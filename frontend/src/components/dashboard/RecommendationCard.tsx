import React from 'react';
import { Recommendation } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getRecommendationBadge } from '../../utils/formatters';
import { Zap, ArrowRight, BookOpen, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const navigate = useNavigate();
  const badgeInfo = getRecommendationBadge(recommendation.recommendation_type);

  const handleAction = () => {
    if (recommendation.recommendation_type === 'TARGETED_PRACTICE' || recommendation.recommendation_type === 'CHECKPOINT') {
      navigate(`/student/quizzes/quiz-1`);
    } else {
      navigate(`/student/capsules/cap-1`);
    }
  };

  return (
    <Card className="relative overflow-hidden border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-purple-500/5 to-background shadow-lg shadow-brand-500/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Adaptive Recommendation
              </span>
              <Badge className={badgeInfo.color}>{badgeInfo.label}</Badge>
            </div>

            <h3 className="text-lg font-bold text-foreground">
              {recommendation.topic_title || 'Personalized Adaptive Step'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.explanation}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleAction} className="shadow-brand-500/25">
              <span>Start Activity</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
