/**
 * Decision Rationale Card
 * 
 * Shows 2-3 bullets explaining why system recommends approve/reject
 * with links to policy clauses used.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicyReference {
  id: string;
  policyRef: string;
  section: string;
  clause: string;
  text: string;
}

interface RationalePoint {
  type: 'positive' | 'negative' | 'warning';
  message: string;
  policyRef?: PolicyReference;
}

interface DecisionRationaleCardProps {
  recommendation: 'approve' | 'reject' | 'review';
  rationale: RationalePoint[];
  confidenceScore?: number;
}

export function DecisionRationaleCard({ 
  recommendation, 
  rationale,
  confidenceScore = 85,
}: DecisionRationaleCardProps) {
  const [policySheetOpen, setPolicySheetOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyReference | null>(null);

  const getRecommendationConfig = () => {
    switch (recommendation) {
      case 'approve':
        return {
          icon: CheckCircle,
          label: 'Recommend: Approve',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
        };
      case 'reject':
        return {
          icon: XCircle,
          label: 'Recommend: Reject',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
        };
      default:
        return {
          icon: AlertTriangle,
          label: 'Recommend: Manual Review',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
        };
    }
  };

  const config = getRecommendationConfig();
  const Icon = config.icon;

  const handleOpenPolicy = (policy: PolicyReference) => {
    setSelectedPolicy(policy);
    setPolicySheetOpen(true);
  };

  return (
    <>
      <Card className={cn("border", config.borderColor, config.bgColor)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className={cn("w-4 h-4", config.color)} />
              <span className={config.color}>Decision Rationale</span>
            </div>
            <Badge variant="outline" className="text-xs gap-1">
              <Scale className="w-3 h-3" />
              {confidenceScore}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Recommendation */}
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-lg",
            recommendation === 'approve' && "bg-success/10",
            recommendation === 'reject' && "bg-destructive/10",
            recommendation === 'review' && "bg-warning/10"
          )}>
            <Icon className={cn("w-4 h-4", config.color)} />
            <span className={cn("font-medium text-sm", config.color)}>
              {config.label}
            </span>
          </div>

          {/* Rationale Points */}
          <div className="space-y-2">
            {rationale.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                {point.type === 'positive' && (
                  <CheckCircle className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                )}
                {point.type === 'negative' && (
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                )}
                {point.type === 'warning' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-xs text-foreground">{point.message}</p>
                  {point.policyRef && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={() => handleOpenPolicy(point.policyRef!)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {point.policyRef.policyRef} - {point.policyRef.section}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Side Panel */}
      <Sheet open={policySheetOpen} onOpenChange={setPolicySheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Policy Reference
            </SheetTitle>
            <SheetDescription>
              {selectedPolicy?.policyRef} - {selectedPolicy?.section}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedPolicy && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Clause: {selectedPolicy.clause}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {selectedPolicy.text}
                  </p>
                </div>
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a href={`/employer/policies?ref=${selectedPolicy.policyRef}`} target="_blank">
                    <ExternalLink className="w-4 h-4" />
                    Open Full Policy
                  </a>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
