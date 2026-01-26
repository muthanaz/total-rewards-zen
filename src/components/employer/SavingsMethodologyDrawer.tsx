/**
 * SavingsMethodologyDrawer
 * 
 * Detailed explanation of how savings are calculated.
 * Linked from KPI cards and glossary.
 */

import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calculator, 
  Database, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  PiggyBank,
  Percent,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SavingsMethodologyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAVINGS_TYPES = [
  {
    type: 'Discount Savings',
    typeAr: 'توفيرات الخصم',
    description: 'Amount saved when an employee uses a percentage discount on a purchase.',
    descriptionAr: 'المبلغ المحفوظ عندما يستخدم الموظف خصمًا مئويًا على عملية شراء.',
    formula: 'Transaction Amount × Discount %',
    formulaAr: 'مبلغ المعاملة × نسبة الخصم',
    icon: Percent,
    included: true,
  },
  {
    type: 'Cashback',
    typeAr: 'استرداد نقدي',
    description: 'Money returned to employee after a qualifying purchase.',
    descriptionAr: 'الأموال المعادة للموظف بعد عملية شراء مؤهلة.',
    formula: 'Actual cashback credited',
    formulaAr: 'الاسترداد الفعلي المقيد',
    icon: Receipt,
    included: true,
  },
  {
    type: 'Avoided Cost',
    typeAr: 'التكلفة المتجنبة',
    description: 'Estimated savings from free or subsidized services (e.g., free gym membership).',
    descriptionAr: 'التوفيرات المقدرة من الخدمات المجانية أو المدعومة (مثل عضوية الجيم المجانية).',
    formula: 'Market rate – Employee cost',
    formulaAr: 'سعر السوق - تكلفة الموظف',
    icon: PiggyBank,
    included: false,
    note: 'Not included by default (requires market rate data)',
    noteAr: 'غير مشمول بشكل افتراضي (يتطلب بيانات أسعار السوق)',
  },
];

const DATA_SOURCES = [
  {
    source: 'Vendor API',
    sourceAr: 'واجهة برمجة المورد',
    description: 'Real-time activation and redemption data from connected vendors',
    descriptionAr: 'بيانات التفعيل والاسترداد في الوقت الفعلي من الموردين المتصلين',
    reliability: 'high' as const,
  },
  {
    source: 'Offer Discount %',
    sourceAr: 'نسبة خصم العرض',
    description: 'Discount percentage configured for each marketplace offer',
    descriptionAr: 'نسبة الخصم المكونة لكل عرض في السوق',
    reliability: 'high' as const,
  },
  {
    source: 'Avg Transaction Value',
    sourceAr: 'متوسط قيمة المعاملة',
    description: 'Estimated average purchase amount (AED 500 default)',
    descriptionAr: 'متوسط مبلغ الشراء المقدر (500 درهم افتراضيًا)',
    reliability: 'estimated' as const,
  },
];

export function SavingsMethodologyDrawer({ 
  open, 
  onOpenChange,
}: SavingsMethodologyDrawerProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isRTL ? 'left' : 'right'} className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className={cn('pb-4', isRTL && 'text-right')}>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg">
                {t('Savings Methodology', 'منهجية التوفيرات')}
              </SheetTitle>
              <SheetDescription>
                {t('How marketplace savings are calculated', 'كيف يتم حساب توفيرات السوق')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Definition */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <h4 className={cn(
                'font-semibold text-sm flex items-center gap-2 mb-2',
                isRTL && 'flex-row-reverse'
              )}>
                <FileText className="w-4 h-4 text-muted-foreground" />
                {t('What "Savings" Means', 'ما تعنيه "التوفيرات"')}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t(
                  'Total Savings represents the cumulative monetary value employees saved by using marketplace offers, calculated from discount percentages and estimated transaction values.',
                  'تمثل إجمالي التوفيرات القيمة النقدية التراكمية التي وفرها الموظفون باستخدام عروض السوق، محسوبة من نسب الخصم وقيم المعاملات المقدرة.'
                )}
              </p>
            </CardContent>
          </Card>

          {/* Savings Types */}
          <div>
            <h4 className={cn(
              'font-semibold text-sm mb-3',
              isRTL && 'text-right'
            )}>
              {t('Types of Savings', 'أنواع التوفيرات')}
            </h4>
            <div className="space-y-3">
              {SAVINGS_TYPES.map((type, idx) => {
                const Icon = type.icon;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      'p-3 rounded-lg border',
                      type.included ? 'bg-success/5 border-success/20' : 'bg-muted/30 border-border'
                    )}
                  >
                    <div className={cn(
                      'flex items-start gap-3',
                      isRTL && 'flex-row-reverse'
                    )}>
                      <div className={cn(
                        'p-1.5 rounded-md',
                        type.included ? 'bg-success/10' : 'bg-muted'
                      )}>
                        <Icon className={cn(
                          'w-4 h-4',
                          type.included ? 'text-success' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className={cn('flex-1', isRTL && 'text-right')}>
                        <div className={cn(
                          'flex items-center gap-2 flex-wrap',
                          isRTL && 'flex-row-reverse'
                        )}>
                          <span className="font-medium text-sm">
                            {t(type.type, type.typeAr)}
                          </span>
                          {type.included ? (
                            <Badge variant="outline" className="text-xs text-success border-success/30 gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('Included', 'مشمول')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                              <XCircle className="w-3 h-3" />
                              {t('Not Included', 'غير مشمول')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(type.description, type.descriptionAr)}
                        </p>
                        <div className={cn(
                          'flex items-center gap-1.5 mt-2 text-xs',
                          isRTL && 'flex-row-reverse'
                        )}>
                          <Calculator className="w-3 h-3 text-muted-foreground" />
                          <code className="px-1.5 py-0.5 bg-muted rounded text-[11px]">
                            {t(type.formula, type.formulaAr)}
                          </code>
                        </div>
                        {type.note && (
                          <p className="text-xs text-warning mt-1.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t(type.note, type.noteAr || type.note)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Calculation Approach */}
          <div>
            <h4 className={cn(
              'font-semibold text-sm mb-3',
              isRTL && 'text-right'
            )}>
              {t('Calculation Approach', 'طريقة الحساب')}
            </h4>
            <div className="p-4 rounded-lg bg-muted/30 border">
              <div className="space-y-3 text-sm">
                <div className={cn('flex items-start gap-2', isRTL && 'flex-row-reverse')}>
                  <span className="text-muted-foreground shrink-0">1.</span>
                  <p className={isRTL ? 'text-right' : ''}>
                    {t(
                      'For each offer activation, we take the offer\'s discount percentage',
                      'لكل تفعيل عرض، نأخذ نسبة خصم العرض'
                    )}
                  </p>
                </div>
                <div className={cn('flex items-start gap-2', isRTL && 'flex-row-reverse')}>
                  <span className="text-muted-foreground shrink-0">2.</span>
                  <p className={isRTL ? 'text-right' : ''}>
                    {t(
                      'Multiply by estimated average transaction value (AED 500)',
                      'نضرب في متوسط قيمة المعاملة المقدرة (500 درهم)'
                    )}
                  </p>
                </div>
                <div className={cn('flex items-start gap-2', isRTL && 'flex-row-reverse')}>
                  <span className="text-muted-foreground shrink-0">3.</span>
                  <p className={isRTL ? 'text-right' : ''}>
                    {t(
                      'Sum across all activations for total savings',
                      'نجمع عبر جميع التفعيلات لإجمالي التوفيرات'
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-md bg-accent/10 border border-accent/20">
                <code className="text-xs">
                  Total Savings = Σ (Discount % × AED 500)
                </code>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data Sources */}
          <div>
            <h4 className={cn(
              'font-semibold text-sm mb-3 flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}>
              <Database className="w-4 h-4 text-muted-foreground" />
              {t('Data Sources', 'مصادر البيانات')}
            </h4>
            <div className="space-y-2">
              {DATA_SOURCES.map((source, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg border',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div className={cn('flex-1', isRTL && 'text-right')}>
                    <p className="text-sm font-medium">
                      {t(source.source, source.sourceAr)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(source.description, source.descriptionAr)}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      source.reliability === 'high' 
                        ? 'text-success border-success/30' 
                        : 'text-warning border-warning/30'
                    )}
                  >
                    {source.reliability === 'high' 
                      ? t('Measured', 'مقاس')
                      : t('Estimated', 'مقدر')
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
            <h4 className={cn(
              'font-semibold text-sm mb-2 flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}>
              <AlertTriangle className="w-4 h-4 text-warning" />
              {t('What\'s NOT Included', 'ما هو غير مشمول')}
            </h4>
            <ul className={cn(
              'space-y-1 text-sm text-muted-foreground',
              isRTL ? 'pr-5 text-right' : 'pl-5'
            )}>
              <li className="list-disc">{t('Actual transaction amounts (only estimated)', 'مبالغ المعاملات الفعلية (مقدرة فقط)')}</li>
              <li className="list-disc">{t('Avoided costs from free services', 'التكاليف المتجنبة من الخدمات المجانية')}</li>
              <li className="list-disc">{t('Non-monetary benefits (e.g., priority access)', 'المزايا غير النقدية (مثل الوصول ذو الأولوية)')}</li>
              <li className="list-disc">{t('Offers without discount percentages', 'العروض بدون نسب خصم')}</li>
            </ul>
          </div>

          {/* Confidence Note */}
          <div className={cn(
            'p-3 rounded-lg bg-muted/30 flex items-start gap-2',
            isRTL && 'flex-row-reverse'
          )}>
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className={cn('text-xs text-muted-foreground', isRTL && 'text-right')}>
              {t(
                'To improve accuracy, connect vendor APIs that provide actual transaction data. This upgrades savings from "Estimated" to "Measured" confidence.',
                'لتحسين الدقة، اربط واجهات برمجة الموردين التي توفر بيانات المعاملات الفعلية. هذا يرقي التوفيرات من "مقدرة" إلى "مقاسة".'
              )}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SavingsMethodologyDrawer;
