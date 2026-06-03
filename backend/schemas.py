from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ==========================================
# SUB-SCHEMAS
# ==========================================
class QuestionSchema(BaseModel):
    type: str = Field(description="One of 'behavioral', 'system-design', 'coding', 'wrap-up'")
    question: str = Field(description="The actual question text")
    aiCriteria: str = Field(description="Evaluation criteria for the AI")

class CodePresetsSchema(BaseModel):
    js: str = Field(description="JavaScript starter code preset template")
    py: str = Field(description="Python starter code preset template")
    cpp: str = Field(description="C++ starter code preset template")

class TestCaseSchema(BaseModel):
    input_args: List[str] = Field(description="Arguments as strings, e.g. ['[1, 2, 2, 1]', '[2, 2]']")
    expected_output: str = Field(description="Expected output as a string, e.g. '[2]'")

class FeedbackRoundSchema(BaseModel):
    exemplary: str = Field(description="An ideal exemplary response for this round")
    feedback: str = Field(description="Constructive critique of the candidate's actual response")

# ==========================================
# PROFILE & EVALUATION SCHEMAS
# ==========================================
class ProfileTemplateSchema(BaseModel):
    char: str = Field(description="Two letter initials representation e.g. JS, PY, TS")
    title: str = Field(description="Target role title")
    level: str = Field(description="Expert level string")
    skills: List[str] = Field(description="List of detected skills")
    syllabus: List[str] = Field(description="List of core syllabus points to cover")
    questions: List[QuestionSchema] = Field(description="4 questions of type behavioral, system-design, coding, and wrap-up")
    codePresets: CodePresetsSchema = Field(description="Code templates matching the coding question")
    testCases: List[TestCaseSchema] = Field(description="List of 2-3 test cases for code execution verification")

class EvaluateResponseSchema(BaseModel):
    technical: int = Field(description="Technical score (0-100)")
    communication: int = Field(description="Communication score (0-100)")
    problemSolving: int = Field(description="Problem solving score (0-100)")
    cultureFit: int = Field(description="Culture fit score (0-100)")
    codeQuality: int = Field(description="Code quality score (0-100)")
    systemDesign: int = Field(description="System design score (0-100)")
    feedback: Dict[str, FeedbackRoundSchema] = Field(description="Dictionary with feedback for each round type ('behavioral', 'system-design', 'coding', 'wrap-up')")

# ==========================================
# REQUEST / RESPONSE ROUTE SCHEMAS
# ==========================================
class CodeRunRequest(BaseModel):
    language: str
    code: str
    testCases: List[TestCaseSchema]

class CodeRunResponse(BaseModel):
    status: str
    output: str
    pass_status: bool

class ResponseItem(BaseModel):
    round: str
    question: str
    response: str
    criteria: str

class EvaluateRequest(BaseModel):
    track: str
    responses: List[ResponseItem]

class SessionAnswerRequest(BaseModel):
    round: str
    question: str
    response: str
    criteria: str

class SessionResponse(BaseModel):
    session_id: str
    track: str
    profile: Optional[ProfileTemplateSchema] = None
    answers_count: int
    is_completed: bool
