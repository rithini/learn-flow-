import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Layers,
  LineChart,
  BrainCircuit,
  Workflow,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 py-12 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold tracking-wide animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen AI Adaptive Micro-Learning for Institutes</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]">
          Tailor Every Student’s Path with{' '}
          <span className="gradient-text">Continuous Adaptive Mastery</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Convert institute curriculum into interactive micro-capsules and diagnostic quizzes. Our closed-loop adaptive engine routes every learner to the next optimal activity based on demonstrated mastery.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={() => navigate('/register')} className="shadow-xl shadow-brand-500/25">
            <span>Start Free Demo</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            <span>Sign In with Demo Accounts</span>
          </Button>
        </div>

        {/* Floating Metrics Preview Banner */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-2xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">0.55×</span>
              <span className="text-xs font-medium text-muted-foreground">Recent Assessment Weight</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-emerald-500">100%</span>
              <span className="text-xs font-medium text-muted-foreground">Server-Side Graded (Zero Leakage)</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-purple-500">DRAFT</span>
              <span className="text-xs font-medium text-muted-foreground">Trainer-Reviewed AI Publishing</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-black text-amber-500">DAG</span>
              <span className="text-xs font-medium text-muted-foreground">Prerequisite Safe Progression</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Capabilities Section */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-foreground">Three Tailored Role Portals</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Strict role-based access control with scoped ownership and private student records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Card */}
          <Card className="hover:border-brand-500/40 transition-all duration-300">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Student Portal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dynamic personalized paths, multi-format micro-capsules (standard & simplified analogies), instant scored quizzes, and real-time gap remediation.
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Prerequisite safe unlocking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mastery strength & gap detection</li>
              </ul>
            </CardContent>
          </Card>

          {/* Trainer Card */}
          <Card className="hover:border-brand-500/40 transition-all duration-300">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Trainer Curriculum Studio</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload PDFs/DOCX, extract chunked text with page citations, generate structured AI drafts, review/edit capsules, and inspect struggling student cohorts.
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Human-in-the-loop publishing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Topic difficulty telemetry</li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="hover:border-brand-500/40 transition-all duration-300">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Admin Control Plane</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Manage user directory, activate/deactivate accounts, moderate course status, and audit security compliance logs across the institute.
              </p>
              <ul className="text-xs text-muted-foreground space-y-2 pt-2 border-t border-border">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Institute-wide user & course moderation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-500" /> Immutable audit logging</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closed-Loop Adaptive Engine Explanation */}
      <section className="p-10 rounded-3xl bg-gradient-to-br from-brand-900/10 via-card to-background border border-border space-y-8">
        <div className="text-center space-y-3">
          <Badge variant="default">The LearnFlow Innovation</Badge>
          <h2 className="text-3xl font-black text-foreground">Closed-Loop Adaptive Learning Cycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-600 mx-auto flex items-center justify-center font-bold text-sm">1</div>
            <h4 className="font-bold text-sm text-foreground">Activity & Quiz</h4>
            <p className="text-xs text-muted-foreground">Student studies micro-capsule and completes timed topic assessment.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-600 mx-auto flex items-center justify-center font-bold text-sm">2</div>
            <h4 className="font-bold text-sm text-foreground">Mastery Calculation</h4>
            <p className="text-xs text-muted-foreground">Recency-weighted accuracy, quality, and prerequisite scores compute topic mastery.</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-600 mx-auto flex items-center justify-center font-bold text-sm">3</div>
            <h4 className="font-bold text-sm text-foreground">Policy Evaluation</h4>
            <p className="text-xs text-muted-foreground">Classifies into Strong (&ge;80%), Developing (50-79%), or Needs Support (&lt;50%).</p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border space-y-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-600 mx-auto flex items-center justify-center font-bold text-sm">4</div>
            <h4 className="font-bold text-sm text-foreground">Adaptive Path Update</h4>
            <p className="text-xs text-muted-foreground">Routes learner to next topic, simplified remediation, or targeted practice.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 py-8">
        <h2 className="text-3xl sm:text-4xl font-black text-foreground">Ready to test LearnFlow?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Explore student dashboards, curriculum generation, and live adaptive recommendations.
        </p>
        <Button size="lg" onClick={() => navigate('/login')}>
          Launch Interactive Demo Portal
        </Button>
      </section>
    </div>
  );
};
