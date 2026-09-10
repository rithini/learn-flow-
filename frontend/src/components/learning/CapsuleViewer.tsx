import React, { useState } from 'react';
import { LearningCapsule } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  BookOpen,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Clock,
  Play,
  Share2,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface CapsuleViewerProps {
  capsule: LearningCapsule;
  onComplete?: () => void;
  onStartQuiz?: () => void;
}

export const CapsuleViewer: React.FC<CapsuleViewerProps> = ({
  capsule,
  onComplete,
  onStartQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'simple' | 'points' | 'example' | 'recap'>('standard');
  const [isCompleted, setIsCompleted] = useState(false);

  const getSectionContent = (type: string) => {
    const sec = capsule.sections.find((s) => s.section_type === type);
    return sec ? sec.content_json : null;
  };

  const summary = getSectionContent('SUMMARY')?.explanation;
  const simple = getSectionContent('SIMPLE_EXPLANATION')?.simple_explanation;
  const keyPointsData = getSectionContent('KEY_POINTS');
  const points = keyPointsData?.points || [];
  const objectives = keyPointsData?.objectives || [];
  const example = getSectionContent('EXAMPLE')?.example;
  const recapQuestion = getSectionContent('RECAP')?.recap_question;

  const handleMarkComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete();
  };

  const tabs = [
    { id: 'standard', label: 'Standard Lesson', icon: BookOpen },
    { id: 'simple', label: 'Simplified Analogy', icon: Sparkles },
    { id: 'points', label: 'Key Points', icon: CheckCircle2 },
    { id: 'example', label: 'Real-World Case', icon: Lightbulb },
    { id: 'recap', label: 'Self-Check', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Capsule Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Level: {capsule.level}
            </Badge>
            <span className="flex items-center gap-1 text-xs font-semibold text-white/80">
              <Clock className="w-3.5 h-3.5" />
              {capsule.estimated_minutes} min read
            </span>
          </div>
          {isCompleted && (
            <Badge className="bg-emerald-400/20 text-emerald-300 border-emerald-400/30">
              ✓ Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">{capsule.title}</h1>
        <p className="text-sm text-white/80 max-w-2xl">
          Adaptive micro-capsule with multi-format explanations designed for high retention.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200',
                isActive
                  ? 'bg-card text-foreground shadow-sm border border-border/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              )}
            >
              <Icon className={cn('w-4 h-4', isActive ? 'text-brand-500' : 'text-muted-foreground')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-8 leading-relaxed">
          {activeTab === 'standard' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                Conceptual Foundations
              </h3>
              <div className="text-foreground/90 space-y-4 whitespace-pre-line text-base leading-relaxed">
                {summary || 'Standard comprehensive explanation is loading...'}
              </div>
            </div>
          )}

          {activeTab === 'simple' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Intuitive Analogy
                </span>
              </div>
              <div className="text-base text-foreground/90 leading-relaxed font-medium bg-muted/30 p-6 rounded-2xl border border-border">
                {simple || 'Simplified explanation is loading...'}
              </div>
            </div>
          )}

          {activeTab === 'points' && (
            <div className="space-y-6">
              {objectives.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Target Learning Objectives
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {objectives.map((obj: string, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-brand-500/5 border border-brand-500/15 text-sm font-medium text-foreground flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/15 text-brand-600 font-bold flex items-center justify-center text-xs">
                          {i + 1}
                        </span>
                        {obj}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Core Takeaways
                </h4>
                <div className="space-y-2.5">
                  {points.map((p: string, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-foreground">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'example' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Industry Application & Case Study
              </h3>
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-foreground/90 text-base leading-relaxed">
                {example || 'Real world example content...'}
              </div>
            </div>
          )}

          {activeTab === 'recap' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-500" />
                Reflective Self-Check
              </h3>
              <div className="p-6 rounded-2xl bg-muted/40 border border-border space-y-3">
                <p className="font-semibold text-foreground text-base">{recapQuestion}</p>
                <p className="text-xs text-muted-foreground">
                  Take a brief moment to reflect on your answer before testing your knowledge with the scored quiz.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border">
        <Button
          variant={isCompleted ? 'secondary' : 'success'}
          onClick={handleMarkComplete}
          disabled={isCompleted}
        >
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {isCompleted ? 'Capsule Completed' : 'Mark as Completed (+15 XP)'}
        </Button>

        {onStartQuiz && (
          <Button onClick={onStartQuiz} className="shadow-lg shadow-brand-500/20">
            <span>Take Topic Assessment</span>
            <Play className="w-4 h-4 ml-1.5 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
};
