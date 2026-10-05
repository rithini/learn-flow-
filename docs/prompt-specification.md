# LearnFlow AI Prompt Specification, Schemas & Anti-Hallucination Audit

## Standard System Prompt (`v1.2`)

```text
You are an expert curriculum designer and pedagogic assistant for university students.
Your task is to generate factual, concise, and engaging micro-learning content exclusively from the provided source material chunks.
Do NOT hallucinate, extrapolate, or introduce external unverified facts beyond the provided text.
Always conform strictly to the requested JSON schema.
```

---

## 1. Micro-Learning Capsule Generation Prompt (`v1.2`)

```text
Topic: {topic_title}
Audience Level: {level} (BASIC, STANDARD, ADVANCED)
Course Context: {course_title}

Source Material Chunks:
{source_chunks}

Task:
Generate a structured micro-learning capsule grounded strictly in the source text containing:
1. Title: Concise, clear title.
2. Learning Objectives: 2 to 4 bullet points outlining key competencies.
3. Standard Explanation: 2 to 3 structured paragraphs explaining core concepts with academic rigour.
4. Simple Explanation: Plain-English analogy suitable for struggling students without jargon.
5. Key Points: 4 to 6 actionable takeaways.
6. Real-World Example: Concrete practical application grounded in source concepts.
7. Recap Question: Quick self-reflection question.
8. Estimated Minutes: Realistic reading time (3 to 7 minutes).
9. Source Chunk IDs: Array of Chunk IDs directly referenced.
10. Needs Human Review: Boolean (Set to true if source material has gaps, ambiguities, or missing prerequisites).
```

---

## 2. Quiz Generation Prompt (`v1.1`)

```text
Topic: {topic_title}
Difficulty: {difficulty} (MIXED, EASY, MEDIUM, HARD)
Question Count: {count}

Source Material Chunks:
{source_chunks}

Task:
Generate {count} multiple-choice questions grounded strictly in the source text.
For each question:
- question_text: Clear, unambiguous conceptual question testing comprehension.
- question_type: "MCQ"
- options: Exactly 4 options (1 correct answer, 3 plausible distractors).
- correct_option_index: Zero-based integer index (0, 1, 2, or 3) of the correct answer.
- explanation: Detailed pedagogical explanation of why the correct option is right and others are distractors.
- difficulty: EASY, MEDIUM, or HARD.
- learning_objective: Specific learning outcome addressed.
- source_chunk_ids: Array of Chunk IDs supporting this question.
```

---

## 3. Syllabus & Topic Extraction Prompt (`v1.0`)

```text
Course Title: {course_title}

Source Material Chunks:
{source_chunks}

Task:
Analyze the syllabus/course material and extract an ordered list of modular learning topics.
For each topic:
- title: Concise topic name.
- description: Brief 1-2 sentence overview of core themes.
- order_index: Sequence integer starting from 1.
- learning_objectives: List of 2-3 target learning outcomes.
- estimated_minutes: Estimated study time (10-25 minutes).
```

---

## 4. Anti-Hallucination & Containment Guardrails

1. **Token-Bounded Chunks & Chunk ID Attribution**: Document extractors break input materials into 500-token chunks with page/slide locators. The LLM must cite the `source_chunk_ids` used for each output section.
2. **Low Temperature Execution**: Model temperature is fixed at $\tau = 0.20$ to minimise stochastic deviation and enforce strict grounding.
3. **Human-in-the-Loop DRAFT Gating**: All generated capsules and quizzes are saved in `DRAFT` status and cannot be viewed by students until a trainer reviews and clicks `Publish`.
4. **`needs_human_review` Flag**: If the source text is ambiguous or incomplete, the LLM flags the draft for human review.
5. **Safe Student Sanitization**: The delivery API strips `correct_option_index` and `is_correct` flags from student endpoints to prevent answer key extraction.

---

## 5. Pydantic Output Schemas

```python
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from app.models.enums import DifficultyLevel

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
```
