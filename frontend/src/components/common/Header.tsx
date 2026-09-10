import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Bell,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'ADMIN') return <ShieldCheck className="w-4 h-4 text-rose-500" />;
    if (user?.role === 'TRAINER') return <BookOpen className="w-4 h-4 text-purple-500" />;
    return <GraduationCap className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        </button>

        {/* User Profile Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-sm font-semibold text-foreground leading-none">{user.full_name}</span>
              <span className="text-xs text-muted-foreground capitalize flex items-center justify-end gap-1 mt-0.5">
                {getRoleIcon()}
                {user.role.toLowerCase()}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm shadow-sm">
              {user.full_name.charAt(0)}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 p-2 h-9 w-9 rounded-xl"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
