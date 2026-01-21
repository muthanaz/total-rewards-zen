/**
 * TopBenefitsTable
 * 
 * Enhanced benefits table with Utilization %, Avg Value, Trend, and sorting.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Benefit {
  name: string;
  utilizationRate: number;
  avgValue: number;
  trend: number; // percentage change
  claims: number;
}

interface TopBenefitsTableProps {
  benefits: Benefit[];
}

type SortKey = 'utilizationRate' | 'avgValue' | 'trend';
type SortDir = 'asc' | 'desc';

export function TopBenefitsTable({ benefits }: TopBenefitsTableProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [sortKey, setSortKey] = useState<SortKey>('utilizationRate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedBenefits = [...benefits].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortButton = ({ column, label }: { column: SortKey; label: string }) => {
    const isActive = sortKey === column;
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-auto p-0 font-medium hover:bg-transparent",
          isActive && "text-primary"
        )}
        onClick={() => handleSort(column)}
      >
        {label}
        {isActive ? (
          sortDir === 'desc' ? (
            <ChevronDown className="w-3 h-3 ms-1" />
          ) : (
            <ChevronUp className="w-3 h-3 ms-1" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 ms-1 opacity-50" />
        )}
      </Button>
    );
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getTrendBadge = (trend: number) => {
    const color = trend > 0 
      ? 'bg-success/10 text-success' 
      : trend < 0 
        ? 'bg-destructive/10 text-destructive' 
        : 'bg-muted text-muted-foreground';
    return (
      <Badge variant="outline" className={cn("text-xs border-0", color)}>
        {getTrendIcon(trend)}
        <span className="ms-1">{trend > 0 ? '+' : ''}{trend}%</span>
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Activity className="w-5 h-5 text-primary" />
          {t('Top Performing Benefits (Platform-wide)', 'أفضل المزايا أداءً (على مستوى المنصة)')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className={cn("py-2 text-left font-medium text-sm", isRTL && "text-right")}>
                  {t('Benefit', 'الميزة')}
                </th>
                <th className={cn("py-2 text-left font-medium text-sm", isRTL && "text-right")}>
                  <SortButton column="utilizationRate" label={t('Utilization', 'الاستخدام')} />
                </th>
                <th className={cn("py-2 text-left font-medium text-sm", isRTL && "text-right")}>
                  <SortButton column="avgValue" label={t('Avg Value', 'متوسط القيمة')} />
                </th>
                <th className={cn("py-2 text-left font-medium text-sm", isRTL && "text-right")}>
                  <SortButton column="trend" label={t('Trend', 'الاتجاه')} />
                </th>
                <th className={cn("py-2 text-right font-medium text-sm", isRTL && "text-left")}>
                  {t('Claims', 'المطالبات')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBenefits.map((benefit, index) => (
                <tr 
                  key={benefit.name} 
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30 transition-colors",
                    index === 0 && "bg-success/5"
                  )}
                >
                  <td className={cn("py-3", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      {index === 0 && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                          #1
                        </Badge>
                      )}
                      <span className="font-medium">{benefit.name}</span>
                    </div>
                  </td>
                  <td className={cn("py-3", isRTL && "text-right")}>
                    <div className={cn("flex items-center gap-2 w-32", isRTL && "flex-row-reverse")}>
                      <Progress value={benefit.utilizationRate} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-10 text-right">{benefit.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className={cn("py-3 text-sm", isRTL && "text-right")}>
                    {formatCurrencyAED(benefit.avgValue)}
                  </td>
                  <td className={cn("py-3", isRTL && "text-right")}>
                    {getTrendBadge(benefit.trend)}
                  </td>
                  <td className={cn("py-3 text-sm text-right tabular-nums", isRTL && "text-left")}>
                    {benefit.claims.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
