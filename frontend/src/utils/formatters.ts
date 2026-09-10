import { StrengthStatus, RecommendationType } from '../types';

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getStrengthBadgeColor(status: StrengthStatus): { bg: string; text: string; label: string } {
  switch (status) {
    case 'STRONG':
      return { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', text: 'text-emerald-500', label: 'Strong (>= 80%)' };
    case 'DEVELOPING':
      return { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', text: 'text-amber-500', label: 'Developing (50-79%)' };
    case 'NEEDS_SUPPORT':
      return { bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', text: 'text-rose-500', label: 'Needs Support (< 50%)' };
    default:
      return { bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30', text: 'text-slate-500', label: 'Uncertain Baseline' };
  }
}

export function getRecommendationBadge(type: RecommendationType): { label: string; color: string } {
  switch (type) {
    case 'NEXT_TOPIC':
      return { label: 'Unlock Next Module', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    case 'SIMPLIFIED_CAPSULE':
      return { label: 'Simplified Concept Review', color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    case 'TARGETED_PRACTICE':
      return { label: 'Targeted Practice Quiz', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    case 'ADVANCED_PRACTICE':
      return { label: 'Advanced Challenge', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    case 'PREREQUISITE_REVIEW':
      return { label: 'Prerequisite Gap Review', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' };
    case 'CHECKPOINT':
      return { label: 'Knowledge Checkpoint', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
  }
}
