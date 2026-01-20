import { ShoppingBag, Lock, Mail, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

export function MarketplaceDisabledState() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  const { isAdmin, toggleFlag } = useFeatureFlags();

  const handleEnableMarketplace = async () => {
    try {
      await toggleFlag('marketplaceEnabled', true);
      toast.success(t('Marketplace enabled successfully!', 'تم تفعيل السوق بنجاح!'));
      // Refresh the page to show the marketplace
      window.location.reload();
    } catch (error) {
      toast.error(t('Failed to enable marketplace', 'فشل في تفعيل السوق'));
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className={cn(
        "max-w-lg w-full text-center border-dashed border-2 bg-muted/20",
        isRTL && "text-right"
      )}>
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-primary/60" />
          </div>
          <Badge variant="outline" className="w-fit mx-auto mb-3 text-xs">
            <Lock className="w-3 h-3 mr-1" />
            {t('Phase 2 Feature', 'ميزة المرحلة الثانية')}
          </Badge>
          <CardTitle className="text-xl font-display">
            {t('Marketplace Analytics', 'تحليلات السوق')}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t(
              'The Marketplace module is currently being prepared for your organization. This feature will allow you to track perk activations, employee savings, and vendor performance.',
              'يتم حالياً تحضير وحدة السوق لمؤسستك. ستتيح لك هذه الميزة تتبع تفعيلات المزايا وتوفيرات الموظفين وأداء الموردين.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { 
                icon: '📊', 
                title: t('Perk Analytics', 'تحليلات المزايا'),
                desc: t('Track activation rates', 'تتبع معدلات التفعيل')
              },
              { 
                icon: '💰', 
                title: t('Savings Tracking', 'تتبع التوفيرات'),
                desc: t('Employee savings insights', 'رؤى توفيرات الموظفين')
              },
              { 
                icon: '🏪', 
                title: t('Vendor Performance', 'أداء الموردين'),
                desc: t('Offer engagement metrics', 'مقاييس التفاعل مع العروض')
              },
              { 
                icon: '📈', 
                title: t('ROI Reports', 'تقارير العائد'),
                desc: t('Benefits program ROI', 'عائد برنامج المزايا')
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-3 rounded-lg bg-background/60 border border-border/50",
                  isRTL && "text-right"
                )}
              >
                <div className="text-lg mb-1">{feature.icon}</div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.desc}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t space-y-3">
            {isAdmin ? (
              <Button 
                onClick={handleEnableMarketplace}
                className="w-full gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('Enable Marketplace Module', 'تفعيل وحدة السوق')}
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  toast.info(t(
                    'Please contact your HR administrator to enable this feature.',
                    'يرجى التواصل مع مسؤول الموارد البشرية لتفعيل هذه الميزة.'
                  ));
                }}
              >
                <Mail className="w-4 h-4" />
                {t('Request Access', 'طلب الوصول')}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {isAdmin 
                ? t('As an administrator, you can enable this feature for your organization.', 
                    'بصفتك مسؤولاً، يمكنك تفعيل هذه الميزة لمؤسستك.')
                : t('Contact your administrator to enable the Marketplace module.', 
                    'تواصل مع المسؤول لتفعيل وحدة السوق.')
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
