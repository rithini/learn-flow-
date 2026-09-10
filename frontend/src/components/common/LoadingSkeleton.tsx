import React from 'react';
import { cn } from '../../utils/cn';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse rounded-xl bg-muted/60', className)} />;
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/50 border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-muted/50 border border-border" />
        <div className="h-72 rounded-2xl bg-muted/50 border border-border" />
      </div>
    </div>
  );
};
