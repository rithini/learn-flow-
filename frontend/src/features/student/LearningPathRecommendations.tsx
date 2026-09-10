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

export const LearningPathPage: React.FC = () => {
  const [path, setPath] = useState<LearningPath | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getLearningPath('crs-ml-101').then(setPath);
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-white/30">Version {path?.version || 1} Active</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Your Personalized Learning Path</h1>
        <p className="text-xs text-white/80 max-w-2xl leading-relaxed">
          The adaptive engine dynamically sequences your curriculum units based on prerequisite graphs and ongoing performance.
        </p>
      </div>

      <div className="space-y-4">
        {path?.items.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 font-black flex items-center justify-center text-sm">
                {idx + 1}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-base text-foreground">{item.topic_title}</h4>
                <p className="text-xs text-muted-foreground">{item.reason_code}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-foreground">{item.mastery_score}% Mastery</span>
              <Button size="sm" onClick={() => navigate(`/student/capsules/${item.capsule_id || 'cap-1'}`)}>
                <span>Launch Unit</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

export const PerformancePage: React.FC = () => {
  const [perfs, setPerfs] = useState<StudentPerformance[]>([]);

  useEffect(() => {
    studentApi.getPerformance().then(setPerfs);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mastery Profile & Performance Matrix</h1>
        <p className="text-xs text-muted-foreground">Topic-by-topic multi-factor evaluation history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perfs.map((p) => {
          const b = getStrengthBadgeColor(p.strength_status);
          return (
            <Card key={p.topic_id} className="border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-foreground">{p.topic_title}</h3>
                  <Badge className={b.bg}>{b.label}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center text-xs">
                  <div>
                    <span className="block font-black text-lg text-foreground">{p.mastery_score}%</span>
                    <span className="text-muted-foreground">Mastery</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-foreground">{p.recent_accuracy}%</span>
                    <span className="text-muted-foreground">Quiz Accuracy</span>
                  </div>
                  <div>
                    <span className="block font-black text-lg text-foreground">{p.confidence_score}%</span>
                    <span className="text-muted-foreground">Confidence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export const StrengthsWeaknessesPage: React.FC = () => {
  const [perfs, setPerfs] = useState<StudentPerformance[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getPerformance().then(setPerfs);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Strengths & Learning Gaps</h1>
        <p className="text-xs text-muted-foreground">Categorized based on adaptive policy thresholds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-emerald-600 dark:text-emerald-400">
              Proficient Topics (&ge; 80% Mastery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {perfs.filter((p) => p.mastery_score >= 80).map((p) => (
              <div key={p.topic_id} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{p.topic_title}</h4>
                  <span className="text-xs text-muted-foreground">{p.attempt_count} attempts completed</span>
                </div>
                <Badge variant="success">{p.mastery_score}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-rose-500">
              Concepts Needing Support (&lt; 50% Mastery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Cost Function Formulation</h4>
                <span className="text-xs text-rose-500 font-medium">Prerequisite gap detected</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/student/capsules/cap-1')}>
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const ProgressPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity Progress Timeline</h1>
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Completed Linear Regression Checkpoint Quiz</h4>
              <span className="text-xs text-muted-foreground">Scored 100% (2/2 pts) • 2 days ago</span>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Studied Mathematical Foundations Micro-Capsule</h4>
              <span className="text-xs text-muted-foreground">Read Standard & Simplified Analogies • 5 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Profile</h1>
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
            <p className="text-base font-bold text-foreground">{user?.full_name}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
            <p className="text-base font-medium text-foreground">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Student Roll Code</label>
            <p className="text-base font-medium text-foreground">{user?.student_code || 'STU-2026-001'}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Institution</label>
            <p className="text-base font-medium text-foreground">{user?.institution_name || 'National Institute of Technology'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
