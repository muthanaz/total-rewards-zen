import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Sparkles, Send, CheckCircle2, Lightbulb, Calendar, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SatisfactionSurveyProps {
  compact?: boolean;
}

// Survey window configuration: October 15 - December 31 (Q4 end of year)
const SURVEY_WINDOW = {
  startMonth: 10, // October
  startDay: 15,
  endMonth: 12,  // December
  endDay: 31,
};

function isWithinSurveyWindow(): boolean {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  
  // Check if within the survey window (Oct 15 - Dec 31)
  if (month === SURVEY_WINDOW.startMonth) {
    return day >= SURVEY_WINDOW.startDay;
  }
  if (month > SURVEY_WINDOW.startMonth && month <= SURVEY_WINDOW.endMonth) {
    return true;
  }
  return false;
}

export function SatisfactionSurvey({ compact = false }: SatisfactionSurveyProps) {
  const { user } = useAuth();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [benefitsRating, setBenefitsRating] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [hoveredStar, setHoveredStar] = useState<{ type: 'benefits' | 'platform'; star: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const currentYear = new Date().getFullYear();
  const isInWindow = isWithinSurveyWindow();

  // Check for existing ratings this year (annual survey)
  useEffect(() => {
    async function fetchExistingRatings() {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('employee_satisfaction_ratings')
        .select('category, rating, feedback, period_year')
        .eq('user_id', user.id)
        .eq('period_year', currentYear);

      if (data && data.length > 0) {
        const benefitsData = data.find(r => r.category === 'benefits_policy');
        const platformData = data.find(r => r.category === 'platform_experience');
        
        if (benefitsData) setBenefitsRating(benefitsData.rating);
        if (platformData) {
          setPlatformRating(platformData.rating);
          if (platformData.feedback) setSuggestion(platformData.feedback);
        }
        
        setHasSubmitted(true);
      }
    }

    fetchExistingRatings();

    // Check if dismissed this session
    const dismissed = sessionStorage.getItem(`survey_dismissed_${currentYear}`);
    if (dismissed) setIsDismissed(true);
  }, [user?.id, currentYear]);

  // Don't render if outside survey window
  if (!isInWindow) {
    return null;
  }

  // Don't render if dismissed (for compact view only)
  if (isDismissed && compact && hasSubmitted) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(`survey_dismissed_${currentYear}`, 'true');
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error(t('Please log in to submit feedback', 'يرجى تسجيل الدخول لإرسال الملاحظات'));
      return;
    }

    if (benefitsRating === 0 || platformRating === 0) {
      toast.error(t('Please rate both questions', 'يرجى تقييم كلا السؤالين'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Upsert benefits policy rating
      await supabase
        .from('employee_satisfaction_ratings')
        .upsert({
          user_id: user.id,
          category: 'benefits_policy',
          rating: benefitsRating,
          feedback: null,
          period_month: new Date().getMonth() + 1,
          period_year: currentYear,
        }, {
          onConflict: 'user_id,category,period_month,period_year'
        });

      // Upsert platform experience rating with suggestion
      await supabase
        .from('employee_satisfaction_ratings')
        .upsert({
          user_id: user.id,
          category: 'platform_experience',
          rating: platformRating,
          feedback: suggestion || null,
          period_month: new Date().getMonth() + 1,
          period_year: currentYear,
        }, {
          onConflict: 'user_id,category,period_month,period_year'
        });

      setHasSubmitted(true);
      toast.success(t('Thank you for your feedback! Your input helps us improve.', 'شكراً لملاحظاتك! مدخلاتك تساعدنا على التحسين.'));
    } catch (error: any) {
      console.error('Error submitting satisfaction rating:', error);
      toast.error(t('Failed to submit feedback', 'فشل في إرسال الملاحظات'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (type: 'benefits' | 'platform', currentRating: number, setRating: (val: number) => void) => {
    const hovered = hoveredStar?.type === type ? hoveredStar.star : 0;
    const labels = type === 'benefits' 
      ? ['', t('Poor', 'ضعيف'), t('Fair', 'مقبول'), t('Good', 'جيد'), t('Great', 'ممتاز'), t('Excellent', 'رائع')]
      : ['', t('Frustrating', 'محبط'), t('Needs work', 'يحتاج تحسين'), t('Okay', 'مقبول'), t('Helpful', 'مفيد'), t('Love it!', 'أحبه!')];

    return (
      <div className="space-y-1">
        <div className={cn("flex gap-1.5", isRTL && "flex-row-reverse")}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar({ type, star })}
              onMouseLeave={() => setHoveredStar(null)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
              disabled={isSubmitting}
            >
              <Star
                className={cn(
                  "w-7 h-7 transition-all duration-200",
                  star <= (hovered || currentRating)
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : "text-muted-foreground/30 hover:text-amber-300"
                )}
              />
            </button>
          ))}
        </div>
        {(hovered > 0 || currentRating > 0) && (
          <p className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
            {labels[hovered || currentRating]}
          </p>
        )}
      </div>
    );
  };

  // Compact version for dashboard
  if (compact) {
    if (hasSubmitted) {
      return (
        <Card className="border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-500/5">
          <CardContent className="p-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className={cn("flex-1", isRTL && "text-right")}>
                <p className="text-sm font-semibold text-emerald-600">
                  {t('Thank you for your feedback!', 'شكراً على ملاحظاتك!')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t(`Your ${currentYear} annual survey is complete`, `تم إكمال استبيان ${currentYear} السنوي`)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="border-violet-500/20 bg-gradient-to-br from-card via-card to-violet-500/5 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100"
          onClick={handleDismiss}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
        <CardContent className="p-4">
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-500/5 shrink-0">
              <Sparkles className="w-5 h-5 text-violet-500" />
            </div>
            <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
              <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                <p className="text-sm font-semibold">
                  {t('Annual Benefits Survey', 'الاستبيان السنوي للمزايا')}
                </p>
                <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-600 border-0">
                  <Calendar className="w-3 h-3 mr-1" />
                  {currentYear}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('Help us improve your benefits experience', 'ساعدنا في تحسين تجربة مزاياك')}
              </p>
              
              {/* Quick rating for compact view */}
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1.5">{t('How satisfied are you with your benefits?', 'ما مدى رضاك عن مزاياك؟')}</p>
                  <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setBenefitsRating(star)}
                        onMouseEnter={() => setHoveredStar({ type: 'benefits', star })}
                        onMouseLeave={() => setHoveredStar(null)}
                        className="p-0.5 transition-transform hover:scale-110"
                        disabled={isSubmitting}
                      >
                        <Star
                          className={cn(
                            "w-5 h-5 transition-colors",
                            star <= (hoveredStar?.type === 'benefits' ? hoveredStar.star : benefitsRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1.5">{t('How helpful is this platform?', 'ما مدى فائدة هذه المنصة؟')}</p>
                  <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPlatformRating(star)}
                        onMouseEnter={() => setHoveredStar({ type: 'platform', star })}
                        onMouseLeave={() => setHoveredStar(null)}
                        className="p-0.5 transition-transform hover:scale-110"
                        disabled={isSubmitting}
                      >
                        <Star
                          className={cn(
                            "w-5 h-5 transition-colors",
                            star <= (hoveredStar?.type === 'platform' ? hoveredStar.star : platformRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {benefitsRating > 0 && platformRating > 0 && (
                <Button 
                  size="sm" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-3 w-full bg-violet-500 hover:bg-violet-600"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {t('Submit Survey', 'إرسال الاستبيان')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full version
  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-card to-violet-500/5">
      <CardHeader className="pb-4">
        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="p-2.5 rounded-xl bg-violet-500/10">
            <Sparkles className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <CardTitle className="text-lg">
                {t('Annual Benefits Survey', 'الاستبيان السنوي للمزايا')}
              </CardTitle>
              <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-600 border-0">
                <Calendar className="w-3 h-3 mr-1" />
                {currentYear}
              </Badge>
            </div>
            <CardDescription className={cn(isRTL && "text-right")}>
              {t('Your feedback helps shape better benefits for everyone', 'ملاحظاتك تساعد في تحسين المزايا للجميع')}
            </CardDescription>
          </div>
          {hasSubmitted && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {t('Completed', 'مكتمل')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question 1: Benefits Policy Satisfaction */}
        <div className={cn("space-y-3", isRTL && "text-right")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-bold">1</span>
            <h3 className="font-medium">
              {t('How satisfied are you with your current benefits package?', 'ما مدى رضاك عن حزمة المزايا الحالية؟')}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('Consider all your benefits: allowances, insurance, leave, and perks.', 'ضع في اعتبارك جميع مزاياك: البدلات، التأمين، الإجازات، والامتيازات.')}
          </p>
          {renderStars('benefits', benefitsRating, setBenefitsRating)}
        </div>

        {/* Question 2: Platform Experience */}
        <div className={cn("space-y-3", isRTL && "text-right")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-sm font-bold">2</span>
            <h3 className="font-medium">
              {t('How helpful is this benefits platform for you?', 'ما مدى فائدة منصة المزايا هذه بالنسبة لك؟')}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('Does it make managing your benefits easier?', 'هل تجعل إدارة مزاياك أسهل؟')}
          </p>
          {renderStars('platform', platformRating, setPlatformRating)}
        </div>

        {/* Suggestions */}
        <div className={cn("space-y-3", isRTL && "text-right")}>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h3 className="font-medium">
              {t('Any suggestions to improve your benefits?', 'أي اقتراحات لتحسين مزاياك؟')}
            </h3>
          </div>
          <Textarea
            placeholder={t(
              'Tell us what benefits you would like to see, or how we can improve existing ones...', 
              'أخبرنا عن المزايا التي تود رؤيتها، أو كيف يمكننا تحسين المزايا الحالية...'
            )}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value.slice(0, 500))}
            maxLength={500}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <p className={cn("text-xs text-muted-foreground", isRTL ? "text-left" : "text-right")}>
            {suggestion.length}/500
          </p>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || benefitsRating === 0 || platformRating === 0}
          className="w-full bg-violet-600 hover:bg-violet-700"
          size="lg"
        >
          <Send className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {hasSubmitted 
            ? t('Update My Feedback', 'تحديث ملاحظاتي')
            : t('Submit Annual Survey', 'إرسال الاستبيان السنوي')
          }
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {t(
            'This annual survey is available from Oct 15 to Dec 31 and helps HR plan better benefits.',
            'هذا الاستبيان السنوي متاح من ١٥ أكتوبر إلى ٣١ ديسمبر ويساعد الموارد البشرية في تخطيط مزايا أفضل.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
