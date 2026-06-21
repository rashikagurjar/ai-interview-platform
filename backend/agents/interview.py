import logging
from typing import List, Optional, Any
from backend.services.llm import GeminiClient
from backend.schemas import ProfileTemplateSchema, EvaluateResponseSchema, ResponseItem, QuestionSchema

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

        system_instruction = (
            "You are an advanced AI technical interviewer. "
            "Generate interview questions ONLY from the provided candidate context. "
            "Do not invent projects, technologies, experience, or skills that are not present in the context."
        )

        context_text = resume_text

        if self.resume_store and resume_id:
            try:
                logger.info(
                    f"Querying vector store for track '{track}' and resume_id '{resume_id}'..."
                )

                relevant_docs = self.resume_store.query(
                    query_text=track,
                    n_results=4,
                    where={"resume_id": resume_id}
                )

                if relevant_docs:
                    context_text = "\n\n".join(
                        [doc.text for doc in relevant_docs]
                    )

                    logger.info(
                        f"Successfully retrieved {len(relevant_docs)} chunks from ChromaDB."
                    )

                    print("\n========== RETRIEVED CONTEXT ==========")
                    print(context_text)
                    print("=======================================\n")

                else:
                    logger.warning(
                        f"No resume chunks found for resume_id '{resume_id}'."
                    )

            except Exception as e:
                logger.error(
                    f"Error querying ChromaDB: {e}"
                )

        prompt = f"""
TARGET TRACK:
{track}

IMPORTANT RULES:

1. The behavioral question MUST reference a project,
   experience, technology, or achievement present in the candidate context.

2. Do NOT generate generic questions unless they are clearly
   mentioned in the candidate context.

3. Use the candidate context as the primary source of truth.

CANDIDATE CONTEXT:

{context_text}

Generate:

1. Two-letter initials.
2. Appropriate job title.
3. Skills list.
4. Interview syllabus.
5. Exactly ONE interview question:
   - This question must be of type 'behavioral'.
   - It MUST reference a project, experience, technology, or achievement present in the candidate context.

Also generate starter code templates and two test cases. The coding question must implement resolveIntersect(arr1, arr2) or resolve_intersect(arr1, arr2) to find unique common elements between two unsorted arrays.
"""

        print("\n========== FINAL PROMPT ==========")
        print(prompt)
        print("==================================\n")

        logger.info(
            f"Triggering resume parsing and question generation agent for track '{track}'..."
        )

        return self.llm_client.generate_structured(
            prompt=prompt,
            response_schema=ProfileTemplateSchema,
            system_instruction=system_instruction,
            model_name=model_name
        )

    def generate_next_question(
        self,
        track: str,
        resume_text: str,
        responses: List[ResponseItem],
        next_round_type: str,
        model_name: str = "gemini-2.5-flash"
    ) -> QuestionSchema:
        """Generates the next question dynamically based on resume context and conversation history."""
        system_instruction = (
            "You are an advanced AI technical interviewer. "
            "Formulate the next question dynamically based on the candidate's track, resume, "
            "and the interview transcript so far."
        )

        transcript_text = ""
        for idx, resp in enumerate(responses):
            transcript_text += f"Round {idx+1} ({resp.round}):\nQuestion: {resp.question}\nAnswer: {resp.response}\n\n"

        prompt = f"""
CANDIDATE PROFILE TRACK:
{track}

CANDIDATE RESUME CONTEXT:
{resume_text}

CONVERSATION TRANSCRIPT SO FAR:
{transcript_text}

TARGET NEXT ROUND TYPE:
{next_round_type}

INSTRUCTIONS:
1. Generate exactly one question of type '{next_round_type}' and its evaluation criteria.
2. If the next round type is 'system-design', analyze the candidate's resume and their behavioral answers. Generate a system design question that is derived from their actual past projects, technologies, or challenges. If possible, make it a natural follow-up probing a technical choice they described in their previous response.
3. If the next round type is 'wrap-up', review their behavioral, system-design, and coding answers. Ask a tailored wrap-up question analyzing their architectural choices, dynamic engine optimizations, or trade-offs mentioned during the coding and system design rounds.
"""
        logger.info(f"Triggering dynamic next question generation for round '{next_round_type}'...")
        return self.llm_client.generate_structured(
            prompt=prompt,
            response_schema=QuestionSchema,
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
