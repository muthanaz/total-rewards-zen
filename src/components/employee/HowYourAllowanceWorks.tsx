/**
 * HowYourAllowanceWorks
 * 
 * A step-based workflow section showing how the benefit/allowance works.
 * Displays steps in a visually connected flow with numbered circles.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WorkflowStep {
  /** Step title */
  title: string;
  /** Optional description */
  description?: string;
  /** Whether step is completed (for progress tracking) */
  isCompleted?: boolean;
}

export interface HowYourAllowanceWorksProps {
  /** Title of the section */
  title?: string;
  /** Workflow steps (will be converted from simple strings if needed) */
  steps: (string | WorkflowStep)[];
  /** Show as horizontal timeline instead of vertical list */
  variant?: 'vertical' | 'horizontal' | 'compact';
  /** Custom className */
  className?: string;
}

export function HowYourAllowanceWorks({
  title = "How your allowance works",
  steps,
  variant = 'vertical',
  className,
}: HowYourAllowanceWorksProps) {
  // Normalize steps to WorkflowStep objects
  const normalizedSteps: WorkflowStep[] = steps.map(step => 
    typeof step === 'string' ? { title: step } : step
  );

  if (normalizedSteps.length === 0) {
    return null;
  }

  if (variant === 'horizontal') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Horizontal connector line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-border hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
              {normalizedSteps.slice(0, 4).map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center">
                  {/* Step number */}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold z-10",
                    step.isCompleted 
                      ? "bg-success text-success-foreground" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {/* Step content */}
                  <div className="mt-3 px-2">
                    <p className="text-sm font-medium">{step.title}</p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {normalizedSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5",
                  step.isCompleted 
                    ? "bg-success/20 text-success" 
                    : "bg-primary/10 text-primary"
                )}>
                  {step.isCompleted ? '✓' : i + 1}
                </span>
                <div>
                  <p className="text-sm text-foreground">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  // Default: vertical with connecting line
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical connector line */}
          {normalizedSteps.length > 1 && (
            <div 
              className="absolute left-[11px] top-3 w-0.5 bg-border" 
              style={{ height: `calc(100% - 24px)` }}
            />
          )}
          
          <div className="space-y-4">
            {normalizedSteps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-4">
                {/* Step number */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold z-10 shrink-0",
                  step.isCompleted 
                    ? "bg-success text-success-foreground" 
                    : "bg-primary text-primary-foreground"
                )}>
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                
                {/* Step content */}
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium leading-relaxed">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
