import { apiClient } from './client';
import {
  QuizDelivery,
  QuizAttemptSubmit,
  QuizAttemptResult,
} from '../types';
import { mockQuizDelivery } from './mockData';

export const quizApi = {
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
};
