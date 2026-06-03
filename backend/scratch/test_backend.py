import os
import sys
from pydantic import BaseModel, Field

# Add backend to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.llm import GeminiClient
from backend.services.session import InMemorySessionStore, InterviewSession
from backend.services.vector_store import ChromaDBStorePlaceholder, Document
from backend.agents.interview import InterviewAgent
from backend.schemas import QuestionSchema, ResponseItem

class TestItem(BaseModel):
    name: str = Field(description="A test name")
    success: bool = Field(description="Boolean verification flag")

def main():
    print("=== TESTING PRODUCTION LLM & AGENT LAYER ===")
    
    # 1. Test Session Management
    print("\n--- Testing SessionStore ---")
    store = InMemorySessionStore()
    session = InterviewSession(track="frontend")
    session_id = session.session_id
    print(f"Created session with ID: {session_id}")
    
    # Save session
    store.save(session)
    retrieved = store.get(session_id)
    assert retrieved is not None, "Failed to retrieve session."
    assert retrieved.track == "frontend", "Session track mismatch."
    print("SessionStore save & retrieve: SUCCESS")
    
    # Test incremental answers
    retrieved.responses.append(ResponseItem(
        round="behavioral",
        question="Tell me about a design conflict.",
        response="I used custom variables to resolve it.",
        criteria="Assesses design conflicts"
    ))
    store.save(retrieved)
    updated = store.get(session_id)
    assert len(updated.responses) == 1, "Session responses not updated."
    print("SessionStore incremental answer save: SUCCESS")
    
    # 2. Test Vector Store interface
    print("\n--- Testing VectorStore Interface ---")
    vector_store = ChromaDBStorePlaceholder()
    doc = Document(id="doc1", text="Candidate has senior React knowledge.", metadata={"track": "frontend"})
    vector_store.add_documents([doc])
    
    matches = vector_store.query("React", n_results=1)
    assert len(matches) == 1, "VectorStore query failed."
    assert matches[0].text == doc.text, "VectorStore matched text mismatch."
    print("VectorStore interface and ChromaDB mock: SUCCESS")

    # 3. Test LLM client & structured output
    print("\n--- Testing GeminiClient (LLM) ---")
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY not configured. Skipping LLM client e2e test.")
        print("\n=== ALL OFFLINE TESTS PASSED ===")
        return
        
    try:
        client = GeminiClient(api_key=api_key)
        # Run a simple structured output test
        result = client.generate_structured(
            prompt="Generate a test object with name 'Google DeepMind' and success True",
            response_schema=TestItem
        )
        print(f"Structured response received: {result}")
        assert result.name == "Google DeepMind"
        assert result.success is True
        print("GeminiClient structured JSON output validation: SUCCESS")
        
        # Test Interview Agent
        print("\n--- Testing InterviewAgent ---")
        agent = InterviewAgent(client)
        print("Requesting resume parse...")
        profile = agent.parse_resume_and_generate_questions(
            resume_text="Senior React Engineer with 8 years of experience. Built scalable CSS design systems.",
            track="frontend"
        )
        print(f"Generated Profile Title: {profile.title}")
        print(f"Generated Skills: {profile.skills}")
        print(f"Number of generated questions: {len(profile.questions)}")
        assert len(profile.questions) == 4, "Should generate exactly 4 questions."
        assert len(profile.testCases) > 0, "Should generate test cases."
        print("InterviewAgent e2e execution: SUCCESS")
        
        print("\n=== ALL ONLINE/OFFLINE TESTS PASSED ===")
        
    except Exception as e:
        print(f"LLM/Agent integration test FAILED: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
