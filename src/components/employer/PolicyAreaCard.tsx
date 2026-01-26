import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Eye, Zap, MessageSquare, XCircle, FileX } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';

export interface PolicyAreaData {
  id: string;
  policyName: string;
  clarityScore: number;
  targetScore: number;
  questionsThisMonth: number;
  rejectionsThisMonth: number;
  missingDocsCount: number;
  unrealizedValue: number;
  status: 'good' | 'warning' | 'critical';
  topIssue: string;
  suggestedFixes: string[];
}

interface PolicyAreaCardProps {
  policy: PolicyAreaData;
  onViewEvidence: (policy: PolicyAreaData) => void;
  onQuickFix: (policy: PolicyAreaData) => void;
}

export function PolicyAreaCard({ policy, onViewEvidence, onQuickFix }: PolicyAreaCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': 
        return <Badge className="bg-success/10 text-success border-success/20">Good</Badge>;
      case 'warning': 
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Attention</Badge>;
      case 'critical': 
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Critical</Badge>;
      default: 
        return null;
    }
  };

  const getClarityColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 65) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <Card className="card-elevated hover:shadow-md transition-shadow">
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{policy.policyName}</h3>
          </div>
          {getStatusBadge(policy.status)}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Clarity Score</p>
            <div className="flex items-center gap-2">
              <Progress value={policy.clarityScore} className="w-12 h-1.5" />
              <span className={cn("text-sm font-semibold", getClarityColor(policy.clarityScore))}>
                {policy.clarityScore}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> Questions
            </p>
            <p className="text-sm font-semibold">{policy.questionsThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Rejections
            </p>
            <p className="text-sm font-semibold">{policy.rejectionsThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <FileX className="h-3 w-3" /> Missing Docs
            </p>
            <p className="text-sm font-semibold">{policy.missingDocsCount}</p>
          </div>
        </div>

        {/* Unrealized Value */}
        {policy.unrealizedValue > 0 && (
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 mb-3">
            <p className="text-xs text-amber-600">
              Unrealized value: <span className="font-semibold">{formatCurrencyAED(policy.unrealizedValue)}</span>
            </p>
          </div>
        )}

        {/* Top Issue */}
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Top Issue</p>
          <Badge variant="outline" className="text-xs">{policy.topIssue}</Badge>
        </div>

        {/* Suggested Fixes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {policy.suggestedFixes.slice(0, 2).map((fix, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {fix}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewEvidence(policy)}
            className="flex-1 gap-1"
          >
            <Eye className="h-3.5 w-3.5" />
            View Evidence
          </Button>
          <Button 
            size="sm" 
            onClick={() => onQuickFix(policy)}
            className="flex-1 gap-1"
          >
            <Zap className="h-3.5 w-3.5" />
            Quick Fix
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
