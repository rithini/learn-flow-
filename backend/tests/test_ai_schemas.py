import pytest
from pydantic import ValidationError
from app.schemas.ai import StructuredCapsuleOutput, StructuredQuizOutput, StructuredQuizQuestion
from app.models.enums import DifficultyLevel


def test_structured_capsule_output_validation():
    valid_data = {
        "title": "Introduction to Neural Networks",
        "learning_objectives": ["Understand Perceptrons", "Compute Forward Pass"],
        "standard_explanation": "Neural networks are composed of layers of nodes...",
        "simple_explanation": "Think of it as a team passing information.",
        "key_points": ["Layered architecture", "Weights and biases"],
        "real_world_example": "Spam filtering in email clients.",
        "recap_question": "What is an activation function?",
        "estimated_minutes": 5,
        "source_chunk_ids": ["chunk-1", "chunk-2"],
        "needs_human_review": False,
    }
    capsule = StructuredCapsuleOutput.model_validate(valid_data)
    assert capsule.title == "Introduction to Neural Networks"
    assert len(capsule.learning_objectives) == 2


def test_structured_capsule_output_missing_field():
    invalid_data = {
        "title": "Incomplete Capsule",
        # missing standard_explanation
    }
    with pytest.raises(ValidationError):
        StructuredCapsuleOutput.model_validate(invalid_data)


def test_structured_quiz_output_validation():
    valid_quiz = {
        "title": "Neural Networks Quiz",
        "questions": [
            {
                "question_text": "What does ReLU stand for?",
                "question_type": "MCQ",
                "options": ["Rectified Linear Unit", "Random Linear Unit", "Recursive Logic Unit"],
                "correct_option_index": 0,
                "explanation": "ReLU is Rectified Linear Unit.",
                "difficulty": "EASY",
                "learning_objective": "Identify common activation functions",
            }
        ],
    }
    quiz = StructuredQuizOutput.model_validate(valid_quiz)
    assert quiz.title == "Neural Networks Quiz"
    assert len(quiz.questions) == 1
    assert quiz.questions[0].correct_option_index == 0
