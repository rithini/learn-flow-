import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { StudentPerformance, Course } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Target,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table,
  Eye,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  Flame,
  Check,
  X,
  Layers,
  Brain,
  Sliders,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getStrengthBadgeColor } from '../../utils/formatters';

type ViewMode = 'CARDS' | 'TABLE' | 'QUADRANTS';
type StatusFilter = 'ALL' | 'STRONG' | 'DEVELOPING' | 'NEEDS_SUPPORT';
type SortField = 'mastery' | 'accuracy' | 'confidence' | 'attempts' | 'title';

export const PerformanceMatrixPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [perfs, setPerfs] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('mastery');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<StudentPerformance | null>(null);

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
  const strongTopics = perfs.filter((p) => p.strength_status === 'STRONG' || p.mastery_score >= 80);
  const devTopics = perfs.filter(
    (p) => (p.strength_status === 'DEVELOPING' || (p.mastery_score >= 50 && p.mastery_score < 80))
  );
  const supportTopics = perfs.filter(
    (p) => p.strength_status === 'NEEDS_SUPPORT' || (p.mastery_score < 50 && p.attempt_count > 0)
  );

  const avgMastery =
    totalTopics > 0
      ? Math.round(perfs.reduce((acc, p) => acc + p.mastery_score, 0) / totalTopics)
      : 0;

  const avgAccuracy =
    totalTopics > 0
      ? Math.round(perfs.reduce((acc, p) => acc + p.recent_accuracy, 0) / totalTopics)
      : 0;

  const avgConfidence =
    totalTopics > 0
      ? Math.round(perfs.reduce((acc, p) => acc + p.confidence_score, 0) / totalTopics)
      : 0;

  // Filtered and Sorted Topics
  const filteredTopics = useMemo(() => {
    let result = perfs.filter((p) => {
      const matchesSearch =
        p.topic_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.course_title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'STRONG') return p.mastery_score >= 80;
      if (statusFilter === 'DEVELOPING') return p.mastery_score >= 50 && p.mastery_score < 80;
      if (statusFilter === 'NEEDS_SUPPORT') return p.mastery_score < 50;

      return true;
    });

    result.sort((a, b) => {
      let valA: any = a.mastery_score;
      let valB: any = b.mastery_score;

      if (sortField === 'accuracy') {
        valA = a.recent_accuracy;
        valB = b.recent_accuracy;
      } else if (sortField === 'confidence') {
        valA = a.confidence_score;
        valB = b.confidence_score;
      } else if (sortField === 'attempts') {
        valA = a.attempt_count;
        valB = b.attempt_count;
      } else if (sortField === 'title') {
        valA = a.topic_title;
        valB = b.topic_title;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [perfs, searchQuery, statusFilter, sortField, sortAsc]);

  // Chart Data: Bar Chart Comparison
  const barChartData = perfs.map((p) => ({
    name: p.topic_title.length > 15 ? p.topic_title.slice(0, 13) + '..' : p.topic_title,
    fullTitle: p.topic_title,
    Mastery: p.mastery_score,
    Accuracy: p.recent_accuracy,
    Confidence: p.confidence_score,
  }));

  // Chart Data: Radar Chart Dimensions
  const radarChartData = [
    { subject: 'Topic Mastery', A: avgMastery, fullMark: 100 },
    { subject: 'Quiz Accuracy', A: avgAccuracy, fullMark: 100 },
    { subject: 'Confidence', A: avgConfidence, fullMark: 100 },
    {
      subject: 'Completion Quality',
      A: totalTopics > 0 ? Math.round(perfs.reduce((acc, p) => acc + p.completion_quality, 0) / totalTopics) : 0,
      fullMark: 100,
    },
    {
      subject: 'Prerequisite Health',
      A: strongTopics.length > 0 ? Math.round((strongTopics.length / (totalTopics || 1)) * 100) : 50,
      fullMark: 100,
    },
  ];

  // Chart Data: Donut Distribution
  const pieData = [
    { name: 'Strong (≥80%)', value: strongTopics.length || (totalTopics === 0 ? 1 : 0), color: '#10b981' },
    { name: 'Developing (50-79%)', value: devTopics.length, color: '#f59e0b' },
    { name: 'Needs Support (<50%)', value: supportTopics.length, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Course Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/70 border border-border backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block">
              Curriculum Filter
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
          <Badge className="bg-brand-500/15 text-brand-600 border-brand-500/30 px-3 py-1 font-bold text-xs">
            Closed-Loop Evaluator Active
          </Badge>
        </div>
      </div>

      {/* Hero Visual Matrix Banner with Adaptive Formula Breakdown */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                Mastery Profile Matrix
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-300/40">
                Multi-Factor Formula v2.0
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Topic Mastery & Competency Matrix
            </h1>

            {/* Formula Explainer Pill */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-xs space-y-1.5">
              <div className="font-extrabold uppercase tracking-wider text-white/90 text-[10px] flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-amber-300" />
                <span>Multi-Factor Mastery Evaluation Formula</span>
              </div>
              <p className="font-mono text-xs text-amber-200 font-bold">
                Mastery = 0.55(Quiz) + 0.20(Completion) + 0.15(Trend) + 0.10(Prerequisite)
              </p>
              <p className="text-[11px] text-white/80 leading-relaxed">
                Continually computes topic strength to dynamically trigger simplified capsules or advanced challenge tracks.
              </p>
            </div>
          </div>

          {/* Overall Composite Metric Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
              Composite Mastery GPA
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">{avgMastery}%</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>{avgAccuracy}% Quiz Accuracy</span>
            </div>
            <span className="text-[10px] text-white/70 mt-1">Across {totalTopics} Curriculum Units</span>
          </div>
        </div>
      </div>

      {/* KPI Diagnostic Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Strong Topics (≥80%)</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {strongTopics.length}
              </p>
              <span className="text-[11px] text-muted-foreground">High proficiency</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Developing (50-79%)</p>
              <p className="text-2xl font-black text-amber-500 mt-1">{devTopics.length}</p>
              <span className="text-[11px] text-muted-foreground">Targeted practice</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Needs Support (&lt;50%)</p>
              <p className="text-2xl font-black text-rose-500 mt-1">{supportTopics.length}</p>
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
              <p className="text-xs font-bold text-muted-foreground uppercase">Avg Confidence</p>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
                {avgConfidence}%
              </p>
              <span className="text-[11px] text-muted-foreground">Self-efficacy index</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Row: Radar & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Competency Chart */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Competency Radar</span>
              <Badge variant="outline" className="text-[10px]">
                5 Dimensions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData}>
                  <PolarGrid stroke="rgba(156, 163, 175, 0.2)" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                  <Radar
                    name="Student Profile"
                    dataKey="A"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Factor Comparison Bar Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Topic-by-Topic Factor Breakdown</span>
              <span className="text-xs font-normal text-muted-foreground">
                Mastery vs Quiz Accuracy vs Confidence
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Mastery" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Confidence" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter, Search & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              statusFilter === 'ALL'
                ? 'bg-brand-500/15 text-brand-600 border-brand-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            All Matrix Units ({totalTopics})
          </button>
          <button
            onClick={() => setStatusFilter('STRONG')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              statusFilter === 'STRONG'
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Strong ({strongTopics.length})
          </button>
          <button
            onClick={() => setStatusFilter('DEVELOPING')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              statusFilter === 'DEVELOPING'
                ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Developing ({devTopics.length})
          </button>
          <button
            onClick={() => setStatusFilter('NEEDS_SUPPORT')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              statusFilter === 'NEEDS_SUPPORT'
                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Needs Support ({supportTopics.length})
          </button>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topic in matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('CARDS')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                viewMode === 'CARDS' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
              title="Rich Matrix Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                viewMode === 'TABLE' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
              title="Matrix Data Table"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('QUADRANTS')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1',
                viewMode === 'QUADRANTS' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              )}
              title="4-Quadrant Mastery vs Confidence Grid"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quadrants</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {viewMode === 'CARDS' && (
        /* Rich Multi-Factor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((p) => {
            const isStrong = p.mastery_score >= 80;
            const isSupport = p.mastery_score < 50;
            const b = getStrengthBadgeColor(p.strength_status);

            return (
              <Card
                key={p.topic_id}
                className={cn(
                  'border transition-all duration-300 hover:shadow-xl group relative overflow-hidden',
                  isStrong
                    ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-br from-card via-card to-emerald-500/5'
                    : isSupport
                    ? 'border-rose-500/30 hover:border-rose-500/50 bg-gradient-to-br from-card via-card to-rose-500/5'
                    : 'border-amber-500/30 hover:border-amber-500/50 bg-gradient-to-br from-card via-card to-amber-500/5'
                )}
              >
                <CardContent className="p-6 space-y-5">
                  {/* Topic Title & Status Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {p.course_title || 'Core Curriculum Module'}
                      </span>
                      <h3 className="font-black text-lg text-foreground group-hover:text-brand-600 transition-colors">
                        {p.topic_title}
                      </h3>
                    </div>
                    <Badge className={b.bg}>{b.label}</Badge>
                  </div>

                  {/* 3 Main Numbers Strip */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-muted/50 border border-border text-center">
                    <div>
                      <span className="block font-black text-xl text-foreground">{p.mastery_score}%</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        Weighted Mastery
                      </span>
                    </div>
                    <div>
                      <span className="block font-black text-xl text-foreground">{p.recent_accuracy}%</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">
                        Quiz Accuracy
                      </span>
                    </div>
                    <div>
                      <span className="block font-black text-xl text-foreground">{p.confidence_score}%</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Confidence</span>
                    </div>
                  </div>

                  {/* Multi-Factor Weight Progress Sliders */}
                  <div className="space-y-3 pt-1">
                    <span className="text-[11px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Evaluation Component Weighting
                    </span>

                    {/* Quiz Accuracy Bar (55% Weight) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-brand-500" />
                          <span>Recent Quiz Score (55% weight)</span>
                        </span>
                        <span className="font-bold text-foreground">{p.recent_accuracy}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, p.recent_accuracy))}%` }}
                        />
                      </div>
                    </div>

                    {/* Completion Quality (20% Weight) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Capsule Quality (20% weight)</span>
                        </span>
                        <span className="font-bold text-foreground">{p.completion_quality}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, p.completion_quality))}%` }}
                        />
                      </div>
                    </div>

                    {/* Confidence / Self-Efficacy (15% Weight) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Confidence Metric (15% weight)</span>
                        </span>
                        <span className="font-bold text-foreground">{p.confidence_score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, p.confidence_score))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Action Triggers */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/70">
                    <span className="text-[11px] text-muted-foreground">
                      {p.attempt_count} assessment attempt{p.attempt_count === 1 ? '' : 's'}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTopic(p)}
                        className="text-xs text-brand-600 hover:bg-brand-500/10"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Diagnostics</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate('/student/capsules/cap-1')}
                        className={cn(
                          'text-xs text-white',
                          isStrong ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-brand-600 hover:bg-brand-700'
                        )}
                      >
                        <span>{isStrong ? 'Review' : 'Reinforce'}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'TABLE' && (
        /* Detailed Matrix Table View */
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-extrabold uppercase tracking-wider">
                  <th
                    className="p-4 cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Topic & Curriculum Unit</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort('mastery')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Mastery Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort('accuracy')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Quiz Accuracy</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort('confidence')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Confidence</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="p-4 text-center cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => toggleSort('attempts')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Attempts</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-4 text-center">Strength Tier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTopics.map((p) => {
                  const b = getStrengthBadgeColor(p.strength_status);
                  return (
                    <tr key={p.topic_id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-4">
                        <span className="font-extrabold text-sm text-foreground block">{p.topic_title}</span>
                        <span className="text-[11px] text-muted-foreground">{p.course_title}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-black text-sm text-foreground">{p.mastery_score}%</span>
                      </td>
                      <td className="p-4 text-center font-bold text-foreground">{p.recent_accuracy}%</td>
                      <td className="p-4 text-center font-bold text-foreground">{p.confidence_score}%</td>
                      <td className="p-4 text-center text-muted-foreground font-semibold">
                        {p.attempt_count}
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={b.bg}>{b.label}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTopic(p)} className="text-xs">
                            Diagnostics
                          </Button>
                          <Button size="sm" onClick={() => navigate('/student/capsules/cap-1')} className="text-xs">
                            Study
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewMode === 'QUADRANTS' && (
        /* 4-Quadrant Matrix Layout */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-card border border-border text-xs text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500 shrink-0" />
            <span>
              <strong>4-Quadrant Competency Mapping</strong>: Topics are categorized by dual-axes (Mastery ≥ 80% vs Confidence ≥ 75%) to guide adaptive calibration.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quadrant 1: High Mastery, High Confidence */}
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Q1: Proficient Champions (Mastery ≥80%, Conf ≥75%)</span>
                  </span>
                  <Badge variant="success">Mastered</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perfs
                  .filter((p) => p.mastery_score >= 80 && p.confidence_score >= 75)
                  .map((p) => (
                    <div
                      key={p.topic_id}
                      className="p-3.5 rounded-xl bg-card border border-emerald-500/20 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{p.topic_title}</h4>
                        <span className="text-[11px] text-muted-foreground">
                          {p.mastery_score}% Mastery • {p.confidence_score}% Confidence
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTopic(p)}>
                        Inspect
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Quadrant 2: High Mastery, Developing Confidence */}
            <Card className="border-brand-500/30 bg-brand-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-brand-600 dark:text-brand-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Q2: High Potential (Mastery ≥80%, Conf &lt;75%)</span>
                  </span>
                  <Badge className="bg-brand-500/10 text-brand-600">Hidden Mastery</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perfs
                  .filter((p) => p.mastery_score >= 80 && p.confidence_score < 75)
                  .map((p) => (
                    <div
                      key={p.topic_id}
                      className="p-3.5 rounded-xl bg-card border border-brand-500/20 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{p.topic_title}</h4>
                        <span className="text-[11px] text-muted-foreground">
                          {p.mastery_score}% Mastery • {p.confidence_score}% Confidence
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTopic(p)}>
                        Inspect
                      </Button>
                    </div>
                  ))}
                {perfs.filter((p) => p.mastery_score >= 80 && p.confidence_score < 75).length === 0 && (
                  <p className="text-xs text-muted-foreground p-3">No topics currently in this quadrant.</p>
                )}
              </CardContent>
            </Card>

            {/* Quadrant 3: Developing Mastery */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-600 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Q3: Developing Focus (Mastery 50-79%)</span>
                  </span>
                  <Badge className="bg-amber-500/10 text-amber-600">Target Practice</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perfs
                  .filter((p) => p.mastery_score >= 50 && p.mastery_score < 80)
                  .map((p) => (
                    <div
                      key={p.topic_id}
                      className="p-3.5 rounded-xl bg-card border border-amber-500/20 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{p.topic_title}</h4>
                        <span className="text-[11px] text-muted-foreground">
                          {p.mastery_score}% Mastery • {p.recent_accuracy}% Quiz Acc
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTopic(p)}>
                        Inspect
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Quadrant 4: Needs Support */}
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-rose-500 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Q4: Foundational Remediation (Mastery &lt;50%)</span>
                  </span>
                  <Badge variant="danger">Support Needed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {perfs
                  .filter((p) => p.mastery_score < 50)
                  .map((p) => (
                    <div
                      key={p.topic_id}
                      className="p-3.5 rounded-xl bg-card border border-rose-500/20 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{p.topic_title}</h4>
                        <span className="text-[11px] text-rose-500 font-semibold">
                          Prerequisite gap & simplified review recommended
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedTopic(p)}>
                        Inspect
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Topic Diagnostics Drill-down Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-foreground border border-border w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTopic(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getStrengthBadgeColor(selectedTopic.strength_status).bg}>
                  {getStrengthBadgeColor(selectedTopic.strength_status).label}
                </Badge>
                <span className="text-xs text-muted-foreground font-semibold">
                  {selectedTopic.attempt_count} Quiz Attempts
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground">{selectedTopic.topic_title}</h2>
              <p className="text-xs text-muted-foreground">{selectedTopic.course_title}</p>
            </div>

            {/* Formula Contribution Breakdown */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-brand-500" />
                <span>Multi-Factor Contribution Calculations</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">0.55 × Quiz Accuracy ({selectedTopic.recent_accuracy}%)</span>
                  <span className="font-mono font-bold text-foreground">
                    +{(0.55 * selectedTopic.recent_accuracy).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">0.20 × Capsule Quality ({selectedTopic.completion_quality}%)</span>
                  <span className="font-mono font-bold text-foreground">
                    +{(0.20 * selectedTopic.completion_quality).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">0.15 × Confidence Metric ({selectedTopic.confidence_score}%)</span>
                  <span className="font-mono font-bold text-foreground">
                    +{(0.15 * selectedTopic.confidence_score).toFixed(1)} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">0.10 × Prerequisite Baseline (100.0%)</span>
                  <span className="font-mono font-bold text-foreground">+10.0 pts</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                  <span>Computed Final Mastery</span>
                  <span className="text-brand-600 font-black">{selectedTopic.mastery_score}%</span>
                </div>
              </div>
            </div>

            {/* Recommended Adaptive Strategy */}
            <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20 space-y-1.5 text-xs">
              <div className="font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Adaptive Recommendation Strategy</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {selectedTopic.mastery_score >= 80
                  ? 'Demonstrated strong mastery. Ready for advanced challenge checkpoints and peer-level application problems.'
                  : selectedTopic.mastery_score >= 50
                  ? 'Targeted practice active. Re-attempting the module checkpoint quiz with ≥ 75% accuracy will promote this unit to Proficient.'
                  : 'Prerequisite support recommended. Read the simplified concept capsule and complete foundational exercises before attempting assessment.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedTopic(null);
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
