import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = 'from-blue-500 to-indigo-600',
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black tracking-tight text-foreground">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 text-xs font-semibold mt-1">
                <span className={trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}>
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              'w-12 h-12 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-white shadow-md',
              gradient
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
