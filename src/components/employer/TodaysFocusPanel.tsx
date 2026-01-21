/**
 * Today's Focus Panel
 * 
 * Shows top 5 SLA-risk items with employee name, request type, due-in time, and owner.
 * Items are clickable to open directly.
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Flame, 
  Clock, 
  User, 
  ArrowRight,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusItem {
  id: string;
  employeeName: string;
  requestType: string;
  subject: string;
  dueInHours: number;
  owner?: string;
  amount?: number;
}

interface TodaysFocusPanelProps {
  items: FocusItem[];
  onItemClick?: (id: string) => void;
}

export function TodaysFocusPanel({ items, onItemClick }: TodaysFocusPanelProps) {
  const getDueBadge = (hours: number) => {
    if (hours < 0) {
      return (
        <Badge className="bg-destructive text-destructive-foreground border-0 gap-1">
          <AlertTriangle className="w-3 h-3" />
          {Math.abs(hours)}h overdue
        </Badge>
      );
    }
    if (hours <= 4) {
      return (
        <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
          <Flame className="w-3 h-3" />
          {hours}h left
        </Badge>
      );
    }
    if (hours <= 24) {
      return (
        <Badge className="bg-warning/10 text-warning border-0 gap-1">
          <Clock className="w-3 h-3" />
          {hours}h left
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <Clock className="w-3 h-3" />
        {Math.round(hours / 24)}d left
      </Badge>
    );
  };

  if (items.length === 0) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
            <Flame className="w-6 h-6 text-success" />
          </div>
          <p className="font-medium text-success">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No urgent items requiring attention</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20 bg-gradient-to-br from-card to-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-destructive/10">
            <Flame className="w-4 h-4 text-destructive" />
          </div>
          Today's Focus
          <Badge variant="outline" className="ml-auto text-xs font-normal">
            {items.length} urgent
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer group",
              item.dueInHours < 0 && "border border-destructive/30"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{item.subject}</span>
                  {item.amount && (
                    <span className="text-xs text-muted-foreground font-mono">
                      AED {item.amount.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {item.employeeName}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{item.requestType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {getDueBadge(item.dueInHours)}
              {item.owner && (
                <Badge variant="outline" className="text-xs hidden sm:flex">
                  {item.owner}
                </Badge>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
        <Link to="/employer/claims?view=sla_risk">
          <Button variant="ghost" size="sm" className="w-full mt-2 gap-1">
            View all SLA-risk items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
