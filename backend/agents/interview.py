import logging
from typing import List, Optional, Any
from backend.services.llm import GeminiClient
from backend.schemas import ProfileTemplateSchema, EvaluateResponseSchema, ResponseItem

logger = logging.getLogger(__name__)

class InterviewAgent:
    """Agent orchestrating conversational interview prompting and assessments via Gemini."""
    def __init__(self, llm_client: GeminiClient, resume_store: Optional[Any] = None):
        self.llm_client = llm_client
        self.resume_store = resume_store
        
    def parse_resume_and_generate_questions(
        self,
        resume_text: str,
        track: str,
        resume_id: Optional[str] = None,
        model_name: str = "gemini-2.5-flash"
    ) -> ProfileTemplateSchema:
        """Parses resume content and dynamically constructs a syllabus and 4 custom questions."""
        system_instruction = (
            "You are an advanced AI technical interviewer. You conduct rigorous, structured "
            "technical assessments tailored specifically to candidate resumes."
        )
        
        # RAG flow: Retrieve relevant chunks if store and resume_id are available
        context_text = resume_text
        if self.resume_store and resume_id:
            try:
                logger.info(f"Querying vector store for track '{track}' and resume_id '{resume_id}'...")
                relevant_docs = self.resume_store.query(
                    query_text=track,
                    n_results=4,
                    where={"resume_id": resume_id}
                )
                if relevant_docs:
                    # Combine retrieved chunks
                    context_text = "\n\n".join([doc.text for doc in relevant_docs])
                    logger.info(f"Successfully retrieved {len(relevant_docs)} chunks from ChromaDB for prompt context.")
                else:
                    logger.warning(f"No resume chunks found in ChromaDB for resume_id '{resume_id}'. Falling back to full resume.")
            except Exception as e:
                logger.error(f"Error querying ChromaDB: {e}. Falling back to full resume text.")
        
        prompt = f"""
Analyze the candidate's resume and target track: '{track}'.
Generate:
1. Two-letter initials (char) matching the track.
2. An appropriate job title and level matching the resume experience.
3. Core competencies (skills) and a custom briefing room syllabus.
4. 4 technical interview questions of types: 'behavioral', 'system-design', 'coding', and 'wrap-up'.
   - The coding question MUST ask the candidate to implement the function 'resolveIntersect(arr1, arr2)' in JS/C++ or 'resolve_intersect(arr1, arr2)' in Python. This function should find the unique intersection between two unsorted arrays.
5. Starter code presets in JS, Python, and C++ matching the 'resolveIntersect' / 'resolve_intersect' function.
6. 2 test cases with integer array inputs and expected outputs to verify their solution inside a compiler.

Candidate Resume/Context Text:
{context_text}
"""
        logger.info(f"Triggering resume parsing and question generation agent for track '{track}'...")
        return self.llm_client.generate_structured(
            prompt=prompt,
            response_schema=ProfileTemplateSchema,
            system_instruction=system_instruction,
            model_name=model_name
        )
        
    def evaluate_transcript(
        self,
        track: str,
        responses: List[ResponseItem],
        model_name: str = "gemini-2.5-flash"
    ) -> EvaluateResponseSchema:
        """Performs a multi-dimensional assessment of the candidate based on the interview transcript."""
        system_instruction = (
            "You are an expert technical evaluation agent scoring candidate interview performances. "
            "You assess technical depth, code quality, and communication skills."
        )
        
        transcript_text = ""
        for idx, resp in enumerate(responses):
            transcript_text += f"""
=== ROUND {idx+1}: {resp.round.upper()} ===
Question: {resp.question}
AI Criteria: {resp.criteria}
Candidate Response: {resp.response}
----------------------------------------
"""
            
        prompt = f"""
Review the candidate's technical interview transcript for the '{track}' track:
{transcript_text}

Rate the candidate's core competencies from 0 to 100:
- technical (Technical Depth)
- communication (Communication)
- problemSolving (Problem Solving)
- cultureFit (Culture Fit)
- codeQuality (Code Quality)
- systemDesign (System Design)

Also write:
1. An ideal exemplary solution showing how a senior-level engineer would answer or code the question.
2. Constructive, direct qualitative feedback explaining strengths and gaps.
"""
        logger.info(f"Triggering transcript evaluation agent for track '{track}'...")
        return self.llm_client.generate_structured(
            prompt=prompt,
            response_schema=EvaluateResponseSchema,
            system_instruction=system_instruction,
            model_name=model_name
        )
