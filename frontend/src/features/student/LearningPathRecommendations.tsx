import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { LearningPath, Recommendation, StudentPerformance } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getRecommendationBadge, getStrengthBadgeColor } from '../../utils/formatters';
import { Compass, Zap, ArrowRight, BookOpen, CheckCircle2, Award, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export { LearningPathPage } from './LearningPathPage';

export const RecommendationsPage: React.FC = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getRecommendations().then(setRecs);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Adaptive Recommendations</h1>
        <p className="text-xs text-muted-foreground">Historical and current closed-loop suggestions.</p>
      </div>

      <div className="space-y-4">
        {recs.map((r) => {
          const badge = getRecommendationBadge(r.recommendation_type);
          return (
            <Card key={r.id} className="border-border shadow-sm">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge className={badge.color}>{badge.label}</Badge>
                    <span className="text-xs font-bold text-muted-foreground">Priority: {r.priority}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{r.topic_title || 'Adaptive Target'}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.explanation}</p>
                </div>
                <Button size="sm" onClick={() => navigate('/student/capsules/cap-1')}>
                  Start Activity
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export { PerformanceMatrixPage as PerformancePage } from './PerformanceMatrixPage';

export { StrengthsWeaknessesPage } from './StrengthsWeaknessesPage';

export { ActivityProgressTimelinePage as ProgressPage } from './ActivityProgressTimelinePage';

export { StudentProfilePage } from './StudentProfilePage';
