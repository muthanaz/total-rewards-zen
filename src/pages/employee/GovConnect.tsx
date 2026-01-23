import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Shield, FileCheck, Globe, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Government Services - Coming Soon
 * 
 * Clean ZeroState explaining what will be offered.
 * No fake service tiles or misleading content.
 */
export default function GovConnectPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const upcomingFeatures = [
    {
      icon: FileCheck,
      title: t('Visa & Work Permit Status', 'حالة التأشيرة وتصريح العمل'),
      description: t(
        'Track visa applications and work permit renewals directly from your dashboard',
        'تتبع طلبات التأشيرة وتجديد تصاريح العمل مباشرة من لوحة التحكم'
      ),
    },
    {
      icon: Shield,
      title: t('Emirates ID Integration', 'تكامل الهوية الإماراتية'),
      description: t(
        'Seamlessly verify and update your Emirates ID information',
        'التحقق من معلومات الهوية الإماراتية وتحديثها بسلاسة'
      ),
    },
    {
      icon: Globe,
      title: t('Government Portal Links', 'روابط البوابات الحكومية'),
      description: t(
        'Quick access to GDRFA, ICP, MOL, and other essential services',
        'وصول سريع إلى الإقامة والجنسية والهجرة وخدمات أخرى'
      ),
    },
    {
      icon: Users,
      title: t('Dependent Sponsorship', 'كفالة المعالين'),
      description: t(
        'Manage family visa applications with HR support tracking',
        'إدارة طلبات تأشيرات العائلة مع تتبع دعم الموارد البشرية'
      ),
    },
  ];

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-8 px-4">
        {/* Icon & Badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/20">
            <Building2 className="w-10 h-10 text-accent" />
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1 bg-accent/10 text-accent border-accent/20">
            {t('Coming Soon', 'قريباً')}
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-bold">
            {t('Government Services', 'الخدمات الحكومية')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {t(
              "We're building seamless integrations with UAE government services to simplify your official documentation and status tracking.",
              'نحن نعمل على بناء تكاملات سلسة مع الخدمات الحكومية الإماراتية لتبسيط وثائقك الرسمية وتتبع حالتك.'
            )}
          </p>
        </div>

        {/* Upcoming Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {upcomingFeatures.map((feature, index) => (
            <Card key={index} className="border-border/50 bg-muted/30">
              <CardContent className="p-4">
                <div className={cn('flex gap-3', isRTL && 'flex-row-reverse text-right')}>
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/employee')}
            className="gap-2"
          >
            <ArrowLeft className={cn('w-4 h-4', isRTL && 'rotate-180')} />
            {t('Back to Dashboard', 'العودة إلى لوحة التحكم')}
          </Button>
        </div>

        {/* Note */}
        <p className="text-xs text-muted-foreground">
          {t(
            'Need government-related HR assistance now? Submit a request to your HR team.',
            'تحتاج مساعدة الموارد البشرية في أمور حكومية الآن؟ قدم طلبًا لفريق الموارد البشرية.'
          )}
        </p>
        <Button
          variant="link"
          className="h-auto p-0 text-xs text-accent"
          onClick={() => navigate('/employee/requests?type=request&category=Other')}
        >
          {t('Submit Request', 'تقديم طلب')}
        </Button>
      </div>
    </div>
  );
}
