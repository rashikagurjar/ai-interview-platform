import uuid
import threading
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from backend.schemas import ProfileTemplateSchema, ResponseItem, EvaluateResponseSchema

class InterviewSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    track: str
    resume_text: Optional[str] = None
    profile: Optional[ProfileTemplateSchema] = None
    responses: List[ResponseItem] = Field(default_factory=list)
    evaluation: Optional[EvaluateResponseSchema] = None
    is_completed: bool = False

class BaseSessionStore:
    """Interface for session persistence, enabling future database/Redis swaps."""
    def get(self, session_id: str) -> Optional[InterviewSession]:
        raise NotImplementedError()
        
    def save(self, session: InterviewSession) -> None:
        raise NotImplementedError()
        
    def delete(self, session_id: str) -> None:
        raise NotImplementedError()

class InMemorySessionStore(BaseSessionStore):
    """Thread-safe in-memory implementation of the session store."""
    def __init__(self):
        self._sessions: Dict[str, InterviewSession] = {}
        self._lock = threading.Lock()
        
    def get(self, session_id: str) -> Optional[InterviewSession]:
        with self._lock:
            return self._sessions.get(session_id)
            
    def save(self, session: InterviewSession) -> None:
        with self._lock:
            self._sessions[session.session_id] = session
            
    def delete(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)
            
    def list_sessions(self) -> List[InterviewSession]:
        with self._lock:
            return list(self._sessions.values())
