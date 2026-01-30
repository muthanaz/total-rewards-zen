/**
 * PolicyHighlightsBullets
 * 
 * Simple bullet-point policy highlights with checkmarks.
 * Clean 2-column grid layout matching the reference design.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, Lightbulb, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PolicyHighlight {
  /** Text content */
  text: string;
  /** Optional icon type: 'check' (default), 'tip', 'warning' */
  type?: 'check' | 'tip' | 'warning';
}

export interface PolicyHighlightsBulletsProps {
  /** Array of policy highlight strings or objects */
  highlights: (string | PolicyHighlight)[];
  /** Show submit claim button */
  showSubmitClaim?: boolean;
  /** Show view policy button */
  showViewPolicy?: boolean;
  /** Callback for submit claim */
  onSubmitClaim?: () => void;
  /** Callback for view policy */
  onViewPolicy?: () => void;
  /** Custom className */
  className?: string;
}

export function PolicyHighlightsBullets({
  highlights,
  showSubmitClaim = false,
  showViewPolicy = true,
  onSubmitClaim,
  onViewPolicy,
  className,
}: PolicyHighlightsBulletsProps) {
  // Normalize highlights to objects
  const normalizedHighlights: PolicyHighlight[] = highlights.map(h =>
    typeof h === 'string' ? { text: h, type: 'check' } : h
  );

  if (normalizedHighlights.length === 0) {
    return null;
  }

  const getIcon = (type: PolicyHighlight['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'warning':
        return <FileWarning className="w-4 h-4 text-orange-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Policy Highlights
          </CardTitle>
          <div className="flex items-center gap-2">
            {showSubmitClaim && (
              <Button size="sm" onClick={onSubmitClaim}>
                <FileText className="w-4 h-4 mr-1.5" />
                Submit Claim
              </Button>
            )}
            {showViewPolicy && (
              <Button variant="outline" size="sm" onClick={onViewPolicy}>
                View Full Policy
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {normalizedHighlights.map((highlight, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1">
              <span className="mt-0.5 shrink-0">
                {getIcon(highlight.type)}
              </span>
              <span className="text-sm text-foreground leading-relaxed">
                {highlight.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}