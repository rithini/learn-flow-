from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import GenerationType, DifficultyLevel


# Request to trigger AI generation
class AIGenerationRequest(BaseModel):
    generation_type: GenerationType
    topic_id: Optional[str] = None
    material_id: Optional[str] = None
    level: Optional[str] = "STANDARD"
    difficulty: Optional[str] = "MEDIUM"
    question_count: Optional[int] = 4


# --- Structured Output Pydantic Schemas for AI LLM ---

class StructuredCapsuleOutput(BaseModel):
    title: str = Field(..., description="Concise, clear topic title")
    learning_objectives: List[str] = Field(..., description="2-4 key learning objectives")
    standard_explanation: str = Field(..., description="2-3 comprehensive paragraphs")
    simple_explanation: str = Field(..., description="Simplified analogy or plain English breakdown")
    key_points: List[str] = Field(..., description="4-6 bullet points")
    real_world_example: str = Field(..., description="Concrete real-world application or case")
    recap_question: str = Field(..., description="Quick self-check question")
    estimated_minutes: int = Field(5, description="Estimated minutes to read")
    source_chunk_ids: List[str] = Field(default_factory=list, description="IDs of source chunks used")
    needs_human_review: bool = Field(False, description="Flag true if source material had ambiguities")


class StructuredQuizQuestion(BaseModel):
    question_text: str = Field(..., description="Clear question text")
    question_type: str = Field("MCQ", description="MCQ or TRUE_FALSE")
    options: List[str] = Field(..., min_length=2, max_length=4, description="List of options")
    correct_option_index: int = Field(..., ge=0, le=3, description="0-based index of correct option")
    explanation: str = Field(..., description="Explanation of why this option is correct")
    difficulty: DifficultyLevel = Field(DifficultyLevel.MEDIUM, description="EASY, MEDIUM, or HARD")
    learning_objective: str = Field(..., description="Learning outcome addressed")
    source_chunk_ids: List[str] = Field(default_factory=list, description="IDs of source chunks used")


class StructuredQuizOutput(BaseModel):
    title: str = Field(..., description="Quiz title")
    topic_id: Optional[str] = None
    questions: List[StructuredQuizQuestion] = Field(..., min_length=1)
    needs_human_review: bool = Field(False)


class StructuredTopicItem(BaseModel):
    title: str
    description: str
    order_index: int
    learning_objectives: List[str]
    estimated_minutes: int = 15


class StructuredTopicExtractionOutput(BaseModel):
    course_title: str
    topics: List[StructuredTopicItem]
    needs_human_review: bool = False


class StructuredVideoScript(BaseModel):
    title: str
    duration_estimate_seconds: int = 90
    scenes: List[Dict[str, str]]  # e.g. [{"scene_no": "1", "narration": "...", "slide_text": "..."}]
