import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi } from '../../api/students';
import { ActivityTimelineData, ActivityTimelineEvent } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
} from 'recharts';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Zap,
  Flame,
  Award,
  Calendar,
  Filter,
  Search,
  Hourglass,
  Sparkles,
  Activity,
  History,
  Timer,
  ChevronRight,
  X,
  Target,
  BarChart2,
  Check,
} from 'lucide-react';
import { cn } from '../../utils/cn';

type TimeFilter = 'ALL' | 'WEEK' | 'MONTH';
type TypeFilter = 'ALL' | 'QUIZ' | 'CAPSULE';

export const ActivityProgressTimelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ActivityTimelineData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<ActivityTimelineEvent | null>(null);

  useEffect(() => {
    setLoading(true);
    studentApi
      .getActivityTimeline()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // Filtered timeline events
  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];
    return data.events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.topic_title.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (typeFilter === 'QUIZ') return evt.event_type === 'QUIZ';
      if (typeFilter === 'CAPSULE') return evt.event_type === 'CAPSULE';

      return true;
    });
  }, [data, searchQuery, typeFilter]);

  const totalMinutes = data?.total_study_minutes || 245;
  const totalHours = data?.total_study_hours || (totalMinutes / 60).toFixed(1);
  const quizCount = data?.events.filter((e) => e.event_type === 'QUIZ').length || 2;
  const capsuleCount = data?.events.filter((e) => e.event_type === 'CAPSULE').length || 2;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Visual Timeline & Time Metrics Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                Time-Stamped Activity Tracker
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-300/40">
                {data?.efficiency_rating || 'Top 10% Velocity (94% Efficiency)'}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Activity Progress Timeline & Time Velocity
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Chronological ledger comparing time spent per module, quiz completion pace, and daily learning velocity against target benchmarks.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-white/90">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-white/70" />
                <span>{totalHours} Total Hours Logged</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Flame className="w-4 h-4 fill-current" />
                <span>{data?.streak_days || 4} Day Activity Streak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-emerald-300" />
                <span>Avg. {data?.average_session_minutes || 16.5}m / Study Session</span>
              </div>
            </div>
          </div>

          {/* Time Efficiency Metric Card */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col items-center justify-center text-center shrink-0 min-w-[210px]">
            <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider block">
              Weekly Learning Velocity
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-1">
              {totalMinutes}
              <span className="text-sm font-bold text-white/70 ml-1">mins</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-300 font-bold mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+35 mins vs Last Week</span>
            </div>
            <span className="text-[10px] text-white/70 mt-1">Exceeding 20 min/day target</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Row: Time Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Total Study Time</p>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
                {totalHours} hrs
              </p>
              <span className="text-[11px] text-muted-foreground">{totalMinutes} active minutes</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Quiz Sessions</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {quizCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Avg 2m 45s per quiz</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Capsule Reads</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {capsuleCount}
              </p>
              <span className="text-[11px] text-muted-foreground">Avg 14m deep focus</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Time Efficiency</p>
              <p className="text-2xl font-black text-amber-500 mt-1">94%</p>
              <span className="text-[11px] text-muted-foreground">High retention pace</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics: Daily Study Time vs Target & Quiz Accuracy */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-black text-foreground">
                Daily Study Time & Velocity vs 20m Target
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Track your active study minutes alongside daily assessment accuracy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px]">
                Past 7 Days
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.daily_velocity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.15)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 60]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'minutes' ? `${val} minutes` : `${val}%`,
                    name === 'minutes' ? 'Active Study Time' : 'Quiz Accuracy',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#timeGradient)"
                  name="Study Minutes"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                  name="Target (20m)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              typeFilter === 'ALL'
                ? 'bg-brand-500/15 text-brand-600 border-brand-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            All Activities ({data?.events.length || 0})
          </button>
          <button
            onClick={() => setTypeFilter('QUIZ')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              typeFilter === 'QUIZ'
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Quizzes & Checkpoints ({quizCount})
          </button>
          <button
            onClick={() => setTypeFilter('CAPSULE')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              typeFilter === 'CAPSULE'
                ? 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30'
                : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            )}
          >
            Micro-Capsule Reads ({capsuleCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activity timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Main Vertical Activity Timeline */}
      <div className="relative space-y-6">
        {/* Vertical Connecting Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-500 via-indigo-500 to-border hidden sm:block pointer-events-none" />

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
            <History className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <h3 className="font-bold text-base text-foreground">No activities found</h3>
            <p className="text-xs text-muted-foreground">Try clearing your filters or search query.</p>
          </div>
        ) : (
          filteredEvents.map((event, idx) => {
            const isQuiz = event.event_type === 'QUIZ';

            return (
              <div key={event.id} className="relative sm:pl-16 transition-all group">
                {/* Step Pin Icon */}
                <div
                  className={cn(
                    'absolute left-2.5 top-6 -translate-x-1/2 w-8 h-8 rounded-full font-black text-xs hidden sm:flex items-center justify-center border-2 transition-all shadow-md z-10',
                    isQuiz
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/25'
                      : 'bg-brand-600 border-brand-400 text-white shadow-brand-500/25'
                  )}
                >
                  {isQuiz ? <Zap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                </div>

                {/* Event Card */}
                <div
                  className={cn(
                    'p-6 rounded-3xl bg-card border transition-all duration-300 shadow-sm hover:shadow-md space-y-3',
                    isQuiz
                      ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-r from-card to-emerald-500/5'
                      : 'border-brand-500/30 hover:border-brand-500/50 bg-gradient-to-r from-card to-brand-500/5'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={isQuiz ? 'success' : 'default'}
                          className="text-[10px] py-0.5"
                        >
                          {event.badge_label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Duration: {event.time_spent_formatted}</span>
                        </Badge>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base sm:text-lg text-foreground group-hover:text-brand-600 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{event.topic_title}</p>
                    </div>

                    {/* Time Speed Pace Pill */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge className="bg-muted text-muted-foreground border-border text-[11px]">
                        {event.speed_pace}
                      </Badge>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs text-brand-600 hover:bg-brand-500/10"
                      >
                        Details
                      </Button>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {isQuiz
                        ? `Scored ${event.percentage}% • Completed in ${event.time_spent_formatted}`
                        : `Read progress ${event.percentage}% • Time logged ${event.time_spent_formatted}`}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => navigate(isQuiz ? '/student/quizzes/quiz-1' : '/student/capsules/cap-1')}
                      className="text-xs"
                      variant="outline"
                    >
                      <span>{isQuiz ? 'Retake Checkpoint' : 'Review Capsule'}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card text-foreground border border-border w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={selectedEvent.event_type === 'QUIZ' ? 'success' : 'default'}>
                  {selectedEvent.event_type}
                </Badge>
                <span className="text-xs text-muted-foreground font-semibold">
                  {formatDate(selectedEvent.timestamp)}
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground">{selectedEvent.title}</h2>
              <p className="text-xs text-muted-foreground">{selectedEvent.topic_title}</p>
            </div>

            {/* Time Metrics Deep-Dive */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Time Spent</span>
                <span className="text-base font-black text-foreground mt-0.5 block">
                  {selectedEvent.time_spent_formatted}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Performance</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {selectedEvent.percentage}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Velocity Class</span>
                <span className="text-xs font-black text-foreground mt-1 block">
                  {selectedEvent.speed_pace}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  navigate(selectedEvent.event_type === 'QUIZ' ? '/student/quizzes/quiz-1' : '/student/capsules/cap-1');
                }}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                Launch Activity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
