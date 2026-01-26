/**
 * MarketplaceNoDataState
 * 
 * Shows when vendor integration is not connected or vendor dataset is empty.
 * Hides all numeric KPIs and shows clear CTA to configure marketplace.
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Link2, 
  BarChart3, 
  PiggyBank, 
  Star, 
  Users,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MarketplaceNoDataStateProps {
  /** Which integration is missing */
  missingIntegration?: 'vendor' | 'perk_activations' | 'both';
  className?: string;
}

const UNLOCKABLE_METRICS = [
  {
    icon: BarChart3,
    label: 'Activations',
    labelAr: 'التفعيلات',
    description: 'Track offer redemptions',
    descriptionAr: 'تتبع استخدام العروض',
  },
  {
    icon: PiggyBank,
    label: 'Savings',
    labelAr: 'التوفيرات',
    description: 'Employee savings data',
    descriptionAr: 'بيانات توفيرات الموظفين',
  },
  {
    icon: Star,
    label: 'Ratings',
    labelAr: 'التقييمات',
    description: 'Offer feedback scores',
    descriptionAr: 'درجات ملاحظات العروض',
  },
  {
    icon: Users,
    label: 'Segment Engagement',
    labelAr: 'تفاعل الشرائح',
    description: 'Per-group analytics',
    descriptionAr: 'تحليلات لكل مجموعة',
  },
];

export function MarketplaceNoDataState({ 
  missingIntegration = 'both',
  className,
}: MarketplaceNoDataStateProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleConfigureMarketplace = () => {
    navigate('/employer/integrations?view=ops&filter=marketplace');
  };

  return (
    <div className={cn('min-h-[60vh] flex items-center justify-center p-6', className)}>
      <Card className={cn(
        'max-w-2xl w-full border-2 border-dashed bg-muted/10',
        isRTL && 'text-right'
      )}>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-primary/60" />
          </div>
          <Badge variant="outline" className="w-fit mx-auto mb-3 gap-1.5">
            <Link2 className="w-3 h-3" />
            {t('Vendor Integration Required', 'يتطلب تكامل الموردين')}
          </Badge>
          <CardTitle className="text-2xl font-display">
            {t('Connect Vendors to Unlock Insights', 'اربط الموردين لفتح الرؤى')}
          </CardTitle>
          <CardDescription className="text-base mt-2 max-w-lg mx-auto">
            {t(
              'Marketplace analytics require vendor data integration. Once connected, you\'ll see real activation counts, savings, and performance metrics.',
              'تتطلب تحليلات السوق تكامل بيانات الموردين. بمجرد الاتصال، سترى أعداد التفعيلات الفعلية والتوفيرات ومقاييس الأداء.'
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Unlockable metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {UNLOCKABLE_METRICS.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={idx}
                  className={cn(
                    'p-4 rounded-xl bg-background/60 border border-border/50 text-center',
                    'opacity-60'
                  )}
                >
                  <div className="mx-auto w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">
                    {t(metric.label, metric.labelAr)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(metric.description, metric.descriptionAr)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* What's needed section */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
            <h4 className={cn(
              'font-medium text-sm mb-2 flex items-center gap-2',
              isRTL && 'flex-row-reverse'
            )}>
              <Settings className="w-4 h-4 text-accent" />
              {t('What\'s needed:', 'ما هو مطلوب:')}
            </h4>
            <ul className={cn(
              'space-y-1.5 text-sm text-muted-foreground',
              isRTL ? 'pr-6' : 'pl-6'
            )}>
              <li className="list-disc">
                {t(
                  'Connect at least one vendor/perk provider in Integrations',
                  'اربط مورد/مزود مزايا واحد على الأقل في التكاملات'
                )}
              </li>
              <li className="list-disc">
                {t(
                  'Ensure perk activation tracking is enabled',
                  'تأكد من تمكين تتبع تفعيل المزايا'
                )}
              </li>
              <li className="list-disc">
                {t(
                  'Wait for first employee activations to flow through',
                  'انتظر تدفق أول تفعيلات الموظفين'
                )}
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleConfigureMarketplace}
              className="gap-2"
              size="lg"
            >
              <Settings className="w-4 h-4" />
              {t('Configure Marketplace', 'تكوين السوق')}
              <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/employer/integrations')}
              size="lg"
            >
              {t('View All Integrations', 'عرض جميع التكاملات')}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {t(
              'Demo data will not be shown. All metrics require real vendor connections.',
              'لن يتم عرض بيانات العرض التوضيحي. تتطلب جميع المقاييس اتصالات حقيقية بالموردين.'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketplaceNoDataState;
