import os
import sys
import shutil
import gc
from datetime import datetime
from dotenv import load_dotenv

# Load env variables at start
load_dotenv()

# Add backend to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.embedding_service import SentenceTransformerEmbeddingService
from backend.services.chunking_service import ResumeChunkingService
from backend.services.vector_store import ChromaDBStore, Document
from backend.services.indexing_service import ResumeIndexingService
from backend.agents.interview import InterviewAgent
from backend.services.llm import GeminiClient

def run_tests():
    print("=== STARTING RAG SYSTEM VERIFICATION ===")
    
    # 1. Setup temporary persist directory for testing
    test_db_dir = "./test_chromadb_storage"
    if os.path.exists(test_db_dir):
        try:
            shutil.rmtree(test_db_dir)
        except Exception:
            pass
        
    os.environ["CHROMADB_PERSIST_DIRECTORY"] = test_db_dir
    
    print("\n[Step 1] Initializing services...")
    embedding_service = SentenceTransformerEmbeddingService()
    chunking_service = ResumeChunkingService()
    
    resume_store = ChromaDBStore(
        collection_name="test_resume_embeddings",
        embedding_service=embedding_service,
        persist_directory=test_db_dir
    )
    
    indexing_service = ResumeIndexingService(
        vector_store=resume_store,
        chunking_service=chunking_service,
        embedding_service=embedding_service
    )
    
    # 2. Test Resume Chunking
    print("\n[Step 2] Testing ResumeChunkingService...")
    sample_resume = """
John Doe
Senior Software Engineer
john.doe@example.com

SUMMARY
Passionate senior software engineer with 6+ years of experience building Python and React applications.

EXPERIENCE
Lead Developer at Tech Corp (2020 - Present)
- Architected a distributed messaging pipeline handling 100k requests per second using RabbitMQ and Python.
- Designed a custom CSS styling system that improved frontend rendering performance by 40%.
- Led a team of 4 junior developers and established CI/CD pipelines.

Software Engineer at Startup Co (2018 - 2020)
- Designed and built RESTful web services in FastAPI.
- Optimized PostgreSQL database queries, reducing average API response time by 150ms.

SKILLS
Programming: Python, JavaScript, SQL, C++
Frameworks: FastAPI, Django, React, Next.js
Databases: PostgreSQL, MongoDB, Redis, ChromaDB
Other: Docker, Kubernetes, AWS, RabbitMQ
"""
    
    chunks = chunking_service.chunk_text(sample_resume)
    print(f"Chunks generated: {len(chunks)}")
    for idx, chunk in enumerate(chunks):
        print(f"--- Chunk {idx} ({len(chunk)} chars) ---")
        print(chunk[:150] + "...")
        
    assert len(chunks) > 0, "No chunks generated!"
    
    # 3. Test Resume Indexing Pipeline
    print("\n[Step 3] Testing ResumeIndexingService...")
    candidate_id = "cand_test_123"
    resume_id = "res_test_123"
    
    indexed_count = indexing_service.index_resume(
        candidate_id=candidate_id,
        resume_id=resume_id,
        resume_text=sample_resume
    )
    print(f"Indexed chunks count: {indexed_count}")
    assert indexed_count == len(chunks), "Indexed chunks count mismatch!"
    
    # 4. Test ChromaDB Query and Scoring
    print("\n[Step 4] Testing Vector Search and Retrieval...")
    # Query for "messaging pipeline"
    query_text = "messaging pipeline"
    results = resume_store.query(
        query_text=query_text,
        n_results=2,
        where={"resume_id": resume_id}
    )
    
    print(f"Search results for: '{query_text}'")
    assert len(results) > 0, "No search results returned!"
    for r in results:
        score = r.metadata.get("score")
        print(f"- Text snippet: {r.text[:120]}...")
        print(f"  Score: {score:.4f}")
        print(f"  Metadata: {r.metadata}")
        assert score is not None, "Similarity score is missing from metadata!"
        assert 0.0 <= score <= 1.0, f"Score {score} out of 0-1 range!"
        
    # Test delete
    print("\n[Step 5] Testing Document Deletion...")
    resume_store.delete_documents(where={"resume_id": resume_id})
    remaining = resume_store.query(query_text=query_text, n_results=1, where={"resume_id": resume_id})
    print(f"Remaining documents after deletion: {len(remaining)}")
    assert len(remaining) == 0, "Documents were not deleted successfully!"
    
    # Re-index for agent testing
    indexing_service.index_resume(
        candidate_id=candidate_id,
        resume_id=resume_id,
        resume_text=sample_resume
    )

    # 5. Test InterviewAgent question generation with RAG
    print("\n[Step 6] Testing InterviewAgent RAG prompt integration...")
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("WARNING: GEMINI_API_KEY not found. Skipping Gemini call verification.")
    else:
        print(f"Using GEMINI_API_KEY: {gemini_api_key[:10]}...")
        client = GeminiClient(api_key=gemini_api_key)
        agent = InterviewAgent(llm_client=client, resume_store=resume_store)
        
        print("Generating syllabus and questions for track 'Python Backend' using resume...")
        profile = agent.parse_resume_and_generate_questions(
            resume_text=sample_resume,
            track="Python Backend",
            resume_id=resume_id
        )
        
        print("\n--- GENERATED INTERVIEW SYLLABUS ---")
        print(f"Title: {profile.title}")
        print(f"Skills: {profile.skills}")
        print(f"Syllabus: {profile.syllabus}")
        print("\n--- GENERATED QUESTIONS ---")
        for q in profile.questions:
            print(f"- [{q.type}] {q.question}")
            print(f"  Criteria: {q.aiCriteria}")
            
        assert len(profile.questions) == 4, "Should generate exactly 4 questions."
        
    # Release handles for Windows cleanup
    del resume_store
    del indexing_service
    gc.collect()

    # Clean up test database
    try:
        if os.path.exists(test_db_dir):
            shutil.rmtree(test_db_dir)
            print("\nSuccessfully cleaned up temporary test database.")
    except Exception as e:
        print(f"\nWarning: could not clean up test db directory: {e}")
        
    print("\n=== ALL RAG SYSTEM TESTS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
