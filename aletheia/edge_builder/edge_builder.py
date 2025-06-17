import logging
import functools
import json
import sys
import os
from typing import List

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pymongo import MongoClient, InsertOne
from config import Config

# Optional imports with error handling
try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    logging.warning("sentence-transformers not available. Edge building will be limited.")
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    logging.warning("google-genai not available. AI classification will be limited.")
    GENAI_AVAILABLE = False

try:
    import torch
    TORCH_AVAILABLE = True
    device = "cuda" if torch.cuda.is_available() else "cpu"
except ImportError:
    logging.warning("torch not available. Using CPU only.")
    TORCH_AVAILABLE = False
    device = "cpu"

log = logging.getLogger("edge_builder")
logging.basicConfig(level=logging.INFO)

EDGE_COLL = "wisdom_edges"                                  # new collection
SIM_THR   = 0.85                                            # cosine threshold
TARGET    = 5_000                                           # edges to write

# connections
client = MongoClient(Config.MONGODB_URI)
chunks = client[Config.DATABASE_NAME][Config.TEXT_COLLECTION_NAME]
edges  = client[Config.DATABASE_NAME][EDGE_COLL]

# Global model variables
sbert = None
gem_client = None

def initialize_models():
    """Initialize sentence transformer model and Gemini API client for edge building."""
    global sbert, gem_client
    
    try:
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            log.info("Initializing SentenceTransformer model for embeddings (all-mpnet-base-v2)...")
            sbert = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")
            if TORCH_AVAILABLE:
                sbert.to(device)
            log.info(f"SentenceTransformer model initialized successfully on device: {device}")
        else:
            log.error("SentenceTransformers not available. Cannot initialize embedding model.")
            sbert = None

        gemini_api_key = Config.GEMINI_API_KEY
        if not gemini_api_key:
            log.error("GEMINI_API_KEY not found in environment variables. Gemini client will not be available.")
            gem_client = None
        elif GENAI_AVAILABLE:
            gem_client = genai.Client(api_key=Config.GEMINI_API_KEY)
            log.info("Gemini API client initialized successfully.")
        else:
            log.error("google-genai not available. Cannot initialize Gemini client.")
            gem_client = None
        
        log.info("AI models initialization complete.")
        return sbert is not None
        
    except Exception as e:
        log.error(f"Failed to initialize AI models: {e}")
        sbert = None
        gem_client = None
        return False

REL_TYPES = ("supports", "critiques", "analogous_to")

@functools.lru_cache(maxsize=10_000)
def classify(a: str, b: str):
    """Classify relationship between two text passages using Gemini."""
    if gem_client is None or not GENAI_AVAILABLE:
        log.warning("Gemini client not available, using default relation")
        return "analogous_to", 0.5
        
    prompt = (
        "Return JSON {relation:(supports|critiques|analogous_to), confidence:0-1}\n\n"
        f"PassageA:{a}\n\nPassageB:{b}"
    )
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="application/json"
        )
        
        response = gem_client.models.generate_content(
            model="gemini-1.5-pro-latest",
            contents=contents,
            config=config,
        )
        
        resp_text = response.text
        data = json.loads(resp_text)
        relation = data.get("relation", "analogous_to").lower()
        conf = float(data.get("confidence", 0.5))
        
    except Exception as e:
        log.warning(f"Classification failed: {e}")
        relation, conf = "analogous_to", 0.5
    
    return relation if relation in REL_TYPES else "analogous_to", conf

def build():
    """Build semantic edges between text chunks using similarity and AI classification."""
    if sbert is None or not SENTENCE_TRANSFORMERS_AVAILABLE:
        log.error("SentenceTransformer model not initialized. Cannot build edges.")
        return
    
    log.info("Starting edge building process...")
    docs = list(chunks.find({}, {"_id":1, "text":1}))
    log.info(f"Found {len(docs)} documents to process")
    
    texts = [d["text"] for d in docs]
    
    if TORCH_AVAILABLE:
        emb = sbert.encode(texts, convert_to_tensor=True, normalize_embeddings=True)
    else:
        emb = sbert.encode(texts, normalize_embeddings=True)
        
    log.info("Generated embeddings for all documents")

    count, bulk = 0, []
    for i in range(len(docs)):
        if i % 100 == 0:
            log.info(f"Processing document {i}/{len(docs)}")
        
        if TORCH_AVAILABLE and hasattr(util, 'pytorch_cos_sim'):
            sims = util.pytorch_cos_sim(emb[i], emb[i+1:])[0]
        else:
            # Fallback to numpy-based similarity if torch not available
            import numpy as np
            emb_i = emb[i] if hasattr(emb[i], 'numpy') else emb[i]
            emb_rest = emb[i+1:] if hasattr(emb[i+1:], 'numpy') else emb[i+1:]
            if hasattr(emb_i, 'numpy'):
                emb_i = emb_i.numpy()
            if hasattr(emb_rest, 'numpy'):
                emb_rest = emb_rest.numpy()
            sims = np.dot(emb_i, emb_rest.T)
            
        for off, s in enumerate(sims):
            if float(s) < SIM_THR: continue
            j = i + 1 + off
            rel, conf = classify(texts[i], texts[j])
            if conf < 0.75: continue
            bulk.append(InsertOne({
                "src_chunk": docs[i]["_id"],
                "dst_chunk": docs[j]["_id"],
                "relation": rel,
                "sim_score": float(s),
                "confidence": conf
            }))
            count += 1
            if len(bulk) >= 1_000:
                edges.bulk_write(bulk, ordered=False)
                bulk = []
                log.info(f"Wrote batch of edges. Total so far: {count}")
            if count >= TARGET: break
        if count >= TARGET: break
    
    if bulk:
        edges.bulk_write(bulk, ordered=False)
    
    log.info(f"Edge building complete. Stored {count} edges.")

if __name__ == "__main__":
    if initialize_models():
        build()
    else:
        log.error("Failed to initialize models. Exiting.")