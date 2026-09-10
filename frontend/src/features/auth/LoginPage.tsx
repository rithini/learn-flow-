import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { authApi } from '../../api/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sparkles, ShieldCheck, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('student1@learnflow.edu');
  const [password, setPassword] = useState('StudentPass123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.access_token, data.refresh_token);

      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'TRAINER') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your email & password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome to LearnFlow</h1>
          <p className="text-xs text-muted-foreground">Sign in to access your role-based learning portal.</p>
        </div>

        <Card className="border-border shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="name@learnflow.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                <span>Sign In to LearnFlow</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            {/* 1-Click Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block text-center">
                Instant 1-Click Demo Fill:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 flex flex-col items-start text-left"
                  onClick={() => fillDemo('admin@learnflow.edu', 'AdminPass123!')}
                >
                  <span className="font-bold flex items-center gap-1 text-rose-500">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">admin@learnflow.edu</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 flex flex-col items-start text-left"
                  onClick={() => fillDemo('trainer@learnflow.edu', 'TrainerPass123!')}
                >
                  <span className="font-bold flex items-center gap-1 text-purple-500">
                    <BookOpen className="w-3.5 h-3.5" /> Trainer
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">trainer@learnflow.edu</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 flex flex-col items-start text-left"
                  onClick={() => fillDemo('student1@learnflow.edu', 'StudentPass123!')}
                >
                  <span className="font-bold flex items-center gap-1 text-emerald-500">
                    <GraduationCap className="w-3.5 h-3.5" /> Student 1 (Strong)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">student1@learnflow.edu</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 flex flex-col items-start text-left"
                  onClick={() => fillDemo('student2@learnflow.edu', 'StudentPass123!')}
                >
                  <span className="font-bold flex items-center gap-1 text-amber-500">
                    <GraduationCap className="w-3.5 h-3.5" /> Student 2 (Support)
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">student2@learnflow.edu</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 dark:text-brand-400 hover:underline">
            Register for LearnFlow
          </Link>
        </div>
      </div>
    </div>
  );
};
