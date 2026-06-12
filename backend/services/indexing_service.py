import logging
from datetime import datetime
from backend.services.embedding_service import BaseEmbeddingService
from backend.services.chunking_service import ResumeChunkingService
from backend.services.vector_store import ChromaDBStore, Document

logger = logging.getLogger(__name__)

class ResumeIndexingService:
    """Service coordinates the pipeline: Resume Text -> Chunking -> Embeddings -> ChromaDB Storage."""

    def __init__(
        self,
        vector_store: ChromaDBStore,
        chunking_service: ResumeChunkingService,
        embedding_service: BaseEmbeddingService
    ):
        self.vector_store = vector_store
        self.chunking_service = chunking_service
        self.embedding_service = embedding_service

    def index_resume(self, candidate_id: str, resume_id: str, resume_text: str) -> int:
        """
        Chunks candidate's resume, computes embeddings, and indexes them in ChromaDB.
        Returns the number of indexed chunks.
        """
        logger.info(f"Starting indexing pipeline for candidate_id: {candidate_id}, resume_id: {resume_id}")

        if not resume_text or not resume_text.strip():
            logger.warning("Empty resume text provided. Skipping indexing.")
            return 0

        try:
            # 1. Chunk resume text
            chunks = self.chunking_service.chunk_text(resume_text)
            logger.info(f"Resume split into {len(chunks)} chunks.")

            # 2. Build Document list with metadata
            documents = []
            for idx, chunk in enumerate(chunks):
                chunk_id = f"{resume_id}_chunk_{idx}"
                metadata = {
                    "candidate_id": candidate_id,
                    "resume_id": resume_id,
                    "chunk_id": chunk_id,
                    "source": "resume",
                    "created_at": datetime.utcnow().isoformat()
                }
                documents.append(Document(
                    id=chunk_id,
                    text=chunk,
                    metadata=metadata
                ))

            # 3. Save to vector store
            if documents:
                self.vector_store.add_documents(documents)
                logger.info(f"Successfully stored {len(documents)} resume chunks in ChromaDB.")
            
            return len(documents)

        except Exception as e:
            logger.exception(f"Failed to complete resume indexing pipeline: {e}")
            raise
