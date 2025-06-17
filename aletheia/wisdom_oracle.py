# wisdom_oracle.py
import logging
import torch
from transformers import AutoTokenizer, AutoModel
from typing import List, Dict, Tuple
import pymongo
from aletheia.config import Config

logger = logging.getLogger(__name__)

class WisdomOracle:
    """
    The Wisdom Network evaluates an AI's actions against the corpus of human wisdom.
    It uses vector search to find relevant philosophical texts and generates structured critiques.
    """
    def __init__(self, db):
        self.db = db
        self.text_collection = self.db[Config.TEXT_COLLECTION_NAME]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.embedding_model = None
        self._initialize_local_embedding_model()
        logger.info(f"WisdomOracle initialized. Using device: {self.device}")

    def _initialize_local_embedding_model(self):
        try:
            logger.info(f"Initializing local embedding model: {Config.EMBEDDING_MODEL_NAME}")
            self.tokenizer = AutoTokenizer.from_pretrained(Config.EMBEDDING_MODEL_NAME)
            self.embedding_model = AutoModel.from_pretrained(Config.EMBEDDING_MODEL_NAME).to(self.device)
            self.embedding_model.eval()
            logger.info("Local embedding model initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize local embedding model: {e}", exc_info=True)
            raise

    def generate_embedding(self, text: str) -> List[float]:
        """Generates a vector embedding for a given text using a local model."""
        if not text or not text.strip():
            return []
        try:
            inputs = self.tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=512).to(self.device)
            with torch.no_grad():
                outputs = self.embedding_model(**inputs)
            # Mean pooling
            attention_mask = inputs['attention_mask']
            token_embeddings = outputs.last_hidden_state
            input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
            sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
            sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
            mean_pooled = sum_embeddings / sum_mask
            return mean_pooled[0].cpu().numpy().tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            return []

    def _vector_search(self, embedding: List[float], limit: int = 3) -> List[Dict]:
        """Performs a vector search on the philosophical texts collection."""
        if not embedding:
            return []
        try:
            pipeline = [
                {
                    "$vectorSearch": {
                        "index": Config.VECTOR_SEARCH_INDEX,
                        "path": "embedding",
                        "queryVector": embedding,
                        "numCandidates": limit * 15,
                        "limit": limit
                    }
                },
                {
                    "$project": {
                        "text": 1, "author": 1, "source": 1,
                        "ethical_framework": 1, "era": 1,
                        "score": {"$meta": "vectorSearchScore"}
                    }
                }
            ]
            return list(self.text_collection.aggregate(pipeline))
        except pymongo.errors.OperationFailure as e:
            logger.error(f"Vector search failed: {e.details}", exc_info=True)
            return []

    def _build_context_from_docs(self, docs: List[Dict], framework_name: str) -> str:
        """Builds a formatted string context from retrieved documents."""
        context_parts = [f"--- Context for {framework_name} ---"]
        for doc in docs:
            context_parts.append(
                f"Source: {doc.get('author', 'Unknown')} - {doc.get('source', 'Unknown')}\n"
                f"Framework: {doc.get('ethical_framework', 'N/A')}\n"
                f"Score: {doc.get('score', 0):.2f}\n"
                f"Text: \"{doc.get('text', '')}\""
            )
        return "\n\n".join(context_parts)

    def generate_structured_critique(self, scenario: Dict, action: str, justification: str) -> Dict:
        """
        The core function of the Oracle. Generates a multi-faceted philosophical critique
        of an agent's action.
        """
        critique = {}
        frameworks_to_query = {
            "utilitarian": "utility, consequences, greatest good, happiness, suffering, outcome",
            "deontological": "duty, rules, obligation, rights, intent, universal law, means to an end",
            "virtue_ethics": "character, virtue, flourishing, compassion, courage, justice, wisdom",
            "ai_safety": "alignment, corrigibility, instrumental convergence, value lock-in, existential risk"
        }

        full_context = ""
        for framework, keywords in frameworks_to_query.items():
            query_text = f"Critique the action '{action}' for the scenario '{scenario['title']}' using principles of: {keywords}"
            embedding = self.generate_embedding(query_text)
            docs = self._vector_search(embedding)
            critique[f'{framework}_docs'] = docs
            full_context += self._build_context_from_docs(docs, framework.replace("_", " ").title()) + "\n\n"
        
        # This is where we would call the Gemini API.
        # For now, we will simulate the response based on the retrieved docs.
        # In a real implementation, you would pass `full_context` to the LLM.
        # The prompt would be in `ai_agent.py` or `app.py` that calls this.
        logger.info("Generated multi-framework context for LLM critique.")
        
        # The actual call to the LLM to generate the final JSON happens in the Agent/API layer
        # This function's job is to prepare the context.
        return {
            "critique_context": full_context,
            "retrieved_docs": critique
        }