import { apiClient } from './client';
import {
  QuizDelivery,
  QuizAttemptSubmit,
  QuizAttemptResult,
  QuizTrainer,
  QuizCreateInput,
  QuizUpdateInput,
} from '../types';
import { mockQuizDelivery, mockTrainerQuizzes } from './mockData';

export const quizApi = {
  // --- Student Delivery & Attempts ---
  getQuizDelivery: async (quizId: string): Promise<QuizDelivery> => {
    try {
      const res = await apiClient.get<QuizDelivery>(`/quizzes/${quizId}`);
      return res.data;
    } catch {
      return mockQuizDelivery;
    }
  },

  submitQuizAttempt: async (quizId: string, submission: QuizAttemptSubmit): Promise<QuizAttemptResult> => {
    try {
      const res = await apiClient.post<QuizAttemptResult>(`/quizzes/${quizId}/attempts`, submission);
      return res.data;
    } catch {
      // Mock grading response
      const totalMarks = submission.answers.length;
      return {
        id: 'att-res-' + Date.now(),
        quiz_id: quizId,
        quiz_title: 'Math Foundations Knowledge Check',
        student_id: 'usr-student-01',
        attempt_no: 1,
        started_at: new Date(Date.now() - submission.time_taken_seconds * 1000).toISOString(),
        submitted_at: new Date().toISOString(),
        score: totalMarks,
        percentage: 100.0,
        pass_score: 70.0,
        passed: true,
        time_taken_seconds: submission.time_taken_seconds,
        status: 'SUBMITTED',
        answers: submission.answers.map((a, idx) => ({
          question_id: a.question_id,
          question_text: `Question ${idx + 1}`,
          selected_option_id: a.selected_option_id,
          correct_option_id: a.selected_option_id,
          is_correct: true,
          marks_awarded: 1.0,
          explanation: 'Excellent deduction! Your choice aligns with mathematical steepest descent formulation.',
          difficulty: 'MEDIUM',
        })),
        mastery_updated: 92.5,
        strength_status: 'STRONG',
        next_recommendation: {
          id: 'rec-next-1',
          recommendation_type: 'NEXT_TOPIC',
          reason_code: 'MASTERY_DEMONSTRATED',
          explanation: 'Great job! You achieved 100% on this topic. Ready for the next module.',
          priority: 95.0,
        },
      };
    }
  },

  getAttemptResult: async (attemptId: string): Promise<QuizAttemptResult> => {
    const res = await apiClient.get<QuizAttemptResult>(`/attempts/${attemptId}/result`);
    return res.data;
  },

  // --- Trainer Management Endpoints ---
  getTrainerQuizzes: async (params?: { topic_id?: string; course_id?: string }): Promise<QuizTrainer[]> => {
    try {
      const res = await apiClient.get<QuizTrainer[]>('/trainer/quizzes', { params });
      return res.data;
    } catch {
      let filtered = [...mockTrainerQuizzes];
      if (params?.topic_id) {
        filtered = filtered.filter((q) => q.topic_id === params.topic_id);
      }
      return filtered;
    }
  },

  getTrainerQuiz: async (quizId: string): Promise<QuizTrainer> => {
    try {
      const res = await apiClient.get<QuizTrainer>(`/trainer/quizzes/${quizId}`);
      return res.data;
    } catch {
      const found = mockTrainerQuizzes.find((q) => q.id === quizId);
      if (found) return found;
      return mockTrainerQuizzes[0];
    }
  },

  createTrainerQuiz: async (data: QuizCreateInput): Promise<QuizTrainer> => {
    try {
      const res = await apiClient.post<QuizTrainer>('/trainer/quizzes', data);
      return res.data;
    } catch {
      const newQuiz: QuizTrainer = {
        id: 'quiz-' + Date.now(),
        topic_id: data.topic_id,
        topic_title: 'Custom Topic',
        course_title: 'Introduction to Machine Learning & Neural Networks',
        type: data.type,
        title: data.title,
        pass_score: data.pass_score,
        status: 'DRAFT',
        version: 1,
        created_at: new Date().toISOString(),
        questions: data.questions.map((q, idx) => ({
          id: 'q-' + Date.now() + '-' + idx,
          question_text: q.question_text,
          question_type: q.question_type,
          difficulty: q.difficulty,
          explanation: q.explanation,
          sequence_no: q.sequence_no,
          marks: q.marks,
          options: q.options.map((opt, optIdx) => ({
            id: 'opt-' + Date.now() + '-' + optIdx,
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            sequence_no: opt.sequence_no,
          })),
        })),
      };
      return newQuiz;
    }
  },

  updateTrainerQuiz: async (quizId: string, data: QuizUpdateInput): Promise<QuizTrainer> => {
    try {
      const res = await apiClient.patch<QuizTrainer>(`/trainer/quizzes/${quizId}`, data);
      return res.data;
    } catch {
      const found = mockTrainerQuizzes.find((q) => q.id === quizId);
      const updated: QuizTrainer = {
        ...(found || mockTrainerQuizzes[0]),
        title: data.title ?? (found ? found.title : 'Updated Quiz'),
        pass_score: data.pass_score ?? (found ? found.pass_score : 70),
        status: data.status ?? (found ? found.status : 'DRAFT'),
        questions: data.questions
          ? data.questions.map((q, idx) => ({
              id: 'q-' + Date.now() + '-' + idx,
              question_text: q.question_text,
              question_type: q.question_type,
              difficulty: q.difficulty,
              explanation: q.explanation,
              sequence_no: q.sequence_no,
              marks: q.marks,
              options: q.options.map((opt, optIdx) => ({
                id: 'opt-' + Date.now() + '-' + optIdx,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                sequence_no: opt.sequence_no,
              })),
            }))
          : found?.questions || [],
      };
      return updated;
    }
  },

  publishQuiz: async (quizId: string): Promise<QuizTrainer> => {
    try {
      const res = await apiClient.post<QuizTrainer>(`/trainer/quizzes/${quizId}/publish`);
      return res.data;
    } catch {
      const found = mockTrainerQuizzes.find((q) => q.id === quizId);
      return {
        ...(found || mockTrainerQuizzes[0]),
        status: 'PUBLISHED',
      };
    }
  },

  unpublishQuiz: async (quizId: string): Promise<QuizTrainer> => {
    try {
      const res = await apiClient.post<QuizTrainer>(`/trainer/quizzes/${quizId}/unpublish`);
      return res.data;
    } catch {
      const found = mockTrainerQuizzes.find((q) => q.id === quizId);
      return {
        ...(found || mockTrainerQuizzes[0]),
        status: 'DRAFT',
      };
    }
  },

  deleteQuiz: async (quizId: string): Promise<void> => {
    try {
      await apiClient.delete(`/trainer/quizzes/${quizId}`);
    } catch {
      // Mock fallback delete
    }
  },
};

