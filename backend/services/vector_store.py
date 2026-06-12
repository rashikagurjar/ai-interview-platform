import os
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

class Document(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class BaseVectorStore:
    """Abstract interface for RAG document vector stores."""
    def add_documents(self, documents: List[Document]) -> None:
        raise NotImplementedError()
        
    def query(self, query_text: str, n_results: int = 3) -> List[Document]:
        raise NotImplementedError()

class ChromaDBStore(BaseVectorStore):
    """
    Production-ready ChromaDB implementation of the vector store interface.
    """
    def __init__(
        self,
        collection_name: str,
        embedding_service: Optional[Any] = None,
        persist_directory: Optional[str] = None
    ):
        """
        Initializes the ChromaDB persistent client and collection.
        Uses cosine distance space by default so scores can be computed as: 1 - distance.
        """
        self.collection_name = collection_name
        self.persist_directory = persist_directory or os.getenv("CHROMADB_PERSIST_DIRECTORY", "./chromadb_storage")
        self.embedding_service = embedding_service

        logger.info(f"Initializing ChromaDB PersistentClient at path: {self.persist_directory}")
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            # Use cosine similarity space
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"Successfully loaded/created collection: {self.collection_name}")
        except Exception as e:
            logger.exception(f"Failed to initialize ChromaDB collection {collection_name}: {e}")
            raise

    def add_documents(self, documents: List[Document]) -> None:
        """Indexes documents in the ChromaDB collection."""
        if not documents:
            return

        ids = [doc.id for doc in documents]
        texts = [doc.text for doc in documents]
        metadatas = [doc.metadata for doc in documents]

        embeddings = None
        if self.embedding_service:
            embeddings = self.embedding_service.embed_batch(texts)

        try:
            self.collection.add(
                ids=ids,
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings
            )
            logger.info(f"Added {len(documents)} documents to ChromaDB collection {self.collection_name}")
        except Exception as e:
            logger.error(f"Error adding documents to collection {self.collection_name}: {e}")
            raise

    def query(self, query_text: str, n_results: int = 3, where: Optional[Dict[str, Any]] = None) -> List[Document]:
        """
        Queries ChromaDB for semantic matches.
        Calculates similarity score as: 1.0 - distance (for cosine space).
        """
        query_embeddings = None
        if self.embedding_service:
            query_embeddings = [self.embedding_service.embed(query_text)]

        try:
            results = self.collection.query(
                query_texts=[query_text] if query_embeddings is None else None,
                query_embeddings=query_embeddings,
                n_results=n_results,
                where=where
            )
        except Exception as e:
            logger.error(f"Error querying ChromaDB collection {self.collection_name}: {e}")
            raise

        documents = []
        if not results or "ids" not in results or not results["ids"]:
            return documents

        ids = results["ids"][0]
        texts = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results.get("distances", [[]])[0]

        for idx in range(len(ids)):
            meta = metadatas[idx].copy() if metadatas[idx] else {}
            if idx < len(distances):
                # Cosine distance = 1 - cosine_similarity
                # So score = 1.0 - distance
                score = 1.0 - distances[idx]
                meta["score"] = score

            documents.append(Document(
                id=ids[idx],
                text=texts[idx],
                metadata=meta
            ))

        return documents

    def delete_documents(self, ids: Optional[List[str]] = None, where: Optional[Dict[str, Any]] = None) -> None:
        """Deletes documents matching ids or metadata filter."""
        try:
            self.collection.delete(ids=ids, where=where)
            logger.info(f"Deleted documents from collection {self.collection_name} (ids={ids}, where={where})")
        except Exception as e:
            logger.error(f"Error deleting documents from collection {self.collection_name}: {e}")
            raise

    def update_documents(self, documents: List[Document]) -> None:
        """Updates existing documents in the ChromaDB collection."""
        if not documents:
            return

        ids = [doc.id for doc in documents]
        texts = [doc.text for doc in documents]
        metadatas = [doc.metadata for doc in documents]

        embeddings = None
        if self.embedding_service:
            embeddings = self.embedding_service.embed_batch(texts)

        try:
            self.collection.update(
                ids=ids,
                documents=texts,
                metadatas=metadatas,
                embeddings=embeddings
            )
            logger.info(f"Updated {len(documents)} documents in collection {self.collection_name}")
        except Exception as e:
            logger.error(f"Error updating documents in collection {self.collection_name}: {e}")
            raise
