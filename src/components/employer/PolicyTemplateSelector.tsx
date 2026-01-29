/**
 * Policy Template Selector
 * 
 * Component for selecting from pre-built UAE/GCC-style policy templates.
 * Features:
 * - 7 realistic demo templates (Housing, Schooling, Health, Transport, Wellbeing, Learning, Long-Term Financials)
 * - "DEMO TEMPLATE" badge to indicate pre-configured content
 * - Quick preview of transaction model and key caps
 * - One-click creation with option to auto-publish
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, PiggyBank, Sparkles, Check, ChevronRight } from 'lucide-react';
import { usePolicyTemplates, PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { formatCurrencyAED } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Category to icon mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  housing: Home,
  home_living: Home,
  schooling: GraduationCap,
  education: GraduationCap,
  health: Heart,
  transport: Car,
  wellbeing: Dumbbell,
  learning: BookOpen,
  long_term_financials: PiggyBank,
  financial: PiggyBank,
};

// Category to color mapping
const CATEGORY_COLORS: Record<string, string> = {
  housing: 'from-blue-500 to-blue-600',
  home_living: 'from-blue-500 to-blue-600',
  schooling: 'from-purple-500 to-purple-600',
  education: 'from-purple-500 to-purple-600',
  health: 'from-rose-500 to-rose-600',
  transport: 'from-amber-500 to-amber-600',
  wellbeing: 'from-green-500 to-green-600',
  learning: 'from-indigo-500 to-indigo-600',
  long_term_financials: 'from-emerald-500 to-emerald-600',
  financial: 'from-emerald-500 to-emerald-600',
};

// Transaction model display
const TRANSACTION_MODEL_LABELS: Record<string, string> = {
  request_only: 'Request Only',
  claim_only: 'Claim Only',
  request_and_claim: 'Request + Claim',
};

interface PolicyTemplateSelectorProps {
  onSelect: (template: PolicyTemplate) => void;
  onCreateBlank?: () => void;
  selectedTemplateId?: string | null;
  isCreating?: boolean;
  showCreateBlank?: boolean;
}

export function PolicyTemplateSelector({
  onSelect,
  onCreateBlank,
  selectedTemplateId,
  isCreating = false,
  showCreateBlank = true,
}: PolicyTemplateSelectorProps) {
  const { data: templates = [], isLoading } = usePolicyTemplates();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No policy templates available.</p>
        {showCreateBlank && onCreateBlank && (
          <Button variant="outline" className="mt-4" onClick={onCreateBlank}>
            Create Blank Policy
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>UAE/GCC-style policy templates with pre-configured rules</span>
      </div>

      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {templates.map((template) => {
            const Icon = CATEGORY_ICONS[template.category] || Home;
            const colorClass = CATEGORY_COLORS[template.category] || 'from-gray-500 to-gray-600';
            const isSelected = selectedTemplateId === template.id;
            const annualCap = template.default_limits?.annual_cap;
            const perTransactionCap = template.default_limits?.per_transaction_cap;

            return (
              <Card
                key={template.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected && 'ring-2 ring-primary border-primary'
                )}
                onClick={() => !isCreating && onSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn('p-2.5 rounded-lg bg-gradient-to-br text-white flex-shrink-0', colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{template.name}</h3>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/50 text-amber-600 bg-amber-50">
                          DEMO TEMPLATE
                        </Badge>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary ml-auto flex-shrink-0" />
                        )}
                      </div>

                      {template.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                          {template.description}
                        </p>
                      )}

                      {/* Metadata chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {template.transaction_model && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {TRANSACTION_MODEL_LABELS[template.transaction_model] || template.transaction_model}
                          </Badge>
                        )}
                        {annualCap && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Cap: {formatCurrencyAED(annualCap, { abbreviate: true })}/yr
                          </Badge>
                        )}
                        {perTransactionCap && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Per claim: {formatCurrencyAED(perTransactionCap, { abbreviate: true })}
                          </Badge>
                        )}
                        {template.default_required_docs && template.default_required_docs.length > 0 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {template.default_required_docs.length} doc{template.default_required_docs.length > 1 ? 's' : ''} required
                          </Badge>
                        )}
                      </div>

                      {/* Key content preview */}
                      {template.default_content?.summary && template.default_content.summary.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground line-clamp-2">
                            {template.default_content.summary[0]}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action hint */}
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Create blank option */}
      {showCreateBlank && onCreateBlank && (
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={onCreateBlank}
            disabled={isCreating}
          >
            Or start with a blank policy →
          </Button>
        </div>
      )}
    </div>
  );
}

export default PolicyTemplateSelector;
