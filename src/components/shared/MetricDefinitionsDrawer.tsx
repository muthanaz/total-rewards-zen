/**
 * MetricDefinitionsDrawer
 * 
 * A lightweight drawer that displays all metric definitions,
 * accessible from any dashboard.
 */

import { useState } from 'react';
import { Book, Search, X, ChevronRight, Calculator, Clock, Database, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { METRIC_DEFINITIONS, MetricDefinition } from '@/lib/metrics';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MetricDefinitionsDrawerProps {
  /** Only show metrics from specific categories */
  categories?: string[];
  /** Trigger element (defaults to a button) */
  trigger?: React.ReactNode;
  className?: string;
}

const categoryLabels: Record<string, { label: string; labelAr: string; color: string }> = {
  utilization: { label: 'Utilization', labelAr: 'الاستخدام', color: 'bg-info/10 text-info' },
  financial: { label: 'Financial', labelAr: 'المالية', color: 'bg-success/10 text-success' },
  operational: { label: 'Operational', labelAr: 'التشغيل', color: 'bg-warning/10 text-warning' },
  satisfaction: { label: 'Satisfaction', labelAr: 'الرضا', color: 'bg-accent/10 text-accent' },
  retention: { label: 'Retention', labelAr: 'الاحتفاظ', color: 'bg-chart-3/10 text-chart-3' },
};

function MetricItem({ metric, language }: { metric: MetricDefinition; language: string }) {
  const isAr = language === 'ar';
  const cat = categoryLabels[metric.category];

  return (
    <AccordionItem value={metric.key} className="border-b border-border/50">
      <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/30 px-3 -mx-3 rounded-lg">
        <div className="flex items-center gap-3 text-left">
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isAr && metric.nameAr ? metric.nameAr : metric.name}
            </p>
            <Badge variant="outline" className={cn('mt-1 text-[10px]', cat?.color)}>
              {isAr && cat?.labelAr ? cat.labelAr : cat?.label || metric.category}
            </Badge>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-4 space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {isAr && metric.descriptionAr ? metric.descriptionAr : metric.description}
        </p>

        {/* Formula */}
        <div className="flex items-start gap-2">
          <Calculator className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Formula</p>
            <p className="text-xs font-mono bg-muted/50 px-2 py-1 rounded mt-0.5">
              {isAr && metric.formulaAr ? metric.formulaAr : metric.formula}
            </p>
          </div>
        </div>

        {/* Time Window */}
        {metric.timeWindow && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Time Window</p>
              <p className="text-xs">{metric.timeWindow}</p>
            </div>
          </div>
        )}

        {/* Exclusions */}
        {metric.exclusions && metric.exclusions.length > 0 && (
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Exclusions</p>
              <ul className="text-xs text-muted-foreground list-disc list-inside mt-0.5">
                {metric.exclusions.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="flex items-start gap-2">
          <Database className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase">Data Source</p>
            <p className="text-xs text-muted-foreground">{metric.dataSource}</p>
          </div>
        </div>

        {/* Benchmark Range */}
        {metric.benchmarkRange && (
          <div className="bg-muted/30 rounded-lg p-2 mt-2">
            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1">Benchmark Range</p>
            <div className="flex gap-4 text-xs">
              <span className="text-destructive">Low: {metric.benchmarkRange.low}</span>
              <span className="text-success font-medium">Target: {metric.benchmarkRange.target}</span>
              <span className="text-info">High: {metric.benchmarkRange.high}</span>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function MetricDefinitionsDrawer({
  categories,
  trigger,
  className,
}: MetricDefinitionsDrawerProps) {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  // Filter metrics
  const metrics = Object.values(METRIC_DEFINITIONS).filter(m => {
    // Category filter
    if (categories && !categories.includes(m.category)) return false;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower) ||
        m.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Group by category
  const grouped = metrics.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, MetricDefinition[]>);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Book className="w-4 h-4" />
            Metric Definitions
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Metric Definitions
          </SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Metrics List */}
        <ScrollArea className="flex-1 px-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No metrics found</p>
            </div>
          ) : (
            <div className="py-4 space-y-6">
              {Object.entries(grouped).map(([category, items]) => {
                const cat = categoryLabels[category];
                return (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {language === 'ar' && cat?.labelAr ? cat.labelAr : cat?.label || category}
                    </h3>
                    <Accordion type="single" collapsible className="space-y-1">
                      {items.map(metric => (
                        <MetricItem key={metric.key} metric={metric} language={language} />
                      ))}
                    </Accordion>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            All metrics are calculated using standardized formulas. 
            Contact support for custom metric requests.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
