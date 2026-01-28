/**
 * Top 3 Decisions Panel
 * 
 * Executive decision-grade panel showing top 3 actions with:
 * - Why it matters (1 line)
 * - Expected impact range (only precise if high confidence)
 * - Evidence links
 * - CTA: Create Action (creates Action Plan item)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  FileText,
  Link2,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UnifiedConfidenceBadge } from '@/components/shared/UnifiedConfidenceBadge';

export interface TopDecision {
  id: string;
  title: string;
  whyItMatters: string;
  impactRange: {
    min: number;
    max: number;
    unit: 'currency' | 'percent' | 'days';
  };
  confidence: 'high' | 'medium' | 'low';
  evidenceLinks: Array<{
    label: string;
    path: string;
  }>;
  category: 'spend' | 'policy' | 'engagement' | 'compliance';
  owner: 'Executive' | 'HR Ops' | 'Comp & Ben' | 'Finance';
}

interface TopDecisionsPanelProps {
  decisions?: TopDecision[];
  onCreateAction?: (decision: TopDecision) => void;
  className?: string;
}

const categoryIcons = {
  spend: DollarSign,
  policy: FileText,
  engagement: Users,
  compliance: AlertTriangle,
};

const categoryColors = {
  spend: 'text-chart-1',
  policy: 'text-chart-2',
  engagement: 'text-chart-3',
  compliance: 'text-chart-4',
};

const ownerStyles: Record<string, string> = {
  Executive: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
  'HR Ops': 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  'Comp & Ben': 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  Finance: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
};

// Default decisions for demo (should be computed from data)
const DEFAULT_DECISIONS: TopDecision[] = [
  {
    id: '1',
    title: 'Recover unrealized housing benefit value',
    whyItMatters: 'AED 2.1M in housing allowances unclaimed; employees may be unaware of eligibility',
    impactRange: { min: 840000, max: 1260000, unit: 'currency' },
    confidence: 'high',
    evidenceLinks: [
      { label: 'Unrealized Value breakdown', path: '/employer/optimization?category=housing' },
      { label: 'Housing policy', path: '/employer/policies' },
    ],
    category: 'spend',
    owner: 'Comp & Ben',
  },
  {
    id: '2',
    title: 'Address high claim rejection rate in L&D',
    whyItMatters: '34% rejection rate due to missing certificates; clarify requirements in policy',
    impactRange: { min: 15, max: 25, unit: 'percent' },
    confidence: 'medium',
    evidenceLinks: [
      { label: 'Claims & Requests', path: '/employer/claims?category=learning' },
      { label: 'L&D Policy', path: '/employer/policies' },
    ],
    category: 'policy',
    owner: 'HR Ops',
  },
  {
    id: '3',
    title: 'Close coverage gap in Grade M1 benefits',
    whyItMatters: 'M1 employees have 23% lower utilization than M2; may indicate awareness issue',
    impactRange: { min: 450000, max: 600000, unit: 'currency' },
    confidence: 'medium',
    evidenceLinks: [
      { label: 'Segment analysis', path: '/employer/segments?dimension=grade' },
    ],
    category: 'engagement',
    owner: 'HR Ops',
  },
];

export function TopDecisionsPanel({ 
  decisions = DEFAULT_DECISIONS, 
  onCreateAction,
  className,
}: TopDecisionsPanelProps) {
  const navigate = useNavigate();
  const [creatingActionId, setCreatingActionId] = useState<string | null>(null);

  const formatImpact = (impact: TopDecision['impactRange'], confidence: TopDecision['confidence']) => {
    const { min, max, unit } = impact;
    
    // Only show precise values for high confidence
    if (confidence === 'low') {
      return unit === 'currency' 
        ? 'Potential savings (data insufficient)'
        : 'Potential improvement (data insufficient)';
    }
    
    if (unit === 'currency') {
      return confidence === 'high'
        ? `${formatCurrencyAED(min)} – ${formatCurrencyAED(max)}`
        : `~${formatCurrencyAED((min + max) / 2)} (estimated)`;
    }
    
    if (unit === 'percent') {
      return confidence === 'high'
        ? `${min}% – ${max}% improvement`
        : `~${Math.round((min + max) / 2)}% improvement (est.)`;
    }
    
    return `${min} – ${max} days`;
  };

  const handleCreateAction = async (decision: TopDecision) => {
    setCreatingActionId(decision.id);
    
    // Simulate creating action
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onCreateAction) {
      onCreateAction(decision);
    }
    
    toast.success('Action added to plan', {
      description: decision.title,
      action: {
        label: 'View',
        onClick: () => navigate('/employer/recommendations'),
      },
    });
    
    setCreatingActionId(null);
  };

  return (
    <Card className={cn('border-accent/20', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            Top 3 Decisions This Week
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Decision-grade
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {decisions.slice(0, 3).map((decision, idx) => {
          const Icon = categoryIcons[decision.category];
          const isCreating = creatingActionId === decision.id;
          
          return (
            <div 
              key={decision.id}
              className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn('w-4 h-4 shrink-0', categoryColors[decision.category])} />
                    <h4 className="font-medium text-sm truncate">{decision.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{decision.whyItMatters}</p>
                </div>
              </div>

              {/* Impact + Confidence */}
              <div className="flex items-center gap-3 mb-3 px-9">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-accent tabular-nums">
                    {formatImpact(decision.impactRange, decision.confidence)}
                  </div>
                  <div className="text-xs text-muted-foreground">Expected impact</div>
                </div>
                <Badge variant="outline" className={cn(
                  'text-[10px] h-5',
                  decision.confidence === 'high' ? 'bg-success/10 text-success' :
                  decision.confidence === 'medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                )}>
                  {decision.confidence === 'high' ? 'Measured' : decision.confidence === 'medium' ? 'Estimated' : 'Partial'}
                </Badge>
              </div>

              {/* Evidence links */}
              <div className="flex flex-wrap items-center gap-2 mb-3 px-9">
                {decision.evidenceLinks.map((link, linkIdx) => (
                  <Button
                    key={linkIdx}
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate(link.path)}
                  >
                    <Link2 className="w-3 h-3" />
                    {link.label}
                  </Button>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50 px-9">
                <Badge variant="outline" className={cn('text-xs', ownerStyles[decision.owner])}>
                  {decision.owner}
                </Badge>
                <Button 
                  size="sm" 
                  className="h-7 text-xs gap-1"
                  onClick={() => handleCreateAction(decision)}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    'Adding...'
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Create Action
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        {/* Link to full recommendations */}
        <Button 
          variant="outline" 
          className="w-full gap-2 text-xs" 
          onClick={() => navigate('/employer/recommendations')}
        >
          View all recommendations
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
