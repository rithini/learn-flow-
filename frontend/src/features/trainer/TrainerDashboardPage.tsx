import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../../api/trainers';
import { TrainerDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BookOpen,
  Users,
  Sparkles,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const TrainerDashboardPage: React.FC = () => {
  const [data, setData] = useState<TrainerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    trainerApi.getDashboard().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-600 via-brand-600 to-indigo-600 text-white shadow-xl shadow-purple-500/10">
        <div className="space-y-1">
          <Badge className="bg-white/20 text-white border-white/30">Faculty Studio</Badge>
          <h1 className="text-2xl sm:text-3xl font-black">Trainer Curriculum Workspace</h1>
          <p className="text-xs text-white/80">
            Ingest course documents, prompt AI content drafts, and review before publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/trainer/materials')}
            className="bg-white text-purple-700 hover:bg-white/90 font-bold shadow-md"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" /> Upload Material
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/trainer/ai-generation')}
            className="bg-purple-950 text-white hover:bg-purple-900 border border-purple-800"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> AI Draft Studio
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Owned Courses"
          value={data.total_courses}
          subtitle="Curriculum containers"
          icon={BookOpen}
          gradient="from-purple-500 to-indigo-600"
        />
        <StatCard
          title="Enrolled Students"
          value={data.total_students}
          subtitle="Active learners"
          icon={Users}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Published Capsules"
          value={data.active_capsules_count}
          subtitle="Live to students"
          icon={FileCheck}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Cohort Quiz Average"
          value={`${data.average_quiz_score}%`}
          subtitle="Across all attempts"
          icon={TrendingUp}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Difficult Topics Alert & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficult Topics Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5" />
                <span>Struggling Topics Early-Warning</span>
              </span>
              <Badge variant="danger">&gt;25% Struggling</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.difficult_topics.map((t) => (
              <div key={t.topic_id} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-foreground">{t.topic_title}</h4>
                  <span className="text-xs font-bold text-rose-500">{t.struggling_percent}% struggling</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-rose-500/10">
                  <span>Average Mastery: {t.average_mastery}%</span>
                  <span>Cohort: {t.total_students} students</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Student Quiz Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Live Student Quiz Activity</span>
              <Button size="sm" variant="ghost" onClick={() => navigate('/trainer/students-performance')}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recent_student_activity.map((act, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{act.student_name}</h4>
                  <span className="text-xs text-muted-foreground">{act.quiz_title} • {act.date}</span>
                </div>
                <Badge variant={act.score >= 70 ? 'success' : 'danger'}>{act.score}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
