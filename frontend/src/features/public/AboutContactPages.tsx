import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BrainCircuit, ShieldCheck, Zap, Layers, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 px-6 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="default">Pedagogical Framework</Badge>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          About LearnFlow & Adaptive Learning
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          LearnFlow bridges traditional classroom curriculum with individualized pacing through multi-factor mastery estimation and closed-loop recommendations.
        </p>
      </div>

      <Card className="border-border shadow-lg">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-2xl font-bold text-foreground">The Mastery Computation Engine</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rather than relying on a static linear passing threshold, LearnFlow models each student’s knowledge state using a deterministic, multi-feature formula:
          </p>

          <div className="p-6 rounded-2xl bg-muted/40 border border-border font-mono text-sm text-brand-600 dark:text-brand-400 overflow-x-auto">
            {"Mastery Score = 0.55 × (Recent Accuracy) + 0.20 × (Completion Quality) + 0.15 × (Trend) + 0.10 × (Prerequisite Mastery)"}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <strong className="text-foreground text-sm block">0.55 × Recent Assessment Accuracy</strong>
              Exponentially decaying average of the student's recent topic quizzes.
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <strong className="text-foreground text-sm block">0.20 × Completion Quality</strong>
              Time spent, completed analogies, and interaction completeness within the capsule.
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <strong className="text-foreground text-sm block">0.15 × Improvement Trend</strong>
              Delta score between current and preceding attempts, rewarding upward trajectories.
            </div>
            <div className="p-4 rounded-xl bg-card border border-border space-y-1">
              <strong className="text-foreground text-sm block">0.10 × Prerequisite Mastery</strong>
              Mean mastery score across all parent prerequisite nodes in the course DAG.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="py-12 px-6 max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <Badge variant="default">Institute Support</Badge>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Get in Touch</h1>
        <p className="text-sm text-muted-foreground">
          Have inquiries regarding institutional deployment, curriculum ingestion, or student privacy compliance?
        </p>
      </div>

      <Card className="border-border shadow-xl">
        <CardContent className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Institute / University Name</label>
            <input className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm" placeholder="e.g. State University" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Contact Email</label>
            <input type="email" className="w-full h-11 px-3.5 rounded-xl border border-input bg-background text-sm" placeholder="contact@institute.edu" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Message</label>
            <textarea rows={4} className="w-full p-3.5 rounded-xl border border-input bg-background text-sm" placeholder="Tell us about your student cohort and curriculum needs..." />
          </div>
          <button className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-colors">
            Send Inquiry
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
