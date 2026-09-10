import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { StudentDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { ProgressRing } from '../../components/common/ProgressRing';
import { RecommendationCard } from '../../components/dashboard/RecommendationCard';
import { ScoreTrendChart } from '../../components/dashboard/ScoreTrendChart';
import { TopicMasteryChart } from '../../components/dashboard/TopicMasteryChart';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { getStrengthBadgeColor } from '../../utils/formatters';

export const StudentDashboardPage: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    studentApi.getDashboard().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  const masteryChartData = [
    ...data.strong_topics.map((t) => ({ topic_title: t.topic_title, mastery_score: t.mastery_score })),
    ...data.weak_topics.map((t) => ({ topic_title: t.topic_title, mastery_score: t.mastery_score })),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Adaptive Learner</span>
            <Badge className="bg-white/20 text-white border-white/30">{data.current_level}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Welcome back, {data.student_name}!</h1>
          <p className="text-xs text-white/80">
            Your personalized learning path is dynamically ordered based on recent topic evaluations.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <ProgressRing progress={data.overall_progress} size={70} strokeWidth={6} label="Progress" />
          <div>
            <span className="text-xs font-bold text-white/70 block uppercase">Streak</span>
            <div className="flex items-center gap-1 text-lg font-black text-amber-300">
              <Flame className="w-5 h-5 fill-current" />
              <span>{data.streak_days} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Next Action Recommendation */}
      {data.active_recommendation && (
        <RecommendationCard recommendation={data.active_recommendation} />
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={`${data.average_score}%`}
          subtitle="Across all quizzes"
          icon={Award}
          gradient="from-emerald-500 to-teal-600"
          trend={{ value: '4.2%', isPositive: true }}
        />
        <StatCard
          title="Quizzes Completed"
          value={data.total_quizzes_taken}
          subtitle="Evaluated server-side"
          icon={TrendingUp}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Active Courses"
          value={data.enrolled_courses_count}
          subtitle="Institute curriculum"
          icon={BookOpen}
          gradient="from-purple-500 to-pink-600"
        />
        <StatCard
          title="Strengths Identified"
          value={data.strong_topics.length}
          subtitle=">= 80% Mastery"
          icon={CheckCircle2}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Quiz Score Trajectory</span>
              <span className="text-xs font-medium text-muted-foreground">Recent Attempts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={data.recent_quiz_attempts} />
          </CardContent>
        </Card>

        {/* Topic Mastery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Topic Mastery Heat</span>
              <span className="text-xs font-medium text-muted-foreground">0 - 100 Scale</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TopicMasteryChart data={masteryChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Weaknesses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Demonstrated Proficiencies (Strong)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.strong_topics.length === 0 ? (
              <p className="text-xs text-muted-foreground">Complete upcoming quizzes to build proficiency evidence.</p>
            ) : (
              data.strong_topics.map((t) => (
                <div key={t.topic_id} className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.topic_title}</h4>
                    <span className="text-xs text-muted-foreground">Confidence: {t.confidence_score}%</span>
                  </div>
                  <Badge variant="success">{t.mastery_score}% Mastery</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weak Topics & Recommended Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <span>Identified Concept Gaps (Needs Support)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weak_topics.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ No critical learning gaps detected! All assessed topics exceed passing baselines.
              </div>
            ) : (
              data.weak_topics.map((t) => (
                <div key={t.topic_id} className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.topic_title}</h4>
                    <span className="text-xs text-rose-500 font-medium">Simplified review recommended</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/capsules/cap-1')}>
                    Review
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
