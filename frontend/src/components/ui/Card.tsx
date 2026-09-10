import React from 'react';
import { cn } from '../../utils/cn';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-2xl border border-border shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={cn('p-6 pb-3 flex flex-col space-y-1.5', className)} {...props}>{children}</div>;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return <h3 className={cn('text-lg font-bold tracking-tight text-foreground', className)} {...props}>{children}</h3>;
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props}>{children}</p>;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={cn('p-6 pt-3', className)} {...props}>{children}</div>;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return <div className={cn('p-6 pt-0 flex items-center justify-between', className)} {...props}>{children}</div>;
};
