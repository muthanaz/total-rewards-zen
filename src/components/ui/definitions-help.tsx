// Definitions & Help Section - Collapsible section at bottom of pages
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Calculator,
  ExternalLink,
  MessageCircleQuestion
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Definition {
  term: string;
  termAr?: string;
  definition: string;
  definitionAr?: string;
  formula?: string;
  formulaAr?: string;
  source?: string;
  metricKey?: string;
}

export interface DefinitionsHelpProps {
  definitions?: Definition[];
  faqItems?: Array<{
    question: string;
    questionAr?: string;
    answer: string;
    answerAr?: string;
  }>;
  policyLink?: string;
  helpLink?: string;
  showMetricsDictionary?: boolean;
  className?: string;
}

export function DefinitionsHelp({
  definitions = [],
  faqItems = [],
  policyLink,
  helpLink,
  showMetricsDictionary = true,
  className,
}: DefinitionsHelpProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  if (definitions.length === 0 && faqItems.length === 0 && !policyLink && !helpLink) {
    return null;
  }

  return (
    <Card className={cn("border-border/50", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <CardTitle className={cn("text-base flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                {isArabic ? 'التعريفات والمساعدة' : 'Definitions & Help'}
              </CardTitle>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {definitions.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {definitions.length} {isArabic ? 'مصطلح' : 'terms'}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Definitions */}
            {definitions.length > 0 && (
              <div className="space-y-3">
                <h4 className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  {isArabic ? 'المصطلحات' : 'Terminology'}
                </h4>
                <div className="grid gap-3">
                  {definitions.map((def, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 rounded-lg bg-muted/30 border border-border/50",
                        isRTL && "text-right"
                      )}
                    >
                      <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                        <p className="font-medium text-sm">
                          {isArabic && def.termAr ? def.termAr : def.term}
                        </p>
                        {def.source && (
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {def.source}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isArabic && def.definitionAr ? def.definitionAr : def.definition}
                      </p>
                      {def.formula && (
                        <p className={cn(
                          "text-xs text-muted-foreground/70 mt-2 font-mono flex items-center gap-1",
                          isRTL && "flex-row-reverse"
                        )}>
                          <Calculator className="w-3 h-3" />
                          {isArabic && def.formulaAr ? def.formulaAr : def.formula}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqItems.length > 0 && (
              <div className="space-y-3">
                <h4 className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <MessageCircleQuestion className="w-4 h-4 text-muted-foreground" />
                  {isArabic ? 'أسئلة شائعة' : 'Common Questions'}
                </h4>
                <div className="grid gap-2">
                  {faqItems.map((faq, index) => (
                    <div 
                      key={index}
                      className={cn("p-3 rounded-lg bg-muted/20", isRTL && "text-right")}
                    >
                      <p className="font-medium text-sm">
                        {isArabic && faq.questionAr ? faq.questionAr : faq.question}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isArabic && faq.answerAr ? faq.answerAr : faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className={cn("flex items-center gap-3 pt-2 flex-wrap", isRTL && "flex-row-reverse")}>
              {showMetricsDictionary && (
                <Link to="/employer/metrics">
                  <Button variant="outline" size="sm" className={cn("gap-1.5", isRTL && "flex-row-reverse")}>
                    <BookOpen className="w-4 h-4" />
                    {isArabic ? 'قاموس المقاييس' : 'Metrics Dictionary'}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              )}
              {policyLink && (
                <Link to={policyLink}>
                  <Button variant="outline" size="sm" className={cn("gap-1.5", isRTL && "flex-row-reverse")}>
                    {isArabic ? 'عرض السياسة' : 'View Policy'}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              )}
              {helpLink && (
                <Link to={helpLink}>
                  <Button variant="ghost" size="sm" className={cn("gap-1.5", isRTL && "flex-row-reverse")}>
                    <HelpCircle className="w-4 h-4" />
                    {isArabic ? 'مركز المساعدة' : 'Help Center'}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
