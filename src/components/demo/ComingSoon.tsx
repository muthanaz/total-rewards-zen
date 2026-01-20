import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Lock, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComingSoonProps {
  title: string;
  description: string;
  phase?: 'Phase 2' | 'Phase 3' | 'Coming Soon';
  expectedDate?: string;
  features?: string[];
  icon?: LucideIcon;
  className?: string;
  compact?: boolean;
}

export function ComingSoon({
  title,
  description,
  phase = 'Coming Soon',
  expectedDate,
  features,
  icon: Icon = Sparkles,
  className,
  compact = false,
}: ComingSoonProps) {
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-dashed border-border',
        className
      )}>
        <Lock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{title}</span>
        <Badge variant="outline" className="text-[10px] bg-muted border-0">
          {phase}
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full', className)}
    >
      <Card className="border-dashed border-2 border-border/60 bg-gradient-to-br from-muted/30 to-muted/10">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6"
          >
            <Icon className="w-8 h-8 text-accent" />
          </motion.div>

          <Badge variant="outline" className="mb-4 bg-accent/10 text-accent border-accent/30">
            <Clock className="w-3 h-3 mr-1.5" />
            {phase}
          </Badge>

          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            {title}
          </h3>
          
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {description}
          </p>

          {features && features.length > 0 && (
            <div className="bg-card rounded-xl p-4 max-w-sm mx-auto mb-6 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Planned Features
              </p>
              <ul className="space-y-2 text-left">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {expectedDate && (
            <p className="text-xs text-muted-foreground">
              Expected: <span className="font-medium">{expectedDate}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Wrapper to conditionally show Coming Soon or children
interface FeatureGateProps {
  children: ReactNode;
  isReady?: boolean;
  fallback: ComingSoonProps;
}

export function FeatureGate({ children, isReady = true, fallback }: FeatureGateProps) {
  if (!isReady) {
    return <ComingSoon {...fallback} />;
  }
  return <>{children}</>;
}

// Badge for inline "Coming Soon" indicators
interface ComingSoonBadgeProps {
  phase?: 'Phase 2' | 'Phase 3' | 'Coming Soon';
  className?: string;
}

export function ComingSoonBadge({ phase = 'Coming Soon', className }: ComingSoonBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-[10px] bg-muted/50 text-muted-foreground border-dashed',
        className
      )}
    >
      <Lock className="w-2.5 h-2.5 mr-1" />
      {phase}
    </Badge>
  );
}
