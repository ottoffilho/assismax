import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'lead_novo' | 'lead_atribuido' | 'lead_convertido' | 'lead_perdido' | 'lead_qualificado';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  activities?: Activity[];
  className?: string;
  isLoading?: boolean;
}

const activityIcons = {
  lead_novo: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' },
  lead_atribuido: { icon: MessageSquare, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  lead_convertido: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  lead_perdido: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  lead_qualificado: { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
};

export function ActivityFeed({ activities = [], className, isLoading }: ActivityFeedProps) {
  const displayActivities = activities;

  if (isLoading) {
    return (
      <Card className={cn("shadow-soft", className)}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-soft hover:shadow-medium transition-shadow", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity) => {
            const { icon: Icon, color, bg } = activityIcons[activity.type] || activityIcons.lead_novo;
            
            return (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                  bg
                )}>
                  <Icon className={cn("w-4 h-4", color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    </div>
                    {activity.user && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {activity.user}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Nenhuma atividade recente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}