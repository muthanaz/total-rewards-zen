import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Coffee, Activity, BookOpen, Users, Car, Home, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Wellness: Heart,
  'Food & Dining': Coffee,
  Fitness: Activity,
  Learning: BookOpen,
  Family: Users,
  Transport: Car,
  'Home & Living': Home,
  Experiences: Plane,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; solid: string }> = {
  Wellness: { bg: 'bg-rose-500/10', text: 'text-rose-600', solid: 'bg-rose-500' },
  'Food & Dining': { bg: 'bg-amber-500/10', text: 'text-amber-600', solid: 'bg-amber-500' },
  Fitness: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', solid: 'bg-emerald-500' },
  Learning: { bg: 'bg-blue-500/10', text: 'text-blue-600', solid: 'bg-blue-500' },
  Family: { bg: 'bg-purple-500/10', text: 'text-purple-600', solid: 'bg-purple-500' },
  Transport: { bg: 'bg-cyan-500/10', text: 'text-cyan-600', solid: 'bg-cyan-500' },
  'Home & Living': { bg: 'bg-orange-500/10', text: 'text-orange-600', solid: 'bg-orange-500' },
  Experiences: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', solid: 'bg-indigo-500' },
};

interface MarketplaceCategoryTilesProps {
  categories: { name: string; nameAr: string; count: number }[];
  onCategorySelect: (category: string) => void;
  className?: string;
}

export function MarketplaceCategoryTiles({ categories, onCategorySelect, className }: MarketplaceCategoryTilesProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-base">{t('Browse Categories', 'تصفح الفئات')}</h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.name] || Heart;
          const colors = CATEGORY_COLORS[cat.name] || CATEGORY_COLORS.Wellness;

          return (
            <button
              key={cat.name}
              onClick={() => onCategorySelect(cat.name)}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
            >
              <Card className="border-border/50 hover:border-accent/30 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5">
                <CardContent className="p-3 text-center">
                  <div className={cn('mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2', colors.bg)}>
                    <Icon className={cn('w-5 h-5', colors.text)} />
                  </div>
                  <p className="text-xs font-medium truncate">
                    {language === 'ar' ? cat.nameAr : cat.name}
                  </p>
                  <Badge variant="secondary" className="text-[9px] px-1.5 mt-1">
                    {cat.count}
                  </Badge>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
