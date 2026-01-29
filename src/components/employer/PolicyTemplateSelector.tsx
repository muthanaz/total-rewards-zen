/**
 * Policy Template Selector
 * 
 * Enhanced template selection modal for creating policies from predefined UAE/GCC templates.
 * Shows all 7 benefit categories with visual cards and "DEMO TEMPLATE" badge.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home, 
  GraduationCap, 
  Heart, 
  Car, 
  Sparkles, 
  BookOpen, 
  PiggyBank,
  FileText,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import { usePolicyTemplates, type PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { cn } from '@/lib/utils';

// Category icon mapping
const CATEGORY_ICONS: Record<string, typeof Home> = {
  housing: Home,
  schooling: GraduationCap,
  health: Heart,
  transport: Car,
  wellbeing: Sparkles,
  learning: BookOpen,
  long_term_financials: PiggyBank,
};

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  housing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  schooling: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  health: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  transport: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  wellbeing: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  learning: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  long_term_financials: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  housing: 'text-blue-600',
  schooling: 'text-purple-600',
  health: 'text-rose-600',
  transport: 'text-amber-600',
  wellbeing: 'text-emerald-600',
  learning: 'text-cyan-600',
  long_term_financials: 'text-indigo-600',
};

const TRANSACTION_MODEL_LABELS: Record<string, string> = {
  request_only: 'Request Only',
  claim_only: 'Claim Only',
  request_and_claim: 'Request + Claim',
};

interface PolicyTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PolicyTemplate) => void;
  onStartBlank: () => void;
}

export function PolicyTemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
  onStartBlank,
}: PolicyTemplateSelectorProps) {
  const { data: templates = [], isLoading } = usePolicyTemplates();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedId) {
      const template = templates.find(t => t.id === selectedId);
      if (template) {
        onSelectTemplate(template);
        onOpenChange(false);
      }
    }
  };

  const handleStartBlank = () => {
    onStartBlank();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create from Template</DialogTitle>
              <DialogDescription>
                Choose a pre-configured policy template to get started quickly
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => {
                  const Icon = CATEGORY_ICONS[template.category] || FileText;
                  const colorClasses = CATEGORY_COLORS[template.category] || 'bg-muted text-muted-foreground';
                  const iconColor = CATEGORY_ICON_COLORS[template.category] || 'text-muted-foreground';
                  const isSelected = selectedId === template.id;
                  
                  // Parse limits
                  const limits = template.default_limits as any;
                  const annualCap = limits?.annual_cap;

                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        'cursor-pointer transition-all hover:border-primary/50',
                        isSelected && 'border-primary ring-2 ring-primary/20'
                      )}
                      onClick={() => setSelectedId(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={cn('p-3 rounded-lg flex-shrink-0', colorClasses)}>
                            <Icon className={cn('w-5 h-5', iconColor)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-foreground">{template.name}</h4>
                              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20">
                                DEMO TEMPLATE
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {TRANSACTION_MODEL_LABELS[template.transaction_model || 'claim_only']}
                              </Badge>
                              {annualCap && (
                                <span>Up to AED {annualCap.toLocaleString()}/year</span>
                              )}
                              {template.default_sla_days && (
                                <span>{template.default_sla_days} day SLA</span>
                              )}
                            </div>
                          </div>

                          {/* Selection indicator */}
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" onClick={handleStartBlank}>
                Start Blank Instead
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={!selectedId}
                className="gap-2"
              >
                Continue with Template
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
