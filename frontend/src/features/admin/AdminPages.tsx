import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admins';
import { AdminDashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { DashboardSkeleton } from '../../components/common/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Activity,
  Server,
  Database,
  Cpu,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white shadow-xl space-y-2">
        <Badge className="bg-white/20 text-white border-white/30">Institute Control Plane</Badge>
        <h1 className="text-2xl sm:text-3xl font-black">System Administration & Audit Portal</h1>
        <p className="text-xs text-white/80 max-w-3xl leading-relaxed">
          Monitor user accounts, active courses, background job health, and audit logs.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.total_users}
          subtitle={`${data.total_students} Students, ${data.total_trainers} Trainers`}
          icon={Users}
          gradient="from-rose-500 to-pink-600"
        />
        <StatCard
          title="Curriculum Courses"
          value={data.total_courses}
          subtitle="Institute containers"
          icon={BookOpen}
          gradient="from-purple-500 to-indigo-600"
        />
        <StatCard
          title="Total Quizzes Evaluated"
          value={data.total_quizzes_taken}
          subtitle="Server-side submissions"
          icon={HelpCircle}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Materials Processed"
          value={data.total_materials_processed}
          subtitle="Chunked & indexed"
          icon={Activity}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Health & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              <span>System Infrastructure Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-500" /> Relational Database
              </span>
              <Badge variant="success">HEALTHY</Badge>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" /> Redis Worker Queue
              </span>
              <Badge variant="success">OPERATIONAL</Badge>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" /> AI Provider Adapter
              </span>
              <Badge variant="success">ONLINE</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" />
              <span>Recent Security Audit Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {data.recent_audit_logs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-1 rounded-md">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground">{log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ''}</span>
                </div>
                <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory & Role Management</h1>
      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-bold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-4 font-bold text-foreground">{u.full_name}</td>
                  <td className="p-4 text-xs text-muted-foreground">{u.email}</td>
                  <td className="p-4"><Badge variant="default">{u.role}</Badge></td>
                  <td className="p-4"><Badge variant="success">Active</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
