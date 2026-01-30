/**
 * Optimization Recommendation Card Template
 * 
 * CFO-defensible card format used across all tabs:
 * - Title (verb-led): "Tighten schooling cap for G3–G4"
 * - Impact: AED (range if needed)
 * - Confidence: High/Med/Low
 * - Mechanism: 1 sentence
 * - Risk/Downside: 1 sentence
 * - Primary CTA: "Simulate"
 * - Secondary CTA: "Create Action" or "Open Policy"
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Plus, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';

export type RecommendationConfidence = 'high' | 'medium' | 'low';
export type RecommendationType = 'cost_efficiency' | 'value_activation' | 'portfolio_rebalancing';

export interface OptimizationRecommendation {
  id: string;
  title: string; // Verb-led action title
  category: string;
  impactMin: number;
  impactMax?: number; // For range display
  confidence: RecommendationConfidence;
  mechanism: string; // 1 sentence explaining how
  riskDownside: string; // 1 sentence on potential downsides
  type: RecommendationType;
  rootCause?: string;
  affectedHeadcount?: number;
  relatedPolicyId?: string;
}

interface OptimizationRecommendationCardProps {
  recommendation: OptimizationRecommendation;
  onSimulate: (recommendation: OptimizationRecommendation) => void;
  onCreateAction?: (recommendation: OptimizationRecommendation) => void;
  onOpenPolicy?: (policyId: string) => void;
  className?: string;
}

const confidenceStyles: Record<RecommendationConfidence, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-success/10 text-success border-success/30' },
  medium: { label: 'Medium', className: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const typeStyles: Record<RecommendationType, { bgColor: string; accentColor: string }> = {
  cost_efficiency: { bgColor: 'border-l-success', accentColor: 'text-success' },
  value_activation: { bgColor: 'border-l-info', accentColor: 'text-info' },
  portfolio_rebalancing: { bgColor: 'border-l-accent', accentColor: 'text-accent' },
};

export function OptimizationRecommendationCard({
  recommendation,
  onSimulate,
  onCreateAction,
  onOpenPolicy,
  className,
}: OptimizationRecommendationCardProps) {
  const conf = confidenceStyles[recommendation.confidence];
  const typeStyle = typeStyles[recommendation.type];
  
  const formatImpact = () => {
    if (recommendation.impactMax && recommendation.impactMax !== recommendation.impactMin) {
      return `${formatCurrencyAED(recommendation.impactMin, { abbreviate: true })} – ${formatCurrencyAED(recommendation.impactMax, { abbreviate: true })}`;
    }
    return formatCurrencyAED(recommendation.impactMin, { abbreviate: true });
  };

  return (
    <Card className={cn(
      'border-l-4 hover:shadow-md transition-shadow group',
      typeStyle.bgColor,
      className
    )}>
      <CardContent className="p-4">
        {/* Header: Title + Confidence */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm leading-tight mb-1">
              {recommendation.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] px-1.5">
                {recommendation.category}
              </Badge>
              {recommendation.rootCause && (
                <Badge variant="outline" className="text-[10px] px-1.5 bg-muted/50">
                  {recommendation.rootCause}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs shrink-0", conf.className)}>
            {conf.label}
          </Badge>
        </div>

        {/* Impact Row */}
        <div className="flex items-center gap-2 mb-3 p-2 rounded-md bg-muted/30">
          <TrendingUp className={cn("h-4 w-4 shrink-0", typeStyle.accentColor)} />
          <div className="flex-1">
            <span className="text-xs text-muted-foreground">Potential Impact:</span>
            <span className={cn("ml-1.5 font-bold text-sm", typeStyle.accentColor)}>
              {formatImpact()}
            </span>
          </div>
          {recommendation.affectedHeadcount && (
            <span className="text-xs text-muted-foreground">
              {recommendation.affectedHeadcount} employees
            </span>
          )}
        </div>

        {/* Mechanism */}
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">How:</span> {recommendation.mechanism}
          </p>
        </div>

        {/* Risk/Downside */}
        <div className="flex items-start gap-2 mb-4">
          <ShieldAlert className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-warning">Risk:</span> {recommendation.riskDownside}
          </p>
        </div>

        {/* Actions - Single primary CTA: Create Action */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {onCreateAction && (
            <Button 
              size="sm" 
              className="gap-1.5 flex-1"
              onClick={() => onCreateAction(recommendation)}
            >
              <Plus className="h-3.5 w-3.5" />
              Create Action
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5"
            onClick={() => onSimulate(recommendation)}
          >
            <Play className="h-3.5 w-3.5" />
            Simulate
          </Button>
          
          {onOpenPolicy && recommendation.relatedPolicyId && (
            <span 
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2"
              onClick={() => onOpenPolicy(recommendation.relatedPolicyId!)}
            >
              View Policy
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
