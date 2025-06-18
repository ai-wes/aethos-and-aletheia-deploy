# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB
    MONGODB_URI = os.getenv('MONGODB_URI')
    DATABASE_NAME = os.getenv('DATABASE_NAME')
    
    # Core SophiaGuard/Wisdom Oracle Collections
    TEXT_COLLECTION_NAME = os.getenv('COLLECTION_NAME', 'philosophical_texts')
    VECTOR_SEARCH_INDEX = os.getenv('VECTOR_SEARCH_INDEX', 'default_vector_index')
    REASONING_TRACES_COLLECTION_NAME = os.getenv('REASONING_TRACES_COLLECTION_NAME', 'reasoning_traces')

    # Aletheia Framework Collections
    SCENARIOS_COLLECTION = os.getenv('SCENARIOS_COLLECTION', 'ethical_scenarios')
    AGENTS_COLLECTION = os.getenv('AGENTS_COLLECTION', 'ai_agents')
    LEARNING_HISTORY_COLLECTION = os.getenv('LEARNING_HISTORY_COLLECTION', 'learning_history')

    # Google AI
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    GOOGLE_CLOUD_PROJECT = os.getenv('GOOGLE_CLOUD_PROJECT')
    GOOGLE_CLOUD_LOCATION = os.getenv('GOOGLE_CLOUD_LOCATION')
    
    # LLM Models
    GENERATIVE_MODEL_NAME = "gemini-1.5-flash-latest"
    EMBEDDING_MODEL_NAME = "bert-base-uncased" # Using local model