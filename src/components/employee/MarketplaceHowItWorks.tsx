import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Ticket, CheckCircle, Gift, Building2, Info, 
  Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MarketplaceHowItWorksProps {
  sponsoredCount: number;
  publicCount: number;
  className?: string;
}

export function MarketplaceHowItWorks({ 
  sponsoredCount, 
  publicCount, 
  className 
}: MarketplaceHowItWorksProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const steps = [
    {
      icon: Search,
      title: t('Browse Perks', 'تصفح الامتيازات'),
      description: t('Explore curated offers from verified partners', 'استكشف العروض المختارة من شركاء موثوقين'),
      color: 'from-info/20 to-info/5',
      iconColor: 'text-info',
    },
    {
      icon: Ticket,
      title: t('Activate Offer', 'تفعيل العرض'),
      description: t('Click activate to get your unique voucher code', 'انقر على تفعيل للحصول على رمز القسيمة الخاص بك'),
      color: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      icon: CheckCircle,
      title: t('Redeem & Save', 'استرداد ووفّر'),
      description: t('Use your code at the partner to enjoy the discount', 'استخدم رمزك لدى الشريك للاستمتاع بالخصم'),
      color: 'from-success/20 to-success/5',
      iconColor: 'text-success',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* How It Works Steps */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className={cn('flex items-center gap-2 mb-4', isRTL && 'flex-row-reverse')}>
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Info className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-semibold text-sm">
              {t('How Perks Work', 'كيف تعمل الامتيازات')}
            </h3>
          </div>

          <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', isRTL && 'md:flex-row-reverse')}>
            {steps.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  'relative flex items-start gap-3 p-3 rounded-lg',
                  `bg-gradient-to-br ${step.color}`,
                  isRTL && 'flex-row-reverse'
                )}
              >
                <div className={cn(
                  'shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm',
                )}>
                  <step.icon className={cn('w-4 h-4', step.iconColor)} />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {t('STEP', 'الخطوة')} {index + 1}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 hidden md:block',
                    isRTL ? '-left-4 rotate-180' : '-right-4'
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offer Types Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sponsored Offers */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
              <div className="shrink-0 p-2 rounded-lg bg-accent/10">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div className={cn('flex-1', isRTL && 'text-right')}>
                <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                  <h4 className="font-semibold text-sm">{t('Employer-Sponsored', 'برعاية صاحب العمل')}</h4>
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">
                    {sponsoredCount} {t('offers', 'عرض')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'These offers are subsidized by your employer as part of your benefits package. You get exclusive rates not available to the public.',
                    'هذه العروض مدعومة من صاحب عملك كجزء من حزمة مزاياك. تحصل على أسعار حصرية غير متاحة للعامة.'
                  )}
                </p>
                <div className={cn('flex items-center gap-1.5 mt-2 text-[11px] text-accent', isRTL && 'flex-row-reverse')}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('Premium rates for employees', 'أسعار مميزة للموظفين')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Offers */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
              <div className="shrink-0 p-2 rounded-lg bg-muted">
                <Gift className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className={cn('flex-1', isRTL && 'text-right')}>
                <div className={cn('flex items-center gap-2 mb-1', isRTL && 'flex-row-reverse')}>
                  <h4 className="font-semibold text-sm">{t('Partner Offers', 'عروض الشركاء')}</h4>
                  <Badge variant="outline" className="text-[10px]">
                    {publicCount} {t('offers', 'عرض')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'Curated discounts from our verified partner network. Available to all employees at negotiated corporate rates.',
                    'خصومات منتقاة من شبكة شركائنا الموثوقين. متاحة لجميع الموظفين بأسعار الشركات المتفاوض عليها.'
                  )}
                </p>
                <div className={cn('flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground', isRTL && 'flex-row-reverse')}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('Corporate rates for all', 'أسعار الشركات للجميع')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
