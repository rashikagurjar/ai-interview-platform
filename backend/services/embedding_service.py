import logging
from typing import List

logger = logging.getLogger(__name__)

class BaseEmbeddingService:
    """Abstract interface for embedding services to enable swappable backends."""
    def embed(self, text: str) -> List[float]:
        raise NotImplementedError()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError()

class SentenceTransformerEmbeddingService(BaseEmbeddingService):
    """Local SentenceTransformer embedding service using all-MiniLM-L6-v2."""
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        logger.info(f"Loading sentence-transformers model: {model_name}")
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
            logger.info("Successfully loaded sentence-transformers model.")
        except Exception as e:
            logger.error(f"Failed to load sentence-transformers model: {e}")
            raise

    def embed(self, text: str) -> List[float]:
        """Generates embedding for a single text string."""
        if not text:
            return []
        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating single embedding: {e}")
            raise

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a list of text strings."""
        if not texts:
            return []
        try:
            embeddings = self.model.encode(texts)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
