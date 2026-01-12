import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
  { label: 'Contains special character (!@#$%^&*)', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const analysis = useMemo(() => {
    const passed = requirements.filter(req => req.test(password));
    const score = passed.length;
    const percentage = (score / requirements.length) * 100;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = 'bg-destructive';
    
    if (score >= 5) {
      strength = 'strong';
      color = 'bg-green-500';
    } else if (score >= 4) {
      strength = 'good';
      color = 'bg-blue-500';
    } else if (score >= 3) {
      strength = 'fair';
      color = 'bg-yellow-500';
    }
    
    return { passed, score, percentage, strength, color };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength meter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span className={cn(
            'font-medium capitalize',
            analysis.strength === 'strong' && 'text-green-500',
            analysis.strength === 'good' && 'text-blue-500',
            analysis.strength === 'fair' && 'text-yellow-500',
            analysis.strength === 'weak' && 'text-destructive'
          )}>
            {analysis.strength}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-300', analysis.color)}
            style={{ width: `${analysis.percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const isPassed = req.test(password);
          return (
            <div 
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                isPassed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}
            >
              {isPassed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getPasswordStrength(password: string): number {
  return requirements.filter(req => req.test(password)).length;
}

export function isPasswordStrong(password: string): boolean {
  return getPasswordStrength(password) >= 4;
}
