/**
 * Policy Empty State
 * 
 * Shows helpful empty state for the policies page with clear CTAs.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Download, Sparkles } from 'lucide-react';

interface PolicyEmptyStateProps {
  onCreateClick: () => void;
  onImportClick?: () => void;
  canCreate?: boolean;
}

export function PolicyEmptyState({ 
  onCreateClick, 
  onImportClick,
  canCreate = true,
}: PolicyEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No policies yet
        </h3>
        
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Create your first benefit policy to define eligibility rules, approval workflows, 
          and required documents. Policies power the Claims module and employee portal.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {canCreate ? (
            <>
              <Button onClick={onCreateClick} className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Policy
              </Button>
              
              {onImportClick && (
                <Button variant="outline" onClick={onImportClick} className="gap-2">
                  <Download className="w-4 h-4" />
                  Import from Templates
                </Button>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Policy creation is managed by your administrator.
              </p>
              <Button variant="outline" disabled className="gap-2">
                <Sparkles className="w-4 h-4" />
                Request Policy Setup
              </Button>
            </div>
          )}
        </div>
        
        {/* Quick tips */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center max-w-2xl">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground">Step 1</p>
            <p className="text-xs text-muted-foreground">Choose benefit category</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground">Step 2</p>
            <p className="text-xs text-muted-foreground">Configure rules & limits</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground">Step 3</p>
            <p className="text-xs text-muted-foreground">Publish to employees</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============ Insights Strip ============

interface PolicyInsight {
  type: 'info' | 'warning' | 'success';
  message: string;
}

interface PolicyInsightsStripProps {
  insights: PolicyInsight[];
}

export function PolicyInsightsStrip({ insights }: PolicyInsightsStripProps) {
  if (insights.length === 0) return null;
  
  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Key Insights</span>
        </div>
        <ul className="space-y-1">
          {insights.map((insight, i) => (
            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className={
                insight.type === 'warning' ? 'text-amber-500' :
                insight.type === 'success' ? 'text-emerald-500' :
                'text-blue-500'
              }>•</span>
              {insight.message}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
