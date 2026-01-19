import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ProfileCompletenessProps {
  firstName: string;
  completenessPercent: number;
  missingFields: string[];
  isRTL?: boolean;
  className?: string;
}

export function ProfileCompleteness({
  firstName,
  completenessPercent,
  missingFields,
  isRTL = false,
  className,
}: ProfileCompletenessProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isRTL ? 'صباح الخير' : 'Good morning';
    if (hour < 17) return isRTL ? 'مساء الخير' : 'Good afternoon';
    return isRTL ? 'مساء الخير' : 'Good evening';
  };

  const isComplete = completenessPercent >= 100;

  if (isComplete) {
    return (
      <div className={cn("flex items-center justify-between", className, isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-lg">
              {firstName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className={cn(isRTL && "text-right")}>
            <h2 className="text-xl font-display font-bold">
              {getGreeting()}, {firstName || (isRTL ? 'مستخدم' : 'User')}!
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إليك نظرة عامة على مزاياك' : "Here's your benefits overview"}
            </p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 text-sm text-success", isRTL && "flex-row-reverse")}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{isRTL ? 'الملف الشخصي مكتمل' : 'Profile complete'}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-warning/20 bg-gradient-to-r from-card to-warning/5", className)}>
      <CardContent className="p-4">
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">
                {firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className={cn(isRTL && "text-right")}>
              <h2 className="text-xl font-display font-bold">
                {getGreeting()}, {firstName || (isRTL ? 'مستخدم' : 'User')}!
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? `ملفك الشخصي مكتمل بنسبة ${completenessPercent}%`
                  : `Your profile is ${completenessPercent}% complete`
                }
              </p>
            </div>
          </div>
          
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-32">
              <Progress value={completenessPercent} className="h-2 [&>div]:bg-warning" />
            </div>
            <Link to="/employee/profile">
              <Button size="sm" variant="outline" className={cn("gap-1", isRTL && "flex-row-reverse")}>
                <User className="w-3.5 h-3.5" />
                {isRTL ? 'إكمال الملف' : 'Complete Profile'}
                <ChevronRight className={cn("w-3.5 h-3.5", isRTL && "rotate-180")} />
              </Button>
            </Link>
          </div>
        </div>
        
        {missingFields.length > 0 && missingFields.length <= 3 && (
          <p className={cn("text-xs text-muted-foreground mt-3", isRTL && "text-right")}>
            {isRTL ? 'مطلوب: ' : 'Missing: '}
            {missingFields.slice(0, 3).join(', ')}
            {missingFields.length > 3 && (isRTL ? ` و${missingFields.length - 3} أخرى` : ` +${missingFields.length - 3} more`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
