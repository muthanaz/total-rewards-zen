import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/contexts/ProfileContext';

export function MarketplaceBankCardBanner({ className }: { className?: string }) {
  const { language, direction } = useLanguage();
  const { bankCards } = useProfile();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const linkedCount = bankCards.length;

  return (
    <Card className={cn('border-accent/20 bg-gradient-to-r from-accent/5 via-transparent to-primary/5', className)}>
      <CardContent className="p-4">
        <div className={cn('flex items-center justify-between gap-4', isRTL && 'flex-row-reverse')}>
          <div className={cn('flex items-center gap-3', isRTL && 'flex-row-reverse')}>
            <div className="p-2 rounded-lg bg-accent/10">
              <CreditCard className="w-5 h-5 text-accent" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                <h4 className="font-semibold text-sm">
                  {linkedCount > 0 
                    ? t('Card-Linked Offers', 'عروض مرتبطة بالبطاقة')
                    : t('Unlock Card-Linked Offers', 'افتح عروض البطاقة')
                  }
                </h4>
                {linkedCount > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {linkedCount} {t('cards', 'بطاقات')}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {linkedCount > 0 
                  ? t('Get automatic cashback and exclusive discounts', 'احصل على استرداد نقدي وخصومات حصرية')
                  : t('Link your bank cards to unlock exclusive cashback offers', 'اربط بطاقاتك للحصول على عروض استرداد نقدي')
                }
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" asChild>
            <Link to="/employee/profile#linked-cards">
              {linkedCount > 0 ? t('Manage Cards', 'إدارة البطاقات') : t('Link Card', 'ربط بطاقة')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
