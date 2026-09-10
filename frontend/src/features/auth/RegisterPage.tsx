import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../api/auth';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sparkles, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<'STUDENT' | 'TRAINER'>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('National Institute of Technology');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({
        email,
        password,
        full_name: fullName,
        role,
        student_code: role === 'STUDENT' ? code : undefined,
        institution_name: institution,
      });

      // Auto login after registration
      const loginData = await authApi.login(email, password);
      setAuth(loginData.user, loginData.access_token, loginData.refresh_token);

      if (role === 'TRAINER') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Create your Account</h1>
          <p className="text-xs text-muted-foreground">Join the adaptive micro-learning portal.</p>
        </div>

        <Card className="border-border shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Select Your Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={cn(
                      'p-3 rounded-xl border text-left flex items-center gap-3 transition-all',
                      role === 'STUDENT'
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <div>
                      <span className="block text-xs font-bold text-foreground">Student</span>
                      <span className="text-[10px] text-muted-foreground">Personalized Path</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('TRAINER')}
                    className={cn(
                      'p-3 rounded-xl border text-left flex items-center gap-3 transition-all',
                      role === 'TRAINER'
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    <BookOpen className="w-5 h-5" />
                    <div>
                      <span className="block text-xs font-bold text-foreground">Trainer</span>
                      <span className="text-[10px] text-muted-foreground">Curriculum & AI</span>
                    </div>
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                placeholder="e.g. Maya Patel"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="maya@learnflow.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Institution Name"
                placeholder="Institute / University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />

              {role === 'STUDENT' ? (
                <Input
                  label="Student ID / Roll Code"
                  placeholder="e.g. STU-2026-088"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              ) : (
                <Input
                  label="Faculty / Employee Code"
                  placeholder="e.g. TRN-FAC-014"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <span>Create LearnFlow Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In instead
          </Link>
        </div>
      </div>
    </div>
  );
};
