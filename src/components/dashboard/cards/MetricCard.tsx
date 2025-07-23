import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    type: 'up' | 'down' | 'neutral';
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const colorClasses = {
  default: {
    bg: 'bg-gray-100',
    icon: 'bg-gray-500',
    trend: 'text-gray-600'
  },
  success: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    trend: 'text-green-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-500',
    trend: 'text-yellow-600'
  },
  danger: {
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    trend: 'text-red-600'
  },
  info: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    trend: 'text-blue-600'
  }
};

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'default',
  className
}: MetricCardProps) {
  const colors = colorClasses[color];
  
  const TrendIcon = trend?.type === 'up' ? TrendingUp : 
                   trend?.type === 'down' ? TrendingDown : 
                   Minus;

  return (
    <div className={cn(
      "relative bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-gradient-to-br from-accent/10 to-accent/5 blur-2xl" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2", colors.trend)}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trend.type === 'up' ? '+' : trend.type === 'down' ? '-' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg transition-transform group-hover:scale-110",
          colors.bg
        )}>
          <div className={cn(
            "w-full h-full flex items-center justify-center rounded-lg text-white",
            colors.icon
          )}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
          </div>
        </div>
      </div>
    </div>
  );
}