/**
 * SpendRecommendedActions - Actionable recommendations for Spend page
 * 
 * Displays 3-6 action cards with title, rationale, impact, owner, and CTA.
 * Each action links to the relevant feature or creates an action plan item.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  Zap,
  Users,
  MessageSquare,
  ClipboardCheck,
  TrendingUp,
  Target,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export interface RecommendedAction {
  id: string;
  title: string;
  rationale: string;
  expectedImpact: string;
  owner: 'HR Ops' | 'Admin' | 'Comms' | 'Vendor' | 'Finance';
  effort: 'low' | 'medium' | 'high';
  priority: 'critical' | 'high' | 'medium';
  icon: LucideIcon;
  deepLink?: {
    path: string;
    params?: Record<string, string>;
  };
  isDemo?: boolean;
}

interface SpendRecommendedActionsProps {
  actions: RecommendedAction[];
  onCreateAction?: (action: RecommendedAction) => void;
  maxItems?: number;
}

const ownerColors: Record<string, string> = {
  'HR Ops': 'bg-primary/10 text-primary',
  'Admin': 'bg-info/10 text-info',
  'Comms': 'bg-accent/10 text-accent',
  'Vendor': 'bg-warning/10 text-warning',
  'Finance': 'bg-success/10 text-success',
};

const priorityColors: Record<string, string> = {
  critical: 'border-destructive/50 bg-destructive/5',
  high: 'border-warning/50 bg-warning/5',
  medium: 'border-info/50 bg-info/5',
};

const effortLabels: Record<string, { label: string; color: string }> = {
  low: { label: '⚡ Quick win', color: 'text-success' },
  medium: { label: '⏱ Medium effort', color: 'text-warning' },
  high: { label: '🔧 Significant effort', color: 'text-destructive' },
};

function buildDeepLink(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

export function SpendRecommendedActions({ 
  actions, 
  onCreateAction, 
  maxItems = 6 
}: SpendRecommendedActionsProps) {
  const displayActions = actions.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Recommended Actions
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {displayActions.length} actions • Impact-prioritized
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayActions.map((action) => {
            const Icon = action.icon;
            const effort = effortLabels[action.effort];
            const deepLinkUrl = action.deepLink 
              ? buildDeepLink(action.deepLink.path, action.deepLink.params)
              : undefined;

            return (
              <div
                key={action.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-sm",
                  priorityColors[action.priority]
                )}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-card shrink-0">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight">{action.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.rationale}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3 h-3 text-success shrink-0" />
                  <span className="text-xs text-success font-medium">{action.expectedImpact}</span>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] px-1.5 py-0", ownerColors[action.owner])}
                  >
                    {action.owner}
                  </Badge>
                  <span className={cn("text-[10px]", effort.color)}>{effort.label}</span>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2">
                  {deepLinkUrl ? (
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" asChild>
                      <Link to={deepLinkUrl}>
                        Take Action
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  ) : onCreateAction ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-7 text-xs"
                      onClick={() => onCreateAction(action)}
                    >
                      {action.isDemo ? 'Demo (no-op)' : 'Create Action'}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-7 text-xs"
                      disabled
                    >
                      Coming soon
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to generate default recommended actions based on spend data
export function generateSpendRecommendedActions(data: {
  unusedEntitlement: number;
  topUnderutilizedCategory: { name: string; unused: number };
  lowAwarenessCategories: string[];
  pendingClaimsCount: number;
}): RecommendedAction[] {
  const actions: RecommendedAction[] = [];

  // Communication campaign for low awareness
  if (data.lowAwarenessCategories.length > 0) {
    actions.push({
      id: 'awareness-campaign',
      title: `Launch awareness campaign for ${data.lowAwarenessCategories[0]}`,
      rationale: 'Low claim velocity despite high FAQ views indicates awareness gap',
      expectedImpact: `Recover up to 20% of unused ${data.lowAwarenessCategories[0]} budget`,
      owner: 'Comms',
      effort: 'low',
      priority: 'high',
      icon: MessageSquare,
      deepLink: {
        path: '/employer/recommendations',
        params: { create: 'true', type: 'communication', benefit: data.lowAwarenessCategories[0] },
      },
    });
  }

  // Process pending claims
  if (data.pendingClaimsCount > 10) {
    actions.push({
      id: 'process-claims',
      title: `Process ${data.pendingClaimsCount} pending claims`,
      rationale: 'Backlog may discourage future claims and affect satisfaction',
      expectedImpact: 'Improve employee experience and unlock utilization',
      owner: 'HR Ops',
      effort: 'medium',
      priority: 'critical',
      icon: ClipboardCheck,
      deepLink: {
        path: '/employer/claims',
        params: { status: 'pending' },
      },
    });
  }

  // Review underutilized policy
  actions.push({
    id: 'policy-review',
    title: `Review ${data.topUnderutilizedCategory.name} policy eligibility`,
    rationale: 'Structural underutilization may indicate overly restrictive rules',
    expectedImpact: `Potential to unlock ${(data.topUnderutilizedCategory.unused * 0.3).toLocaleString('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 })}`,
    owner: 'Admin',
    effort: 'medium',
    priority: 'high',
    icon: Target,
    deepLink: {
      path: '/employer/policies',
      params: { category: data.topUnderutilizedCategory.name.toLowerCase() },
    },
  });

  // Segment-specific intervention
  actions.push({
    id: 'segment-intervention',
    title: 'Target low-utilization segments',
    rationale: 'Personalized outreach yields 2x engagement vs blanket comms',
    expectedImpact: 'Increase segment utilization by 15-25%',
    owner: 'HR Ops',
    effort: 'medium',
    priority: 'medium',
    icon: Users,
    deepLink: {
      path: '/employer/segments',
    },
  });

  // Escalate zombie spend
  if (data.unusedEntitlement > 1000000) {
    actions.push({
      id: 'zombie-recovery',
      title: 'Launch zombie spend recovery playbook',
      rationale: 'Significant unrealized value requires structured intervention',
      expectedImpact: `Target: recover ${(data.unusedEntitlement * 0.4).toLocaleString('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 })}`,
      owner: 'Finance',
      effort: 'high',
      priority: 'high',
      icon: AlertCircle,
      deepLink: {
        path: '/employer/zombie-spend',
        params: { action: 'playbook' },
      },
    });
  }

  return actions;
}
