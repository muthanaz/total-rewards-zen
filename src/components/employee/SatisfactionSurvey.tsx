import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Smile, Send, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SatisfactionSurveyProps {
  compact?: boolean;
}

const categories = [
  { key: 'overall', label: 'Overall Satisfaction', labelAr: 'الرضا العام' },
  { key: 'benefits', label: 'Benefits Package', labelAr: 'حزمة المزايا' },
  { key: 'communication', label: 'HR Communication', labelAr: 'تواصل الموارد البشرية' },
  { key: 'support', label: 'Support Quality', labelAr: 'جودة الدعم' },
];

export function SatisfactionSurvey({ compact = false }: SatisfactionSurveyProps) {
  const { user } = useAuth();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [hoveredStar, setHoveredStar] = useState<{ category: string; star: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [existingRatings, setExistingRatings] = useState<Record<string, number>>({});

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Check for existing ratings this month
  useEffect(() => {
    async function fetchExistingRatings() {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('employee_satisfaction_ratings')
        .select('category, rating')
        .eq('user_id', user.id)
        .eq('period_month', currentMonth)
        .eq('period_year', currentYear);

      if (data && data.length > 0) {
        const ratingsMap: Record<string, number> = {};
        data.forEach(r => {
          ratingsMap[r.category] = r.rating;
        });
        setExistingRatings(ratingsMap);
        setRatings(ratingsMap);
        setHasSubmitted(true);
      }
    }

    fetchExistingRatings();
  }, [user?.id, currentMonth, currentYear]);

  const handleRating = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error(t('Please log in to submit feedback', 'يرجى تسجيل الدخول لإرسال الملاحظات'));
      return;
    }

    const ratedCategories = Object.keys(ratings);
    if (ratedCategories.length === 0) {
      toast.error(t('Please rate at least one category', 'يرجى تقييم فئة واحدة على الأقل'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upsert ratings for each category
      for (const category of ratedCategories) {
        const { error } = await supabase
          .from('employee_satisfaction_ratings')
          .upsert({
            user_id: user.id,
            category,
            rating: ratings[category],
            feedback: category === 'overall' ? feedback : null,
            period_month: currentMonth,
            period_year: currentYear,
          }, {
            onConflict: 'user_id,category,period_month,period_year'
          });

        if (error) throw error;
      }

      setHasSubmitted(true);
      setExistingRatings(ratings);
      toast.success(t('Thank you for your feedback!', 'شكراً لملاحظاتك!'));
    } catch (error: any) {
      console.error('Error submitting satisfaction rating:', error);
      toast.error(t('Failed to submit feedback', 'فشل في إرسال الملاحظات'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (category: string) => {
    const currentRating = ratings[category] || 0;
    const hovered = hoveredStar?.category === category ? hoveredStar.star : 0;

    return (
      <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRating(category, star)}
            onMouseEnter={() => setHoveredStar({ category, star })}
            onMouseLeave={() => setHoveredStar(null)}
            className="p-0.5 transition-transform hover:scale-110"
            disabled={isSubmitting}
          >
            <Star
              className={cn(
                "w-5 h-5 transition-colors",
                star <= (hovered || currentRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <Card className="border-violet-500/20 bg-gradient-to-br from-card to-violet-500/5">
        <CardContent className="p-4">
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2.5 rounded-xl bg-violet-500/10 shrink-0">
              <Smile className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{t('Rate your benefits experience', 'قيّم تجربة مزاياك')}</p>
              <div className="mt-2">
                {renderStars('overall')}
              </div>
            </div>
            {ratings.overall && (
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-card to-violet-500/5">
      <CardHeader className="pb-4">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="p-2.5 rounded-xl bg-violet-500/10">
            <Smile className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {t('Monthly Satisfaction Survey', 'استبيان الرضا الشهري')}
            </CardTitle>
            <CardDescription>
              {t('Help us improve your benefits experience', 'ساعدنا في تحسين تجربة مزاياك')}
            </CardDescription>
          </div>
          {hasSubmitted && (
            <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t('Submitted', 'تم الإرسال')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div 
            key={cat.key} 
            className={cn(
              "flex items-center justify-between py-2",
              isRTL && "flex-row-reverse"
            )}
          >
            <span className="text-sm font-medium">
              {language === 'ar' ? cat.labelAr : cat.label}
            </span>
            {renderStars(cat.key)}
          </div>
        ))}

        <div className="pt-2">
          <Textarea
            placeholder={t('Share any additional feedback (optional)...', 'شارك أي ملاحظات إضافية (اختياري)...')}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value.slice(0, 1000))}
            maxLength={1000}
            className="min-h-[80px] resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {feedback.length}/1000
          </p>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || Object.keys(ratings).length === 0}
          className="w-full"
        >
          <Send className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {hasSubmitted 
            ? t('Update Feedback', 'تحديث الملاحظات')
            : t('Submit Feedback', 'إرسال الملاحظات')
          }
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t(
            'Your responses are anonymous and help improve our benefits program.',
            'ردودك مجهولة وتساعد في تحسين برنامج المزايا.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
