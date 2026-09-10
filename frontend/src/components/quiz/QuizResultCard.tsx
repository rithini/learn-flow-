import React from 'react';
import { QuizAttemptResult } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, XCircle, Zap, RotateCcw, ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatSeconds } from '../../utils/formatters';

interface QuizResultCardProps {
  result: QuizAttemptResult;
  onRetry?: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({ result, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Score Summary Card */}
      <Card className="overflow-hidden border-border shadow-xl">
        <div
          className={`p-8 text-center text-white ${
            result.passed
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
              : 'bg-gradient-to-tr from-rose-600 to-amber-600'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-3 shadow-inner">
            {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-1">
            {result.passed ? 'Assessment Passed!' : 'Needs Reinforcement'}
          </h2>
          <p className="text-white/80 text-sm font-medium">
            {result.passed
              ? 'Excellent demonstration of topic mastery.'
              : 'Review key concepts and try again to unlock dependent modules.'}
          </p>

          <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/20">
            <div>
              <span className="block text-2xl font-black">{result.percentage}%</span>
              <span className="text-[11px] uppercase font-bold text-white/75">Score Achieved</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black">{result.mastery_updated}%</span>
              <span className="text-[11px] uppercase font-bold text-white/75">Updated Mastery</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="block text-2xl font-black">{formatSeconds(result.time_taken_seconds)}</span>
              <span className="text-[11px] uppercase font-bold text-white/75">Time Taken</span>
            </div>
          </div>
        </div>

        {/* Adaptive Engine Recommendation Output */}
        {result.next_recommendation && (
          <div className="p-6 bg-brand-500/10 border-b border-border flex items-start gap-4">
            <div className="p-2 rounded-xl bg-brand-500 text-white flex-shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Adaptive Next Action Generated
              </span>
              <p className="text-sm font-semibold text-foreground">
                {result.next_recommendation.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-bold text-foreground">Question Corrections & Explanations</h3>
          <div className="space-y-3">
            {result.answers.map((ans, idx) => (
              <div
                key={ans.question_id}
                className={`p-4 rounded-2xl border ${
                  ans.is_correct
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-rose-500/5 border-rose-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {ans.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question {idx + 1} ({ans.marks_awarded} pt)
                    </span>
                  </div>
                  <Badge variant={ans.is_correct ? 'success' : 'danger'}>
                    {ans.is_correct ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-foreground mb-2">{ans.question_text}</p>
                {ans.explanation && (
                  <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50 leading-relaxed">
                    <strong className="text-foreground">Explanation:</strong> {ans.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Assessment
              </Button>
            )}
            <Button onClick={() => navigate('/student/dashboard')}>
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
