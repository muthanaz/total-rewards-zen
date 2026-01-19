import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Trophy,
  Target,
  DollarSign,
  Calendar,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface PayoutTier {
  id: string;
  name: string;
  nameAr: string;
  minEarnings: number;
  commissionRate: number;
  benefits: string[];
  benefitsAr: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
}

interface PayoutData {
  currentBalance: number;
  pendingPayout: number;
  minimumWithdrawal: number;
  nextPayoutDate: string;
  lifetimeEarnings: number;
  currentTier: string;
  progressToNextTier: number;
  nextTierThreshold: number;
}

const payoutTiers: PayoutTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameAr: 'برونزي',
    minEarnings: 0,
    commissionRate: 5,
    benefits: ['Standard payout (Net 30)', 'Email support'],
    benefitsAr: ['دفع قياسي (٣٠ يوم صافي)', 'دعم بالبريد الإلكتروني'],
    isUnlocked: true,
    isCurrent: false,
  },
  {
    id: 'silver',
    name: 'Silver',
    nameAr: 'فضي',
    minEarnings: 25000,
    commissionRate: 7,
    benefits: ['Faster payout (Net 15)', 'Priority support', 'Featured badge'],
    benefitsAr: ['دفع أسرع (١٥ يوم صافي)', 'دعم مميز', 'شارة مميزة'],
    isUnlocked: true,
    isCurrent: true,
  },
  {
    id: 'gold',
    name: 'Gold',
    nameAr: 'ذهبي',
    minEarnings: 50000,
    commissionRate: 10,
    benefits: ['Weekly payouts', 'Dedicated manager', 'Homepage placement'],
    benefitsAr: ['دفعات أسبوعية', 'مدير مخصص', 'وضع في الصفحة الرئيسية'],
    isUnlocked: false,
    isCurrent: false,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameAr: 'بلاتيني',
    minEarnings: 100000,
    commissionRate: 12,
    benefits: ['On-demand payouts', 'Custom campaigns', 'API access', 'Co-marketing'],
    benefitsAr: ['دفعات عند الطلب', 'حملات مخصصة', 'وصول API', 'تسويق مشترك'],
    isUnlocked: false,
    isCurrent: false,
  },
];

const payoutData: PayoutData = {
  currentBalance: 24500,
  pendingPayout: 4200,
  minimumWithdrawal: 500,
  nextPayoutDate: '2026-01-25',
  lifetimeEarnings: 156800,
  currentTier: 'silver',
  progressToNextTier: 68,
  nextTierThreshold: 50000,
};

export function PayoutThresholds() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getTierColor = (tier: PayoutTier) => {
    if (!tier.isUnlocked) return 'bg-muted text-muted-foreground border-border';
    switch (tier.id) {
      case 'bronze': return 'bg-amber-600/10 text-amber-700 border-amber-600/20';
      case 'silver': return 'bg-gray-400/10 text-gray-600 border-gray-400/20';
      case 'gold': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'platinum': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default: return '';
    }
  };

  const earningsToNextTier = payoutData.nextTierThreshold - payoutData.lifetimeEarnings;
  const canWithdraw = payoutData.currentBalance >= payoutData.minimumWithdrawal;

  return (
    <div className="space-y-6">
      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Available Balance', 'الرصيد المتاح')}</p>
                <p className="text-3xl font-bold mt-1">AED {payoutData.currentBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('Min withdrawal:', 'الحد الأدنى للسحب:')} AED {payoutData.minimumWithdrawal}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
            </div>
            <Button 
              className="w-full mt-4 gap-2" 
              disabled={!canWithdraw}
            >
              <DollarSign className="w-4 h-4" />
              {t('Request Payout', 'طلب الدفع')}
            </Button>
            {!canWithdraw && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                {t('Earn', 'اكسب')} AED {payoutData.minimumWithdrawal - payoutData.currentBalance} {t('more to withdraw', 'أكثر للسحب')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Pending Payout', 'الدفع المعلق')}</p>
                <p className="text-3xl font-bold mt-1">AED {payoutData.pendingPayout.toLocaleString()}</p>
                <div className={cn("flex items-center gap-1.5 mt-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('Expected:', 'متوقع:')} {payoutData.nextPayoutDate}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-sm text-muted-foreground">{t('Lifetime Earnings', 'الأرباح مدى الحياة')}</p>
                <p className="text-3xl font-bold mt-1">AED {payoutData.lifetimeEarnings.toLocaleString()}</p>
                <div className={cn("flex items-center gap-1.5 mt-2 text-xs text-success", isRTL && "flex-row-reverse")}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18% {t('this quarter', 'هذا الربع')}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-success/10">
                <Trophy className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Tier */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Target className="w-5 h-5 text-accent" />
            {t('Commission Tier Progress', 'تقدم مستوى العمولة')}
          </CardTitle>
          <CardDescription>
            {t('Earn more to unlock higher commission rates', 'اكسب أكثر لفتح معدلات عمولة أعلى')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
              <span className="text-sm font-medium">{t('Progress to Gold', 'التقدم نحو الذهبي')}</span>
              <span className="text-sm font-medium">{payoutData.progressToNextTier}%</span>
            </div>
            <div className="relative">
              <Progress value={payoutData.progressToNextTier} className="h-3" />
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 rounded-full bg-yellow-500 border-2 border-background" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('Earn', 'اكسب')} AED {earningsToNextTier.toLocaleString()} {t('more to unlock Gold tier', 'أكثر لفتح المستوى الذهبي')}
            </p>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {payoutTiers.map((tier) => (
              <div 
                key={tier.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  tier.isCurrent 
                    ? "border-accent bg-accent/5" 
                    : tier.isUnlocked 
                      ? "border-border/60 hover:border-accent/30" 
                      : "border-dashed border-border opacity-60",
                  isRTL && "text-right"
                )}
              >
                <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
                  <Badge variant="outline" className={getTierColor(tier)}>
                    {language === 'ar' ? tier.nameAr : tier.name}
                  </Badge>
                  {tier.isCurrent && (
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">
                      {t('Current', 'الحالي')}
                    </Badge>
                  )}
                  {!tier.isUnlocked && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-2xl font-bold">{tier.commissionRate}%</p>
                  <p className="text-xs text-muted-foreground">{t('commission', 'عمولة')}</p>
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  {tier.minEarnings > 0 && (
                    <span>AED {tier.minEarnings.toLocaleString()}+ {t('lifetime', 'مدى الحياة')}</span>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  {(language === 'ar' ? tier.benefitsAr : tier.benefits).map((benefit, idx) => (
                    <div key={idx} className={cn("flex items-center gap-1.5 text-xs", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className={cn(
                        "w-3 h-3",
                        tier.isUnlocked ? "text-success" : "text-muted-foreground"
                      )} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-accent/10">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold">{t('Boost your earnings', 'عزز أرباحك')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('Create a new high-performing offer to reach Gold faster', 'أنشئ عرضاً جديداً عالي الأداء للوصول إلى الذهبي أسرع')}
                </p>
              </div>
            </div>
            <Button className="gap-2">
              {t('Create Offer', 'إنشاء عرض')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
