import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertTriangle, Info } from 'lucide-react';

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  period?: 'monthly' | 'annual' | 'mtd' | 'qtd' | 'ytd' | 'custom';
  periodLabel?: string;
  periodLabelAr?: string;
  type?: 'gross' | 'net' | 'estimated';
  showDecimals?: boolean;
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  masked?: boolean;
  definition?: string;
  definitionAr?: string;
}

export function CurrencyDisplay({
  value,
  currency = 'AED',
  period,
  periodLabel,
  periodLabelAr,
  type,
  showDecimals = false,
  compact = false,
  size = 'md',
  className,
  masked = false,
  definition,
  definitionAr,
}: CurrencyDisplayProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const formattedValue = useMemo(() => {
    if (masked) return '•••,•••';

    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    };

    if (compact) {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
      }
    }

    return new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-AE', options).format(value);
  }, [value, masked, showDecimals, compact, isArabic]);

  const getPeriodLabel = () => {
    if (periodLabel) return isArabic && periodLabelAr ? periodLabelAr : periodLabel;
    
    const labels = {
      monthly: { en: '/mo', ar: '/شهر' },
      annual: { en: '/yr', ar: '/سنة' },
      mtd: { en: 'MTD', ar: 'م.ح.ش' },
      qtd: { en: 'QTD', ar: 'م.ح.ر' },
      ytd: { en: 'YTD', ar: 'م.ح.س' },
      custom: { en: '', ar: '' },
    };
    
    return period ? (isArabic ? labels[period].ar : labels[period].en) : null;
  };

  const getTypeLabel = () => {
    if (!type) return null;
    const labels = {
      gross: { en: 'Gross', ar: 'إجمالي' },
      net: { en: 'Net', ar: 'صافي' },
      estimated: { en: 'Est.', ar: 'تقدير' },
    };
    return isArabic ? labels[type].ar : labels[type].en;
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl font-semibold',
      xl: 'text-2xl font-bold',
    };
    return sizes[size];
  };

  const content = (
    <span className={cn(
      "inline-flex items-center gap-1",
      getSizeClasses(),
      className,
      isRTL && "flex-row-reverse"
    )}>
      {!isArabic && <span className="text-muted-foreground">{currency}</span>}
      <span className="font-mono">{formattedValue}</span>
      {isArabic && <span className="text-muted-foreground">درهم</span>}
      {getPeriodLabel() && (
        <span className="text-xs text-muted-foreground">{getPeriodLabel()}</span>
      )}
      {type && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[9px] px-1 py-0 ml-1",
            type === 'estimated' && "bg-amber-500/10 text-amber-600 border-amber-500/20"
          )}
        >
          {type === 'estimated' && <AlertTriangle className="w-2 h-2 mr-0.5" />}
          {getTypeLabel()}
        </Badge>
      )}
    </span>
  );

  if (definition) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{content}</span>
          </TooltipTrigger>
          <TooltipContent side={isRTL ? "left" : "right"} className="max-w-xs">
            <p className="text-xs">
              {isArabic && definitionAr ? definitionAr : definition}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// Specialized component for benefit values
interface BenefitValueDisplayProps {
  entitlement?: number;
  eligible?: number;
  claimed?: number;
  approved?: number;
  paid?: number;
  utilized?: number;
  showType: 'entitlement' | 'eligible' | 'claimed' | 'approved' | 'paid' | 'utilized' | 'remaining';
  period?: 'monthly' | 'annual' | 'ytd';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BenefitValueDisplay({
  entitlement = 0,
  eligible = 0,
  claimed = 0,
  approved = 0,
  paid = 0,
  utilized = 0,
  showType,
  period = 'annual',
  size = 'md',
  className,
}: BenefitValueDisplayProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const getValue = () => {
    switch (showType) {
      case 'entitlement': return entitlement;
      case 'eligible': return eligible;
      case 'claimed': return claimed;
      case 'approved': return approved;
      case 'paid': return paid;
      case 'utilized': return utilized;
      case 'remaining': return entitlement - utilized;
    }
  };

  const getDefinitions = () => {
    const definitions = {
      entitlement: {
        en: 'Total annual allowance based on your grade and policy',
        ar: 'إجمالي البدل السنوي بناءً على درجتك والسياسة',
      },
      eligible: {
        en: 'Amount you can claim based on eligibility rules',
        ar: 'المبلغ الذي يمكنك المطالبة به بناءً على قواعد الأهلية',
      },
      claimed: {
        en: 'Total amount submitted for reimbursement',
        ar: 'إجمالي المبلغ المقدم للاسترداد',
      },
      approved: {
        en: 'Amount approved after review',
        ar: 'المبلغ المعتمد بعد المراجعة',
      },
      paid: {
        en: 'Amount transferred to your account',
        ar: 'المبلغ المحول إلى حسابك',
      },
      utilized: {
        en: 'Approved + Paid amount (consumed benefits)',
        ar: 'المبلغ المعتمد + المدفوع (المزايا المستهلكة)',
      },
      remaining: {
        en: 'Entitlement minus utilized (available to use)',
        ar: 'الاستحقاق ناقص المستخدم (متاح للاستخدام)',
      },
    };
    return definitions[showType];
  };

  const def = getDefinitions();

  return (
    <CurrencyDisplay
      value={getValue()}
      period={period}
      size={size}
      className={className}
      definition={def.en}
      definitionAr={def.ar}
    />
  );
}
