import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DepartmentData {
  name: string;
  nameAr: string;
  employees: number;
  utilization: number;
  satisfaction: number;
  participation: number;
  trend: 'up' | 'down' | 'stable';
}

const departmentData: DepartmentData[] = [
  { name: 'Engineering', nameAr: 'الهندسة', employees: 45, utilization: 72, satisfaction: 4.3, participation: 89, trend: 'up' },
  { name: 'Sales', nameAr: 'المبيعات', employees: 32, utilization: 58, satisfaction: 3.9, participation: 76, trend: 'down' },
  { name: 'Marketing', nameAr: 'التسويق', employees: 18, utilization: 81, satisfaction: 4.5, participation: 94, trend: 'up' },
  { name: 'Finance', nameAr: 'المالية', employees: 15, utilization: 65, satisfaction: 4.1, participation: 82, trend: 'stable' },
  { name: 'HR', nameAr: 'الموارد البشرية', employees: 12, utilization: 88, satisfaction: 4.6, participation: 100, trend: 'up' },
  { name: 'Operations', nameAr: 'العمليات', employees: 28, utilization: 45, satisfaction: 3.5, participation: 64, trend: 'down' },
  { name: 'Product', nameAr: 'المنتج', employees: 22, utilization: 77, satisfaction: 4.4, participation: 91, trend: 'up' },
  { name: 'Support', nameAr: 'الدعم', employees: 20, utilization: 52, satisfaction: 3.7, participation: 70, trend: 'stable' },
];

interface EngagementHeatmapProps {
  className?: string;
}

export function EngagementHeatmap({ className }: EngagementHeatmapProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';

  const getHeatmapColor = (value: number, type: 'utilization' | 'satisfaction' | 'participation') => {
    if (type === 'satisfaction') {
      // Scale 1-5 to percentage
      const percent = (value / 5) * 100;
      if (percent >= 80) return 'bg-emerald-500';
      if (percent >= 60) return 'bg-emerald-400';
      if (percent >= 40) return 'bg-amber-400';
      return 'bg-red-400';
    }
    
    if (value >= 80) return 'bg-emerald-500';
    if (value >= 60) return 'bg-emerald-400';
    if (value >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn(
            "text-base font-display font-semibold",
            isRTL && "text-right"
          )}>
            {isArabic ? 'خريطة المشاركة حسب القسم' : 'Engagement Heatmap by Department'}
          </CardTitle>
          <InfoTooltip 
            formula="Color intensity shows performance levels: Green (≥80%), Light Green (60-79%), Amber (40-59%), Red (<40%)" 
            dataSource="HR Analytics" 
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Header Row */}
        <div className={cn(
          "grid grid-cols-5 gap-2 mb-2 text-[10px] font-medium text-muted-foreground",
          isRTL && "text-right"
        )}>
          <div>{isArabic ? 'القسم' : 'Department'}</div>
          <div className="text-center">{isArabic ? 'الاستخدام' : 'Utilization'}</div>
          <div className="text-center">{isArabic ? 'الرضا' : 'Satisfaction'}</div>
          <div className="text-center">{isArabic ? 'المشاركة' : 'Participation'}</div>
          <div className="text-center">{isArabic ? 'الاتجاه' : 'Trend'}</div>
        </div>
        
        {/* Data Rows */}
        <div className="space-y-1.5">
          {departmentData.map((dept) => (
            <div 
              key={dept.name}
              className={cn(
                "grid grid-cols-5 gap-2 items-center p-1.5 rounded-lg hover:bg-muted/30 transition-colors",
                isRTL && "text-right"
              )}
            >
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <span className="text-xs font-medium truncate">
                  {isArabic ? dept.nameAr : dept.name}
                </span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">
                  {dept.employees}
                </Badge>
              </div>
              
              <div className="flex justify-center">
                <div className={cn(
                  "w-full max-w-[60px] h-6 rounded flex items-center justify-center text-[10px] font-bold text-white",
                  getHeatmapColor(dept.utilization, 'utilization')
                )}>
                  {dept.utilization}%
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className={cn(
                  "w-full max-w-[60px] h-6 rounded flex items-center justify-center text-[10px] font-bold text-white",
                  getHeatmapColor(dept.satisfaction, 'satisfaction')
                )}>
                  {dept.satisfaction}
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className={cn(
                  "w-full max-w-[60px] h-6 rounded flex items-center justify-center text-[10px] font-bold text-white",
                  getHeatmapColor(dept.participation, 'participation')
                )}>
                  {dept.participation}%
                </div>
              </div>
              
              <div className="flex justify-center">
                {getTrendIcon(dept.trend)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className={cn(
          "flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground",
          isRTL && "flex-row-reverse"
        )}>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            {isArabic ? 'ممتاز (≥80%)' : 'Excellent (≥80%)'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-400" />
            {isArabic ? 'جيد (60-79%)' : 'Good (60-79%)'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-400" />
            {isArabic ? 'متوسط (40-59%)' : 'Fair (40-59%)'}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-400" />
            {isArabic ? 'يحتاج تحسين (<40%)' : 'Needs Work (<40%)'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
