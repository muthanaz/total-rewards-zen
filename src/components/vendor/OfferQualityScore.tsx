import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Image,
  FileText,
  Tag,
  Calendar,
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ComplianceItem {
  id: string;
  label: string;
  labelAr: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
  icon: typeof CheckCircle2;
}

interface OfferQualityScoreProps {
  offerId?: string;
  offerTitle?: string;
}

const complianceItems: ComplianceItem[] = [
  { id: 'title', label: 'Clear offer title', labelAr: 'عنوان واضح للعرض', status: 'pass', icon: Tag },
  { id: 'description', label: 'Detailed description (50+ chars)', labelAr: 'وصف مفصل (٥٠+ حرف)', status: 'pass', icon: FileText },
  { id: 'image', label: 'High-quality image uploaded', labelAr: 'صورة عالية الجودة مرفوعة', status: 'pass', icon: Image },
  { id: 'terms', label: 'Terms & conditions specified', labelAr: 'الشروط والأحكام محددة', status: 'warning', details: 'Consider adding more details', icon: FileText },
  { id: 'expiry', label: 'Valid expiration date', labelAr: 'تاريخ انتهاء صالح', status: 'pass', icon: Calendar },
  { id: 'discount', label: 'Discount value clearly stated', labelAr: 'قيمة الخصم واضحة', status: 'pass', icon: DollarSign },
  { id: 'category', label: 'Correct category assigned', labelAr: 'الفئة الصحيحة محددة', status: 'pass', icon: Tag },
  { id: 'redemption', label: 'Redemption instructions clear', labelAr: 'تعليمات الاسترداد واضحة', status: 'fail', details: 'Add step-by-step redemption guide', icon: FileText },
];

const optimizationTips = [
  {
    id: 'tip1',
    title: 'Add a redemption guide',
    titleAr: 'أضف دليل الاسترداد',
    description: 'Offers with clear redemption steps see 23% higher conversion rates',
    descriptionAr: 'العروض مع خطوات استرداد واضحة تحقق معدلات تحويل أعلى بنسبة ٢٣٪',
    impact: '+23% conversion',
    priority: 'high',
  },
  {
    id: 'tip2',
    title: 'Expand terms & conditions',
    titleAr: 'وسع الشروط والأحكام',
    description: 'Detailed T&C reduces support tickets by 35%',
    descriptionAr: 'الشروط والأحكام المفصلة تقلل تذاكر الدعم بنسبة ٣٥٪',
    impact: '-35% support load',
    priority: 'medium',
  },
  {
    id: 'tip3',
    title: 'Add lifestyle image',
    titleAr: 'أضف صورة نمط حياة',
    description: 'Lifestyle images outperform product-only images by 18%',
    descriptionAr: 'صور نمط الحياة تتفوق على صور المنتج فقط بنسبة ١٨٪',
    impact: '+18% engagement',
    priority: 'low',
  },
];

export function OfferQualityScore({ offerId, offerTitle }: OfferQualityScoreProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Calculate quality score
  const passCount = complianceItems.filter(i => i.status === 'pass').length;
  const warningCount = complianceItems.filter(i => i.status === 'warning').length;
  const failCount = complianceItems.filter(i => i.status === 'fail').length;
  const qualityScore = Math.round(((passCount + warningCount * 0.5) / complianceItems.length) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 70) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'fail': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quality Score Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Star className="w-5 h-5 text-accent" />
                {t('Offer Quality Score', 'نقاط جودة العرض')}
              </CardTitle>
              <CardDescription>
                {offerTitle || t('Compliance checklist for your offer', 'قائمة التحقق من الامتثال لعرضك')}
              </CardDescription>
            </div>
            <div className={cn("text-center p-4 rounded-xl", getScoreBgColor(qualityScore))}>
              <p className={cn("text-3xl font-bold", getScoreColor(qualityScore))}>{qualityScore}</p>
              <p className="text-xs text-muted-foreground">/100</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className={cn("flex items-center gap-4 mb-4 pb-4 border-b border-border/60", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">{passCount} {t('Passed', 'ناجح')}</span>
            </div>
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium">{warningCount} {t('Warnings', 'تحذيرات')}</span>
            </div>
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium">{failCount} {t('Failed', 'فاشل')}</span>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="space-y-2">
            {complianceItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border border-border/60",
                    item.status === 'fail' && "bg-destructive/5 border-destructive/20",
                    item.status === 'warning' && "bg-warning/5 border-warning/20",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="p-1.5 rounded-md bg-muted">
                      <ItemIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {language === 'ar' ? item.labelAr : item.label}
                      </p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground">{item.details}</p>
                      )}
                    </div>
                  </div>
                  {getStatusIcon(item.status)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Optimization Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Sparkles className="w-5 h-5 text-accent" />
            {t('AI Optimization Tips', 'نصائح التحسين بالذكاء الاصطناعي')}
          </CardTitle>
          <CardDescription>
            {t('Data-driven suggestions to improve your offer performance', 'اقتراحات مبنية على البيانات لتحسين أداء عرضك')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimizationTips.map((tip) => (
              <div 
                key={tip.id}
                className={cn(
                  "p-4 rounded-xl border border-border/60 hover:border-accent/30 hover:bg-muted/30 transition-all",
                  isRTL && "text-right"
                )}
              >
                <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                  <div className="flex-1">
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <Badge variant="outline" className={getPriorityColor(tip.priority)}>
                        {tip.priority}
                      </Badge>
                      <h4 className="font-semibold text-sm">
                        {language === 'ar' ? tip.titleAr : tip.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ar' ? tip.descriptionAr : tip.description}
                    </p>
                  </div>
                  <div className={cn("text-right", isRTL && "text-left")}>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      {tip.impact}
                    </Badge>
                    <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs w-full">
                      {t('Apply', 'تطبيق')}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
