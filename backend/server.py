import os
import tempfile
import subprocess
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pypdf import PdfReader
import docx

# Unified schemas
from backend.schemas import (
    ProfileTemplateSchema,
    CodeRunRequest,
    CodeRunResponse,
    EvaluateResponseSchema,
    SessionAnswerRequest,
    SessionResponse,
    ResponseItem,
    EvaluateRequest,
    QuestionSchema
)

# Services and Agents
from backend.services.llm import GeminiClient, LLMError
from backend.services.session import InterviewSession
from backend.services.mongo_session import MongoSessionStore
from backend.agents.interview import InterviewAgent
from backend.auth.dependencies import get_current_user
from backend.auth.auth_routes import router as auth_router

# New RAG services
from backend.services.embedding_service import SentenceTransformerEmbeddingService
from backend.services.chunking_service import ResumeChunkingService
from backend.services.vector_store import ChromaDBStore, Document
from backend.services.indexing_service import ResumeIndexingService
from pydantic import BaseModel

# Load env variables
load_dotenv()

app = FastAPI(title="AeroAssess Backend API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Routes
app.include_router(auth_router)

# Initialize Services
gemini_client = GeminiClient()
session_store = MongoSessionStore()

# Initialize RAG Services
embedding_service = SentenceTransformerEmbeddingService()
chunking_service = ResumeChunkingService()

resume_store = ChromaDBStore(collection_name="resume_embeddings", embedding_service=embedding_service)
jd_store = ChromaDBStore(collection_name="jd_embeddings", embedding_service=embedding_service)

indexing_service = ResumeIndexingService(
    vector_store=resume_store,
    chunking_service=chunking_service,
    embedding_service=embedding_service
)

# Initialize InterviewAgent with resume_store injected
interview_agent = InterviewAgent(gemini_client, resume_store=resume_store)

# ==========================================
# HEALTH & LEGACY ROUTE ENDPOINTS
# ==========================================
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "gemini_configured": bool(gemini_client.api_key)
    }

@app.post("/api/parse-resume")
async def parse_resume(file: Optional[UploadFile] = File(None), track: str = Form(...), current_user: dict = Depends(get_current_user)):
    """
    Parses resume (optional) and generates technical questions via Gemini.
    Registers a new candidate session.
    """
    text = ""
    if file is not None:
        try:
            contents = await file.read()
            filename = file.filename or ""
            
            if filename.endswith(".pdf"):
                pdf_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                pdf_file.write(contents)
                pdf_file.close()
                
                reader = PdfReader(pdf_file.name)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
                os.unlink(pdf_file.name)
                
            elif filename.endswith((".docx", ".doc")):
                docx_file = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
                docx_file.write(contents)
                docx_file.close()
                
                doc = docx.Document(docx_file.name)
                text = "\n".join([p.text for p in doc.paragraphs])
                os.unlink(docx_file.name)
                
            else:
                text = contents.decode("utf-8", errors="ignore")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")
    else:
        text = f"Candidate has selected the target track: {track}. Generate interview questions, coding presets, and a syllabus tailored to this role."

    if not text.strip():
        text = "No text could be extracted from the resume."

    # Invoke Gemini InterviewAgent to generate dynamic profile questions
    try:
        # Create and register session first to establish session ID
        session = InterviewSession(
            track=track,
            resume_text=text
        )

        candidate_id = f"cand_{session.session_id}"
        resume_id = f"res_{session.session_id}"

        # Vectorize and index resume
        try:
            indexing_service.index_resume(
                candidate_id=candidate_id,
                resume_id=resume_id,
                resume_text=text
            )
        except Exception as e:
            logger.error(f"Failed to index resume in ChromaDB: {e}")

        profile = interview_agent.parse_resume_and_generate_questions(
            resume_text=text,
            track=track,
            resume_id=resume_id
        )
        
        session.profile = profile
        session_store.save(session)
        
        # Return merged dict containing session_id and the profile template fields
        # for clean backward-compatibility with Next.js state binding
        return {
            "session_id": session.session_id,
            **profile.model_dump()
        }
    except LLMError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal agent error: {str(e)}")

# ==========================================
# SESSION MANAGEMENT ENDPOINTS
# ==========================================
@app.get("/api/session/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieves current state metadata for the given interview session."""
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    return SessionResponse(
        session_id=session.session_id,
        track=session.track,
        profile=session.profile,
        answers_count=len(session.responses),
        is_completed=session.is_completed
    )

@app.post("/api/session/{session_id}/answer")
def save_session_answer(session_id: str, req: SessionAnswerRequest, current_user: dict = Depends(get_current_user)):
    """Saves candidate round response incrementally into the session and generates next follow-up question."""
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    # Check if round answer already exists to update/overwrite it (resiliency check)
    existing_idx = -1
    for idx, resp in enumerate(session.responses):
        if resp.round == req.round:
            existing_idx = idx
            break
            
    new_response = ResponseItem(
        round=req.round,
        question=req.question,
        response=req.response,
        criteria=req.criteria
    )
    
    if existing_idx != -1:
        session.responses[existing_idx] = new_response
    else:
        session.responses.append(new_response)
        
    answers_count = len(session.responses)
    
    if session.profile:
        # Clear any questions that were generated in a future round to avoid duplicate appends on retry
        session.profile.questions = session.profile.questions[:answers_count]
        
        try:
            if answers_count == 1:
                # Generate Round 2 (system-design) dynamically
                next_q = interview_agent.generate_next_question(
                    track=session.track,
                    resume_text=session.resume_text or "",
                    responses=session.responses,
                    next_round_type="system-design"
                )
                session.profile.questions.append(next_q)
            elif answers_count == 2:
                # Predefined Round 3 (coding) question
                coding_q = QuestionSchema(
                    type="coding",
                    question="You need to create an optimized helper `resolveIntersect(arr1, arr2)` which finds the unique intersection between two numerical arrays. Complete the code inside the live IDE and execute the verification suite. Explain your time and space complexity bounds.",
                    aiCriteria="Assesses algorithm analysis, linear time-complexity optimizations, and code robustness."
                )
                session.profile.questions.append(coding_q)
            elif answers_count == 3:
                # Generate Round 4 (wrap-up) dynamically
                next_q = interview_agent.generate_next_question(
                    track=session.track,
                    resume_text=session.resume_text or "",
                    responses=session.responses,
                    next_round_type="wrap-up"
                )
                session.profile.questions.append(next_q)
        except Exception as e:
            logger.exception(f"Error generating dynamic followup question: {e}")
            # In case LLM fails, append a fallback question so the user can continue
            fallback_questions = {
                1: QuestionSchema(
                    type="system-design",
                    question="Describe the architectural design and microservices layout of a high-performance scaling system for this track. How would you handle locking or caching?",
                    aiCriteria="Assesses distributed design logic and bottlenecks mitigation."
                ),
                2: QuestionSchema(
                    type="coding",
                    question="You need to create an optimized helper `resolveIntersect(arr1, arr2)` which finds the unique intersection between two numerical arrays. Complete the code inside the live IDE and execute the verification suite. Explain your time and space complexity bounds.",
                    aiCriteria="Assesses algorithm analysis, linear time-complexity optimizations, and code robustness."
                ),
                3: QuestionSchema(
                    type="wrap-up",
                    question="To wrap up, what are the key performance optimizations and scalability trade-offs of the solutions you've proposed today?",
                    aiCriteria="Assesses trade-off analysis and general competence."
                )
            }
            fallback_q = fallback_questions.get(answers_count)
            if fallback_q:
                session.profile.questions.append(fallback_q)

    session_store.save(session)
    return {
        "status": "success", 
        "answers_count": answers_count,
        "profile": session.profile.model_dump() if session.profile else None
    }

@app.post("/api/session/{session_id}/evaluate", response_model=EvaluateResponseSchema)
def evaluate_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Evaluates stored session transcript and generates the Gemini evaluation report."""
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    if not session.responses:
        raise HTTPException(status_code=400, detail="No responses recorded in this session to evaluate.")
        
    try:
        evaluation = interview_agent.evaluate_transcript(
            track=session.track,
            responses=session.responses
        )
        session.evaluation = evaluation
        session.is_completed = True
        session_store.save(session)
        return evaluation
    except LLMError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation agent failed: {str(e)}")

# ==========================================
# CHROMADB RAG ROUTE ENDPOINTS
# ==========================================
class VectorizeResumeRequest(BaseModel):
    candidate_id: str
    resume_text: str

class RetrieveContextRequest(BaseModel):
    query: str
    top_k: int = 5
    resume_id: Optional[str] = None
    candidate_id: Optional[str] = None

class ContextResultItem(BaseModel):
    text: str
    score: float
    metadata: Dict[str, Any]

class RetrieveContextResponse(BaseModel):
    results: List[ContextResultItem]

@app.post("/api/vectorize-resume/{resume_id}")
def vectorize_resume(resume_id: str, req: VectorizeResumeRequest):
    """Vectorize and index resume in ChromaDB store."""
    try:
        chunks_count = indexing_service.index_resume(
            candidate_id=req.candidate_id,
            resume_id=resume_id,
            resume_text=req.resume_text
        )
        return {
            "status": "success",
            "message": "Resume vectorized and indexed successfully",
            "chunks_count": chunks_count,
            "resume_id": resume_id
        }
    except Exception as e:
        logger.exception(f"Error vectorizing resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to vectorize resume: {str(e)}")

@app.post("/api/retrieve-context", response_model=RetrieveContextResponse)
def retrieve_context(req: RetrieveContextRequest):
    """Retrieve top semantic matches from ChromaDB resume store."""
    try:
        where_filter = {}
        if req.resume_id:
            where_filter["resume_id"] = req.resume_id
        if req.candidate_id:
            where_filter["candidate_id"] = req.candidate_id

        where = where_filter if where_filter else None

        documents = resume_store.query(
            query_text=req.query,
            n_results=req.top_k,
            where=where
        )

        results = []
        for doc in documents:
            score = doc.metadata.pop("score", 0.0)
            results.append(ContextResultItem(
                text=doc.text,
                score=score,
                metadata=doc.metadata
            ))

        return RetrieveContextResponse(results=results)
    except Exception as e:
        logger.exception(f"Error retrieving context: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve context: {str(e)}")

@app.delete("/api/resume-embeddings/{resume_id}")
def delete_resume_embeddings(resume_id: str):
    """Delete all vector embeddings associated with a resume_id."""
    try:
        resume_store.delete_documents(where={"resume_id": resume_id})
        return {
            "status": "success",
            "message": f"Successfully deleted embeddings for resume_id: {resume_id}"
        }
    except Exception as e:
        logger.exception(f"Error deleting resume embeddings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete resume embeddings: {str(e)}")

# ==========================================
# LOCAL COMPILER CODE RUNNER ENDPOINT
# ==========================================
@app.post("/api/run-code", response_model=CodeRunResponse)
def run_code(req: CodeRunRequest, current_user: dict = Depends(get_current_user)):
    language = req.language.lower()
    code = req.code
    test_cases = req.testCases

    if language == "py":
        test_harness = """
import json
import sys

# User Code:
{user_code}

# Test runner:
try:
    test_cases = {test_cases_json}
    success = True
    output_logs = []
    
    func_name = 'resolve_intersect'
    if func_name not in globals():
        print("ERROR")
        print("NameError: name 'resolve_intersect' is not defined inside module.")
        sys.exit(0)
        
    func = globals()[func_name]
    
    for idx, tc in enumerate(test_cases):
        inputs = [json.loads(arg) for arg in tc['input_args']]
        expected = json.loads(tc['expected_output'])
        
        result = func(*inputs)
        
        norm_result = sorted(list(result)) if isinstance(result, (list, set)) else result
        norm_expected = sorted(list(expected)) if isinstance(expected, (list, set)) else expected
        
        if norm_result == norm_expected:
            output_logs.append(f"> [TEST {idx+1}] Passed (Input: {inputs}, Returned: {result})")
        else:
            output_logs.append(f"> [TEST {idx+1}] Failed (Input: {inputs}, Expected: {expected}, Returned: {result})")
            success = False
            
    if success:
        print("SUCCESS")
    else:
        print("FAILED")
    print("\\n".join(output_logs))
except Exception as e:
    import traceback
    print("ERROR")
    print(traceback.format_exc())
"""
        test_cases_data = [tc.model_dump() for tc in test_cases]
        harness_code = test_harness.replace("{user_code}", code).replace("{test_cases_json}", repr(test_cases_data))
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w", encoding="utf-8") as f:
            f.write(harness_code)
            temp_path = f.name
            
        try:
            res = subprocess.run(["python", temp_path], capture_output=True, text=True, timeout=5)
            stdout = res.stdout
            stderr = res.stderr
            
            lines = stdout.strip().split("\n")
            status = "ERROR"
            logs = ""
            
            if lines:
                status_header = lines[0]
                if status_header in ["SUCCESS", "FAILED", "ERROR"]:
                    status = status_header
                    logs = "\n".join(lines[1:])
                else:
                    logs = stdout
            
            if stderr:
                logs += f"\nStderr:\n{stderr}"
                status = "ERROR"
                
            return CodeRunResponse(
                status=status,
                output=logs,
                pass_status=(status == "SUCCESS")
            )
        except subprocess.TimeoutExpired:
            return CodeRunResponse(status="ERROR", output="Execution Timeout (limit 5 seconds)", pass_status=False)
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    elif language == "js":
        test_harness = """
// User Code:
{user_code}

// Test runner:
try {
    const testCases = {test_cases_json};
    let success = true;
    const outputLogs = [];
    
    if (typeof resolveIntersect !== 'function') {
        console.log("ERROR");
        console.log("ReferenceError: resolveIntersect is not defined inside the runtime scope.");
        process.exit(0);
    }
    
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const inputs = tc.input_args.map(arg => JSON.parse(arg));
        const expected = JSON.parse(tc.expected_output);
        
        const result = resolveIntersect(...inputs);
        
        const normalize = (val) => {
            if (Array.isArray(val)) return [...val].sort();
            if (val instanceof Set) return [...val].sort();
            return val;
        };
        
        const normResult = normalize(result);
        const normExpected = normalize(expected);
        const isMatch = JSON.stringify(normResult) === JSON.stringify(normExpected);
        
        if (isMatch) {
            outputLogs.push(`> [TEST ${i+1}] Passed (Input: ${JSON.stringify(inputs)}, Returned: ${JSON.stringify(result)})`);
        } else {
            outputLogs.push(`> [TEST ${i+1}] Failed (Input: ${JSON.stringify(inputs)}, Expected: ${JSON.stringify(expected)}, Returned: ${JSON.stringify(result)})`);
            success = false;
        }
    }
    
    if (success) {
        console.log("SUCCESS");
    } else {
        console.log("FAILED");
    }
    console.log(outputLogs.join("\\n"));
} catch (e) {
    console.log("ERROR");
    console.log(e.stack || e.message);
}
"""
        test_cases_data = [tc.model_dump() for tc in test_cases]
        harness_code = test_harness.replace("{user_code}", code).replace("{test_cases_json}", json.dumps(test_cases_data))
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".js", mode="w", encoding="utf-8") as f:
            f.write(harness_code)
            temp_path = f.name
            
        try:
            res = subprocess.run(["node", temp_path], capture_output=True, text=True, timeout=5)
            stdout = res.stdout
            stderr = res.stderr
            
            lines = stdout.strip().split("\n")
            status = "ERROR"
            logs = ""
            
            if lines:
                status_header = lines[0]
                if status_header in ["SUCCESS", "FAILED", "ERROR"]:
                    status = status_header
                    logs = "\n".join(lines[1:])
                else:
                    logs = stdout
            
            if stderr:
                logs += f"\nStderr:\n{stderr}"
                status = "ERROR"
                
            return CodeRunResponse(
                status=status,
                output=logs,
                pass_status=(status == "SUCCESS")
            )
        except subprocess.TimeoutExpired:
            return CodeRunResponse(status="ERROR", output="Execution Timeout (limit 5 seconds)", pass_status=False)
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    elif language == "cpp":
        try:
            # Check if g++ is installed
            gxx_check = subprocess.run(["g++", "--version"], capture_output=True)
            if gxx_check.returncode != 0:
                return CodeRunResponse(
                    status="ERROR", 
                    output="G++ compiler is not available on the server path. Cannot run C++ code locally.", 
                    pass_status=False
                )
        except Exception:
            return CodeRunResponse(
                status="ERROR", 
                output="G++ compiler is not installed or not in system path. Cannot run C++ code locally.", 
                pass_status=False
            )
            
        cpp_tests_code = ""
        for idx, tc in enumerate(test_cases):
            arg1_str = tc.input_args[0].replace("[", "{").replace("]", "}")
            arg2_str = tc.input_args[1].replace("[", "{").replace("]", "}")
            exp_str = tc.expected_output.replace("[", "{").replace("]", "}")
            cpp_tests_code += f"""
    {{
        std::vector<int> a = {arg1_str};
        std::vector<int> b = {arg2_str};
        std::vector<int> expected = {exp_str};
        std::vector<int> result = resolveIntersect(a, b);
        
        std::vector<int> norm_res = result;
        std::sort(norm_res.begin(), norm_res.end());
        std::vector<int> norm_exp = expected;
        std::sort(norm_exp.begin(), norm_exp.end());
        
        if (norm_res == norm_exp) {{
            std::cout << "> [TEST {idx+1}] Passed (Input: {tc.input_args[0]}, {tc.input_args[1]}, Returned: ";
            print_vec(result);
            std::cout << ")\\n";
        }} else {{
            std::cout << "> [TEST {idx+1}] Failed (Input: {tc.input_args[0]}, {tc.input_args[1]}, Expected: {tc.expected_output}, Returned: ";
            print_vec(result);
            std::cout << ")\\n";
            success = false;
        }}
    }}
"""

        cpp_harness = f"""
#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>

// Print helper
void print_vec(const std::vector<int>& v) {{
    std::cout << "[";
    for (size_t i = 0; i < v.size(); ++i) {{
        std::cout << v[i];
        if (i + 1 < v.size()) std::cout << ", ";
    }}
    std::cout << "]";
}}

// User Code:
{code}

int main() {{
    bool success = true;
    
    // Run tests
    {cpp_tests_code}
    
    if (success) {{
        std::cout << "SUCCESS\\n";
    }} else {{
        std::cout << "FAILED\\n";
    }}
    
    return 0;
}}
"""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp", mode="w", encoding="utf-8") as f:
            f.write(cpp_harness)
            temp_cpp_path = f.name
        
        temp_exe_path = temp_cpp_path.replace(".cpp", ".exe")
        
        try:
            comp_res = subprocess.run(["g++", "-std=c++11", temp_cpp_path, "-o", temp_exe_path], capture_output=True, text=True)
            if comp_res.returncode != 0:
                return CodeRunResponse(
                    status="ERROR",
                    output=f"Compilation Error:\n{comp_res.stderr}",
                    pass_status=False
                )
                
            run_res = subprocess.run([temp_exe_path], capture_output=True, text=True, timeout=5)
            stdout = run_res.stdout
            stderr = run_res.stderr
            
            lines = stdout.strip().split("\n")
            status = "ERROR"
            logs = []
            
            for line in lines:
                if line in ["SUCCESS", "FAILED"]:
                    status = line
                else:
                    logs.append(line)
            
            logs_str = "\n".join(logs)
            if stderr:
                logs_str += f"\nStderr:\n{stderr}"
                status = "ERROR"
                
            return CodeRunResponse(
                status=status,
                output=logs_str,
                pass_status=(status == "SUCCESS")
            )
        except subprocess.TimeoutExpired:
            return CodeRunResponse(status="ERROR", output="Execution Timeout (limit 5 seconds)", pass_status=False)
        finally:
            if os.path.exists(temp_cpp_path):
                os.unlink(temp_cpp_path)
            if os.path.exists(temp_exe_path):
                os.unlink(temp_exe_path)
                
    else:
        return CodeRunResponse(status="ERROR", output=f"Unsupported language: {language}", pass_status=False)

@app.post("/api/evaluate", response_model=EvaluateResponseSchema)
def evaluate_interview_legacy(req: EvaluateRequest):
    """Legacy backward-compatible evaluate endpoint."""
    try:
        return interview_agent.evaluate_transcript(
            track=req.track,
            responses=req.responses
        )
    except LLMError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Legacy evaluation failed: {str(e)}")
