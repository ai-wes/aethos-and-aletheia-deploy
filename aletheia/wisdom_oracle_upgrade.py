import logging
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
from typing import List, Dict, Tuple, Optional, Any
import pymongo
from functools import lru_cache
import hashlib
import json
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import threading
from dataclasses import dataclass
from enum import Enum

from data.config import Config

logger = logging.getLogger(__name__)

class CritiqueFramework(Enum):
    """Enumeration of available ethical frameworks for critique generation."""
    UTILITARIAN = "utilitarian"
    DEONTOLOGICAL = "deontological" 
    VIRTUE_ETHICS = "virtue_ethics"
    AI_SAFETY = "ai_safety"
    BUDDHIST = "buddhist"
    CONFUCIAN = "confucian"
    STOIC = "stoic"
    CARE_ETHICS = "care_ethics"

@dataclass
class CritiqueContext:
    """Structured container for critique context and metadata."""
    framework: CritiqueFramework
    retrieved_docs: List[Dict]
    context_text: str
    embedding_query: str
    relevance_scores: List[float]
    timestamp: datetime
    doc_count: int

class WisdomOracle:
    """
    Enhanced Wisdom Oracle that evaluates AI actions against human philosophical wisdom.
    
    Features:
    - Multi-framework ethical analysis
    - Embedding caching for performance
    - Robust error handling and retry logic
    - Configurable critique depth and scope
    - Thread-safe operations
    - Memory-efficient model management
    """
    
    def __init__(self, db, enable_caching: bool = True, max_workers: int = 4):
        self.db = db
        self.text_collection = self.db[Config.TEXT_COLLECTION_NAME]
        self.cache_collection = self.db.get('wisdom_oracle_cache', None)
        self.enable_caching = enable_caching
        self.max_workers = max_workers
        
        # Device and model initialization
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.embedding_model = None
        self._model_lock = threading.Lock()
        
        # Performance tracking
        self.stats = {
            'embeddings_generated': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'vector_searches': 0,
            'critiques_generated': 0
        }
        
        # Framework configurations
        self.framework_configs = self._initialize_framework_configs()
        
        # Initialize components
        self._initialize_embedding_model()
        if self.enable_caching:
            self._initialize_cache_collection()
            
        logger.info(f"WisdomOracle initialized. Device: {self.device}, Caching: {enable_caching}")

    def _initialize_framework_configs(self) -> Dict[CritiqueFramework, Dict[str, Any]]:
        """Initialize configuration for each ethical framework."""
        return {
            CritiqueFramework.UTILITARIAN: {
                'keywords': 'utility consequences greatest good happiness suffering outcome well-being harm benefit cost',
                'weight': 1.0,
                'min_docs': 2,
                'description': 'Consequentialist ethics focused on maximizing overall well-being'
            },
            CritiqueFramework.DEONTOLOGICAL: {
                'keywords': 'duty rules obligation rights intent universal law categorical imperative means ends moral law',
                'weight': 1.0,
                'min_docs': 2,
                'description': 'Duty-based ethics emphasizing moral rules and obligations'
            },
            CritiqueFramework.VIRTUE_ETHICS: {
                'keywords': 'character virtue flourishing compassion courage justice wisdom temperance prudence excellence',
                'weight': 1.0,
                'min_docs': 2,
                'description': 'Character-based ethics focusing on moral virtues'
            },
            CritiqueFramework.AI_SAFETY: {
                'keywords': 'alignment corrigibility instrumental convergence value lock-in existential risk control problem goal specification',
                'weight': 1.2,  # Higher weight for AI safety relevance
                'min_docs': 1,
                'description': 'AI-specific safety and alignment considerations'
            },
            CritiqueFramework.BUDDHIST: {
                'keywords': 'compassion non-harm mindfulness interdependence suffering liberation wisdom meditation',
                'weight': 0.9,
                'min_docs': 1,
                'description': 'Buddhist ethical principles emphasizing compassion and non-harm'
            },
            CritiqueFramework.CONFUCIAN: {
                'keywords': 'benevolence ren ritual propriety li social harmony filial piety relationships duty',
                'weight': 0.9,
                'min_docs': 1,
                'description': 'Confucian ethics emphasizing social harmony and relationships'
            },
            CritiqueFramework.STOIC: {
                'keywords': 'virtue reason acceptance fate control wisdom courage justice temperance resilience',
                'weight': 0.8,
                'min_docs': 1,
                'description': 'Stoic philosophy emphasizing virtue and rational acceptance'
            },
            CritiqueFramework.CARE_ETHICS: {
                'keywords': 'care relationships responsibility context particularity empathy nurturing vulnerability',
                'weight': 0.9,
                'min_docs': 1,
                'description': 'Ethics of care emphasizing relationships and responsibility'
            }
        }

    def _initialize_embedding_model(self):
        """Initialize the embedding model with proper error handling."""
        try:
            with self._model_lock:
                logger.info(f"Initializing embedding model: {Config.EMBEDDING_MODEL_NAME}")
                self.tokenizer = AutoTokenizer.from_pretrained(
                    Config.EMBEDDING_MODEL_NAME,
                    cache_dir=getattr(Config, 'MODEL_CACHE_DIR', None)
                )
                self.embedding_model = AutoModel.from_pretrained(
                    Config.EMBEDDING_MODEL_NAME,
                    cache_dir=getattr(Config, 'MODEL_CACHE_DIR', None)
                ).to(self.device)
                self.embedding_model.eval()
                
                # Optimize for inference
                if hasattr(torch, 'jit') and hasattr(Config, 'OPTIMIZE_MODEL') and Config.OPTIMIZE_MODEL:
                    try:
                        self.embedding_model = torch.jit.script(self.embedding_model)
                        logger.info("Model optimized with TorchScript")
                    except Exception as e:
                        logger.warning(f"TorchScript optimization failed: {e}")
                
                logger.info("Embedding model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {e}", exc_info=True)
            raise RuntimeError(f"Embedding model initialization failed: {e}")

    def _initialize_cache_collection(self):
        """Initialize the caching collection with proper indexing."""
        try:
            if self.cache_collection is None:
                self.cache_collection = self.db['wisdom_oracle_cache']
            
            # Create indexes for efficient caching
            try:
                self.cache_collection.create_index([
                    ('text_hash', 1),
                    ('model_version', 1)
                ], unique=True, background=True)
                self.cache_collection.create_index([
                    ('created_at', 1)
                ], expireAfterSeconds=getattr(Config, 'CACHE_TTL_SECONDS', 86400))
                logger.info("Cache collection indexes created")
            except pymongo.errors.OperationFailure as e:
                if "already exists" not in str(e):
                    logger.warning(f"Index creation failed: {e}")
        except Exception as e:
            logger.warning(f"Cache initialization failed: {e}")
            self.enable_caching = False

    @lru_cache(maxsize=1000)
    def _get_text_hash(self, text: str) -> str:
        """Generate a hash for text caching."""
        return hashlib.md5(text.encode('utf-8')).hexdigest()

    def generate_embedding(self, text: str, use_cache: bool = True) -> List[float]:
        """
        Generate vector embedding with caching and error handling.
        
        Args:
            text: Input text to embed
            use_cache: Whether to use cached embeddings
            
        Returns:
            List of embedding values
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding generation")
            return []

        # Normalize text
        text = text.strip()
        text_hash = self._get_text_hash(text)
        
        # Check cache
        if use_cache and self.enable_caching:
            cached_embedding = self._get_cached_embedding(text_hash)
            if cached_embedding:
                self.stats['cache_hits'] += 1
                return cached_embedding
            self.stats['cache_misses'] += 1

        # Generate new embedding
        embedding = self._generate_embedding_internal(text)
        
        # Cache the result
        if embedding and use_cache and self.enable_caching:
            self._cache_embedding(text_hash, text, embedding)
        
        self.stats['embeddings_generated'] += 1
        return embedding

    def _get_cached_embedding(self, text_hash: str) -> Optional[List[float]]:
        """Retrieve cached embedding."""
        try:
            cached = self.cache_collection.find_one({
                'text_hash': text_hash,
                'model_version': Config.EMBEDDING_MODEL_NAME
            })
            if cached:
                return cached['embedding']
        except Exception as e:
            logger.warning(f"Cache retrieval failed: {e}")
        return None

    def _cache_embedding(self, text_hash: str, text: str, embedding: List[float]):
        """Cache an embedding."""
        try:
            self.cache_collection.update_one(
                {'text_hash': text_hash, 'model_version': Config.EMBEDDING_MODEL_NAME},
                {
                    '$set': {
                        'embedding': embedding,
                        'text_preview': text[:200],
                        'created_at': datetime.utcnow(),
                        'model_version': Config.EMBEDDING_MODEL_NAME
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.warning(f"Cache storage failed: {e}")

    def _generate_embedding_internal(self, text: str) -> List[float]:
        """Internal embedding generation with robust error handling."""
        if not self.tokenizer or not self.embedding_model:
            logger.error("Embedding model not initialized")
            return []

        try:
            with self._model_lock:
                # Tokenize with proper truncation
                max_length = getattr(Config, 'MAX_SEQUENCE_LENGTH', 512)
                inputs = self.tokenizer(
                    text,
                    return_tensors='pt',
                    padding=True,
                    truncation=True,
                    max_length=max_length
                ).to(self.device)

                with torch.no_grad():
                    outputs = self.embedding_model(**inputs)

                # Advanced pooling strategy
                embedding = self._pool_embeddings(outputs, inputs['attention_mask'])
                
                # Validate embedding
                if torch.isnan(embedding).any() or torch.isinf(embedding).any():
                    logger.error("Generated embedding contains NaN or Inf values")
                    return []
                
                return embedding[0].cpu().numpy().tolist()

        except torch.cuda.OutOfMemoryError:
            logger.error("CUDA out of memory during embedding generation")
            # Try to recover by clearing cache
            if hasattr(torch.cuda, 'empty_cache'):
                torch.cuda.empty_cache()
            return []
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}", exc_info=True)
            return []

    def _pool_embeddings(self, outputs, attention_mask) -> torch.Tensor:
        """Advanced embedding pooling with multiple strategies."""
        token_embeddings = outputs.last_hidden_state
        
        # Mean pooling (default)
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        mean_pooled = sum_embeddings / sum_mask
        
        # Optional: Add CLS token pooling for BERT-like models
        if hasattr(Config, 'USE_CLS_POOLING') and Config.USE_CLS_POOLING:
            cls_embedding = token_embeddings[:, 0]  # CLS token
            return (mean_pooled + cls_embedding) / 2
        
        return mean_pooled

    def _vector_search_with_retry(self, embedding: List[float], limit: int = 3, 
                                 max_retries: int = 3) -> List[Dict]:
        """Perform vector search with retry logic and enhanced error handling."""
        if not embedding:
            logger.warning("Empty embedding provided for vector search")
            return []

        for attempt in range(max_retries):
            try:
                return self._vector_search_internal(embedding, limit)
            except pymongo.errors.OperationFailure as e:
                logger.warning(f"Vector search attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(f"Vector search failed after {max_retries} attempts")
                    return []
            except Exception as e:
                logger.error(f"Unexpected error in vector search: {e}")
                return []

        return []

    def _vector_search_internal(self, embedding: List[float], limit: int) -> List[Dict]:
        """Internal vector search implementation."""
        pipeline = [
            {
                "$vectorSearch": {
                    "index": Config.VECTOR_SEARCH_INDEX,
                    "path": "embedding",
                    "queryVector": embedding,
                    "numCandidates": max(limit * 15, 100),  # Dynamic candidate selection
                    "limit": limit
                }
            },
            {
                "$project": {
                    "text": 1,
                    "author": 1,
                    "source": 1,
                    "ethical_framework": 1,
                    "era": 1,
                    "concepts": 1,
                    "text_hash": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        
        results = list(self.text_collection.aggregate(pipeline))
        self.stats['vector_searches'] += 1
        
        # Filter out low-quality results
        min_score = getattr(Config, 'MIN_RELEVANCE_SCORE', 0.1)
        filtered_results = [doc for doc in results if doc.get('score', 0) >= min_score]
        
        logger.info(f"Vector search returned {len(results)} results, {len(filtered_results)} after filtering")
        return filtered_results

    def _build_enhanced_context(self, contexts: List[CritiqueContext], 
                              scenario: Dict, action: str) -> str:
        """Build sophisticated context string with framework organization."""
        context_parts = [
            "=== PHILOSOPHICAL WISDOM ANALYSIS ===",
            f"Scenario: {scenario.get('title', 'Unknown')}",
            f"Proposed Action: {action}",
            f"Analysis Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}",
            ""
        ]
        
        for context in contexts:
            if not context.retrieved_docs:
                continue
                
            framework_name = context.framework.value.replace('_', ' ').title()
            context_parts.extend([
                f"--- {framework_name} Framework Analysis ---",
                f"Query: {context.embedding_query}",
                f"Documents Retrieved: {context.doc_count}",
                f"Average Relevance: {np.mean(context.relevance_scores):.3f}",
                ""
            ])
            
            for i, doc in enumerate(context.retrieved_docs):
                doc_text = doc.get('text', '')[:500]
                context_parts.append(
                    f"Source {i+1}: {doc.get('author', 'Unknown')} - {doc.get('source', 'Unknown')}\n"
                    f"Framework: {doc.get('ethical_framework', 'N/A')} | Era: {doc.get('era', 'N/A')}\n"
                    f"Relevance: {doc.get('score', 0):.3f}\n"
                    f"Text: \"{doc_text}{'...' if len(doc.get('text', '')) > 500 else ''}\"\n"
                )
            context_parts.append("")
        
        return "\n".join(context_parts)

    def generate_structured_critique(self, scenario: Dict, action: str, 
                                   justification: str, 
                                   frameworks: Optional[List[CritiqueFramework]] = None,
                                   max_docs_per_framework: int = 3) -> Dict:
        """
        Generate comprehensive multi-framework philosophical critique.
        
        Args:
            scenario: The ethical scenario being evaluated
            action: The action taken by the agent
            justification: Agent's justification for the action
            frameworks: Specific frameworks to use (defaults to all)
            max_docs_per_framework: Maximum documents per framework
            
        Returns:
            Dictionary containing critique context and metadata
        """
        if frameworks is None:
            frameworks = list(CritiqueFramework)
        
        logger.info(f"Generating critique for action '{action}' using {len(frameworks)} frameworks")
        
        # Generate critique contexts in parallel
        critique_contexts = []
        
        if self.max_workers > 1:
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                futures = {
                    executor.submit(
                        self._generate_framework_context,
                        framework, scenario, action, justification, max_docs_per_framework
                    ): framework for framework in frameworks
                }
                
                for future in futures:
                    try:
                        context = future.result(timeout=30)  # 30 second timeout
                        if context:
                            critique_contexts.append(context)
                    except Exception as e:
                        framework = futures[future]
                        logger.error(f"Framework {framework.value} critique failed: {e}")
        else:
            # Sequential processing for single-threaded mode
            for framework in frameworks:
                try:
                    context = self._generate_framework_context(
                        framework, scenario, action, justification, max_docs_per_framework
                    )
                    if context:
                        critique_contexts.append(context)
                except Exception as e:
                    logger.error(f"Framework {framework.value} critique failed: {e}")
        
        # Build comprehensive context
        full_context = self._build_enhanced_context(critique_contexts, scenario, action)
        
        # Compile metadata
        total_docs = sum(len(ctx.retrieved_docs) for ctx in critique_contexts)
        framework_coverage = {ctx.framework.value: len(ctx.retrieved_docs) 
                            for ctx in critique_contexts}
        
        self.stats['critiques_generated'] += 1
        
        result = {
            "critique_context": full_context,
            "frameworks_analyzed": [ctx.framework.value for ctx in critique_contexts],
            "total_documents_retrieved": total_docs,
            "framework_coverage": framework_coverage,
            "generation_timestamp": datetime.utcnow().isoformat(),
            "performance_stats": self.stats.copy(),
            "retrieved_docs_by_framework": {
                ctx.framework.value: ctx.retrieved_docs for ctx in critique_contexts
            }
        }
        
        logger.info(f"Critique generated: {len(critique_contexts)} frameworks, {total_docs} total docs")
        return result

    def _generate_framework_context(self, framework: CritiqueFramework, 
                                   scenario: Dict, action: str, justification: str,
                                   max_docs: int) -> Optional[CritiqueContext]:
        """Generate critique context for a specific ethical framework."""
        config = self.framework_configs[framework]
        
        # Construct query combining action, framework keywords, and scenario context
        query_parts = [
            f"Evaluate action '{action}' in scenario '{scenario.get('title', '')}'",
            f"Justification: {justification[:200]}",
            f"Framework keywords: {config['keywords']}"
        ]
        query_text = " ".join(query_parts)
        
        # Generate embedding and search
        embedding = self.generate_embedding(query_text)
        if not embedding:
            logger.warning(f"Failed to generate embedding for framework {framework.value}")
            return None
        
        # Adjust document limit based on framework weight
        adjusted_limit = max(1, int(max_docs * config['weight']))
        docs = self._vector_search_with_retry(embedding, limit=adjusted_limit)
        
        if len(docs) < config['min_docs']:
            logger.warning(f"Insufficient documents for framework {framework.value}: "
                         f"{len(docs)} < {config['min_docs']}")
        
        if not docs:
            return None
        
        relevance_scores = [doc.get('score', 0) for doc in docs]
        
        return CritiqueContext(
            framework=framework,
            retrieved_docs=docs,
            context_text="",  # Will be built later
            embedding_query=query_text,
            relevance_scores=relevance_scores,
            timestamp=datetime.utcnow(),
            doc_count=len(docs)
        )

    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics for monitoring."""
        return {
            **self.stats,
            'cache_hit_rate': (self.stats['cache_hits'] / 
                             (self.stats['cache_hits'] + self.stats['cache_misses']) 
                             if self.stats['cache_hits'] + self.stats['cache_misses'] > 0 else 0),
            'device': str(self.device),
            'model_loaded': self.embedding_model is not None,
            'caching_enabled': self.enable_caching
        }

    def clear_cache(self):
        """Clear the embedding cache."""
        if self.enable_caching and self.cache_collection:
            try:
                result = self.cache_collection.delete_many({})
                logger.info(f"Cleared {result.deleted_count} cache entries")
            except Exception as e:
                logger.error(f"Cache clearing failed: {e}")

    def __del__(self):
        """Cleanup resources."""
        try:
            if hasattr(self, 'embedding_model') and self.embedding_model is not None:
                del self.embedding_model
            if hasattr(torch, 'cuda') and torch.cuda.is_available():
                torch.cuda.empty_cache()
        except Exception:
            pass
