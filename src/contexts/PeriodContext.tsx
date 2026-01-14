import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { startOfMonth, startOfQuarter, startOfYear, endOfMonth, endOfQuarter, endOfYear, format, subMonths, subYears } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

export type PeriodType = 'MTD' | 'QTD' | 'YTD' | 'custom';
export type FiscalYearType = 'calendar' | 'fiscal';

interface PeriodRange {
  start: Date;
  end: Date;
}

interface ComparisonData {
  enabled: boolean;
  type: 'period' | 'year';
  range: PeriodRange | null;
}

interface PeriodContextType {
  period: PeriodType;
  setPeriod: (period: PeriodType) => void;
  customRange: PeriodRange | null;
  setCustomRange: (range: PeriodRange | null) => void;
  dateRange: PeriodRange;
  fiscalYearType: FiscalYearType;
  setFiscalYearType: (type: FiscalYearType) => void;
  comparison: ComparisonData;
  setComparison: (comparison: ComparisonData) => void;
  formatPeriodLabel: () => string;
  fiscalYear: number;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
  const [period, setPeriod] = useState<PeriodType>('YTD');
  const [customRange, setCustomRange] = useState<PeriodRange | null>(null);
  const [fiscalYearType, setFiscalYearType] = useState<FiscalYearType>('calendar');
  const [comparison, setComparison] = useState<ComparisonData>({
    enabled: false,
    type: 'period',
    range: null,
  });

  const today = new Date();
  const fiscalYear = today.getFullYear();

  const dateRange = useMemo<PeriodRange>(() => {
    if (period === 'custom' && customRange) {
      return customRange;
    }

    switch (period) {
      case 'MTD':
        return { start: startOfMonth(today), end: today };
      case 'QTD':
        return { start: startOfQuarter(today), end: today };
      case 'YTD':
      default:
        return { start: startOfYear(today), end: today };
    }
  }, [period, customRange, today]);

  const formatPeriodLabel = useMemo(() => {
    return () => {
      const locale = isArabic ? ar : undefined;
      
      if (period === 'custom' && customRange) {
        return `${format(customRange.start, 'MMM d', { locale })} - ${format(customRange.end, 'MMM d, yyyy', { locale })}`;
      }

      const labels = {
        MTD: isArabic ? 'من بداية الشهر' : 'Month to Date',
        QTD: isArabic ? 'من بداية الربع' : 'Quarter to Date',
        YTD: isArabic ? `${fiscalYear} من بداية السنة` : `${fiscalYear} Year to Date`,
      };

      return labels[period] || labels.YTD;
    };
  }, [period, customRange, fiscalYear, isArabic]);

  return (
    <PeriodContext.Provider
      value={{
        period,
        setPeriod,
        customRange,
        setCustomRange,
        dateRange,
        fiscalYearType,
        setFiscalYearType,
        comparison,
        setComparison,
        formatPeriodLabel,
        fiscalYear,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
}
