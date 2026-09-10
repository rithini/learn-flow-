import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { capsuleApi } from '../../api/capsules';
import { quizApi } from '../../api/quizzes';
import { LearningCapsule, QuizDelivery, QuizAttemptResult } from '../../types';
import { CapsuleViewer } from '../../components/learning/CapsuleViewer';
import { QuizQuestionCard } from '../../components/quiz/QuizQuestionCard';
import { QuizResultCard } from '../../components/quiz/QuizResultCard';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Clock, HelpCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatSeconds } from '../../utils/formatters';

export const CapsuleViewPage: React.FC = () => {
  const { capsuleId } = useParams<{ capsuleId: string }>();
  const [capsule, setCapsule] = useState<LearningCapsule | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    capsuleApi.getStudentCapsule(capsuleId || 'cap-1').then(setCapsule);
  }, [capsuleId]);

  if (!capsule) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Course
      </Button>

      <CapsuleViewer
        capsule={capsule}
        onComplete={() => capsuleApi.recordProgress(capsule.id, { completion_percent: 100, time_spent_seconds: 300 })}
        onStartQuiz={() => navigate(`/student/quizzes/quiz-1`)}
      />
    </div>
  );
};

export const QuizTakePage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<QuizDelivery | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    quizApi.getQuizDelivery(quizId || 'quiz-1').then(setQuiz);
    const interval = setInterval(() => setTimerSeconds((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [quizId]);

  if (result) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/dashboard')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </Button>
        <QuizResultCard
          result={result}
          onRetry={() => {
            setResult(null);
            setAnswers({});
            setCurrentIndex(0);
            setTimerSeconds(0);
          }}
        />
      </div>
    );
  }

  if (!quiz) return <DashboardSkeleton />;

  const currentQ = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      answers: Object.entries(answers).map(([qId, optId]) => ({
        question_id: qId,
        selected_option_id: optId,
      })),
      time_taken_seconds: timerSeconds,
    };
    try {
      const res = await quizApi.submitQuizAttempt(quiz.id, payload);
      setResult(res);
    } catch (e) {
      console.error('Quiz submission error', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top bar with timer & progress */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
        <div>
          <h1 className="text-base font-bold text-foreground">{quiz.title}</h1>
          <span className="text-xs text-muted-foreground">Pass criteria: {quiz.pass_score}%</span>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-sm bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
          <Clock className="w-4 h-4 text-brand-500" />
          <span>{formatSeconds(timerSeconds)}</span>
        </div>
      </div>

      {/* Question Card */}
      <QuizQuestionCard
        question={currentQ}
        currentIndex={currentIndex}
        totalQuestions={quiz.questions.length}
        selectedOptionId={answers[currentQ.id]}
        onSelectOption={handleSelectOption}
      />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
        </Button>

        {isLastQuestion ? (
          <Button onClick={handleSubmit} isLoading={isSubmitting} variant="success">
            <span>Submit Assessment</span>
            <CheckCircle2 className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((idx) => Math.min(quiz.questions.length - 1, idx + 1))}>
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
