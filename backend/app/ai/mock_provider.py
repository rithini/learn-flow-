import random
from typing import List, Dict, Any
from app.ai.provider_base import AIProvider
from app.schemas.ai import (
    StructuredCapsuleOutput,
    StructuredQuizOutput,
    StructuredQuizQuestion,
    StructuredTopicExtractionOutput,
    StructuredTopicItem,
    StructuredVideoScript,
)
from app.models.enums import DifficultyLevel


class MockAIProvider(AIProvider):
    async def generate_capsule(
        self,
        topic_title: str,
        level: str,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredCapsuleOutput:
        chunk_ids = [str(c.get("id", "")) for c in source_chunks if c.get("id")]
        
        return StructuredCapsuleOutput(
            title=f"Mastering {topic_title}",
            learning_objectives=[
                f"Understand the fundamental mechanics of {topic_title}.",
                f"Analyze practical tradeoffs when implementing {topic_title} in production.",
                f"Evaluate real-world case studies and diagnostic metrics for {topic_title}.",
            ],
            standard_explanation=(
                f"{topic_title} is a vital pillar within {course_title}. At its core, it enables structured "
                f"reasoning and mathematical optimization over input parameters. In modern computer science and engineering, "
                f"{topic_title} bridges the gap between theoretical modeling and scalable system performance.\n\n"
                f"When applied correctly, {topic_title} provides strong guarantees regarding convergence, latency, and "
                f"computational overhead. Practitioners analyze state transitions and boundary conditions to ensure stable operation."
            ),
            simple_explanation=(
                f"Think of {topic_title} like a smart thermostat. Instead of manually adjusting the temperature every minute, "
                f"the system measures the current state, compares it to the target goal, and smoothly adjusts the output."
            ),
            key_points=[
                f"{topic_title} reduces systemic error through iterative refinement.",
                "Prerequisites must be firmly established before tuning hyperparameters.",
                "Real-time feedback loops prevent overfitting and drift.",
                "Monitoring residual variance ensures continuous reliability.",
            ],
            real_world_example=(
                f"In high-frequency logistics systems, {topic_title} is used to dynamically reroute delivery fleets "
                f"based on localized congestion, reducing mean transit delays by over 28%."
            ),
            recap_question=f"What is the primary factor that causes performance degradation in {topic_title}?",
            estimated_minutes=5 if level == "STANDARD" else (3 if level == "BASIC" else 8),
            source_chunk_ids=chunk_ids,
            needs_human_review=False,
        )

    async def generate_quiz(
        self,
        topic_title: str,
        difficulty: str,
        question_count: int,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredQuizOutput:
        chunk_ids = [str(c.get("id", "")) for c in source_chunks if c.get("id")]
        diff_enum = DifficultyLevel.MEDIUM
        if difficulty == "EASY":
            diff_enum = DifficultyLevel.EASY
        elif difficulty == "HARD":
            diff_enum = DifficultyLevel.HARD

        questions: List[StructuredQuizQuestion] = []
        templates = [
            (
                f"What is the primary objective of {topic_title}?",
                [
                    f"To minimize error and optimize predictive throughput.",
                    "To increase storage space linearly.",
                    "To bypass network encryption checks.",
                    "To eliminate the need for any training data.",
                ],
                0,
                f"The core goal of {topic_title} is mathematical optimization and error minimization.",
            ),
            (
                f"Under which condition would {topic_title} typically perform sub-optimally?",
                [
                    "When input features are normalized.",
                    "When extreme outliers and high multicollinearity exist without regularization.",
                    "When computation is distributed across multiple cores.",
                    "When continuous validation checks are enabled.",
                ],
                1,
                "Outliers and multicollinearity distort gradient estimation unless proper regularization is applied.",
            ),
            (
                f"Which metric is most critical when evaluating {topic_title} in practice?",
                [
                    "Raw file transfer size only.",
                    "Residual error convergence and cross-validation accuracy.",
                    "Operating system build version.",
                    "Screen refresh rate.",
                ],
                1,
                "Cross-validation accuracy and residual error provide unbiased insight into real-world generalization.",
            ),
            (
                f"How does {topic_title} interact with its foundational prerequisites?",
                [
                    "It replaces all basic mathematics with heuristic guesses.",
                    "It builds directly upon linear transformations and error loss formulation.",
                    "It operates completely independent of any mathematical baseline.",
                    "It only works on simulated quantum hardware.",
                ],
                1,
                "Advanced topics in this curriculum directly leverage linear algebra and loss formulation foundations.",
            ),
        ]

        for i in range(min(question_count, len(templates))):
            q_text, options, correct_idx, exp = templates[i]
            questions.append(
                StructuredQuizQuestion(
                    question_text=q_text,
                    question_type="MCQ",
                    options=options,
                    correct_option_index=correct_idx,
                    explanation=exp,
                    difficulty=diff_enum,
                    learning_objective=f"Assess conceptual and practical mastery of {topic_title}.",
                    source_chunk_ids=chunk_ids,
                )
            )

        return StructuredQuizOutput(
            title=f"{topic_title} - Conceptual Checkpoint",
            questions=questions,
            needs_human_review=False,
        )

    async def extract_topics(
        self,
        course_title: str,
        source_chunks: List[Dict[str, Any]],
    ) -> StructuredTopicExtractionOutput:
        return StructuredTopicExtractionOutput(
            course_title=course_title,
            topics=[
                StructuredTopicItem(
                    title="1. Foundations & Mathematical Preliminaries",
                    description="Essential algebra, probability, and foundational notation.",
                    order_index=1,
                    learning_objectives=["Review vectors and matrices", "Understand loss concepts"],
                    estimated_minutes=15,
                ),
                StructuredTopicItem(
                    title="2. Core Algorithms & Representation",
                    description="Primary algorithmic building blocks and state representations.",
                    order_index=2,
                    learning_objectives=["Formulate optimization equations", "Trace forward passes"],
                    estimated_minutes=20,
                ),
                StructuredTopicItem(
                    title="3. Evaluation, Tuning & Optimization",
                    description="Hyperparameter search, validation splits, and metric computation.",
                    order_index=3,
                    learning_objectives=["Calculate precision/recall", "Tune learning rates"],
                    estimated_minutes=25,
                ),
            ],
            needs_human_review=False,
        )

    async def generate_video_script(
        self,
        topic_title: str,
        capsule_data: Dict[str, Any],
    ) -> StructuredVideoScript:
        return StructuredVideoScript(
            title=f"Video Overview: {topic_title}",
            duration_estimate_seconds=90,
            scenes=[
                {
                    "scene_no": "1",
                    "narration": f"Welcome to this micro-lesson on {topic_title}. Today we break down the key fundamentals in 90 seconds.",
                    "slide_text": f"Introduction to {topic_title}\nKey Concepts & Overview",
                },
                {
                    "scene_no": "2",
                    "narration": f"The core mechanism relies on structured feedback. Notice how inputs flow through our pipeline without data loss.",
                    "slide_text": "Core Pipeline Architecture\n- Input Stream -> Processing Node -> Output Evaluation",
                },
                {
                    "scene_no": "3",
                    "narration": "Remember to test your understanding with the topic quiz right after this video.",
                    "slide_text": "Summary & Next Steps\nTake the topic quiz to update your mastery score!",
                },
            ],
        )
