/**
 * Quick Wins Card
 * 
 * Displays top 3 quick wins for recovering unrealized value.
 * Each item shows estimated impact, effort level, and time to impact.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Clock, 
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface QuickWin {
  id: string;
  title: string;
  category: string;
  estimatedRecovery: number;
  effort: 'low' | 'medium' | 'high';
  timeToImpact: string;
  cause: 'awareness' | 'friction' | 'eligibility' | 'policy';
}

interface QuickWinsCardProps {
  wins: QuickWin[];
  onTakeAction?: (winId: string) => void;
  className?: string;
}

const effortConfig = {
  low: { label: 'Low effort', color: 'bg-success/10 text-success border-success/30' },
  medium: { label: 'Medium effort', color: 'bg-warning/10 text-warning border-warning/30' },
  high: { label: 'High effort', color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const causeColors = {
  awareness: 'bg-info/10 text-info',
  friction: 'bg-warning/10 text-warning',
  eligibility: 'bg-chart-3/10 text-chart-3',
  policy: 'bg-destructive/10 text-destructive',
};

export function QuickWinsCard({ wins, onTakeAction, className }: QuickWinsCardProps) {
  const topWins = wins.slice(0, 3);
  const totalRecovery = topWins.reduce((sum, w) => sum + w.estimatedRecovery, 0);

  return (
    <Card className={cn("card-elevated", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Top 3 Quick Wins
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <TrendingUp className="h-3 w-3 mr-1" />
            {formatCurrencyAED(totalRecovery, { abbreviate: true })} recoverable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topWins.map((win, idx) => (
          <div 
            key={win.id} 
            className="p-3 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{idx + 1}</span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{win.title}</p>
                    {/* Prominent Effort Level Badge */}
                    <Badge 
                      className={cn(
                        "text-[10px] px-2 py-0.5 font-semibold",
                        win.effort === 'low' && "bg-success text-success-foreground",
                        win.effort === 'medium' && "bg-warning text-warning-foreground",
                        win.effort === 'high' && "bg-destructive text-destructive-foreground"
                      )}
                    >
                      {win.effort.charAt(0).toUpperCase() + win.effort.slice(1)} Effort
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {win.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {win.timeToImpact}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className="font-bold text-success text-sm">
                  {formatCurrencyAED(win.estimatedRecovery, { abbreviate: true })}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs mt-1"
                  onClick={() => onTakeAction?.(win.id)}
                >
                  Take action
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* View all link */}
        <div className="pt-2 border-t">
          <Link 
            to="/employer/recommendations" 
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all recovery actions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
