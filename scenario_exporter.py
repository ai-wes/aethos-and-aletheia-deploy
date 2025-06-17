"""
Google Cloud-Native Scenario Exporter for Aethos & Aletheia
MongoDB Atlas → Vertex AI, zero AWS/OpenAI dependencies
"""

import os
import json
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from flask import Blueprint, request, jsonify
from google.cloud import storage, aiplatform
from google.cloud.aiplatform import training_jobs
import pymongo
from bson import ObjectId
import logging
import re
from dataclasses import dataclass, asdict
import random

logger = logging.getLogger(__name__)

# Create Flask blueprint
scenario_exporter = Blueprint('scenario_exporter', __name__)

@dataclass
class ExportRequest:
    """Data structure for export requests"""
    format: str = "vertex_sft_basic"
    gcs_prefix: str = "gs://aethos-datasets/v1"
    filter: Dict[str, Any] = None
    split: Dict[str, float] = None
    autotune: bool = False
    model: str = "gemma-2b"
    region: str = "us-central1"
    include_context: bool = True
    custom_context: str = None
    
    def __post_init__(self):
        if self.filter is None:
            self.filter = {}
        if self.split is None:
            self.split = {"train": 0.9, "val": 0.1}

@dataclass
class CanonicalRecord:
    """Canonical record format for export"""
    _id: str
    prompt: str
    raw_answer: str
    revised_answer: str
    critique: List[Dict[str, Any]]
    constitution_version: int
    tags: List[str]
    ts: str

class ScenarioExporter:
    """Main exporter class handling MongoDB → Vertex AI transformations"""
    
    def __init__(self, db, gcs_bucket_name: str = None, project_id: str = None):
        self.db = db
        self.gcs_bucket_name = gcs_bucket_name or os.getenv('GCS_BUCKET_NAME', 'aethos-datasets')
        self.project_id = project_id or os.getenv('GOOGLE_CLOUD_PROJECT')
        self.local_export_dir = os.getenv('LOCAL_EXPORT_DIR', './exports')
        
        # Initialize GCS client
        try:
            if self.project_id:
                self.storage_client = storage.Client(project=self.project_id)
                self.bucket = self.storage_client.bucket(self.gcs_bucket_name)
                logger.info(f"GCS client initialized for bucket: {self.gcs_bucket_name}")
            else:
                logger.warning("No GOOGLE_CLOUD_PROJECT set, GCS uploads will be disabled")
                self.storage_client = None
                self.bucket = None
        except Exception as e:
            logger.error(f"Failed to initialize GCS client: {e}")
            logger.warning("GCS uploads will be disabled, exports will be saved locally")
            self.storage_client = None
            self.bucket = None
        
        # Initialize Vertex AI
        try:
            if self.project_id:
                aiplatform.init(project=self.project_id)
                logger.info("Vertex AI initialized successfully")
            else:
                logger.warning("No GOOGLE_CLOUD_PROJECT set, Vertex AI features will be disabled")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
    
    def normalize_to_canonical(self, raw_data: Dict[str, Any], export_request: ExportRequest = None) -> CanonicalRecord:
        """Convert MongoDB Atlas data to canonical format"""
        try:
            # Debug log to understand data structure
            if logger.level <= logging.DEBUG:
                logger.debug(f"Raw data keys: {list(raw_data.keys())}")
            
            # Extract prompt from various possible fields
            raw_prompt = (raw_data.get('query') or 
                         raw_data.get('prompt') or 
                         raw_data.get('scenario_text') or
                         raw_data.get('scenario_title') or
                         raw_data.get('dilemma') or
                         raw_data.get('description', ''))
            
            # Add context preface to the prompt for training
            if export_request and not export_request.include_context:
                # No context preface requested
                prompt = raw_prompt
            elif export_request and export_request.custom_context:
                # Use custom context preface
                prompt = export_request.custom_context + "\n\n" + raw_prompt if raw_prompt else export_request.custom_context
            else:
                # Use default context preface based on data type
                if 'full_response_text' in raw_data:
                    # Reasoning traces - wisdom oracle responses
                    context_preface = "The following is a wisdom and philosophical reasoning exercise. You are being trained to provide thoughtful responses that draw from historical philosophical wisdom and ethical frameworks. Please analyze the question carefully and provide a well-reasoned response.\n\n"
                elif 'agent_decision' in raw_data:
                    # Learning history - agent ethical decisions
                    context_preface = "The following is an ethical decision-making training scenario for AI agents. You are learning to make principled decisions that balance multiple moral considerations. Please think through the scenario carefully and provide your ethical reasoning and decision.\n\n"
                else:
                    # General case
                    context_preface = "The following is a wisdom, morality, and ethical reasoning training exercise designed to help AI systems develop sound moral judgment and philosophical understanding. Please provide a thoughtful, well-reasoned response that considers multiple ethical perspectives.\n\n"
                
                prompt = context_preface + raw_prompt if raw_prompt else context_preface
            
            # Extract raw answer based on collection type
            raw_answer = ''
            
            # For reasoning_traces collection
            if 'full_response_text' in raw_data:
                raw_answer = raw_data['full_response_text']
            
            # For learning_history collection  
            elif 'agent_decision' in raw_data:
                raw_answer = raw_data['agent_decision']
                
            # For wisdom_cache collection
            elif 'response' in raw_data:
                response_data = raw_data['response']
                # Try to parse if it's a JSON string
                if isinstance(response_data, str) and response_data.strip().startswith('{'):
                    try:
                        response_data = json.loads(response_data)
                    except:
                        pass
                
                if isinstance(response_data, dict):
                    # If response is a dict, try to extract text content
                    raw_answer = (response_data.get('tldr') or 
                                 response_data.get('wisdom') or 
                                 response_data.get('alignment_implications') or
                                 response_data.get('text') or
                                 response_data.get('answer', ''))
                    # If still empty, try to get the first non-empty string value
                    if not raw_answer:
                        for key, value in response_data.items():
                            if isinstance(value, str) and value.strip() and key not in ['trace_id', 'timestamp', 'id']:
                                raw_answer = value
                                break
                else:
                    raw_answer = str(response_data) if response_data else ''
            
            # Fallback to other possible response fields
            if not raw_answer:
                raw_answer = (raw_data.get('raw_response') or 
                             raw_data.get('initial_response') or
                             raw_data.get('agent_response') or
                             raw_data.get('answer', ''))
            
            # Extract revised answer (after reflection/critique)
            revised_answer = ''
            
            # For learning_history, use agent_reflection or constitution_after_reflection
            if 'agent_reflection' in raw_data:
                revised_answer = raw_data['agent_reflection']
            elif 'constitution_after_reflection' in raw_data:
                constitution = raw_data['constitution_after_reflection']
                if isinstance(constitution, list):
                    revised_answer = '\n'.join(str(item) for item in constitution)
                else:
                    revised_answer = str(constitution)
            
            # Fallback options
            if not revised_answer:
                revised_answer = (raw_data.get('revised_response') or 
                                raw_data.get('final_response') or
                                raw_data.get('improved_response') or
                                raw_answer)  # Fallback to raw if no revision
            
            # Ensure revised_answer is a string
            if isinstance(revised_answer, list):
                revised_answer = '\n'.join(str(item) for item in revised_answer)
            
            # Extract critique/evaluation data
            critique = []
            if 'critique' in raw_data:
                critique = raw_data['critique']
            elif 'evaluation' in raw_data:
                critique = raw_data['evaluation']
            elif 'ethical_analysis' in raw_data:
                # Convert ethical analysis to critique format
                analysis = raw_data['ethical_analysis']
                if isinstance(analysis, dict):
                    for framework, score in analysis.items():
                        critique.append({
                            "framework": framework,
                            "score": score if isinstance(score, (int, float)) else 0.0,
                            "comment": f"Analysis from {framework}"
                        })
            
            # Extract constitution version
            constitution_version = (raw_data.get('constitution_version') or 
                                  raw_data.get('agent_version') or
                                  raw_data.get('agent_version_before_reflection') or
                                  raw_data.get('version', 1))
            
            # Extract tags
            tags = []
            if 'tags' in raw_data:
                tags = raw_data['tags']
            elif 'ethical_frameworks' in raw_data:
                tags = raw_data['ethical_frameworks']
            elif 'categories' in raw_data:
                tags = raw_data['categories']
            elif 'scenario_metadata' in raw_data:
                # Extract from scenario metadata if available
                metadata = raw_data['scenario_metadata']
                if isinstance(metadata, dict):
                    tags = metadata.get('tags', [])
            
            # Add scenario complexity as a tag if available
            if 'scenario_complexity' in raw_data:
                if not isinstance(tags, list):
                    tags = []
                tags.append(f"complexity_{raw_data['scenario_complexity']}")
            
            # Ensure tags is a list
            if isinstance(tags, str):
                tags = [tags]
            elif not isinstance(tags, list):
                tags = []
            
            # Add alignment and control tags for AI safety scenarios
            if any(keyword in prompt.lower() for keyword in ['ai', 'artificial intelligence', 'autonomous', 'algorithm']):
                tags.extend(['alignment', 'control'])
            
            # Extract timestamp
            ts = raw_data.get('timestamp') or raw_data.get('created_at') or datetime.now(timezone.utc)
            if isinstance(ts, datetime):
                ts = ts.isoformat()
            
            return CanonicalRecord(
                _id=str(raw_data.get('_id', ObjectId())),
                prompt=prompt,
                raw_answer=raw_answer,
                revised_answer=revised_answer,
                critique=critique,
                constitution_version=int(constitution_version),
                tags=tags,
                ts=ts
            )
            
        except Exception as e:
            logger.error(f"Failed to normalize record {raw_data.get('_id')}: {e}")
            raise
    
    def fetch_data_from_mongo(self, filter_criteria: Dict[str, Any], export_request: ExportRequest = None) -> List[CanonicalRecord]:
        """Fetch and normalize data from MongoDB collections"""
        canonical_records = []
        
        try:
            # Fetch from reasoning_traces collection
            if 'reasoning_traces' in self.db.list_collection_names():
                traces_collection = self.db['reasoning_traces']
                traces = traces_collection.find(filter_criteria)
                for trace in traces:
                    try:
                        canonical_record = self.normalize_to_canonical(trace, export_request)
                        canonical_records.append(canonical_record)
                    except Exception as e:
                        logger.warning(f"Skipping trace {trace.get('_id')}: {e}")
            
            # Fetch from learning_history collection  
            if 'learning_history' in self.db.list_collection_names():
                history_collection = self.db['learning_history']
                history_filter = filter_criteria.copy()
                # Add agent_id filter if specified
                if 'agent_id' in filter_criteria:
                    history_filter['agent_id'] = filter_criteria['agent_id']
                    
                history_records = history_collection.find(history_filter)
                for record in history_records:
                    try:
                        canonical_record = self.normalize_to_canonical(record, export_request)
                        canonical_records.append(canonical_record)
                    except Exception as e:
                        logger.warning(f"Skipping history record {record.get('_id')}: {e}")
            
            # Fetch from wisdom_cache collection with approved feedback
            if 'wisdom_cache' in self.db.list_collection_names():
                wisdom_collection = self.db['wisdom_cache']
                wisdom_filter = filter_criteria.copy()
                wisdom_filter['approved'] = True  # Only approved wisdom
                
                wisdom_records = wisdom_collection.find(wisdom_filter)
                for record in wisdom_records:
                    try:
                        canonical_record = self.normalize_to_canonical(record, export_request)
                        canonical_records.append(canonical_record)
                    except Exception as e:
                        logger.warning(f"Skipping wisdom record {record.get('_id')}: {e}")
            
            logger.info(f"Fetched {len(canonical_records)} canonical records from MongoDB")
            return canonical_records
            
        except Exception as e:
            logger.error(f"Failed to fetch data from MongoDB: {e}")
            raise
    
    def create_vertex_sft_basic(self, records: List[CanonicalRecord]) -> str:
        """Convert to Vertex AI SFT basic format"""
        jsonl_lines = []
        for record in records:
            line = {
                "input_text": record.prompt,
                "output_text": record.revised_answer
            }
            jsonl_lines.append(json.dumps(line))
        return '\n'.join(jsonl_lines)
    
    def create_vertex_sft_chat(self, records: List[CanonicalRecord]) -> str:
        """Convert to Vertex AI SFT chat format"""
        jsonl_lines = []
        for record in records:
            line = {
                "messages": [
                    {"author": "user", "content": record.prompt},
                    {"author": "assistant", "content": record.revised_answer}
                ]
            }
            jsonl_lines.append(json.dumps(line))
        return '\n'.join(jsonl_lines)
    
    def create_vertex_prefs(self, records: List[CanonicalRecord]) -> str:
        """Convert to Vertex AI preferences format (DPO/RLHF)"""
        jsonl_lines = []
        for record in records:
            # Only include records where we have both raw and revised answers
            if record.raw_answer and record.revised_answer and record.raw_answer != record.revised_answer:
                line = {
                    "prompt": record.prompt,
                    "chosen": record.revised_answer,
                    "rejected": record.raw_answer
                }
                jsonl_lines.append(json.dumps(line))
        return '\n'.join(jsonl_lines)
    
    def create_vertex_rlhf(self, records: List[CanonicalRecord]) -> str:
        """Convert to Vertex AI RLHF format"""
        jsonl_lines = []
        for record in records:
            # Calculate reward based on critique scores
            reward = 0.0
            if record.critique:
                scores = [c.get('score', 0) for c in record.critique if isinstance(c.get('score'), (int, float))]
                if scores:
                    reward = sum(scores) / len(scores)
            
            line = {
                "prompt": record.prompt,
                "action": record.revised_answer,
                "reward": reward
            }
            jsonl_lines.append(json.dumps(line))
        return '\n'.join(jsonl_lines)
    
    def validate_jsonl(self, jsonl_content: str, format_type: str) -> bool:
        """Validate JSONL format for Vertex AI"""
        try:
            lines = jsonl_content.strip().split('\n')
            for i, line in enumerate(lines):
                if not line.strip():
                    continue
                    
                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON at line {i+1}: {line[:100]}...")
                    return False
                
                # Validate required fields based on format
                if format_type == "vertex_sft_basic":
                    if not all(key in data for key in ["input_text", "output_text"]):
                        logger.error(f"Missing required fields at line {i+1}")
                        return False
                elif format_type == "vertex_sft_chat":
                    if "messages" not in data:
                        logger.error(f"Missing messages field at line {i+1}")
                        return False
                elif format_type == "vertex_prefs":
                    if not all(key in data for key in ["prompt", "chosen", "rejected"]):
                        logger.error(f"Missing required fields at line {i+1}")
                        return False
                elif format_type == "vertex_rlhf":
                    if not all(key in data for key in ["prompt", "action", "reward"]):
                        logger.error(f"Missing required fields at line {i+1}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"JSONL validation failed: {e}")
            return False
    
    def split_data(self, records: List[CanonicalRecord], split_config: Dict[str, float]) -> Dict[str, List[CanonicalRecord]]:
        """Split data into train/validation sets"""
        random.shuffle(records)
        
        total = len(records)
        train_size = int(total * split_config.get('train', 0.9))
        
        return {
            'train': records[:train_size],
            'val': records[train_size:]
        }
    
    def save_locally(self, content: str, file_path: str) -> str:
        """Save content to local filesystem as fallback"""
        try:
            # Create local export directory if it doesn't exist
            os.makedirs(self.local_export_dir, exist_ok=True)
            
            # Extract relative path from GCS-style path
            if file_path.startswith('gs://'):
                file_path = file_path.split('/', 3)[-1]  # Remove gs://bucket/
            
            local_path = os.path.join(self.local_export_dir, file_path)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            with open(local_path, 'w') as f:
                f.write(content)
            
            logger.info(f"Saved {len(content)} bytes locally to {local_path}")
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to save locally: {e}")
            raise
    
    def upload_to_gcs(self, content: str, gcs_path: str) -> str:
        """Upload content to Google Cloud Storage or save locally as fallback"""
        try:
            if not self.storage_client or not self.bucket:
                logger.warning("GCS not available, saving locally instead")
                return self.save_locally(content, gcs_path)
            
            # Remove gs:// prefix and bucket name from path
            if gcs_path.startswith('gs://'):
                gcs_path = gcs_path[5:]  # Remove gs://
                if gcs_path.startswith(self.gcs_bucket_name + '/'):
                    gcs_path = gcs_path[len(self.gcs_bucket_name) + 1:]
            
            blob = self.bucket.blob(gcs_path)
            blob.upload_from_string(content, content_type='application/json')
            
            full_gcs_path = f"gs://{self.gcs_bucket_name}/{gcs_path}"
            logger.info(f"Uploaded {len(content)} bytes to {full_gcs_path}")
            return full_gcs_path
            
        except Exception as e:
            logger.error(f"Failed to upload to GCS: {e}")
            logger.warning("Falling back to local save")
            return self.save_locally(content, gcs_path)
    
    def generate_signed_url(self, gcs_path: str, expiration_hours: int = 24) -> str:
        """Generate signed URL for GCS object or return local file path"""
        try:
            # If it's a local path, return it as-is
            if not gcs_path.startswith('gs://'):
                # For local files, return a file URL
                abs_path = os.path.abspath(gcs_path)
                return f"file://{abs_path}"
            
            if not self.storage_client or not self.bucket:
                logger.warning("GCS client not initialized, cannot generate signed URL")
                return gcs_path  # Return the path as-is
            
            # Extract blob path
            if gcs_path.startswith('gs://'):
                gcs_path = gcs_path[5:]  # Remove gs://
                if gcs_path.startswith(self.gcs_bucket_name + '/'):
                    gcs_path = gcs_path[len(self.gcs_bucket_name) + 1:]
            
            blob = self.bucket.blob(gcs_path)
            
            from datetime import timedelta
            url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=expiration_hours),
                method="GET"
            )
            
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate signed URL: {e}")
            return gcs_path  # Return the path as-is
    
    def create_manifest(self, export_request: ExportRequest, records: List[CanonicalRecord], file_paths: Dict[str, str]) -> Dict[str, Any]:
        """Create manifest with checksums and provenance"""
        manifest = {
            "export_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "export_request": asdict(export_request),
            "total_records": len(records),
            "constitution_versions": list(set(r.constitution_version for r in records)),
            "file_checksums": {},
            "provenance": {
                "source": "MongoDB Atlas",
                "collections": ["reasoning_traces", "learning_history", "wisdom_cache"],
                "project_id": self.project_id,
                "bucket": self.gcs_bucket_name
            }
        }
        
        # Calculate file checksums
        for split_name, file_path in file_paths.items():
            try:
                if file_path.startswith('gs://') and self.bucket:
                    # GCS file
                    blob_path = file_path.replace(f"gs://{self.gcs_bucket_name}/", "")
                    blob = self.bucket.blob(blob_path)
                    blob.reload()
                    manifest["file_checksums"][split_name] = {
                        "path": file_path,
                        "size_bytes": blob.size,
                        "md5_hash": blob.md5_hash,
                        "crc32c": blob.crc32c
                    }
                else:
                    # Local file
                    if os.path.exists(file_path):
                        file_size = os.path.getsize(file_path)
                        manifest["file_checksums"][split_name] = {
                            "path": file_path,
                            "size_bytes": file_size,
                            "local_file": True
                        }
            except Exception as e:
                logger.warning(f"Failed to get checksum for {file_path}: {e}")
        
        return manifest
    
    def start_vertex_tuning_job(self, export_request: ExportRequest, train_gcs_path: str, val_gcs_path: str = None) -> str:
        """Start Vertex AI tuning job"""
        try:
            if not self.project_id:
                logger.warning("Cannot start Vertex AI tuning job without GOOGLE_CLOUD_PROJECT")
                return None
            
            if not train_gcs_path.startswith('gs://'):
                logger.warning("Cannot start Vertex AI tuning job with local files")
                return None
            # Create tuning job based on model and format
            job_display_name = f"aethos-tune-{export_request.format}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            
            if export_request.model.startswith("gemma"):
                # Use Gemma tuning
                tuning_job = training_jobs.CustomJob(
                    display_name=job_display_name,
                    worker_pool_specs=[{
                        "machine_type": "n1-highmem-8" if "27b" in export_request.model else "n1-standard-8",
                        "accelerator_type": "NVIDIA_TESLA_T4" if "2b" in export_request.model else "NVIDIA_TESLA_V100",
                        "accelerator_count": 1 if "2b" in export_request.model else 2,
                        "replica_count": 1,
                        "container_spec": {
                            "image_uri": "us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13:latest",
                            "command": ["python", "-m", "torch.distributed.launch"],
                            "args": [
                                "--train_file", train_gcs_path,
                                "--validation_file", val_gcs_path or train_gcs_path,
                                "--model_name", export_request.model,
                                "--output_dir", f"gs://{self.gcs_bucket_name}/models/{job_display_name}",
                                "--format", export_request.format
                            ]
                        }
                    }],
                    base_output_dir=f"gs://{self.gcs_bucket_name}/jobs/{job_display_name}"
                )
            else:
                # Use generic custom training
                tuning_job = training_jobs.CustomJob(
                    display_name=job_display_name,
                    worker_pool_specs=[{
                        "machine_type": "n1-standard-4",
                        "replica_count": 1,
                        "container_spec": {
                            "image_uri": "gcr.io/vertex-ai/training/pytorch-gpu.1-12:latest"
                        }
                    }]
                )
            
            # Submit the job
            job = tuning_job.submit(
                service_account=None,  # Use default service account
                network=None,
                timeout=None,
                restart_job_on_worker_restart=False,
                enable_web_access=False,
                enable_dashboard_access=False,
                labels={"export_format": export_request.format, "source": "aethos-aletheia"}
            )
            
            job_id = job.resource_name
            logger.info(f"Started Vertex AI tuning job: {job_id}")
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to start Vertex AI tuning job: {e}")
            raise

# Global exporter instance (will be initialized in app.py)
exporter = None

def initialize_exporter(db, gcs_bucket_name=None, project_id=None):
    """Initialize the global exporter instance"""
    global exporter
    exporter = ScenarioExporter(db, gcs_bucket_name, project_id)
    return exporter

@scenario_exporter.route('/export/download/<path:filepath>', methods=['GET'])
def download_export(filepath):
    """Download exported files"""
    try:
        from flask import send_file
        import os
        
        # Security check - ensure the file is in the exports directory
        safe_path = os.path.join(exporter.local_export_dir, filepath)
        safe_path = os.path.abspath(safe_path)
        exports_dir = os.path.abspath(exporter.local_export_dir)
        
        if not safe_path.startswith(exports_dir):
            return jsonify({"error": "Invalid file path"}), 403
            
        if not os.path.exists(safe_path):
            return jsonify({"error": "File not found"}), 404
            
        # Determine mime type
        if safe_path.endswith('.json'):
            mimetype = 'application/json'
        else:
            mimetype = 'application/octet-stream'
            
        return send_file(
            safe_path,
            mimetype=mimetype,
            as_attachment=True,
            download_name=os.path.basename(safe_path)
        )
    except Exception as e:
        logger.error(f"Download failed: {e}")
        return jsonify({"error": f"Download failed: {str(e)}"}), 500

@scenario_exporter.route('/export', methods=['POST'])
def export_scenarios():
    """Main export endpoint"""
    try:
        if exporter is None:
            return jsonify({"error": "Exporter not initialized"}), 500
        
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        export_request = ExportRequest(
            format=data.get('format', 'vertex_sft_basic'),
            gcs_prefix=data.get('gcs_prefix', 'gs://aethos-datasets/v1'),
            filter=data.get('filter', {}),
            split=data.get('split', {"train": 0.9, "val": 0.1}),
            autotune=data.get('autotune', False),
            model=data.get('model', 'gemini-1.5-flash'),
            region=data.get('region', 'us-central1')
        )
        
        # Validate format
        supported_formats = ['vertex_sft_basic', 'vertex_sft_chat', 'vertex_prefs', 'vertex_rlhf']
        if export_request.format not in supported_formats:
            return jsonify({"error": f"Unsupported format. Use: {supported_formats}"}), 400
        
        # Generate task ID
        task_id = f"exp_{random.randint(10, 99)}"
        
        # Fetch data from MongoDB
        records = exporter.fetch_data_from_mongo(export_request.filter, export_request)
        
        if not records:
            return jsonify({"error": "No records found matching filter criteria"}), 404
        
        # Split data
        split_data = exporter.split_data(records, export_request.split)
        
        # Convert to target format
        format_converters = {
            'vertex_sft_basic': exporter.create_vertex_sft_basic,
            'vertex_sft_chat': exporter.create_vertex_sft_chat,
            'vertex_prefs': exporter.create_vertex_prefs,
            'vertex_rlhf': exporter.create_vertex_rlhf
        }
        
        converter = format_converters[export_request.format]
        
        # Generate JSONL content for each split
        jsonl_content = {}
        for split_name, split_records in split_data.items():
            if split_records:  # Only process non-empty splits
                content = converter(split_records)
                
                # Validate JSONL
                if not exporter.validate_jsonl(content, export_request.format):
                    return jsonify({"error": f"JSONL validation failed for {split_name} split"}), 400
                
                jsonl_content[split_name] = content
        
        # Upload to GCS
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_paths = {}
        
        for split_name, content in jsonl_content.items():
            gcs_path = f"{export_request.gcs_prefix.rstrip('/')}/{export_request.format}/{timestamp}/{split_name}.jsonl"
            uploaded_path = exporter.upload_to_gcs(content, gcs_path)
            file_paths[split_name] = uploaded_path
        
        # Create and upload manifest
        manifest = exporter.create_manifest(export_request, records, file_paths)
        manifest_path = f"{export_request.gcs_prefix.rstrip('/')}/{export_request.format}/{timestamp}/manifest.json"
        manifest_gcs_path = exporter.upload_to_gcs(json.dumps(manifest, indent=2), manifest_path)
        
        # Prepare response
        response_data = {
            "task_id": task_id,
            "status": "completed",
            "total_records": len(records),
            "splits": {name: len(split_data[name]) for name in split_data},
            "files": file_paths,
            "manifest": manifest_gcs_path
        }
        
        # Generate signed URLs if not autotuning
        if not export_request.autotune:
            signed_urls = {}
            for split_name, file_path in file_paths.items():
                url = exporter.generate_signed_url(file_path)
                # For local files, provide the relative path for easier access
                if url.startswith('file://'):
                    signed_urls[split_name] = file_path
                else:
                    signed_urls[split_name] = url
            response_data["signed_urls"] = signed_urls
            
            manifest_url = exporter.generate_signed_url(manifest_gcs_path)
            if manifest_url.startswith('file://'):
                response_data["manifest_url"] = manifest_gcs_path
            else:
                response_data["manifest_url"] = manifest_url
            
            # Add a note if files were saved locally
            if any(url.startswith('./') or url.startswith('exports/') for url in signed_urls.values()):
                response_data["note"] = "Files saved locally in the exports directory"
                
                # Convert local paths to download URLs
                download_urls = {}
                for split_name, file_path in signed_urls.items():
                    if file_path.startswith('./') or file_path.startswith('exports/'):
                        # Remove leading ./ or exports/ to get relative path
                        relative_path = file_path.replace('./exports/', '').replace('exports/', '')
                        download_urls[split_name] = f"/api/export/download/{relative_path}"
                    else:
                        download_urls[split_name] = file_path
                
                response_data["download_urls"] = download_urls
                
                # Handle manifest URL
                if manifest_gcs_path.startswith('./') or manifest_gcs_path.startswith('exports/'):
                    relative_manifest = manifest_gcs_path.replace('./exports/', '').replace('exports/', '')
                    response_data["manifest_download_url"] = f"/api/export/download/{relative_manifest}"
        
        # Start Vertex AI tuning job if requested
        if export_request.autotune:
            try:
                train_path = file_paths.get('train')
                val_path = file_paths.get('val')
                
                if train_path:
                    vertex_job_id = exporter.start_vertex_tuning_job(export_request, train_path, val_path)
                    response_data["vertex_job"] = vertex_job_id
                else:
                    logger.warning("No training data available for autotuning")
                    response_data["warning"] = "Autotuning requested but no training data available"
                    
            except Exception as e:
                logger.error(f"Failed to start autotuning: {e}")
                response_data["warning"] = f"Export completed but autotuning failed: {str(e)}"
        
        return jsonify(response_data), 202
        
    except Exception as e:
        logger.error(f"Export failed: {e}", exc_info=True)
        return jsonify({"error": f"Export failed: {str(e)}"}), 500

@scenario_exporter.route('/export/status/<task_id>', methods=['GET'])
def get_export_status(task_id):
    """Get export task status"""
    # This is a placeholder - in a real implementation, you'd track task status
    return jsonify({
        "task_id": task_id,
        "status": "completed",
        "message": "Export task completed successfully"
    })

@scenario_exporter.route('/export/colab', methods=['POST'])
def export_to_colab():
    """Generate Colab notebook with exported data"""
    try:
        if exporter is None:
            return jsonify({"error": "Exporter not initialized"}), 500
        
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        export_request = ExportRequest(
            format=data.get('format', 'vertex_sft_basic'),
            gcs_prefix=data.get('gcs_prefix', 'gs://aethos-datasets/v1'),
            filter=data.get('filter', {}),
            split=data.get('split', {"train": 0.9, "val": 0.1}),
            autotune=False,  # Always false for Colab export
            model=data.get('model', 'gemma-2b'),
            region=data.get('region', 'us-central1')
        )
        
        # Fetch and export data
        records = exporter.fetch_data_from_mongo(export_request.filter, export_request)
        
        if not records:
            return jsonify({"error": "No records found matching filter criteria"}), 404
        
        # Split data
        split_data = exporter.split_data(records, export_request.split)
        
        # Convert to target format
        format_converters = {
            'vertex_sft_basic': exporter.create_vertex_sft_basic,
            'vertex_sft_chat': exporter.create_vertex_sft_chat,
            'vertex_prefs': exporter.create_vertex_prefs,
            'vertex_rlhf': exporter.create_vertex_rlhf
        }
        
        converter = format_converters[export_request.format]
        train_data = converter(split_data['train'])
        val_data = converter(split_data.get('val', []))
        
        # Generate Colab notebook
        notebook_content = generate_colab_notebook(
            export_request, 
            train_data, 
            val_data, 
            len(records)
        )
        
        # Save notebook locally
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        notebook_filename = f"aethos_aletheia_training_{export_request.format}_{timestamp}.ipynb"
        notebook_path = os.path.join(exporter.local_export_dir, notebook_filename)
        
        os.makedirs(os.path.dirname(notebook_path), exist_ok=True)
        with open(notebook_path, 'w') as f:
            json.dump(notebook_content, f, indent=2)
        
        # Generate Colab URL
        colab_url = f"https://colab.research.google.com/github/upload"
        
        return jsonify({
            "notebook_path": notebook_path,
            "notebook_filename": notebook_filename,
            "colab_url": colab_url,
            "download_url": f"/api/export/download/{notebook_filename}",
            "total_records": len(records),
            "train_records": len(split_data['train']),
            "val_records": len(split_data.get('val', [])),
            "format": export_request.format
        }), 200
        
    except Exception as e:
        logger.error(f"Colab export failed: {e}", exc_info=True)
        return jsonify({"error": f"Colab export failed: {str(e)}"}), 500

def generate_colab_notebook(export_request: ExportRequest, train_data: str, val_data: str, total_records: int):
    """Generate a Colab notebook with the exported data"""
    
    # Split JSONL data into individual records for embedding
    train_records = [json.loads(line) for line in train_data.split('\n') if line.strip()]
    val_records = [json.loads(line) for line in val_data.split('\n') if line.strip()]
    
    notebook = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {
            "colab": {
                "provenance": [],
                "collapsed_sections": []
            },
            "kernelspec": {
                "name": "python3",
                "display_name": "Python 3"
            }
        },
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Aethos & Aletheia: Ethical AI Training with Vertex AI\n",
                    "\n",
                    "This notebook contains exported training data from the Aethos & Aletheia system for fine-tuning AI models on ethical reasoning and wisdom.\n",
                    "\n",
                    "**Dataset Information:**\n",
                    f"- Total Records: {total_records}\n",
                    f"- Training Records: {len(train_records)}\n",
                    f"- Validation Records: {len(val_records)}\n",
                    f"- Export Format: {export_request.format}\n",
                    f"- Target Model: {export_request.model}\n",
                    "\n",
                    "This data comes from:\n",
                    "- Wisdom Oracle responses (philosophical reasoning)\n",
                    "- AI Agent ethical decisions and reflections\n",
                    "- Approved wisdom cache entries\n",
                    "\n",
                    "Each prompt includes contextual prefaces to guide ethical reasoning."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Setup and Installation\n",
                    "\n",
                    "Install required packages for Vertex AI training."
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Install required packages\n",
                    "!pip install -q --upgrade \\\n",
                    "    google-cloud-aiplatform \\\n",
                    "    transformers \\\n",
                    "    torch \\\n",
                    "    datasets \\\n",
                    "    accelerate \\\n",
                    "    wandb"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Restart runtime to use newly installed packages\n",
                    "import sys\n",
                    "if 'google.colab' in sys.modules:\n",
                    "    import IPython\n",
                    "    app = IPython.Application.instance()\n",
                    "    app.kernel.do_shutdown(True)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Authentication and Project Setup"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Authenticate with Google Cloud\n",
                    "import sys\n",
                    "if 'google.colab' in sys.modules:\n",
                    "    from google.colab import auth\n",
                    "    auth.authenticate_user()"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Set your Google Cloud project information\n",
                    "PROJECT_ID = \"[your-project-id]\"  # @param {type:\"string\"}\n",
                    f"LOCATION = \"{export_request.region}\"\n",
                    "BUCKET_URI = f\"gs://your-bucket-name-{PROJECT_ID}-unique\"  # @param {type:\"string\"}\n",
                    "EXPERIMENT_NAME = \"aethos-aletheia-training\"  # @param {type:\"string\"}\n",
                    "\n",
                    "# Verify project ID is set\n",
                    "if PROJECT_ID == \"[your-project-id]\":\n",
                    "    print(\"⚠️  Please set your PROJECT_ID in the cell above\")\n",
                    "else:\n",
                    "    print(f\"✅ Project ID: {PROJECT_ID}\")\n",
                    "    print(f\"✅ Location: {LOCATION}\")\n",
                    "    print(f\"✅ Bucket: {BUCKET_URI}\")"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Create Cloud Storage bucket if it doesn't exist\n",
                    "!gsutil mb -l {LOCATION} -p {PROJECT_ID} {BUCKET_URI} 2>/dev/null || echo \"Bucket already exists or creation failed\""
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Training Data\n",
                    "\n",
                    "The following cells contain your exported Aethos & Aletheia training data."
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "import json\n",
                    "import pandas as pd\n",
                    "from google.cloud import aiplatform\n",
                    "\n",
                    "# Initialize Vertex AI\n",
                    "aiplatform.init(\n",
                    "    project=PROJECT_ID,\n",
                    "    location=LOCATION,\n",
                    "    staging_bucket=BUCKET_URI,\n",
                    "    experiment=EXPERIMENT_NAME\n",
                    ")"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    f"# Training data ({len(train_records)} records)\n",
                    f"training_data = {json.dumps(train_records, indent=2)}"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    f"# Validation data ({len(val_records)} records)\n",
                    f"validation_data = {json.dumps(val_records, indent=2)}"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Data Preview and Analysis"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Preview the training data structure\n",
                    "print(f\"📊 Dataset Overview:\")\n",
                    "print(f\"   Training samples: {len(training_data)}\")\n",
                    "print(f\"   Validation samples: {len(validation_data)}\")\n",
                    "print(f\"   Format: {export_request.format}\")\n",
                    "print(f\"   Target model: {export_request.model}\")\n",
                    "\n",
                    "# Show first training example\n",
                    "if training_data:\n",
                    "    print(\"\\n📝 First training example:\")\n",
                    "    for key, value in training_data[0].items():\n",
                    "        print(f\"   {key}: {str(value)[:200]}{'...' if len(str(value)) > 200 else ''}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Save Data to Cloud Storage"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Save training data to JSONL format for Vertex AI\n",
                    "train_jsonl = \"\\n\".join([json.dumps(record) for record in training_data])\n",
                    "val_jsonl = \"\\n\".join([json.dumps(record) for record in validation_data])\n",
                    "\n",
                    "# Write to local files\n",
                    "with open('train.jsonl', 'w') as f:\n",
                    "    f.write(train_jsonl)\n",
                    "    \n",
                    "with open('val.jsonl', 'w') as f:\n",
                    "    f.write(val_jsonl)\n",
                    "\n",
                    "print(\"✅ Training data saved to local files\")"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Upload to Cloud Storage\n",
                    "train_gcs_path = f\"{BUCKET_URI}/aethos_data/train.jsonl\"\n",
                    "val_gcs_path = f\"{BUCKET_URI}/aethos_data/val.jsonl\"\n",
                    "\n",
                    "!gsutil cp train.jsonl {train_gcs_path}\n",
                    "!gsutil cp val.jsonl {val_gcs_path}\n",
                    "\n",
                    "print(f\"✅ Training data uploaded to:\")\n",
                    "print(f\"   Train: {train_gcs_path}\")\n",
                    "print(f\"   Validation: {val_gcs_path}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    f"## Fine-tune {export_request.model.title()} Model\n",
                    "\n",
                    "Create a custom training job to fine-tune the model on ethical reasoning data."
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Create training script for Gemma fine-tuning\n",
                    "training_script = '''\n",
                    "import json\n",
                    "import torch\n",
                    "from transformers import (\n",
                    "    AutoTokenizer, \n",
                    "    AutoModelForCausalLM, \n",
                    "    TrainingArguments, \n",
                    "    Trainer,\n",
                    "    DataCollatorForLanguageModeling\n",
                    ")\n",
                    "from datasets import Dataset\n",
                    "import argparse\n",
                    "import os\n",
                    "\n",
                    "def load_jsonl(file_path):\n",
                    "    data = []\n",
                    "    with open(file_path, 'r') as f:\n",
                    "        for line in f:\n",
                    "            data.append(json.loads(line))\n",
                    "    return data\n",
                    "\n",
                    "def preprocess_data(examples, tokenizer):\n",
                    "    # Combine input and output for causal language modeling\n",
                    "    texts = []\n",
                    "    for example in examples:\n",
                    "        if 'input_text' in example:\n",
                    "            text = f\"{example['input_text']}\\n\\n{example['output_text']}\"\n",
                    "        else:\n",
                    "            # Handle chat format\n",
                    "            messages = example['messages']\n",
                    "            text = \"\\n\".join([f\"{msg['author']}: {msg['content']}\" for msg in messages])\n",
                    "        texts.append(text)\n",
                    "    \n",
                    "    return tokenizer(texts, truncation=True, padding=True, max_length=512)\n",
                    "\n",
                    "def main():\n",
                    "    parser = argparse.ArgumentParser()\n",
                    "    parser.add_argument('--model_name', default='google/gemma-2b')\n",
                    "    parser.add_argument('--train_file', required=True)\n",
                    "    parser.add_argument('--val_file', required=True)\n",
                    "    parser.add_argument('--output_dir', required=True)\n",
                    "    parser.add_argument('--epochs', type=int, default=3)\n",
                    "    parser.add_argument('--batch_size', type=int, default=4)\n",
                    "    parser.add_argument('--learning_rate', type=float, default=2e-5)\n",
                    "    \n",
                    "    args = parser.parse_args()\n",
                    "    \n",
                    "    # Load model and tokenizer\n",
                    "    tokenizer = AutoTokenizer.from_pretrained(args.model_name)\n",
                    "    tokenizer.pad_token = tokenizer.eos_token\n",
                    "    \n",
                    "    model = AutoModelForCausalLM.from_pretrained(\n",
                    "        args.model_name,\n",
                    "        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32\n",
                    "    )\n",
                    "    \n",
                    "    # Load and preprocess data\n",
                    "    train_data = load_jsonl(args.train_file)\n",
                    "    val_data = load_jsonl(args.val_file)\n",
                    "    \n",
                    "    train_dataset = Dataset.from_list(train_data)\n",
                    "    val_dataset = Dataset.from_list(val_data)\n",
                    "    \n",
                    "    # Tokenize datasets\n",
                    "    train_dataset = train_dataset.map(\n",
                    "        lambda x: preprocess_data([x], tokenizer), \n",
                    "        batched=False\n",
                    "    )\n",
                    "    val_dataset = val_dataset.map(\n",
                    "        lambda x: preprocess_data([x], tokenizer), \n",
                    "        batched=False\n",
                    "    )\n",
                    "    \n",
                    "    # Training arguments\n",
                    "    training_args = TrainingArguments(\n",
                    "        output_dir=args.output_dir,\n",
                    "        num_train_epochs=args.epochs,\n",
                    "        per_device_train_batch_size=args.batch_size,\n",
                    "        per_device_eval_batch_size=args.batch_size,\n",
                    "        learning_rate=args.learning_rate,\n",
                    "        warmup_steps=100,\n",
                    "        logging_steps=10,\n",
                    "        evaluation_strategy=\"steps\",\n",
                    "        eval_steps=100,\n",
                    "        save_strategy=\"steps\",\n",
                    "        save_steps=500,\n",
                    "        fp16=torch.cuda.is_available(),\n",
                    "        remove_unused_columns=False,\n",
                    "    )\n",
                    "    \n",
                    "    # Data collator\n",
                    "    data_collator = DataCollatorForLanguageModeling(\n",
                    "        tokenizer=tokenizer,\n",
                    "        mlm=False,\n",
                    "    )\n",
                    "    \n",
                    "    # Trainer\n",
                    "    trainer = Trainer(\n",
                    "        model=model,\n",
                    "        args=training_args,\n",
                    "        train_dataset=train_dataset,\n",
                    "        eval_dataset=val_dataset,\n",
                    "        data_collator=data_collator,\n",
                    "    )\n",
                    "    \n",
                    "    # Train\n",
                    "    trainer.train()\n",
                    "    trainer.save_model()\n",
                    "    \n",
                    "if __name__ == \"__main__\":\n",
                    "    main()\n",
                    "'''\n",
                    "\n",
                    "with open('training_script.py', 'w') as f:\n",
                    "    f.write(training_script)\n",
                    "    \n",
                    "print(\"✅ Training script created\")"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# Create and run custom training job\n",
                    "job = aiplatform.CustomTrainingJob(\n",
                    "    display_name=\"aethos-aletheia-gemma-training\",\n",
                    "    script_path=\"training_script.py\",\n",
                    f"    container_uri=\"us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13:latest\",\n",
                    "    requirements=[\"transformers\", \"datasets\", \"accelerate\"],\n",
                    ")\n",
                    "\n",
                    "print(\"🚀 Starting Vertex AI training job...\")\n",
                    "print(\"This may take 30-60 minutes depending on data size and model.\")\n",
                    "\n",
                    "# Start experiment run\n",
                    "aiplatform.start_run(\"aethos-aletheia-run-1\")\n",
                    "\n",
                    "# Log parameters\n",
                    "parameters = {\n",
                    f"    \"model\": \"{export_request.model}\",\n",
                    f"    \"format\": \"{export_request.format}\",\n",
                    "    \"epochs\": 3,\n",
                    "    \"batch_size\": 4,\n",
                    "    \"learning_rate\": 2e-5,\n",
                    "    \"train_samples\": len(training_data),\n",
                    "    \"val_samples\": len(validation_data)\n",
                    "}\n",
                    "aiplatform.log_params(parameters)\n",
                    "\n",
                    "# Run training\n",
                    "model = job.run(\n",
                    "    replica_count=1,\n",
                    f"    machine_type=\"n1-highmem-8\",\n",
                    f"    accelerator_type=\"NVIDIA_TESLA_T4\",\n",
                    "    accelerator_count=1,\n",
                    "    args=[\n",
                    f"        f\"--model_name=google/{export_request.model}\",\n",
                    "        f\"--train_file={train_gcs_path}\",\n",
                    "        f\"--val_file={val_gcs_path}\",\n",
                    "        f\"--output_dir={BUCKET_URI}/models/aethos-gemma\",\n",
                    "        \"--epochs=3\",\n",
                    "        \"--batch_size=4\",\n",
                    "        \"--learning_rate=2e-5\"\n",
                    "    ]\n",
                    ")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Monitor Training Progress"
                ]
            },
            {
                "cell_type": "code",
                "metadata": {},
                "execution_count": None,
                "outputs": [],
                "source": [
                    "# View experiment results\n",
                    "experiment_df = aiplatform.get_experiment_df()\n",
                    "print(\"📈 Experiment Results:\")\n",
                    "display(experiment_df)\n",
                    "\n",
                    "# View in Cloud Console\n",
                    "print(f\"\\n🔗 View in Cloud Console:\")\n",
                    "print(f\"Experiments: https://console.cloud.google.com/ai/platform/experiments/experiments?project={PROJECT_ID}\")\n",
                    "print(f\"Models: https://console.cloud.google.com/ai/platform/models?project={PROJECT_ID}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## Next Steps\n",
                    "\n",
                    "1. **Monitor Training**: Check the Vertex AI console for training progress\n",
                    "2. **Deploy Model**: Once training completes, deploy to an endpoint for testing\n",
                    "3. **Evaluate**: Test the fine-tuned model on ethical reasoning tasks\n",
                    "4. **Iterate**: Adjust parameters and retrain as needed\n",
                    "\n",
                    "Your model has been trained on ethical reasoning data from the Aethos & Aletheia system, including wisdom from philosophical traditions and AI agent decision-making scenarios."
                ]
            }
        ]
    }
    
    return notebook

@scenario_exporter.route('/export/formats', methods=['GET'])
def get_supported_formats():
    """Get list of supported export formats"""
    formats = {
        "vertex_sft_basic": {
            "description": "Basic SFT format for Vertex AI",
            "schema": {"input_text": "string", "output_text": "string"},
            "use_case": "Fine-tuning PaLM Text/Gemini-Flash"
        },
        "vertex_sft_chat": {
            "description": "Chat SFT format for Vertex AI",
            "schema": {"messages": [{"author": "string", "content": "string"}]},
            "use_case": "Chat model fine-tuning"
        },
        "vertex_prefs": {
            "description": "Preference format for DPO/RLHF",
            "schema": {"prompt": "string", "chosen": "string", "rejected": "string"},
            "use_case": "DPO/RLHF training"
        },
        "vertex_rlhf": {
            "description": "RLHF format with rewards",
            "schema": {"prompt": "string", "action": "string", "reward": "float"},
            "use_case": "PPO reinforcement learning"
        }
    }
    return jsonify(formats)