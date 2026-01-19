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
      <div className={cn("flex items-center justify-between py-1", className, isRTL && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-sm">
            <span className="text-accent-foreground font-bold text-xl">
              {firstName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className={cn(isRTL && "text-right")}>
            <h2 className="text-2xl font-display font-bold tracking-tight">
              {getGreeting()}, {firstName || (isRTL ? 'مستخدم' : 'User')}!
            </h2>
            <p className="text-[14px] text-muted-foreground mt-0.5">
              {isRTL ? 'إليك نظرة عامة على مزاياك' : "Here's your benefits overview"}
            </p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 text-[13px] text-success", isRTL && "flex-row-reverse")}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-medium">{isRTL ? 'الملف الشخصي مكتمل' : 'Profile complete'}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-warning/15 bg-gradient-to-r from-card to-warning/3", className)}>
      <CardContent className="p-5">
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-5", isRTL && "md:flex-row-reverse")}>
          <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-sm">
              <span className="text-accent-foreground font-bold text-xl">
                {firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className={cn(isRTL && "text-right")}>
              <h2 className="text-2xl font-display font-bold tracking-tight">
                {getGreeting()}, {firstName || (isRTL ? 'مستخدم' : 'User')}!
              </h2>
              <p className="text-[14px] text-muted-foreground mt-0.5">
                {isRTL 
                  ? `ملفك الشخصي مكتمل بنسبة ${completenessPercent}%`
                  : `Your profile is ${completenessPercent}% complete`
                }
              </p>
            </div>
          </div>
          
          <div className={cn("flex items-center gap-5", isRTL && "flex-row-reverse")}>
            <div className="w-36">
              <Progress value={completenessPercent} className="h-1.5 [&>div]:bg-warning" />
            </div>
            <Link to="/employee/profile">
              <Button size="sm" variant="outline" className={cn("gap-2 h-9 text-[13px]", isRTL && "flex-row-reverse")}>
                <User className="w-4 h-4" />
                {isRTL ? 'إكمال الملف' : 'Complete Profile'}
                <ChevronRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              </Button>
            </Link>
          </div>
        </div>
        
        {missingFields.length > 0 && missingFields.length <= 3 && (
          <p className={cn("text-[13px] text-muted-foreground mt-4", isRTL && "text-right")}>
            {isRTL ? 'مطلوب: ' : 'Missing: '}
            {missingFields.slice(0, 3).join(', ')}
            {missingFields.length > 3 && (isRTL ? ` و${missingFields.length - 3} أخرى` : ` +${missingFields.length - 3} more`)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
