import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Compass,
  Award,
  Zap,
  CheckCircle2,
  User,
  UploadCloud,
  FileCheck,
  HelpCircle,
  BarChart3,
  Users,
  ShieldCheck,
  GraduationCap,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'STUDENT';

  const studentNavItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/courses', label: 'My Courses', icon: BookOpen },
    { to: '/student/learning-path', label: 'Personalized Path', icon: Compass },
    { to: '/student/recommendations', label: 'Adaptive Recommendations', icon: Zap },
    { to: '/student/performance', label: 'Mastery & Trends', icon: BarChart3 },
    { to: '/student/strengths-weaknesses', label: 'Strengths & Gaps', icon: Award },
    { to: '/student/progress', label: 'Activity Progress', icon: CheckCircle2 },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const trainerNavItems = [
    { to: '/trainer/dashboard', label: 'Trainer Dashboard', icon: LayoutDashboard },
    { to: '/trainer/courses', label: 'Course Management', icon: BookOpen },
    { to: '/trainer/materials', label: 'Upload Materials', icon: UploadCloud },
    { to: '/trainer/ai-generation', label: 'AI Content Studio', icon: Sparkles },
    { to: '/trainer/quizzes', label: 'Quiz Management', icon: HelpCircle },
    { to: '/trainer/students-performance', label: 'Student Mastery', icon: Users },
    { to: '/trainer/analytics', label: 'Course Analytics', icon: BarChart3 },
    { to: '/trainer/profile', label: 'Profile', icon: User },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'System Overview', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/courses', label: 'Course Moderation', icon: BookOpen },
    { to: '/admin/analytics', label: 'Telemetry & Trends', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ShieldCheck },
  ];

  const navItems = role === 'ADMIN' ? adminNavItems : role === 'TRAINER' ? trainerNavItems : studentNavItems;

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 transition-colors">
      <div>
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight gradient-text">LearnFlow</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
              Adaptive Portal
            </span>
          </div>
        </div>

        {/* Role Scope Pill */}
        <div className="px-4 py-3">
          <div className="px-3 py-2 rounded-xl bg-muted/60 border border-border/50 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-rose-500" />}
            {role === 'TRAINER' && <BookOpen className="w-4 h-4 text-purple-500" />}
            {role === 'STUDENT' && <GraduationCap className="w-4 h-4 text-emerald-500" />}
            <span>{role} WORKSPACE</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm border border-brand-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )
                }
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/60">
        <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 text-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground font-medium">
            <span>Engine</span>
            <span className="text-emerald-500 font-bold">Rule Engine v1.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Multi-factor adaptive learning active.
          </p>
        </div>
      </div>
    </aside>
  );
};
