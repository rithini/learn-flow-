import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { StudentPerformance, Course } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Award,
  AlertTriangle,
  Target,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  Brain,
  Lightbulb,
  X,
  Clock,
  Compass,
  Check,
  Flame,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ProgressRing } from '../../components/common/ProgressRing';
import { getStrengthBadgeColor } from '../../utils/formatters';

type CategoryFilter = 'ALL' | 'STRENGTHS' | 'DEVELOPING' | 'GAPS';

export const StrengthsWeaknessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [perfs, setPerfs] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<StudentPerformance | null>(null);

  useEffect(() => {
    studentApi.getMyCourses().then((res) => {
      if (res && res.length > 0) {
        setCourses(res);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const cId = selectedCourseId === 'all' ? undefined : selectedCourseId;
    studentApi
      .getPerformance(cId)
      .then((res) => {
        setPerfs(res);
      })
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  // Calculations
  const totalTopics = perfs.length;
  const strengths = perfs.filter((p) => p.mastery_score >= 80);
  const developing = perfs.filter((p) => p.mastery_score >= 50 && p.mastery_score < 80);
  const gaps = perfs.filter((p) => p.mastery_score < 50);

  const avgMastery =
    totalTopics > 0
      ? Math.round(perfs.reduce((acc, p) => acc + p.mastery_score, 0) / totalTopics)
      : 0;

  const strengthIndex =
    totalTopics > 0 ? Math.round((strengths.length / totalTopics) * 100) : 0;

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return perfs.filter((p) => {
      const matchesSearch =
        p.topic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.course_title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'STRENGTHS') return p.mastery_score >= 80;
      if (categoryFilter === 'DEVELOPING') return p.mastery_score >= 50 && p.mastery_score < 80;
      if (categoryFilter === 'GAPS') return p.mastery_score < 50;

      return true;
    });
  }, [perfs, searchQuery, categoryFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* Course Switcher Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/70 border border-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Curriculum Scope
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent font-bold text-base text-foreground focus:outline-none cursor-pointer hover:text-brand-600 transition-colors"
            >
              <option value="all" className="bg-card text-foreground">
                All Enrolled Courses & Modules
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 px-3 py-1 font-bold text-xs">
            Adaptive Policy Thresholds Active
          </Badge>
        </div>
      </div>

      {/* Hero Visual Diagnostic Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-xl shadow-emerald-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                Competency Diagnostics
              </Badge>
              <Badge className="bg-emerald-300/30 text-emerald-100 border-emerald-300/40">
                Rule Engine Policy Active
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Strengths & Knowledge Gaps
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Real-time classification of your mastery profile. Strong topics unlock advanced challenges, while identified gaps receive targeted remediation and simplified concept analogies.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{strengths.length} Proficient Topics (≥80%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-300" />
                <span>{developing.length} Developing Topics (50-79%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-300" />
                <span>{gaps.length} Concept Gaps (&lt;50%)</span>
              </div>
            </div>
          </div>

          {/* Strength Index Ring Gauge */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex items-center gap-5 shrink-0 self-start lg:self-auto">
            <ProgressRing
              progress={strengthIndex}
              size={84}
              strokeWidth={7}
              label="Strengths"
            />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                Proficiency Index
              </span>
              <div className="text-2xl font-black text-white">{strengthIndex}%</div>
              <p className="text-[11px] text-white/80">
                {strengthIndex >= 70
                  ? '🌟 Exceptional foundation'
                  : strengthIndex >= 40
                  ? '⚡ Steady progress across units'
                  : '🛡️ Focus on remediation actions'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Pillar Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Proficient Strengths Card */}
        <Card className="border-emerald-500/30 bg-gradient-to-b from-card to-emerald-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Demonstrated Strengths</span>
              </span>
              <Badge variant="success">{strengths.length} Units</Badge>
            </div>
            <CardTitle className="text-lg font-black text-foreground mt-1">
              Proficient (&ge; 80% Mastery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground leading-relaxed">
            <p>
              Topics where you have demonstrated mastery with high quiz accuracy and consistent retention.
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
              ✓ Ready for advanced synthesis questions and challenge checkpoints.
            </div>
          </CardContent>
        </Card>

        {/* Developing Competencies Card */}
        <Card className="border-amber-500/30 bg-gradient-to-b from-card to-amber-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>Active Competencies</span>
              </span>
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                {developing.length} Units
              </Badge>
            </div>
            <CardTitle className="text-lg font-black text-foreground mt-1">
              Developing (50 - 79% Mastery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground leading-relaxed">
            <p>
              Concepts understood in principle, but requiring targeted practice quizzes to bridge to proficiency.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
              ⚡ Targeted practice quizzes recommended to cross the 80% threshold.
            </div>
          </CardContent>
        </Card>

        {/* Critical Concept Gaps Card */}
        <Card className="border-rose-500/30 bg-gradient-to-b from-card to-rose-500/5 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>High-Priority Support</span>
              </span>
              <Badge variant="danger">{gaps.length} Units</Badge>
            </div>
            <CardTitle className="text-lg font-black text-foreground mt-1">
              Concept Gaps (&lt; 50% Mastery)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground leading-relaxed">
            <p>
              Foundational topics with missing prerequisites or quiz struggles that need remediation.
            </p>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
              🛡️ Simplified analogy micro-capsules and foundational review prescribed.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actionable "Gap-Closure Battle Plan" Banner */}
      {gaps.length > 0 && (
        <Card className="border-brand-500/30 bg-gradient-to-r from-brand-600/10 via-indigo-600/10 to-purple-600/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-foreground">
                    Actionable Remediation Battle Plan
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    High-yield sequence prescribed by AI engine to eliminate concept gaps.
                  </p>
                </div>
              </div>
              <Badge className="bg-brand-500 text-white">Priority 1 Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                <span className="font-extrabold text-brand-600 text-[10px] uppercase">Step 01 • Review</span>
                <h4 className="font-bold text-foreground">Read Simplified Analogies</h4>
                <p className="text-muted-foreground text-[11px]">
                  Study the intuitive visual capsule for foundational topics.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                <span className="font-extrabold text-amber-500 text-[10px] uppercase">Step 02 • Practice</span>
                <h4 className="font-bold text-foreground">2-Question Mini Checkpoint</h4>
                <p className="text-muted-foreground text-[11px]">
                  Solve step-by-step diagnostic questions to calibrate intuition.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                <span className="font-extrabold text-emerald-500 text-[10px] uppercase">Step 03 • Unlock</span>
                <h4 className="font-bold text-foreground">Retake Assessment Quiz</h4>
                <p className="text-muted-foreground text-[11px]">
                  Score &ge; 70% to promote topic status to Proficient.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              categoryFilter === 'ALL'
                ? 'bg-brand-500/15 text-brand-600 border-brand-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            All Classified Units ({totalTopics})
          </button>
          <button
            onClick={() => setCategoryFilter('STRENGTHS')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              categoryFilter === 'STRENGTHS'
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Strengths ({strengths.length})
          </button>
          <button
            onClick={() => setCategoryFilter('DEVELOPING')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              categoryFilter === 'DEVELOPING'
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Developing ({developing.length})
          </button>
          <button
            onClick={() => setCategoryFilter('GAPS')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              categoryFilter === 'GAPS'
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Learning Gaps ({gaps.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search strength or gap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Main Diagnostic Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTopics.map((item) => {
          const isStrength = item.mastery_score >= 80;
          const isGap = item.mastery_score < 50;
          const isDev = item.mastery_score >= 50 && item.mastery_score < 80;

          return (
            <Card
              key={item.topic_id}
              className={cn(
                'border transition-all duration-300 hover:shadow-xl group relative overflow-hidden',
                isStrength
                  ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-br from-card to-emerald-500/5'
                  : isGap
                  ? 'border-rose-500/30 hover:border-rose-500/50 bg-gradient-to-br from-card to-rose-500/5 ring-1 ring-rose-500/15'
                  : 'border-amber-500/30 hover:border-amber-500/50 bg-gradient-to-br from-card to-amber-500/5'
              )}
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {item.course_title || 'Curriculum Module'}
                      </span>
                      {isStrength && (
                        <Badge variant="success" className="text-[10px] py-0.5">
                          ✓ Proficient
                        </Badge>
                      )}
                      {isDev && (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] py-0.5">
                          ⚡ Developing
                        </Badge>
                      )}
                      {isGap && (
                        <Badge variant="danger" className="text-[10px] py-0.5">
                          🛡️ Gap Flagged
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-extrabold text-lg text-foreground group-hover:text-brand-600 transition-colors">
                      {item.topic_title}
                    </h3>
                  </div>

                  {/* Mastery Score Pill */}
                  <div className="text-right">
                    <span className="text-xl font-black text-foreground block">{item.mastery_score}%</span>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground">Mastery</span>
                  </div>
                </div>

                {/* Root Cause / Recommendation Note */}
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs space-y-1',
                    isStrength
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
                      : isGap
                      ? 'bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200'
                  )}
                >
                  <div className="font-bold text-[11px] flex items-center gap-1.5">
                    {isStrength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : isGap ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <Target className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {isStrength
                        ? 'Mastery Confirmed'
                        : isGap
                        ? 'Root-Cause: Prerequisite Gap & Low Checkpoint Retention'
                        : 'Bridge Required: +15% Accuracy to reach Proficient'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {isStrength
                      ? `Demonstrated ${item.recent_accuracy}% accuracy across ${item.attempt_count} assessment attempt(s). Prerequisite dependencies solid.`
                      : isGap
                      ? 'Simplified concept capsule and foundational exercises recommended to clear prerequisite blocker.'
                      : `Currently at ${item.recent_accuracy}% quiz accuracy. Targeted mini-checkpoint will promote this to strong tier.`}
                  </p>
                </div>

                {/* Mastery Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                    <span>Proficiency Baseline</span>
                    <span>{item.mastery_score}% / 80% Target</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isStrength ? 'bg-emerald-500' : isGap ? 'bg-rose-500' : 'bg-amber-500'
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, item.mastery_score))}%` }}
                    />
                  </div>
                </div>

                {/* Footer Action Triggers */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/70">
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {item.attempt_count} Attempt{item.attempt_count === 1 ? '' : 's'} Logged
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedItem(item)}
                      className="text-xs text-brand-600 hover:bg-brand-500/10"
                    >
                      <span>Root-Cause</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => navigate('/student/capsules/cap-1')}
                      className={cn(
                        'text-xs text-white',
                        isStrength
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : isGap
                          ? 'bg-rose-600 hover:bg-rose-700'
                          : 'bg-brand-600 hover:bg-brand-700'
                      )}
                    >
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      <span>{isStrength ? 'Review Unit' : isGap ? 'Fix Gap Now' : 'Practice'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Root-Cause Diagnostic Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-foreground border border-border w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getStrengthBadgeColor(selectedItem.strength_status).bg}>
                  {getStrengthBadgeColor(selectedItem.strength_status).label}
                </Badge>
                <span className="text-xs text-muted-foreground font-semibold">
                  {selectedItem.mastery_score}% Weighted Mastery
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground">{selectedItem.topic_title}</h2>
              <p className="text-xs text-muted-foreground">{selectedItem.course_title}</p>
            </div>

            {/* Diagnostic Root Cause Breakdown */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-brand-500" />
                <span>Diagnostic Assessment Breakdown</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quiz Accuracy Benchmark</span>
                  <span className="font-bold text-foreground">{selectedItem.recent_accuracy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence Self-Efficacy</span>
                  <span className="font-bold text-foreground">{selectedItem.confidence_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion Quality Index</span>
                  <span className="font-bold text-foreground">{selectedItem.completion_quality}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Diagnostic Attempts</span>
                  <span className="font-bold text-foreground">{selectedItem.attempt_count}</span>
                </div>
              </div>
            </div>

            {/* Prescribed Solution */}
            <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 space-y-2 text-xs">
              <div className="font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Adaptive Remediation</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {selectedItem.mastery_score >= 80
                  ? 'Great performance! You have cleared all prerequisite checks for this module. You can freely proceed to subsequent modules or take advanced challenge quizzes.'
                  : selectedItem.mastery_score >= 50
                  ? 'You understand the core principles. Retaking the checkpoint quiz and achieving ≥ 75% will officially promote this module to Proficient.'
                  : 'Prerequisite gap detected. We recommend reading the simplified analogy capsule, following the step-by-step mathematical breakdown, and then completing the diagnostic quiz.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  navigate('/student/capsules/cap-1');
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                Launch Capsule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
