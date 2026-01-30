/**
 * HowYourAllowanceWorks
 * 
 * Horizontal card-based workflow showing numbered steps.
 * Each step appears in its own subtle card with number badge.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
}

export interface HowYourAllowanceWorksProps {
  /** Title of the section */
  title?: string;
  /** Workflow steps */
  steps: (string | WorkflowStep)[];
  /** Custom className */
  className?: string;
}

export function HowYourAllowanceWorks({
  title = "How Your Allowance Works",
  steps,
  className,
}: HowYourAllowanceWorksProps) {
  // Normalize steps to WorkflowStep objects
  const normalizedSteps: WorkflowStep[] = steps.map(step => {
    if (typeof step === 'string') {
      // Try to split on " — " or ": " for title/description
      const dashSplit = step.split(' — ');
      const colonSplit = step.split(': ');
      
      if (dashSplit.length === 2) {
        return { title: dashSplit[0], description: dashSplit[1] };
      } else if (colonSplit.length === 2) {
        return { title: colonSplit[0], description: colonSplit[1] };
      }
      return { title: step };
    }
    return step;
  });

  if (normalizedSteps.length === 0) {
    return null;
  }

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Info className="w-5 h-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "grid gap-4",
          normalizedSteps.length === 2 && "grid-cols-1 md:grid-cols-2",
          normalizedSteps.length === 3 && "grid-cols-1 md:grid-cols-3",
          normalizedSteps.length >= 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}>
          {normalizedSteps.map((step, i) => (
            <div 
              key={i} 
              className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/20"
            >
              {/* Number badge */}
              <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                {i + 1}
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground leading-snug">
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}