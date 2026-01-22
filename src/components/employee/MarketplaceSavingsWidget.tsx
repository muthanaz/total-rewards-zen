import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, PiggyBank, ShoppingBag, Sparkles, Activity, BookOpen, Users } from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CategoryUsage {
  category: string;
  activations: number;
  savings: number;
  icon: React.ElementType;
}

interface MarketplaceSavingsWidgetProps {
  totalSavings: number;
  totalActivations: number;
  topCategories: CategoryUsage[];
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Health & Fitness': Activity,
  'Learning & Skills': BookOpen,
  'Family & Parenting': Users,
  'Lifestyle & Shopping': ShoppingBag,
};

export function MarketplaceSavingsWidget({
  totalSavings,
  totalActivations,
  topCategories,
  className,
}: MarketplaceSavingsWidgetProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className={cn('flex items-start gap-4', isRTL && 'flex-row-reverse')}>
          {/* Savings Highlight */}
          <div className={cn('flex-1 space-y-3', isRTL && 'text-right')}>
            <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
              <div className="p-2 rounded-lg bg-gradient-to-br from-success/20 to-accent/20">
                <PiggyBank className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('Your Savings to Date', 'مدخراتك حتى الآن')}
                </p>
                <p className="text-xl font-bold text-success">
                  {formatCurrencyAED(totalSavings)}
                </p>
              </div>
            </div>

            <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', isRTL && 'flex-row-reverse')}>
              <TrendingUp className="w-3 h-3 text-success" />
              <span>
                {t(`${totalActivations} offers activated`, `${totalActivations} عرض مفعل`)}
              </span>
            </div>
          </div>

          {/* Top Categories */}
          <div className={cn('flex-1', isRTL && 'text-right')}>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {t('Top Categories', 'أفضل الفئات')}
            </p>
            <div className="space-y-1.5">
              {topCategories.slice(0, 3).map((cat, i) => {
                const Icon = CATEGORY_ICONS[cat.category] || ShoppingBag;
                return (
                  <div
                    key={cat.category}
                    className={cn(
                      'flex items-center justify-between gap-2 text-xs',
                      isRTL && 'flex-row-reverse'
                    )}
                  >
                    <div className={cn('flex items-center gap-1.5', isRTL && 'flex-row-reverse')}>
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="truncate max-w-[100px]">{cat.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                      {formatCurrencyAED(cat.savings, { abbreviate: true })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analytics Notice */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              'mt-3 pt-3 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-help',
              isRTL && 'flex-row-reverse'
            )}>
              <Sparkles className="w-3 h-3" />
              <span>
                {t(
                  'Your usage helps improve benefits for everyone',
                  'استخدامك يساعد في تحسين المزايا للجميع'
                )}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <p className="text-xs">
              {t(
                'Aggregate marketplace analytics (never personal data) help your employer curate better offers and negotiate exclusive discounts.',
                'تساعد تحليلات السوق الإجمالية (وليس البيانات الشخصية) صاحب العمل في اختيار عروض أفضل والتفاوض على خصومات حصرية.'
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  );
}

// Demo data generator for mock savings
export function generateMockSavingsData(activations: any[]): {
  totalSavings: number;
  totalActivations: number;
  topCategories: CategoryUsage[];
} {
  // Simulate savings based on activations
  const categoryMap = new Map<string, CategoryUsage>();
  
  activations.forEach((activation) => {
    const offer = activation.marketplace_offers;
    if (!offer) return;
    
    const category = offer.category || 'Other';
    const savings = Math.round((offer.discount_percent || 10) * 5); // Assume ~500 AED avg transaction
    
    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category)!;
      existing.activations += 1;
      existing.savings += savings;
    } else {
      categoryMap.set(category, {
        category,
        activations: 1,
        savings,
        icon: CATEGORY_ICONS[category] || ShoppingBag,
      });
    }
  });

  const topCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.savings - a.savings);

  const totalSavings = topCategories.reduce((sum, cat) => sum + cat.savings, 0);
  
  // Add some base savings even if no activations
  const baseSavings = activations.length === 0 ? 0 : Math.max(totalSavings, 250);

  return {
    totalSavings: baseSavings || 1250, // Mock default
    totalActivations: activations.length || 8, // Mock default
    topCategories: topCategories.length > 0 ? topCategories : [
      { category: 'Health & Fitness', activations: 3, savings: 450, icon: Activity },
      { category: 'Learning & Skills', activations: 2, savings: 380, icon: BookOpen },
      { category: 'Family & Parenting', activations: 3, savings: 420, icon: Users },
    ],
  };
}
