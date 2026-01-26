/**
 * TopRecoveryPlays - Exactly 5 Recovery Plays with Create Action buttons
 * 
 * Each play shows: name, cause targeted, impact range, time to impact, and action button
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Megaphone,
  Settings,
  Store,
  BookOpen,
  RefreshCcw,
  Zap,
  Clock,
  Target,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { RecoveryCauseType } from './RecoverableValueInsights';

export interface RecoveryPlay {
  id: string;
  name: string;
  description: string;
  targetCause: RecoveryCauseType;
  impactRange: { min: number; max: number };
  timeToImpact: string;
  effort: 'low' | 'medium' | 'high';
}

interface TopRecoveryPlaysProps {
  plays: RecoveryPlay[];
  isDemo?: boolean;
}

const causeLabels: Record<RecoveryCauseType, { label: string; badgeClass: string }> = {
  awareness: { label: 'Awareness', badgeClass: 'border-info/30 text-info bg-info/5' },
  eligibility: { label: 'Eligibility', badgeClass: 'border-purple-500/30 text-purple-500 bg-purple-500/5' },
  friction: { label: 'Friction', badgeClass: 'border-warning/30 text-warning bg-warning/5' },
  policy: { label: 'Policy', badgeClass: 'border-destructive/30 text-destructive bg-destructive/5' },
};

const effortConfig = {
  low: { label: 'Low effort', className: 'border-success/50 text-success' },
  medium: { label: 'Medium effort', className: 'border-warning/50 text-warning' },
  high: { label: 'High effort', className: 'border-destructive/50 text-destructive' },
};

const playIcons: Record<string, typeof Megaphone> = {
  awareness_campaign: Megaphone,
  friction_fix: Settings,
  vendor_enablement: Store,
  policy_simplification: BookOpen,
  reallocation_proposal: RefreshCcw,
};

export function TopRecoveryPlays({ plays, isDemo }: TopRecoveryPlaysProps) {
  // Limit to exactly 5 plays
  const displayPlays = plays.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Top Recovery Plays
            </CardTitle>
            <CardDescription>
              The fastest levers to recover unrealized value
            </CardDescription>
          </div>
          {isDemo && (
            <Badge variant="outline" className="text-xs">Demo</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayPlays.map((play, index) => {
            const PlayIcon = playIcons[play.id] || Zap;
            const causeConfig = causeLabels[play.targetCause];
            const effort = effortConfig[play.effort];

            return (
              <div
                key={play.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-muted/30 transition-all group"
              >
                {/* Rank */}
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                  <PlayIcon className="w-5 h-5 text-accent" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{play.name}</span>
                    <Badge variant="outline" className={cn("text-[10px]", causeConfig.badgeClass)}>
                      {causeConfig.label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", effort.className)}>
                      {effort.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{play.description}</p>
                </div>

                {/* Metrics */}
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" /> Impact
                    </p>
                    <p className="text-sm font-semibold text-success">
                      {formatCurrencyAED(play.impactRange.min, { abbreviate: true })}–{formatCurrencyAED(play.impactRange.max, { abbreviate: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </p>
                    <p className="text-sm font-medium">{play.timeToImpact}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                  asChild
                >
                  <Link to={`/employer/recommendations?action=${play.id}`}>
                    Create action
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/employer/recommendations">
              View full Action Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
