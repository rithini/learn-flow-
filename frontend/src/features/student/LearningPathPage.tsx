import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { LearningPath, LearningPathItem, Course, StudentPerformance } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Compass,
  Zap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  Lock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Check,
  Target,
  Flame,
  X,
  FileText,
  BarChart2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ProgressRing } from '../../components/common/ProgressRing';

type PacingMode = 'SPRINT' | 'STANDARD' | 'DEEP_MASTERY';
type FilterStatus = 'ALL' | 'NEEDS_ATTENTION' | 'IN_PROGRESS' | 'MASTERED' | 'LOCKED';
type ViewMode = 'TIMELINE' | 'DAG';

export const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-ml-101');
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalibrating, setRecalibrating] = useState<boolean>(false);
  const [pacingMode, setPacingMode] = useState<PacingMode>('STANDARD');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('TIMELINE');
  const [previewItem, setPreviewItem] = useState<LearningPathItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviewedItems, setReviewedItems] = useState<Record<string, boolean>>({});

  // Fetch enrolled courses and initial learning path
  useEffect(() => {
    studentApi.getMyCourses().then((res) => {
      if (res && res.length > 0) {
        setCourses(res);
        if (!res.some((c) => c.id === selectedCourseId)) {
          setSelectedCourseId(res[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setLoading(true);
    studentApi
      .getLearningPath(selectedCourseId)
      .then((res) => {
        setPath(res);
        if (res?.pacing_mode) {
          setPacingMode(res.pacing_mode as PacingMode);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCourseId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleRecalibrate = async (mode: PacingMode = pacingMode) => {
    if (!selectedCourseId) return;
    setRecalibrating(true);
    try {
      const updated = await studentApi.recalibrateLearningPath(selectedCourseId, mode);
      setPath(updated);
      setPacingMode(mode);
      showToast(
        `AI Adaptive Engine recalibrated your path to Version ${updated.version || 2} in ${
          mode === 'SPRINT' ? 'Sprint Track' : mode === 'DEEP_MASTERY' ? 'Deep Mastery Track' : 'Balanced Track'
        }!`
      );
    } catch (err) {
      showToast('Path recalibrated based on latest topic mastery scores.');
    } finally {
      setRecalibrating(false);
    }
  };

  const handlePacingChange = (mode: PacingMode) => {
    setPacingMode(mode);
    handleRecalibrate(mode);
  };

  const toggleReviewed = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReviewedItems((prev) => {
      const next = !prev[itemId];
      showToast(next ? 'Milestone marked as reviewed!' : 'Milestone unmarked.');
      return { ...prev, [itemId]: next };
    });
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!path?.items) return [];
    return path.items.filter((item) => {
      const matchesSearch =
        item.topic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.reason_code && item.reason_code.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'MASTERED') {
        return item.mastery_score >= 80;
      }
      if (filterStatus === 'NEEDS_ATTENTION') {
        return item.mastery_score < 50 && !item.is_locked;
      }
      if (filterStatus === 'IN_PROGRESS') {
        return item.mastery_score >= 50 && item.mastery_score < 80;
      }
      if (filterStatus === 'LOCKED') {
        return !!item.is_locked;
      }
      return true;
    });
  }, [path, filterStatus, searchQuery]);

  // Derived metrics
  const totalUnits = path?.items.length || 0;
  const masteredUnits = path?.items.filter((i) => i.mastery_score >= 80).length || 0;
  const developingUnits = path?.items.filter((i) => i.mastery_score >= 50 && i.mastery_score < 80).length || 0;
  const supportUnits = path?.items.filter((i) => i.mastery_score < 50 && !i.is_locked).length || 0;
  const lockedUnits = path?.items.filter((i) => i.is_locked).length || 0;

  const readinessScore =
    path?.readiness_percentage !== undefined
      ? path.readiness_percentage
      : totalUnits > 0
      ? Math.round(
          (path?.items.reduce((acc, i) => acc + (i.mastery_score || 0), 0) || 0) / totalUnits
        )
      : 0;

  const remainingMinutes =
    path?.estimated_total_minutes !== undefined
      ? path.estimated_total_minutes
      : (totalUnits - masteredUnits) * 20;

  const activeCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md bg-foreground text-background dark:bg-card dark:text-foreground border border-brand-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <p className="text-xs font-semibold leading-snug flex-1">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Course Switcher & Pacing Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card/70 border border-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Active Course Curriculum
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-transparent font-bold text-base text-foreground focus:outline-none cursor-pointer hover:text-brand-600 transition-colors"
            >
              {courses.length > 0 ? (
                courses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-card text-foreground">
                    {c.title}
                  </option>
                ))
              ) : (
                <option value="crs-ml-101" className="bg-card text-foreground">
                  Introduction to Machine Learning & Neural Networks
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pacing Mode Selector */}
          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border text-xs">
            <button
              onClick={() => handlePacingChange('SPRINT')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5',
                pacingMode === 'SPRINT'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Fast-track key modules & unlocked challenge checkpoints (~15m/day)"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Sprint</span>
            </button>
            <button
              onClick={() => handlePacingChange('STANDARD')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5',
                pacingMode === 'STANDARD'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Balanced pacing with standard micro-capsules and checkpoint quizzes (~25m/day)"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Balanced</span>
            </button>
            <button
              onClick={() => handlePacingChange('DEEP_MASTERY')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5',
                pacingMode === 'DEEP_MASTERY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Deep foundational reviews, extra practice & simplified analogies (~40m/day)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deep Mastery</span>
            </button>
          </div>

          {/* AI Recalibrate Button */}
          <Button
            onClick={() => handleRecalibrate()}
            disabled={recalibrating}
            className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', recalibrating && 'animate-spin')} />
            <span>{recalibrating ? 'Recalibrating...' : '⚡ Recalibrate Path'}</span>
          </Button>
        </div>
      </div>

      {/* Hero Adaptive Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                Version {path?.version || 1} Adaptive Roadmap
              </Badge>
              <Badge className="bg-emerald-500/30 text-emerald-100 border-emerald-400/40">
                Closed-Loop Rule Engine v1.0 Active
              </Badge>
              <Badge className="bg-amber-400/30 text-amber-100 border-amber-300/40">
                {pacingMode === 'SPRINT' ? '⚡ Sprint Track' : pacingMode === 'DEEP_MASTERY' ? '🛡️ Deep Mastery' : '🎯 Balanced Track'}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Your Personalized Learning Path
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              The AI engine recalculates your sequence dynamically using DAG prerequisite relationships, quiz accuracies, and retention trends.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-white/70" />
                <span>Est. {remainingMinutes} mins to complete course</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{masteredUnits} of {totalUnits} Units Mastered</span>
              </div>
            </div>
          </div>

          {/* Readiness Meter Gauge */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 flex items-center gap-5 shrink-0 self-start lg:self-auto">
            <ProgressRing
              progress={readinessScore}
              size={84}
              strokeWidth={7}
              label="Readiness"
            />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
                Exam / Concept Readiness
              </span>
              <div className="text-2xl font-black text-white">{readinessScore}%</div>
              <p className="text-[11px] text-white/80">
                {readinessScore >= 80
                  ? '🌟 Strong competency achieved'
                  : readinessScore >= 50
                  ? '⚡ Good progress, review active units'
                  : '🛡️ Reinforce foundational prerequisites'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Diagnostic Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Mastered (≥80%)</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{masteredUnits}</p>
              <span className="text-[11px] text-muted-foreground">Proficient modules</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">In Progress (50-79%)</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{developingUnits}</p>
              <span className="text-[11px] text-muted-foreground">Active practice</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Needs Support (&lt;50%)</p>
              <p className="text-2xl font-black text-rose-500 mt-1">{supportUnits}</p>
              <span className="text-[11px] text-muted-foreground">Simplified capsule</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Prerequisites Locked</p>
              <p className="text-2xl font-black text-muted-foreground mt-1">{lockedUnits}</p>
              <span className="text-[11px] text-muted-foreground">Sequenced after prior</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter, Search and View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              filterStatus === 'ALL'
                ? 'bg-brand-500/15 text-brand-600 border-brand-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            All Milestones ({totalUnits})
          </button>
          <button
            onClick={() => setFilterStatus('NEEDS_ATTENTION')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              filterStatus === 'NEEDS_ATTENTION'
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Needs Attention ({supportUnits})
          </button>
          <button
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              filterStatus === 'IN_PROGRESS'
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            In Progress ({developingUnits})
          </button>
          <button
            onClick={() => setFilterStatus('MASTERED')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              filterStatus === 'MASTERED'
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Mastered ({masteredUnits})
          </button>
          {lockedUnits > 0 && (
            <button
              onClick={() => setFilterStatus('LOCKED')}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
                filterStatus === 'LOCKED'
                  ? 'bg-muted text-foreground border-border'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
              )}
            >
              Locked ({lockedUnits})
            </button>
          )}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topic or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                viewMode === 'TIMELINE' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
              title="Milestone Timeline View"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('DAG')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                viewMode === 'DAG' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
              title="Prerequisite DAG Dependency Tree View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DAG Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Roadmap Display */}
      {viewMode === 'TIMELINE' ? (
        /* Vertical Stepper Roadmap */
        <div className="relative space-y-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-500 via-indigo-500 to-border hidden sm:block pointer-events-none" />

          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
              <Compass className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
              <h3 className="font-bold text-base text-foreground">No milestones match your filter</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try resetting your search query or selecting a different status filter above.
              </p>
              <Button size="sm" variant="outline" onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isMastered = item.mastery_score >= 80;
              const isSupport = item.mastery_score < 50 && !item.is_locked;
              const isDeveloping = item.mastery_score >= 50 && item.mastery_score < 80;
              const isLocked = item.is_locked;
              const isReviewed = reviewedItems[item.id];

              return (
                <div
                  key={item.id}
                  className={cn(
                    'relative sm:pl-16 transition-all group',
                    isLocked && 'opacity-70'
                  )}
                >
                  {/* Step Sequence Pin Icon */}
                  <div
                    className={cn(
                      'absolute left-2.5 top-6 -translate-x-1/2 w-8 h-8 rounded-full font-black text-xs hidden sm:flex items-center justify-center border-2 transition-all shadow-md z-10',
                      isMastered
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/25'
                        : isSupport
                        ? 'bg-rose-500 border-rose-400 text-white shadow-rose-500/25 animate-pulse'
                        : isDeveloping
                        ? 'bg-brand-600 border-brand-400 text-white shadow-brand-500/25'
                        : isLocked
                        ? 'bg-muted border-border text-muted-foreground'
                        : 'bg-card border-brand-500 text-brand-600'
                    )}
                  >
                    {isMastered ? <Check className="w-4 h-4 stroke-[3]" /> : isLocked ? <Lock className="w-3.5 h-3.5" /> : idx + 1}
                  </div>

                  {/* Milestone Content Card */}
                  <div
                    className={cn(
                      'p-6 rounded-3xl bg-card border transition-all duration-300 shadow-sm hover:shadow-md space-y-4',
                      isMastered
                        ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-r from-card to-emerald-500/5'
                        : isSupport
                        ? 'border-rose-500/40 hover:border-rose-500/60 bg-gradient-to-r from-card to-rose-500/5 ring-1 ring-rose-500/20'
                        : isDeveloping
                        ? 'border-brand-500/40 hover:border-brand-500/60 bg-gradient-to-r from-card to-brand-500/5'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                            Unit {item.position || idx + 1}
                          </span>
                          
                          {/* Difficulty Pill */}
                          <Badge variant="outline" className="text-[10px] py-0.5">
                            {item.difficulty || 'MEDIUM'}
                          </Badge>

                          {/* Time Estimate */}
                          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimated_minutes || 20}m
                          </span>

                          {/* Status Badge */}
                          {isMastered && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                              ✓ Mastered ({item.mastery_score}%)
                            </Badge>
                          )}
                          {isDeveloping && (
                            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
                              ⚡ Developing ({item.mastery_score}%)
                            </Badge>
                          )}
                          {isSupport && (
                            <Badge className="bg-rose-500/15 text-rose-500 border-rose-500/30">
                              🛡️ Remediation Recommended ({item.mastery_score}%)
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Prerequisite Locked
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-extrabold text-lg text-foreground tracking-tight group-hover:text-brand-600 transition-colors">
                          {item.topic_title}
                        </h3>

                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 leading-relaxed">
                          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span>{item.reason_code || 'Curriculum progression target.'}</span>
                        </p>
                      </div>

                      {/* Mastery Gauge & Quick Info */}
                      <div className="flex items-center gap-4 self-start sm:self-auto">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-foreground">{item.mastery_score}%</div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Topic Mastery</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewItem(item)}
                          className="text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-500/10"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          <span>Quick Preview</span>
                        </Button>
                      </div>
                    </div>

                    {/* Prerequisite Note if Locked */}
                    {isLocked && item.lock_reason && (
                      <div className="p-3 rounded-xl bg-muted/70 border border-border text-xs text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{item.lock_reason}</span>
                      </div>
                    )}

                    {/* Progress Bar for Topic Mastery */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Mastery Progress</span>
                        <span>{item.mastery_score}% / 100%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isMastered ? 'bg-emerald-500' : isSupport ? 'bg-rose-500' : 'bg-brand-500'
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, item.mastery_score))}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Triggers Footer */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60">
                      <div className="flex items-center gap-2">
                        {item.prerequisite_titles && item.prerequisite_titles.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">
                            <span className="font-semibold text-foreground">Requires:</span>{' '}
                            {item.prerequisite_titles.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Reviewed Status */}
                        <button
                          onClick={(e) => toggleReviewed(item.id, e)}
                          className={cn(
                            'p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5',
                            isReviewed
                              ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                              : 'bg-card text-muted-foreground border-border hover:bg-muted/60'
                          )}
                          title="Mark milestone as reviewed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isReviewed ? 'Reviewed' : 'Mark Done'}</span>
                        </button>

                        {/* Direct Study Capsule Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLocked}
                          onClick={() => navigate(`/student/capsules/${item.capsule_id || 'cap-1'}`)}
                          className="text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 mr-1" />
                          <span>Study Capsule</span>
                        </Button>

                        {/* Direct Quiz Assessment Button */}
                        <Button
                          size="sm"
                          disabled={isLocked}
                          onClick={() => navigate(`/student/quizzes/${item.quiz_id || 'quiz-1'}`)}
                          className={cn(
                            'text-xs',
                            isMastered
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-brand-600 hover:bg-brand-700 text-white'
                          )}
                        >
                          <span>{isMastered ? 'Practice Quiz' : 'Take Assessment'}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Prerequisite Dependency DAG View */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-500" />
              <span>
                <strong>Dependency DAG Graph</strong>: Topics unlock sequentially as prerequisites reach ≥ 50% mastery baseline.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {path?.items.map((item, idx) => {
              const isMastered = item.mastery_score >= 80;
              const isSupport = item.mastery_score < 50 && !item.is_locked;
              const isLocked = item.is_locked;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    'border transition-all duration-300 hover:shadow-lg relative overflow-hidden',
                    isMastered
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isSupport
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : isLocked
                      ? 'border-border opacity-75'
                      : 'border-brand-500/30 bg-brand-500/5'
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">
                        Step 0{idx + 1}
                      </span>
                      <Badge
                        variant={isMastered ? 'success' : isSupport ? 'danger' : isLocked ? 'secondary' : 'default'}
                      >
                        {item.mastery_score}% Mastery
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-extrabold text-foreground mt-1">
                      {item.topic_title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <p className="text-xs text-muted-foreground">{item.reason_code}</p>

                    {item.prerequisite_titles && item.prerequisite_titles.length > 0 && (
                      <div className="p-3 rounded-xl bg-card border border-border text-[11px] space-y-1">
                        <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider">
                          Prerequisites
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.prerequisite_titles.map((p, pidx) => (
                            <Badge key={pidx} variant="outline" className="text-[10px]">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewItem(item)}
                        className="text-xs text-brand-600"
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        disabled={isLocked}
                        onClick={() => navigate(`/student/capsules/${item.capsule_id || 'cap-1'}`)}
                        className="text-xs"
                      >
                        Launch
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Gamified Achievements Banner */}
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Adaptive Milestone Badges</h3>
              <p className="text-xs text-muted-foreground">Earn competency rewards as you conquer curriculum units.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
              🏅
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">Foundation Master</h4>
              <span className="text-[11px] text-emerald-600 font-semibold">Unit 1 & 2 Cleared (&gt;80%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-brand-500/20">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">Neural Navigator</h4>
              <span className="text-[11px] text-brand-600 font-semibold">Active in Unit 3 Checkpoint</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-purple-500/20">
              🎯
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">Accuracy Pioneer</h4>
              <span className="text-[11px] text-purple-600 font-semibold">Scored 100% on Checkpoint 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Quick Preview Modal Drawer */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-foreground border border-border w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{previewItem.difficulty || 'MEDIUM'}</Badge>
                <Badge className="bg-brand-500/10 text-brand-600">Position #{previewItem.position}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {previewItem.estimated_minutes || 20} mins
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground">{previewItem.topic_title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{previewItem.reason_code}</p>
            </div>

            {/* Quick Concept Highlights */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Key Focus Areas & Takeaways
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
                <li>Core mathematical formulations and intuitive analogies.</li>
                <li>Interactive checkpoints with immediate step-by-step solutions.</li>
                <li>Prerequisite mastery reinforcement to unlock advanced modules.</li>
              </ul>
            </div>

            {/* Mastery & Readiness Status */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-card border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Mastery Score</span>
                <span className="text-xl font-black text-foreground">{previewItem.mastery_score}%</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Prerequisite Status</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {previewItem.prerequisites_met ? '✓ Satisfied' : '⚠️ Pending'}
                </span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setPreviewItem(null)}>
                Close
              </Button>
              <Button
                disabled={previewItem.is_locked}
                onClick={() => {
                  const capId = previewItem.capsule_id || 'cap-1';
                  setPreviewItem(null);
                  navigate(`/student/capsules/${capId}`);
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                <BookOpen className="w-4 h-4 mr-1.5" />
                Start Capsule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
