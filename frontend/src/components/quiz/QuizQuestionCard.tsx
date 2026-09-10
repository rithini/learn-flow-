import React from 'react';
import { QuizQuestionPublic } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { HelpCircle } from 'lucide-react';

interface QuizQuestionCardProps {
  question: QuizQuestionPublic;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId?: string | null;
  onSelectOption: (optionId: string) => void;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
}) => {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return <Badge variant="success">Easy (1.0 Pt)</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium (1.0 Pt)</Badge>;
      default:
        return <Badge variant="danger">Hard (1.0 Pt)</Badge>;
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          {getDifficultyBadge(question.difficulty)}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mt-2 leading-relaxed">
          {question.question_text}
        </h2>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionId === opt.id;
          const letter = String.fromCharCode(65 + idx);

          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={cn(
                'w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 group',
                isSelected
                  ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-300 font-semibold shadow-sm'
                  : 'bg-card border-border hover:bg-muted/50 text-foreground'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors flex-shrink-0',
                  isSelected
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                )}
              >
                {letter}
              </div>
              <span className="text-sm leading-relaxed">{opt.option_text}</span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
