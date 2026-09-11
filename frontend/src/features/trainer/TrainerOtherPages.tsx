import React, { useEffect, useState } from 'react';
import { trainerApi } from '../../api/trainers';
import { CourseAnalyticsData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Users, HelpCircle, BarChart3, Award, CheckCircle2, User } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export { QuizManagementPage } from './QuizManagementPage';

export const StudentPerformancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cohort Performance Matrix</h1>
        <p className="text-xs text-muted-foreground">Enrolled student mastery breakdown across course topics.</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-bold">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Roll Code</th>
                <th className="p-4">Email</th>
                <th className="p-4">Avg Mastery</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-bold text-foreground">Alex Chen</td>
                <td className="p-4 text-xs font-mono">STU-2026-001</td>
                <td className="p-4 text-xs text-muted-foreground">student1@learnflow.edu</td>
                <td className="p-4 font-black text-emerald-500">90.8%</td>
                <td className="p-4"><Badge variant="success">Strong Proficient</Badge></td>
              </tr>
              <tr className="hover:bg-muted/30">
                <td className="p-4 font-bold text-foreground">Sophia Martinez</td>
                <td className="p-4 text-xs font-mono">STU-2026-002</td>
                <td className="p-4 text-xs text-muted-foreground">student2@learnflow.edu</td>
                <td className="p-4 font-black text-rose-500">53.2%</td>
                <td className="p-4"><Badge variant="danger">Needs Support</Badge></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CourseAnalyticsData | null>(null);

  useEffect(() => {
    trainerApi.getCourseAnalytics('crs-ml-101').then(setAnalytics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Analytics & Score Distribution</h1>
        <p className="text-xs text-muted-foreground">Comprehensive insights into completion and mastery trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">Completion Rate</span>
          <h3 className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">{analytics?.completion_rate || 72}%</h3>
        </Card>
        <Card className="p-6 text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">Mean Quiz Score</span>
          <h3 className="text-3xl font-black text-emerald-500 mt-1">{analytics?.average_score || 82.5}%</h3>
        </Card>
        <Card className="p-6 text-center">
          <span className="text-xs font-bold text-muted-foreground uppercase">Median Mastery</span>
          <h3 className="text-3xl font-black text-purple-500 mt-1">{analytics?.median_score || 85}%</h3>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Score Distribution Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics?.score_distribution.map((d, i) => (
            <div key={i} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{d.range}</span>
              <span className="text-sm font-bold text-brand-500">{d.count} Students</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export const TrainerProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Trainer Profile</h1>
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Full Name</label>
            <p className="text-base font-bold text-foreground">{user?.full_name}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Faculty Employee Code</label>
            <p className="text-base font-medium text-foreground">{user?.employee_code || 'TRN-ENG-042'}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
            <p className="text-base font-medium text-foreground">{user?.department || 'Computer Science & AI'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
