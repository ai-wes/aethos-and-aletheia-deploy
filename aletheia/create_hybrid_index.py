#!/usr/bin/env python3
import logging
from pymongo import MongoClient, errors
from config import Config                                   # ← your class

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("create_hybrid_index")

INDEX_NAME = Config.VECTOR_SEARCH_INDEX or "wisdom_hybrid_idx"
DIM        = 768                                            # BERT-base

client     = MongoClient(Config.MONGODB_URI)
coll       = client[Config.DATABASE_NAME][Config.TEXT_COLLECTION_NAME]

index_def = {
    "name": INDEX_NAME,
    "type": "vectorSearch",
    "options": { "numCandidates": 200, "dimensions": DIM, "similarity": "cosine" },
    "fields": [
        { "type": "string", "path": "text"      },          # BM25
        { "type": "vector", "path": "embedding" }           # HNSW
    ]
}

try:
    log.info("Creating / updating hybrid index '%s' …", INDEX_NAME)
    coll.database.command(
        {"createSearchIndex": Config.TEXT_COLLECTION_NAME, "definition": index_def}
    )
    log.info("Hybrid index ready.")
except errors.OperationFailure as e:
    if "already exists" in str(e):
        log.warning("Index already exists — skipped.")
    else:
        raise