/**
 * Profile Data Banner
 * 
 * Shows a clear banner when missing key profile data affects entitlement accuracy.
 * Provides a direct link to fix the profile.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, User, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProfileDataBannerProps {
  missingFields: string[];
  completenessPercent: number;
  affectedBenefits?: string[];
  isRTL?: boolean;
  className?: string;
  dismissible?: boolean;
}

const fieldLabels: Record<string, { en: string; ar: string }> = {
  'Emirates ID': { en: 'Emirates ID', ar: 'الهوية الإماراتية' },
  'Phone Number': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'date_of_birth': { en: 'Date of Birth', ar: 'تاريخ الميلاد' },
  'nationality': { en: 'Nationality', ar: 'الجنسية' },
  'dependents': { en: 'Dependents', ar: 'المعالين' },
  'grade': { en: 'Grade Level', ar: 'الدرجة الوظيفية' },
  'location': { en: 'Work Location', ar: 'موقع العمل' },
  'marital_status': { en: 'Marital Status', ar: 'الحالة الاجتماعية' },
  'children': { en: 'Children Information', ar: 'معلومات الأطفال' },
  'bank_account': { en: 'Bank Account', ar: 'الحساب البنكي' },
};

export function ProfileDataBanner({
  missingFields,
  completenessPercent,
  affectedBenefits,
  isRTL = false,
  className,
  dismissible = false,
}: ProfileDataBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if profile is reasonably complete or no critical fields missing
  if (dismissed || completenessPercent >= 90 || missingFields.length === 0) {
    return null;
  }

  const isCritical = completenessPercent < 60;
  const getFieldLabel = (field: string) => {
    const label = fieldLabels[field];
    if (label) return isRTL ? label.ar : label.en;
    return field;
  };

  return (
    <Card className={cn(
      "border-warning/30",
      isCritical ? "bg-warning/8" : "bg-warning/5",
      className
    )}>
      <CardContent className="p-4">
        <div className={cn(
          "flex flex-col md:flex-row md:items-center justify-between gap-4",
          isRTL && "md:flex-row-reverse"
        )}>
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className={cn(isRTL && "text-right")}>
              <h3 className="font-semibold text-sm text-foreground">
                {isRTL 
                  ? 'بيانات الملف الشخصي غير مكتملة'
                  : 'Profile data incomplete'
                }
              </h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                {isRTL 
                  ? 'بعض قيم الاستحقاق قد تكون تقديرية بسبب نقص المعلومات'
                  : 'Some entitlement values may be estimated due to missing information'
                }
              </p>
              <div className={cn("flex items-center gap-2 flex-wrap mt-2", isRTL && "flex-row-reverse")}>
                <span className="text-[12px] text-muted-foreground">
                  {isRTL ? 'المفقود:' : 'Missing:'}
                </span>
                {missingFields.slice(0, 3).map((field) => (
                  <Badge 
                    key={field}
                    variant="outline" 
                    className="text-[11px] bg-warning/10 text-warning border-warning/20"
                  >
                    {getFieldLabel(field)}
                  </Badge>
                ))}
                {missingFields.length > 3 && (
                  <Badge variant="outline" className="text-[11px]">
                    +{missingFields.length - 3} {isRTL ? 'أخرى' : 'more'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Link to="/employee/profile">
              <Button size="sm" className="h-9 gap-2">
                <User className="w-4 h-4" />
                {isRTL ? 'تحديث الملف الشخصي' : 'Fix Profile'}
                <ArrowRight className={cn("w-4 h-4", isRTL && "rotate-180")} />
              </Button>
            </Link>
            {dismissible && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0"
                onClick={() => setDismissed(true)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
