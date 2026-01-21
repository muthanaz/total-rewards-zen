/**
 * InteractiveIndustryChart
 * 
 * Industry distribution donut chart with click-to-filter functionality.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatedDonutChart } from '@/components/charts';

interface IndustryData {
  name: string;
  value: number;
  color: string;
  organizations?: number;
  employees?: number;
}

interface InteractiveIndustryChartProps {
  data: IndustryData[];
  onIndustrySelect?: (industry: string | null) => void;
  selectedIndustry?: string | null;
}

export function InteractiveIndustryChart({ 
  data, 
  onIndustrySelect,
  selectedIndustry,
}: InteractiveIndustryChartProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleSliceClick = (item: IndustryData) => {
    if (selectedIndustry === item.name) {
      onIndustrySelect?.(null);
    } else {
      onIndustrySelect?.(item.name);
    }
  };

  const selectedData = selectedIndustry 
    ? data.find(d => d.name === selectedIndustry) 
    : null;

  return (
    <Card className={cn(
      "transition-all duration-300",
      selectedIndustry && "ring-2 ring-primary/30"
    )}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <PieChart className="w-5 h-5 text-primary" />
              {t('Industry Distribution', 'توزيع الصناعات')}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {t('Click a segment to filter dashboard', 'انقر على شريحة لتصفية لوحة المعلومات')}
            </CardDescription>
          </div>
          {selectedIndustry && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onIndustrySelect?.(null)}
            >
              <X className="w-3 h-3 me-1" />
              {t('Clear', 'مسح')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <AnimatedDonutChart
            data={data}
            height={180}
            innerRadius={45}
            outerRadius={75}
            onSliceClick={(item) => handleSliceClick(item as IndustryData)}
          />
          
          {/* Center content when industry is selected */}
          {selectedData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-lg font-bold">{selectedData.value}%</p>
                <p className="text-[10px] text-muted-foreground max-w-[60px] truncate">
                  {selectedData.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Legend with click interaction */}
        <div className="mt-4 space-y-1.5">
          {data.map((item) => {
            const isSelected = selectedIndustry === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleSliceClick(item)}
                className={cn(
                  "w-full flex items-center justify-between text-sm p-2 rounded-lg transition-all",
                  "hover:bg-muted/50",
                  isSelected && "bg-muted ring-1 ring-primary/30",
                  selectedIndustry && !isSelected && "opacity-50",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <div 
                    className={cn(
                      "w-3 h-3 rounded-full transition-transform",
                      isSelected && "scale-125"
                    )} 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className={cn(isSelected && "font-medium")}>{item.name}</span>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <span className="font-medium">{item.value}%</span>
                  {isSelected && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      {t('Active', 'نشط')}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
