import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Send } from 'lucide-react';
import { SubmitClaimButton } from './SubmitClaimButton';
import { cn } from '@/lib/utils';

interface PolicyHighlightsCardProps {
  title?: string;
  policies: string[];
  category: string;
  actionLabel?: string;
  policyLabel?: string;
  showClaimButton?: boolean;
  isRTL?: boolean;
  className?: string;
}

export function PolicyHighlightsCard({
  title = 'Policy Highlights',
  policies,
  category,
  actionLabel = 'Submit Claim',
  policyLabel = 'View Full Policy',
  showClaimButton = true,
  isRTL = false,
  className,
}: PolicyHighlightsCardProps) {
  return (
    <Card className={cn("relative", className)}>
      <CardHeader className="pb-3">
        <div className={cn(
          "flex items-start justify-between gap-4",
          isRTL && "flex-row-reverse"
        )}>
          <CardTitle className={cn(
            "text-base font-display flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <FileText className="w-5 h-5 text-accent" />
            {title}
          </CardTitle>
          <div className={cn(
            "flex items-center gap-2 shrink-0",
            isRTL && "flex-row-reverse"
          )}>
            {showClaimButton && (
              <SubmitClaimButton 
                category={category} 
                buttonText={actionLabel}
                buttonSize="sm"
              />
            )}
            <Button variant="outline" size="sm">
              {policyLabel}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className={cn(
          "grid md:grid-cols-2 gap-2 text-sm text-muted-foreground",
          isRTL && "text-right"
        )}>
          {policies.map((policy, index) => (
            <li 
              key={index} 
              className={cn(
                "flex items-start gap-2",
                isRTL && "flex-row-reverse"
              )}
            >
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              {policy}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
