import { useState } from 'react';
import { HelpCircle, X, Lightbulb, Target, BarChart3, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PageExplanation {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  purpose: string;
  purposeAr: string;
  decisions: Array<{
    text: string;
    textAr: string;
  }>;
  keyMetrics: Array<{
    name: string;
    nameAr: string;
    definition: string;
    definitionAr: string;
  }>;
  dataQualityTips?: Array<{
    tip: string;
    tipAr: string;
    action?: string;
    actionAr?: string;
    actionRoute?: string;
  }>;
}

interface ExplainPageProps {
  explanation: PageExplanation;
  className?: string;
}

export function ExplainPage({ explanation, className }: ExplainPageProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "text-xs text-muted-foreground hover:text-foreground gap-1.5",
          className,
          isRTL && "flex-row-reverse"
        )}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {isArabic ? 'ما هذا؟' : "What's this?"}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className={cn(isRTL && "text-right")}>
            <SheetTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Lightbulb className="w-5 h-5 text-accent" />
              {isArabic ? explanation.titleAr : explanation.title}
            </SheetTitle>
            <SheetDescription className={cn(isRTL && "text-right")}>
              {isArabic ? explanation.descriptionAr : explanation.description}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Purpose Section */}
            <div className={cn("space-y-2", isRTL && "text-right")}>
              <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                <Target className="w-4 h-4 text-primary" />
                {isArabic ? 'الغرض' : 'Purpose'}
              </div>
              <p className="text-sm text-muted-foreground pl-6">
                {isArabic ? explanation.purposeAr : explanation.purpose}
              </p>
            </div>

            {/* Decisions Supported */}
            <div className={cn("space-y-2", isRTL && "text-right")}>
              <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isArabic ? 'القرارات المدعومة' : 'Decisions Supported'}
              </div>
              <ul className="space-y-1.5 pl-6">
                {explanation.decisions.map((decision, i) => (
                  <li 
                    key={i} 
                    className={cn(
                      "text-sm text-muted-foreground flex items-start gap-2",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <ArrowRight className="w-3 h-3 mt-1 shrink-0 text-accent" />
                    {isArabic ? decision.textAr : decision.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Metrics */}
            <div className={cn("space-y-2", isRTL && "text-right")}>
              <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                <BarChart3 className="w-4 h-4 text-blue-600" />
                {isArabic ? 'المقاييس الرئيسية' : 'Key Metrics'}
              </div>
              <div className="space-y-2 pl-6">
                {explanation.keyMetrics.map((metric, i) => (
                  <div 
                    key={i} 
                    className="p-2 rounded-lg bg-muted/50 border border-border/30"
                  >
                    <p className="text-sm font-medium">
                      {isArabic ? metric.nameAr : metric.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isArabic ? metric.definitionAr : metric.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Quality Tips */}
            {explanation.dataQualityTips && explanation.dataQualityTips.length > 0 && (
              <div className={cn("space-y-2", isRTL && "text-right")}>
                <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {isArabic ? 'لتحسين البيانات' : 'Improve Your Insights'}
                </div>
                <div className="space-y-2 pl-6">
                  {explanation.dataQualityTips.map((tip, i) => (
                    <div 
                      key={i} 
                      className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20"
                    >
                      <p className="text-sm text-amber-700">
                        {isArabic ? tip.tipAr : tip.tip}
                      </p>
                      {tip.action && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 mt-1 text-xs text-amber-600"
                        >
                          {isArabic ? tip.actionAr : tip.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                {isArabic ? 'فهمت' : 'Got it'}
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
