/**
 * BenefitsActionPlanSummary - Aggregated action plan with cross-portal integration
 * 
 * Displays summary of actions from multiple sources (Zombie Spend, Spend, Claims, Policies)
 * with deep links and audit logging.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight,
  Zap,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
  ExternalLink,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toast } from 'sonner';

// Action item structure
export interface ActionPlanItem {
  id: string;
  title: string;
  category: string;
  rationale: string;
  expectedImpact: string;
  expectedImpactAED?: number;
  owner: 'HR Ops' | 'Admin' | 'Vendor' | 'Comms' | 'Finance';
  priority: 'P0' | 'P1' | 'P2';
  status: 'open' | 'in_progress' | 'done';
  dueDate?: string;
  sourceType: 'zombie_spend' | 'spend' | 'claims' | 'policies' | 'segments' | 'manual';
  deepLinks: {
    label: string;
    path: string;
    params?: Record<string, string>;
  }[];
  isDemo?: boolean;
}

interface BenefitsActionPlanSummaryProps {
  actions: ActionPlanItem[];
  onCreateAction?: () => void;
  onUpdateStatus?: (actionId: string, newStatus: 'open' | 'in_progress' | 'done') => void;
  onSendToHROps?: (action: ActionPlanItem) => void;
  maxItems?: number;
  showViewAll?: boolean;
}

const priorityConfig = {
  P0: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  P1: { label: 'High', color: 'bg-warning/10 text-warning border-warning/30' },
  P2: { label: 'Medium', color: 'bg-info/10 text-info border-info/30' },
};

const statusConfig = {
  open: { label: 'Open', icon: AlertCircle, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-info' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-success' },
};

const ownerIcons: Record<string, LucideIcon> = {
  'HR Ops': Users,
  'Admin': Target,
  'Vendor': ExternalLink,
  'Comms': MessageSquare,
  'Finance': TrendingUp,
};

const sourceLabels = {
  zombie_spend: 'Optimization',
  spend: 'Spend',
  claims: 'Claims',
  policies: 'Policies',
  segments: 'Segments',
  manual: 'Manual',
};

function buildDeepLink(path: string, params?: Record<string, string>): string {
  if (!params) return path;
  const searchParams = new URLSearchParams(params);
  return `${path}?${searchParams.toString()}`;
}

export function BenefitsActionPlanSummary({
  actions,
  onCreateAction,
  onUpdateStatus,
  onSendToHROps,
  maxItems = 5,
  showViewAll = true,
}: BenefitsActionPlanSummaryProps) {
  const navigate = useNavigate();
  const { logEvent } = useAuditLog();
  const displayActions = actions.slice(0, maxItems);
  
  // Summary stats
  const openCount = actions.filter(a => a.status === 'open').length;
  const inProgressCount = actions.filter(a => a.status === 'in_progress').length;
  const doneCount = actions.filter(a => a.status === 'done').length;
  const totalImpact = actions.reduce((sum, a) => sum + (a.expectedImpactAED || 0), 0);
  const completionRate = actions.length > 0 ? Math.round((doneCount / actions.length) * 100) : 0;

  const handleStatusChange = async (action: ActionPlanItem, newStatus: 'open' | 'in_progress' | 'done') => {
    if (action.isDemo) {
      toast.info('Demo: Status update simulated');
      return;
    }
    
    // Log audit event
    await logEvent({
      action: newStatus === 'done' ? 'ACTION_PLAN_COMPLETE' : 'ACTION_PLAN_UPDATE',
      resourceType: 'action_plan',
      resourceId: action.id,
      details: {
        title: action.title,
        previousStatus: action.status,
        newStatus,
        category: action.category,
      },
    });
    
    onUpdateStatus?.(action.id, newStatus);
    toast.success(`Action marked as ${statusConfig[newStatus].label}`);
  };

  const handleSendToHROps = async (action: ActionPlanItem) => {
    if (action.isDemo) {
      toast.info('Demo: Would send to HR Ops queue');
      return;
    }
    
    await logEvent({
      action: 'ACTION_PLAN_SEND_TO_OPS',
      resourceType: 'action_plan',
      resourceId: action.id,
      details: {
        title: action.title,
        category: action.category,
        targetQueue: 'hr_ops',
      },
    });
    
    onSendToHROps?.(action);
    toast.success('Sent to HR Ops queue');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Benefits Action Plan
            </CardTitle>
            <CardDescription>
              Actionable recommendations from Optimization, Spend, Claims & Policies
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCreateAction}>
              <Plus className="w-4 h-4 mr-1" />
              Add Action
            </Button>
            {showViewAll && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/employer/recommendations">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-muted/30">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{openCount}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-info">{inProgressCount}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{doneCount}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{formatCurrencyAED(totalImpact, { abbreviate: true })}</p>
            <p className="text-xs text-muted-foreground">Total Impact</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          {displayActions.map((action) => {
            const StatusIcon = statusConfig[action.status].icon;
            const OwnerIcon = ownerIcons[action.owner] || Users;
            
            return (
              <div
                key={action.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-sm",
                  action.priority === 'P0' && "border-destructive/30 bg-destructive/5",
                  action.priority === 'P1' && "border-warning/30 bg-warning/5",
                  action.priority === 'P2' && "border-border bg-card",
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-medium text-sm">{action.title}</h4>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5", priorityConfig[action.priority].color)}>
                        {priorityConfig[action.priority].label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {sourceLabels[action.sourceType]}
                      </Badge>
                      {action.isDemo && (
                        <Badge variant="outline" className="text-[10px]">Demo</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{action.rationale}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", statusConfig[action.status].color)}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">{statusConfig[action.status].label}</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 mb-3 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-success font-medium">{action.expectedImpact}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <OwnerIcon className="w-3 h-3" />
                    <span>{action.owner}</span>
                  </div>
                  {action.dueDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{action.dueDate}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Deep Links */}
                  {action.deepLinks.slice(0, 2).map((link, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      asChild
                    >
                      <Link to={buildDeepLink(link.path, link.params)}>
                        {link.label}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  ))}
                  
                  {/* Status Actions */}
                  {action.status === 'open' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleStatusChange(action, 'in_progress')}
                    >
                      Start
                    </Button>
                  )}
                  {action.status === 'in_progress' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-success"
                      onClick={() => handleStatusChange(action, 'done')}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Done
                    </Button>
                  )}
                  
                  {/* Send to HR Ops */}
                  {action.owner === 'HR Ops' && action.status !== 'done' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSendToHROps(action)}
                    >
                      Send to Queue
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {displayActions.length === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-medium mb-1">No Actions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create actions from insights to start tracking progress
            </p>
            <Button onClick={onCreateAction}>
              <Plus className="w-4 h-4 mr-1" />
              Create First Action
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to generate sample actions from optimization data
export function generateSampleActionPlan(data: {
  topCategory: { name: string; unused: number };
  processFriction: { missingDocsRate: number; pendingCount: number };
  lowSegment: { name: string; dimension: string };
}): ActionPlanItem[] {
  return [
    {
      id: 'action-1',
      title: `Launch ${data.topCategory.name} awareness campaign`,
      category: data.topCategory.name,
      rationale: 'Low claim velocity despite high eligibility indicates awareness gap',
      expectedImpact: 'Recover 20-30% of unused value',
      expectedImpactAED: data.topCategory.unused * 0.25,
      owner: 'Comms',
      priority: 'P1',
      status: 'open',
      sourceType: 'zombie_spend',
      deepLinks: [
        { label: 'View Category', path: '/employer/zombie-spend', params: { category: data.topCategory.name.toLowerCase() } },
        { label: 'Create Comms', path: '/employer/recommendations', params: { type: 'comms' } },
      ],
      isDemo: true,
    },
    {
      id: 'action-2',
      title: `Process ${data.processFriction.pendingCount} pending claims`,
      category: 'Claims Operations',
      rationale: 'Backlog may discourage future claims and affect satisfaction',
      expectedImpact: 'Clear queue within SLA',
      owner: 'HR Ops',
      priority: 'P0',
      status: 'in_progress',
      sourceType: 'claims',
      deepLinks: [
        { label: 'Open Claims Queue', path: '/employer/claims', params: { status: 'pending' } },
      ],
      isDemo: true,
    },
    {
      id: 'action-3',
      title: `Target ${data.lowSegment.name} segment`,
      category: data.lowSegment.dimension,
      rationale: 'Personalized outreach yields 2x engagement vs blanket comms',
      expectedImpact: 'Increase segment utilization by 15-25%',
      owner: 'HR Ops',
      priority: 'P2',
      status: 'open',
      sourceType: 'segments',
      deepLinks: [
        { label: 'View Segment', path: '/employer/segments', params: { dimension: data.lowSegment.dimension.toLowerCase() } },
      ],
      isDemo: true,
    },
  ];
}
