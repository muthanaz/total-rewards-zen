import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface GuideStep {
  title: string;
  description: string;
  highlight?: string;
}

interface BenefitGuideProps {
  icon: LucideIcon;
  title: string;
  steps: GuideStep[];
  policyPoints: string[];
  policyButtonText: string;
  onViewPolicy?: () => void;
  className?: string;
}

export function BenefitGuide({
  icon: Icon,
  title,
  steps,
  policyPoints,
  policyButtonText,
  onViewPolicy,
  className,
}: BenefitGuideProps) {
  return (
    <Card className={cn("border-accent/30 bg-gradient-to-br from-accent/5 via-transparent to-transparent", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Icon className="w-5 h-5 text-accent" />
            {title}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewPolicy}
            className="shrink-0 gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {policyButtonText}
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How It Works Steps */}
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.highlight ? (
                    <>
                      {step.description.split(step.highlight)[0]}
                      <span className="font-semibold text-accent">{step.highlight}</span>
                      {step.description.split(step.highlight)[1]}
                    </>
                  ) : (
                    step.description
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Policy Key Points */}
        <div className="pt-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Key Policy Points</p>
          <ul className="grid md:grid-cols-2 gap-2">
            {policyPoints.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
