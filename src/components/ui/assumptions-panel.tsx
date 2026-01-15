import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Info, Edit2, Check, X, Clock, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

export interface Assumption {
  id: string;
  label: string;
  labelAr?: string;
  value: string | number;
  valueAr?: string;
  unit?: string;
  unitAr?: string;
  editable?: boolean;
  source?: 'system' | 'policy' | 'user' | 'estimated';
  lastUpdated?: string;
  impact?: 'high' | 'medium' | 'low';
  description?: string;
  descriptionAr?: string;
}

interface AssumptionsPanelProps {
  title?: string;
  titleAr?: string;
  assumptions: Assumption[];
  lastUpdated?: string;
  onAssumptionChange?: (id: string, value: string | number) => void;
  editableByRole?: 'employee' | 'employer' | 'admin';
  currentRole?: string;
  className?: string;
  defaultOpen?: boolean;
}

export function AssumptionsPanel({
  title = 'Assumptions',
  titleAr = 'الافتراضات',
  assumptions,
  lastUpdated,
  onAssumptionChange,
  editableByRole = 'employer',
  currentRole = 'employee',
  className,
  defaultOpen = false,
}: AssumptionsPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const canEdit = currentRole === editableByRole || currentRole === 'admin';

  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    const configs = {
      system: { label: isArabic ? 'نظام' : 'System', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      policy: { label: isArabic ? 'سياسة' : 'Policy', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
      user: { label: isArabic ? 'مستخدم' : 'User', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
      estimated: { label: isArabic ? 'تقديري' : 'Estimated', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    };
    const config = configs[source as keyof typeof configs];
    return config ? (
      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", config.color)}>
        {config.label}
      </Badge>
    ) : null;
  };

  const getImpactIndicator = (impact?: string) => {
    if (!impact) return null;
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-amber-500',
      low: 'bg-emerald-500',
    };
    return (
      <div className={cn("w-2 h-2 rounded-full", colors[impact as keyof typeof colors])} />
    );
  };

  const handleStartEdit = (assumption: Assumption) => {
    setEditingId(assumption.id);
    setEditValue(String(assumption.value));
  };

  const handleSaveEdit = (id: string) => {
    if (onAssumptionChange) {
      onAssumptionChange(id, editValue);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("border-border/50 bg-muted/30", className)}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Calculator className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">
                  {isArabic ? titleAr : title}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {assumptions.length}
                </Badge>
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                {lastUpdated && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(lastUpdated), 'MMM d, yyyy')}
                  </span>
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
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-2">
              {assumptions.map((assumption) => (
                <div
                  key={assumption.id}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/30",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn("flex items-center gap-2 flex-1", isRTL && "flex-row-reverse")}>
                    {getImpactIndicator(assumption.impact)}
                    <div className={cn(isRTL && "text-right")}>
                      <p className="text-sm font-medium">
                        {isArabic && assumption.labelAr ? assumption.labelAr : assumption.label}
                      </p>
                      {assumption.description && (
                        <p className="text-[10px] text-muted-foreground">
                          {isArabic && assumption.descriptionAr ? assumption.descriptionAr : assumption.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    {editingId === assumption.id ? (
                      <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 w-24 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleSaveEdit(assumption.id)}
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-mono font-medium">
                          {isArabic && assumption.valueAr ? assumption.valueAr : assumption.value}
                          {assumption.unit && (
                            <span className="text-muted-foreground ml-1">
                              {isArabic && assumption.unitAr ? assumption.unitAr : assumption.unit}
                            </span>
                          )}
                        </span>
                        {getSourceBadge(assumption.source)}
                        {canEdit && assumption.editable && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleStartEdit(assumption)}
                          >
                            <Edit2 className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {assumptions.some(a => a.source === 'estimated') && (
              <div className={cn(
                "mt-3 pt-3 border-t border-border/30 flex items-start gap-2 text-[10px] text-amber-600",
                isRTL && "flex-row-reverse text-right"
              )}>
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>
                  {isArabic 
                    ? 'بعض القيم تقديرية وقد تختلف عن القيم الفعلية. راجع السياسة للحصول على التفاصيل الدقيقة.'
                    : 'Some values are estimated and may differ from actual. Refer to policy for exact details.'}
                </span>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
