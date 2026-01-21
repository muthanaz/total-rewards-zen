/**
 * OfferReviewPanel
 * 
 * Evidence-first review panel for offer submissions.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tag, 
  Calendar, 
  Percent, 
  AlertTriangle,
  CheckCircle,
  Store,
  Users,
  Clock,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface ValidationCheck {
  id: string;
  name: string;
  nameAr: string;
  status: 'pass' | 'warning' | 'fail';
  message?: string;
}

interface OfferReviewPanelProps {
  offerName: string;
  offerDetails: {
    discount?: string;
    originalPrice?: number;
    discountedPrice?: number;
    validFrom?: Date;
    validTo?: Date;
    terms?: string;
    category?: string;
    targetAudience?: string;
  };
  vendorContext: {
    name: string;
    status: 'active' | 'pending' | 'suspended';
    totalOffers: number;
    avgRating: number;
  };
}

const VALIDATION_CHECKS: ValidationCheck[] = [
  { id: '1', name: 'Discount Value', nameAr: 'قيمة الخصم', status: 'pass', message: 'Within acceptable range (10-50%)' },
  { id: '2', name: 'Validity Period', nameAr: 'فترة الصلاحية', status: 'pass', message: 'Valid date range set' },
  { id: '3', name: 'Terms & Conditions', nameAr: 'الشروط والأحكام', status: 'warning', message: 'Terms are brief - consider expanding' },
  { id: '4', name: 'Category Mapping', nameAr: 'تصنيف الفئة', status: 'pass', message: 'Correctly categorized' },
  { id: '5', name: 'Pricing Logic', nameAr: 'منطق التسعير', status: 'pass', message: 'Original > Discounted price verified' },
];

export function OfferReviewPanel({ 
  offerName,
  offerDetails = {},
  vendorContext = { name: 'Demo Vendor', status: 'active', totalOffers: 12, avgRating: 4.5 },
}: OfferReviewPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const passCount = VALIDATION_CHECKS.filter(c => c.status === 'pass').length;
  const validationScore = Math.round((passCount / VALIDATION_CHECKS.length) * 100);

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const vendorStatusColor = {
    active: 'bg-success/10 text-success border-success/30',
    pending: 'bg-warning/10 text-warning border-warning/30',
    suspended: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-4">
      {/* Offer Preview */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
          <div className="text-center">
            <Badge className="mb-2 bg-success text-success-foreground">
              <Percent className="w-3 h-3 me-1" />
              {offerDetails.discount || '25% OFF'}
            </Badge>
            <h3 className="font-semibold text-lg">{offerName}</h3>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span>{offerDetails.category || 'Wellness'}</span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{offerDetails.targetAudience || 'All Employees'}</span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {offerDetails.validFrom 
                  ? format(offerDetails.validFrom, 'MMM d') 
                  : 'Jan 1'} - {offerDetails.validTo 
                  ? format(offerDetails.validTo, 'MMM d') 
                  : 'Dec 31'}
              </span>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>90 {t('days remaining', 'أيام متبقية')}</span>
            </div>
          </div>

          {offerDetails.terms && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {offerDetails.terms}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Checks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>{t('Validation Checks', 'فحوصات التحقق')}</span>
            <Badge variant={validationScore === 100 ? 'default' : 'secondary'}>
              {passCount}/{VALIDATION_CHECKS.length} {t('Passed', 'ناجح')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {VALIDATION_CHECKS.map((check) => (
              <div
                key={check.id}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg",
                  check.status === 'fail' ? "bg-destructive/5" : "bg-muted/30",
                  isRTL && "flex-row-reverse"
                )}
              >
                {getStatusIcon(check.status)}
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <p className="text-sm font-medium">
                    {language === 'ar' ? check.nameAr : check.name}
                  </p>
                  {check.message && (
                    <p className="text-xs text-muted-foreground">{check.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Context */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('Vendor Context', 'سياق البائع')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-muted">
              <Store className="w-4 h-4" />
            </div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <p className="font-medium">{vendorContext.name}</p>
              <div className={cn("flex items-center gap-2 mt-0.5", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className={vendorStatusColor[vendorContext.status]}>
                  {vendorContext.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {vendorContext.totalOffers} {t('offers', 'عروض')} · ⭐ {vendorContext.avgRating}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
