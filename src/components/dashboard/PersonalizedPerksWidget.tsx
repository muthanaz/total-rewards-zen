import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Percent,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Perk {
  id: string;
  title: string;
  titleAr: string;
  merchant: string;
  discount: number;
  category: string;
  categoryAr: string;
  image?: string;
  expiresIn?: string;
  rating?: number;
  isNew?: boolean;
  matchReason: string;
  matchReasonAr: string;
}

const demoPerks: Perk[] = [
  {
    id: '1',
    title: 'Premium Gym Membership',
    titleAr: 'عضوية نادي رياضي مميزة',
    merchant: 'Fitness First',
    discount: 40,
    category: 'Wellness',
    categoryAr: 'العافية',
    expiresIn: '5 days',
    rating: 4.8,
    isNew: true,
    matchReason: 'Based on your Wellness interests',
    matchReasonAr: 'بناءً على اهتماماتك بالعافية',
  },
  {
    id: '2',
    title: 'Family Dining Package',
    titleAr: 'باقة عشاء عائلية',
    merchant: "Nando's",
    discount: 25,
    category: 'Food & Dining',
    categoryAr: 'الطعام والمطاعم',
    rating: 4.5,
    matchReason: 'Popular with families',
    matchReasonAr: 'شائعة بين العائلات',
  },
  {
    id: '3',
    title: 'Online Learning Credits',
    titleAr: 'رصيد تعلم إلكتروني',
    merchant: 'Coursera',
    discount: 50,
    category: 'Learning',
    categoryAr: 'التعلم',
    isNew: true,
    matchReason: 'Matches your L&D budget',
    matchReasonAr: 'يتوافق مع ميزانية التعلم الخاصة بك',
  },
];

interface PersonalizedPerksWidgetProps {
  isRTL?: boolean;
  isArabic?: boolean;
  onViewPerk?: (perk: Perk) => void;
  onViewAll?: () => void;
}

export function PersonalizedPerksWidget({
  isRTL = false,
  isArabic = false,
  onViewPerk,
  onViewAll,
}: PersonalizedPerksWidgetProps) {
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("text-lg font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            {isArabic ? 'عروض مخصصة لك' : 'Personalized For You'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={onViewAll}
          >
            {isArabic ? 'عرض الكل' : 'View All'}
            <ChevronIcon className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {demoPerks.map((perk, index) => (
            <motion.div
              key={perk.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="perk-card min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer group"
              onClick={() => onViewPerk?.(perk)}
            >
              {/* Perk Image/Gradient */}
              <div className="h-24 bg-gradient-to-br from-accent/20 via-purple-500/20 to-primary/20 relative">
                {perk.isNew && (
                  <Badge className="absolute top-2 left-2 bg-action text-white border-0 text-[10px]">
                    {isArabic ? 'جديد' : 'New'}
                  </Badge>
                )}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <Percent className="w-3 h-3 text-success" />
                  <span className="text-xs font-bold text-success">{perk.discount}%</span>
                </div>
              </div>

              {/* Perk Details */}
              <div className={cn("p-3", isRTL && "text-right")}>
                <Badge variant="secondary" className="text-[10px] mb-1.5">
                  {isArabic ? perk.categoryAr : perk.category}
                </Badge>
                
                <h4 className="text-sm font-medium text-foreground line-clamp-1 mb-0.5">
                  {isArabic ? perk.titleAr : perk.title}
                </h4>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {perk.merchant}
                </p>

                <div className={cn("flex items-center justify-between text-[10px]", isRTL && "flex-row-reverse")}>
                  {perk.rating && (
                    <div className={cn("flex items-center gap-0.5 text-amber-500", isRTL && "flex-row-reverse")}>
                      <Star className="w-3 h-3 fill-current" />
                      {perk.rating}
                    </div>
                  )}
                  {perk.expiresIn && (
                    <div className={cn("flex items-center gap-0.5 text-muted-foreground", isRTL && "flex-row-reverse")}>
                      <Clock className="w-3 h-3" />
                      {perk.expiresIn}
                    </div>
                  )}
                </div>

                {/* Match Reason */}
                <div className={cn(
                  "mt-2 pt-2 border-t border-border/50 flex items-center gap-1 text-[10px] text-accent",
                  isRTL && "flex-row-reverse"
                )}>
                  <Sparkles className="w-3 h-3" />
                  <span className="line-clamp-1">{isArabic ? perk.matchReasonAr : perk.matchReason}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
