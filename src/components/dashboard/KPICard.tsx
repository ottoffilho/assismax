import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

export function KPICard({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue, 
  icon, 
  color = 'default' 
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      default:
        return '';
    }
  };

  const getCardColor = () => {
    switch (color) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'destructive':
        return 'border-red-200 bg-red-50/50';
      default:
        return '';
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${getCardColor()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>
          {trend && trendValue && (
            <Badge variant="secondary" className={`${getTrendColor()} flex items-center gap-1`}>
              {getTrendIcon()}
              {trendValue}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}