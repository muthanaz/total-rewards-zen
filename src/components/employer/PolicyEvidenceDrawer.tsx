import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  XCircle, 
  FileX, 
  FileText, 
  Settings, 
  Plus,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';

export interface PolicyEvidence {
  policyId: string;
  policyName: string;
  clarityScore: number;
  targetScore: number;
  employeeQuestions: Array<{
    question: string;
    count: number;
    category: string;
  }>;
  rejectionReasons: Array<{
    reason: string;
    count: number;
    percentOfRejections: number;
  }>;
  missingDocs: Array<{
    docType: string;
    count: number;
    percentOfClaims: number;
  }>;
  suggestedFixes: {
    policyText: {
      title: string;
      description: string;
      expectedImpact: number;
    };
    processDoc: {
      title: string;
      description: string;
      expectedImpact: number;
    };
  };
  unrealizedValue: number;
  affectedEmployees: number;
}

interface PolicyEvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidence: PolicyEvidence | null;
  onCreateAction: (fixType: 'policy_text' | 'process_doc', evidence: PolicyEvidence) => void;
}

export function PolicyEvidenceDrawer({
  open,
  onOpenChange,
  evidence,
  onCreateAction,
}: PolicyEvidenceDrawerProps) {
  if (!evidence) return null;

  const clarityGap = evidence.targetScore - evidence.clarityScore;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <SheetTitle>{evidence.policyName}</SheetTitle>
          </div>
          <SheetDescription>
            Evidence for policy clarity issues and recommended fixes
          </SheetDescription>
        </SheetHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-muted-foreground">Clarity Gap</p>
            <p className="text-lg font-bold text-destructive">-{clarityGap}%</p>
            <p className="text-xs text-muted-foreground">vs target {evidence.targetScore}%</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-muted-foreground">Unrealized Value</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrencyAED(evidence.unrealizedValue)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted border">
            <p className="text-xs text-muted-foreground">Affected</p>
            <p className="text-lg font-bold">{evidence.affectedEmployees}</p>
            <p className="text-xs text-muted-foreground">employees</p>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Top Employee Questions */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Top Employee Questions (Verbatim)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {evidence.employeeQuestions.map((q, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm italic">"{q.question}"</p>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {q.count}×
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs mt-2">{q.category}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rejection Reasons */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejection Reasons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {evidence.rejectionReasons.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-destructive/5">
                <span className="text-sm">{r.reason}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.count}</span>
                  <Badge variant="destructive" className="text-xs">
                    {r.percentOfRejections}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Missing Docs */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileX className="h-4 w-4 text-amber-500" />
              Missing Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {evidence.missingDocs.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-amber-500/5">
                <span className="text-sm">{d.docType}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{d.count} missing</span>
                  <Badge className="bg-amber-500/10 text-amber-600 text-xs">
                    {d.percentOfClaims}% of claims
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* Suggested Fixes */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Suggested Fixes
          </h3>

          {/* Policy Text Fix */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{evidence.suggestedFixes.policyText.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {evidence.suggestedFixes.policyText.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Est. -{evidence.suggestedFixes.policyText.expectedImpact}% questions
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => onCreateAction('policy_text', evidence)}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Action
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Process/Docs Fix */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Settings className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{evidence.suggestedFixes.processDoc.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {evidence.suggestedFixes.processDoc.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Est. -{evidence.suggestedFixes.processDoc.expectedImpact}% rejections
                </Badge>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => onCreateAction('process_doc', evidence)}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Action
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
