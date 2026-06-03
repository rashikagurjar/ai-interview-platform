from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

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

class ChromaDBStorePlaceholder(BaseVectorStore):
    """
    Placeholder implementation for ChromaDB vector store.
    
    Can be seamlessly connected to actual ChromaDB database collections in the future
    without altering the core application API.
    """
    def __init__(self, collection_name: str = "interview_contexts"):
        self.collection_name = collection_name
        self._mock_db: Dict[str, Document] = {}
        
    def add_documents(self, documents: List[Document]) -> None:
        """Indexes documents in the vector store."""
        for doc in documents:
            self._mock_db[doc.id] = doc
            
    def query(self, query_text: str, n_results: int = 3) -> List[Document]:
        """Queries the vector store for semantic matches (simulated in-memory)."""
        # Return mock results from the storage map
        return list(self._mock_db.values())[:n_results]
