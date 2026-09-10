import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../stores/useThemeStore';
import { Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-brand-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-background/80 backdrop-blur-lg px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight gradient-text">LearnFlow</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest -mt-1">
              Adaptive Portal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/about" className="hover:text-foreground transition-colors">About & Engine</Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate('/register')}>
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 LearnFlow Platform. Built for Institutes & Universities.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-foreground">Adaptive Architecture</Link>
            <Link to="/login" className="hover:text-foreground">Demo Accounts</Link>
            <Link to="/contact" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
