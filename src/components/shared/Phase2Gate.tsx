import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Clock, Rocket, ShoppingBag, Store, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Phase 2 Feature Gate
 * 
 * Provides consistent handling of Phase 2 features across the platform.
 * Shows a polished placeholder when the feature is not yet enabled.
 */

export interface Phase2GateProps {
  /** The feature flag key to check */
  featureKey: keyof ReturnType<typeof useFeatureFlags>['flags'];
  /** Content to render when feature is enabled */
  children: ReactNode;
  /** Feature display name */
  featureName: string;
  /** Feature description */
  description: string;
  /** Arabic feature name */
  featureNameAr?: string;
  /** Arabic description */
  descriptionAr?: string;
  /** Icon to display */
  icon?: LucideIcon;
  /** Planned features list */
  plannedFeatures?: string[];
  /** Whether to show the admin enable button */
  showEnableButton?: boolean;
  /** Custom class name */
  className?: string;
}

export function Phase2Gate({
  featureKey,
  children,
  featureName,
  description,
  featureNameAr,
  descriptionAr,
  icon: Icon = Sparkles,
  plannedFeatures = [],
  showEnableButton = true,
  className,
}: Phase2GateProps) {
  const { flags, loading, isAdmin, toggleFlag } = useFeatureFlags();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  // Show children if feature is enabled
  if (!loading && flags[featureKey]) {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleEnable = async () => {
    try {
      await toggleFlag(featureKey, true);
      toast.success(t('Feature enabled successfully!', 'تم تفعيل الميزة بنجاح!'));
      window.location.reload();
    } catch (error) {
      toast.error(t('Failed to enable feature', 'فشل في تفعيل الميزة'));
    }
  };

  const handleRequestAccess = () => {
    toast.info(
      t(
        'Access request submitted. Your administrator will be notified.',
        'تم إرسال طلب الوصول. سيتم إخطار المسؤول.'
      )
    );
  };

  // Show Phase 2 placeholder
  return (
    <div className={cn("min-h-[60vh] flex items-center justify-center p-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full"
      >
        <Card className={cn(
          "text-center border-dashed border-2 bg-gradient-to-br from-muted/30 to-muted/10",
          isRTL && "text-right"
        )}>
          <CardHeader className="pb-4">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4"
            >
              <Icon className="w-8 h-8 text-primary/60" />
            </motion.div>

            {/* Phase Badge */}
            <Badge variant="outline" className="w-fit mx-auto mb-3 text-xs bg-accent/10 text-accent border-accent/30">
              <Lock className="w-3 h-3 mr-1.5" />
              {t('Phase 2', 'المرحلة الثانية')}
            </Badge>

            <CardTitle className="text-xl font-display">
              {isRTL && featureNameAr ? featureNameAr : featureName}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isRTL && descriptionAr ? descriptionAr : description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Planned Features */}
            {plannedFeatures.length > 0 && (
              <div className="bg-card rounded-xl p-4 border border-border/50 text-left">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  {t('Planned Capabilities', 'القدرات المخطط لها')}
                </p>
                <ul className="space-y-2">
                  {plannedFeatures.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={cn(
                        "flex items-center gap-2 text-sm text-foreground",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status Info */}
            <div className={cn(
              "flex items-center justify-center gap-2 text-sm text-muted-foreground",
              isRTL && "flex-row-reverse"
            )}>
              <Clock className="w-4 h-4" />
              <span>{t('Coming in the next release cycle', 'قادم في دورة الإصدار القادمة')}</span>
            </div>

            {/* Action Buttons */}
            {showEnableButton && (
              <div className={cn("flex gap-3 justify-center", isRTL && "flex-row-reverse")}>
                {isAdmin ? (
                  <Button onClick={handleEnable} className="gap-2">
                    <Rocket className="w-4 h-4" />
                    {t('Enable Feature', 'تفعيل الميزة')}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleRequestAccess} className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t('Request Early Access', 'طلب الوصول المبكر')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Pre-configured Phase 2 gate for the Marketplace feature
 */
export function MarketplacePhase2Gate({ children }: { children: ReactNode }) {
  return (
    <Phase2Gate
      featureKey="marketplaceEnabled"
      featureName="Perks & Marketplace"
      featureNameAr="السوق والعروض"
      description="Exclusive discounts and partner offers for employees, with analytics for employers."
      descriptionAr="خصومات حصرية وعروض الشركاء للموظفين، مع تحليلات لأصحاب العمل."
      icon={ShoppingBag}
      plannedFeatures={[
        'Curated partner offers with exclusive discounts',
        'Bank card benefits integration',
        'Perk activation tracking and analytics',
        'AI-powered personalized recommendations',
      ]}
    >
      {children}
    </Phase2Gate>
  );
}

/**
 * Vendor Portal Phase 2 Gate
 * Shows a special message for vendors when marketplace is disabled
 */
export function VendorPortalGate({ children }: { children: ReactNode }) {
  const { flags, loading } = useFeatureFlags();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If marketplace is enabled, show normal content
  if (flags.marketplaceEnabled) {
    return <>{children}</>;
  }

  // Show demo-only vendor portal message
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="text-center border-dashed border-2">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-purple-500" />
            </div>
            <Badge variant="outline" className="w-fit mx-auto mb-3 text-xs">
              <Lock className="w-3 h-3 mr-1.5" />
              {t('Demo Mode', 'وضع العرض التوضيحي')}
            </Badge>
            <CardTitle className="text-xl font-display">
              {t('Vendor Portal', 'بوابة البائعين')}
            </CardTitle>
            <CardDescription>
              {t(
                'The Vendor Portal is currently in demo mode. Full functionality will be available when the Marketplace module is enabled for your organization.',
                'بوابة البائعين حاليًا في وضع العرض التوضيحي. ستتوفر الوظائف الكاملة عند تفعيل وحدة السوق لمؤسستك.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Clock className="w-4 h-4 shrink-0" />
                {t('Phase 2 Feature - Coming Soon', 'ميزة المرحلة الثانية - قريبًا')}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              {t('Go Back', 'العودة')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Phase2Gate;
