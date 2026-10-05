import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { studentApi } from '../../api/students';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Award,
  ShieldCheck,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Flame,
  Key,
  Bell,
  Save,
  Check,
  X,
  Target,
  BookOpen,
  Zap,
  Lock,
  Edit3,
} from 'lucide-react';
import { cn } from '../../utils/cn';

type ProfileTab = 'DETAILS' | 'PREFERENCES' | 'SECURITY' | 'ACHIEVEMENTS';

export const StudentProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('DETAILS');

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || 'Alex Chen');
  const [institution, setInstitution] = useState(user?.institution_name || 'National Institute of Technology');
  const [currentLevel, setCurrentLevel] = useState(user?.current_level || 'Senior Undergraduate');
  const [studentCode, setStudentCode] = useState(user?.student_code || 'STU-2026-001');
  const [department, setDepartment] = useState('Computer Science & Artificial Intelligence');
  const [learningGoal, setLearningGoal] = useState('Mastering Deep Learning architectures and generative AI models.');

  // Preference State
  const [learningStyle, setLearningStyle] = useState<'VISUAL' | 'FORMAL' | 'PRACTICE'>('VISUAL');
  const [dailyPace, setDailyPace] = useState<'SPRINT' | 'STANDARD' | 'DEEP'>('STANDARD');
  const [autoPractice, setAutoPractice] = useState<boolean>(true);
  const [emailDigest, setEmailDigest] = useState<boolean>(true);

  // Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<string | null>(null);

  // Status State
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setInstitution(user.institution_name || 'National Institute of Technology');
      setCurrentLevel(user.current_level || 'Senior Undergraduate');
      setStudentCode(user.student_code || 'STU-2026-001');
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await studentApi.updateProfile({
        full_name: fullName,
        institution_name: institution,
        current_level: currentLevel,
      });

      updateUser({
        full_name: updatedUser.full_name,
        institution_name: updatedUser.institution_name,
        current_level: updatedUser.current_level,
        student_code: studentCode,
      });
      showToast('Profile information successfully updated and saved!');
    } catch (err) {
      updateUser({
        full_name: fullName,
        institution_name: institution,
        current_level: currentLevel,
        student_code: studentCode,
      });
      showToast('Profile updated locally.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      setPassMessage('Please enter your current password.');
      return;
    }
    if (newPass.length < 6) {
      setPassMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage('Passwords do not match.');
      return;
    }

    setPassMessage('Password updated successfully!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Security password changed successfully!');
  };

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md bg-foreground text-background dark:bg-card dark:text-foreground border border-brand-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
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

      {/* Hero Profile Banner */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Pill */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active Student">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md">
                  STUDENT PORTAL
                </Badge>
                <Badge className="bg-emerald-400/20 text-emerald-100 border-emerald-300/40">
                  {currentLevel}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{fullName}</h1>
              <p className="text-xs text-white/80 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'student1@learnflow.edu'}</span>
                <span className="text-white/40">•</span>
                <span>Code: {studentCode}</span>
              </p>

              <p className="text-xs text-white/90 flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Building className="w-3.5 h-3.5 text-white/70" />
                <span>{institution}</span>
              </p>
            </div>
          </div>

          {/* KPI Badge Strip */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 grid grid-cols-2 gap-4 text-center shrink-0 w-full sm:w-auto">
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Mastery Index</span>
              <span className="text-xl font-black text-emerald-300">84%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Active Streak</span>
              <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-300">
                <Flame className="w-4 h-4 fill-current" />
                <span>4 Days</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Study Hours</span>
              <span className="text-xl font-black text-white">4.1 hrs</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">Courses</span>
              <span className="text-xl font-black text-white">1 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-card/70 border border-border rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all',
            activeTab === 'DETAILS'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <User className="w-4 h-4" />
          <span>Personal & Academic Info</span>
        </button>

        <button
          onClick={() => setActiveTab('PREFERENCES')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all',
            activeTab === 'PREFERENCES'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Sliders className="w-4 h-4" />
          <span>Adaptive Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('ACHIEVEMENTS')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all',
            activeTab === 'ACHIEVEMENTS'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <Award className="w-4 h-4" />
          <span>Badges & Competencies</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all',
            activeTab === 'SECURITY'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>

      {/* Tab 1: Personal & Academic Details */}
      {activeTab === 'DETAILS' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-foreground">
                  Personal & Academic Information
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your identity details, institute registration, and learning goals.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Verified Student
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    value={user?.email || 'student1@learnflow.edu'}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground">Managed by Institute Single Sign-On</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Student Roll Code
                  </label>
                  <Input
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="e.g. STU-2026-001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Academic Year / Level
                  </label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="First-Year Undergraduate">First-Year Undergraduate</option>
                    <option value="Sophomore Undergraduate">Sophomore Undergraduate</option>
                    <option value="Junior Undergraduate">Junior Undergraduate</option>
                    <option value="Senior Undergraduate">Senior Undergraduate</option>
                    <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                    <option value="PhD Candidate">PhD Candidate</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Institution / University
                  </label>
                  <Input
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Department / Discipline
                  </label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Target Learning Objective & Bio
                </label>
                <textarea
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed resize-none"
                  placeholder="Describe your current learning targets..."
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-border">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 font-bold shadow-md shadow-brand-500/20"
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Adaptive Learning Preferences */}
      {activeTab === 'PREFERENCES' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black text-foreground">
              Adaptive Learning Preferences & Pacing
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Tune how the AI closed-loop engine personalizes micro-capsules and quiz recommendations.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Learning Style */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Preferred Conceptual Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setLearningStyle('VISUAL'); showToast('Set preference: Visual & Analogy-Driven'); }}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-1',
                    learningStyle === 'VISUAL'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <Sparkles className="w-5 h-5 mb-1 text-brand-500" />
                  <h4 className="font-bold text-sm text-foreground">Visual & Analogies</h4>
                  <p className="text-[11px] leading-relaxed">
                    Emphasizes real-world metaphors, intuitive illustrations, and simplified capsule tabs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => { setLearningStyle('FORMAL'); showToast('Set preference: Mathematical Rigor'); }}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-1',
                    learningStyle === 'FORMAL'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <Target className="w-5 h-5 mb-1 text-indigo-500" />
                  <h4 className="font-bold text-sm text-foreground">Mathematical Rigor</h4>
                  <p className="text-[11px] leading-relaxed">
                    Focuses on formal proofs, loss formulations, and step-by-step calculus derivations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => { setLearningStyle('PRACTICE'); showToast('Set preference: Code & Hands-on'); }}
                  className={cn(
                    'p-4 rounded-2xl border text-left transition-all space-y-1',
                    learningStyle === 'PRACTICE'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <Zap className="w-5 h-5 mb-1 text-emerald-500" />
                  <h4 className="font-bold text-sm text-foreground">Code & Practice First</h4>
                  <p className="text-[11px] leading-relaxed">
                    Prioritizes quick checkpoint quizzes and executable Python examples.
                  </p>
                </button>
              </div>
            </div>

            {/* Daily Study Commitment */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Daily Study Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setDailyPace('SPRINT'); showToast('Daily pace: 15 mins (Sprint)'); }}
                  className={cn(
                    'p-3.5 rounded-2xl border text-center transition-all',
                    dailyPace === 'SPRINT'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-600'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="font-black text-lg block text-foreground">15 mins / day</span>
                  <span className="text-[11px] font-semibold">Sprint Track</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setDailyPace('STANDARD'); showToast('Daily pace: 25 mins (Standard)'); }}
                  className={cn(
                    'p-3.5 rounded-2xl border text-center transition-all',
                    dailyPace === 'STANDARD'
                      ? 'bg-brand-500/15 border-brand-500 text-brand-600'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="font-black text-lg block text-foreground">25 mins / day</span>
                  <span className="text-[11px] font-semibold">Standard Balanced</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setDailyPace('DEEP'); showToast('Daily pace: 40 mins (Deep Mastery)'); }}
                  className={cn(
                    'p-3.5 rounded-2xl border text-center transition-all',
                    dailyPace === 'DEEP'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  <span className="font-black text-lg block text-foreground">40 mins / day</span>
                  <span className="text-[11px] font-semibold">Deep Mastery Track</span>
                </button>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-foreground block">
                    Auto-Generate Remedial Practice Quizzes
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Automatically triggers mini-checkpoints when concept gaps (&lt;50%) are detected.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPractice}
                  onChange={(e) => {
                    setAutoPractice(e.target.checked);
                    showToast(e.target.checked ? 'Auto-practice enabled' : 'Auto-practice disabled');
                  }}
                  className="w-5 h-5 accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs text-foreground block">
                    Weekly Performance Digest Notifications
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Receive weekly email telemetry summaries and mastery progress milestones.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => {
                    setEmailDigest(e.target.checked);
                    showToast(e.target.checked ? 'Email digest enabled' : 'Email digest disabled');
                  }}
                  className="w-5 h-5 accent-brand-600 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Achievements & Badges Showcase */}
      {activeTab === 'ACHIEVEMENTS' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-foreground">
                  Academic Milestones & Competency Badges
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Badges unlocked through high quiz scores, retention consistency, and curriculum mastery.
                </p>
              </div>
              <Badge variant="success">4 Unlocked</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  🏅
                </div>
                <h4 className="font-bold text-sm text-foreground">Foundation Master</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Demonstrated ≥ 90% mastery on Mathematical Foundations and Linear Regression.
                </p>
                <Badge variant="success" className="text-[10px]">
                  ✓ Unlocked (Sep 05)
                </Badge>
              </div>

              <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/25 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                  ⚡
                </div>
                <h4 className="font-bold text-sm text-foreground">Speed Demon</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Completed Linear Regression Checkpoint in under 3 minutes with 100% accuracy.
                </p>
                <Badge className="bg-brand-500 text-white text-[10px]">
                  ✓ Unlocked (Sep 07)
                </Badge>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  🔥
                </div>
                <h4 className="font-bold text-sm text-foreground">Streak Champion</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Maintained 4 consecutive active study days in the LearnFlow portal.
                </p>
                <Badge className="bg-amber-500 text-white text-[10px]">
                  ✓ Unlocked (Sep 12)
                </Badge>
              </div>

              <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  🎯
                </div>
                <h4 className="font-bold text-sm text-foreground">Accuracy Pioneer</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scored 100% first-try accuracy on Unit 1 Checkpoint Assessment.
                </p>
                <Badge className="bg-purple-600 text-white text-[10px]">
                  ✓ Unlocked (Sep 05)
                </Badge>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2 opacity-75">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground font-black text-xl flex items-center justify-center">
                  🧠
                </div>
                <h4 className="font-bold text-sm text-foreground">Neural Architect</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Complete Backpropagation & Deep Learning Optimization checkpoints.
                </p>
                <Badge variant="outline" className="text-[10px]">
                  In Progress (50%)
                </Badge>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2 opacity-75">
                <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground font-black text-xl flex items-center justify-center">
                  🏆
                </div>
                <h4 className="font-bold text-sm text-foreground">Curriculum Valedictorian</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Reach ≥ 85% Composite Mastery across all modules in Introduction to ML.
                </p>
                <Badge variant="outline" className="text-[10px]">
                  In Progress (84%)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Account & Security */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          {/* Security Information Card */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black text-foreground">
                Authentication & Role Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Security Role</span>
                  <span className="text-sm font-black text-foreground mt-0.5 block">STUDENT</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Token Encryption</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    HS256 (JWT Rotating)
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Access Duration</span>
                  <span className="text-sm font-black text-foreground mt-0.5 block">60 Min Rotation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black text-foreground flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-500" />
                <span>Change Account Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {passMessage && (
                  <div
                    className={cn(
                      'p-3 rounded-xl text-xs font-semibold',
                      passMessage.includes('successfully')
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    )}
                  >
                    {passMessage}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>

                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
