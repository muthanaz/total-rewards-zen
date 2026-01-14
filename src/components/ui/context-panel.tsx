import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  FileText,
  Link2,
  ChevronDown,
  X,
  Info,
  CheckCircle,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface Definition {
  term: string;
  termAr?: string;
  definition: string;
  definitionAr?: string;
}

interface Document {
  name: string;
  nameAr?: string;
  required: boolean;
}

interface PolicyHighlight {
  text: string;
  textAr?: string;
}

interface RelatedLink {
  label: string;
  labelAr?: string;
  href: string;
}

interface ContextPanelProps {
  definitions?: Definition[];
  documents?: Document[];
  policyHighlights?: PolicyHighlight[];
  relatedLinks?: RelatedLink[];
  className?: string;
  onClose?: () => void;
}

export function ContextPanel({
  definitions = [],
  documents = [],
  policyHighlights = [],
  relatedLinks = [],
  className,
  onClose
}: ContextPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const [openSections, setOpenSections] = useState<string[]>(['definitions']);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const hasContent = definitions.length > 0 || documents.length > 0 || policyHighlights.length > 0 || relatedLinks.length > 0;

  if (!hasContent) return null;

  return (
    <Card className={cn(
      "hidden xl:block w-80 shrink-0 sticky top-6 max-h-[calc(100vh-6rem)] border-border/50 bg-card/50 backdrop-blur-sm",
      className
    )}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("text-sm font-medium flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <HelpCircle className="w-4 h-4 text-primary" />
            {isArabic ? 'معلومات مساعدة' : 'Quick Reference'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="max-h-[calc(100vh-12rem)]">
        <CardContent className="py-3 space-y-3">
          {/* Definitions Section */}
          {definitions.length > 0 && (
            <Collapsible open={openSections.includes('definitions')} onOpenChange={() => toggleSection('definitions')}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                  <BookOpen className="w-4 h-4 text-primary" />
                  {isArabic ? 'التعريفات' : 'Definitions'}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  openSections.includes('definitions') && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {definitions.map((def, index) => (
                  <div key={index} className={cn("p-2 rounded-lg bg-muted/30 text-xs", isRTL && "text-right")}>
                    <p className="font-medium text-foreground mb-1">
                      {isArabic && def.termAr ? def.termAr : def.term}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {isArabic && def.definitionAr ? def.definitionAr : def.definition}
                    </p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Required Documents Section */}
          {documents.length > 0 && (
            <Collapsible open={openSections.includes('documents')} onOpenChange={() => toggleSection('documents')}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                  <FileText className="w-4 h-4 text-accent" />
                  {isArabic ? 'المستندات المطلوبة' : 'Required Documents'}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  openSections.includes('documents') && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {documents.map((doc, index) => (
                  <div key={index} className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-xs",
                    isRTL && "flex-row-reverse"
                  )}>
                    <CheckCircle className={cn(
                      "w-3.5 h-3.5 shrink-0",
                      doc.required ? "text-emerald-500" : "text-muted-foreground"
                    )} />
                    <span className="flex-1">{isArabic && doc.nameAr ? doc.nameAr : doc.name}</span>
                    {doc.required && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {isArabic ? 'مطلوب' : 'Required'}
                      </Badge>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Policy Highlights Section */}
          {policyHighlights.length > 0 && (
            <Collapsible open={openSections.includes('policy')} onOpenChange={() => toggleSection('policy')}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                  <Info className="w-4 h-4 text-amber-500" />
                  {isArabic ? 'أبرز السياسات' : 'Policy Highlights'}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  openSections.includes('policy') && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {policyHighlights.map((highlight, index) => (
                  <div key={index} className={cn(
                    "flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 text-xs",
                    isRTL && "flex-row-reverse text-right"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{isArabic && highlight.textAr ? highlight.textAr : highlight.text}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Related Links Section */}
          {relatedLinks.length > 0 && (
            <Collapsible open={openSections.includes('links')} onOpenChange={() => toggleSection('links')}>
              <CollapsibleTrigger className={cn(
                "flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors",
                isRTL && "flex-row-reverse"
              )}>
                <div className={cn("flex items-center gap-2 text-sm font-medium", isRTL && "flex-row-reverse")}>
                  <Link2 className="w-4 h-4 text-blue-500" />
                  {isArabic ? 'روابط ذات صلة' : 'Related Links'}
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  openSections.includes('links') && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {relatedLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-primary/5 text-primary transition-colors",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <span className="flex-1">{isArabic && link.labelAr ? link.labelAr : link.label}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}