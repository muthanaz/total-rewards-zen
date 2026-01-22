import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrencyAED, DIRHAM_SYMBOL } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Wallet, DollarSign, CheckCircle2, Clock, Gift } from 'lucide-react';

interface CompensationBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isRTL?: boolean;
  salaryData: {
    monthlySalary: number;
    annualSalary: number;
  };
  benefits: Array<{
    name: string;
    value: number;
    utilized: number;
    valueType: 'guaranteed' | 'employer_cost' | 'performance' | 'budget';
  }>;
}

const valueTypeConfig = {
  guaranteed: {
    label: 'Guaranteed',
    labelAr: 'مضمون',
    icon: Shield,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    description: 'Fixed cash paid monthly or annually',
    descriptionAr: 'نقد ثابت يُدفع شهرياً أو سنوياً',
  },
  employer_cost: {
    label: 'Employer-Paid',
    labelAr: 'يدفعه صاحب العمل',
    icon: CheckCircle2,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    description: 'Coverage paid by employer on your behalf',
    descriptionAr: 'تغطية يدفعها صاحب العمل نيابة عنك',
  },
  performance: {
    label: 'Performance-Based',
    labelAr: 'مبني على الأداء',
    icon: TrendingUp,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    description: 'Variable based on individual/company performance',
    descriptionAr: 'متغير بناءً على الأداء الفردي/الشركة',
  },
  budget: {
    label: 'Use-It Budget',
    labelAr: 'ميزانية للاستخدام',
    icon: Wallet,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    description: 'Annual allocation - use it or lose it',
    descriptionAr: 'تخصيص سنوي - استخدمه أو اخسره',
  },
};

export function CompensationBreakdownModal({
  open,
  onOpenChange,
  isRTL = false,
  salaryData,
  benefits,
}: CompensationBreakdownModalProps) {
  const formatCurrency = (value: number) => 
    formatCurrencyAED(value, { abbreviate: false });

  // Group benefits by valueType
  const guaranteedBenefits = benefits.filter(b => b.valueType === 'guaranteed');
  const employerPaidBenefits = benefits.filter(b => b.valueType === 'employer_cost');
  const performanceBenefits = benefits.filter(b => b.valueType === 'performance');
  const budgetBenefits = benefits.filter(b => b.valueType === 'budget');

  // Calculate totals
  const guaranteedTotal = guaranteedBenefits.reduce((sum, b) => sum + b.value, 0);
  const employerPaidTotal = employerPaidBenefits.reduce((sum, b) => sum + b.value, 0);
  const performanceTotal = performanceBenefits.reduce((sum, b) => sum + b.value, 0);
  const budgetTotal = budgetBenefits.reduce((sum, b) => sum + b.value, 0);
  
  const totalGuaranteedCompensation = salaryData.annualSalary + guaranteedTotal;
  const totalPotentialCompensation = salaryData.annualSalary + guaranteedTotal + employerPaidTotal + performanceTotal + budgetTotal;

  const sections = [
    {
      title: isRTL ? 'الراتب الأساسي' : 'Base Salary',
      type: 'salary' as const,
      items: [{ name: isRTL ? 'الراتب السنوي' : 'Annual Salary', value: salaryData.annualSalary, utilized: salaryData.annualSalary, valueType: 'guaranteed' as const }],
      total: salaryData.annualSalary,
      config: valueTypeConfig.guaranteed,
    },
    {
      title: isRTL ? 'المزايا المضمونة' : 'Guaranteed Benefits',
      type: 'guaranteed' as const,
      items: guaranteedBenefits,
      total: guaranteedTotal,
      config: valueTypeConfig.guaranteed,
    },
    {
      title: isRTL ? 'تغطية صاحب العمل' : 'Employer-Paid Coverage',
      type: 'employer_cost' as const,
      items: employerPaidBenefits,
      total: employerPaidTotal,
      config: valueTypeConfig.employer_cost,
    },
    {
      title: isRTL ? 'التعويضات المتغيرة' : 'Variable Compensation',
      type: 'performance' as const,
      items: performanceBenefits,
      total: performanceTotal,
      config: valueTypeConfig.performance,
    },
    {
      title: isRTL ? 'ميزانيات قابلة للاستخدام' : 'Use-It Budgets',
      type: 'budget' as const,
      items: budgetBenefits,
      total: budgetTotal,
      config: valueTypeConfig.budget,
    },
  ].filter(section => section.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("text-xl font-bold flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
            <DollarSign className="w-5 h-5 text-accent" />
            {isRTL ? 'تفاصيل حزمة التعويضات' : 'Compensation Package Breakdown'}
          </DialogTitle>
          <DialogDescription className={cn(isRTL && "text-right")}>
            {isRTL 
              ? 'عرض مفصل لجميع مكونات تعويضاتك حسب النوع'
              : 'Detailed view of all your compensation components by type'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {sections.map((section, sectionIndex) => {
            const IconComponent = section.config.icon;
            return (
              <motion.div
                key={section.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
              >
                <Card className={cn("p-4 border", section.config.color.replace('text-', 'border-').split(' ')[2])}>
                  {/* Section Header */}
                  <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <div className={cn("p-1.5 rounded-lg", section.config.color.split(' ')[0])}>
                        <IconComponent className={cn("w-4 h-4", section.config.color.split(' ')[1])} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{section.title}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {section.type !== 'salary' && (isRTL ? section.config.descriptionAr : section.config.description)}
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="font-bold text-foreground">{formatCurrency(section.total)}</p>
                      {section.type !== 'salary' && (
                        <Badge variant="outline" className={cn("text-[9px] mt-0.5", section.config.color)}>
                          {isRTL ? section.config.labelAr : section.config.label}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  {section.type !== 'salary' && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                      {section.items.map((item, itemIndex) => {
                        const utilization = Math.round((item.utilized / item.value) * 100);
                        return (
                          <div 
                            key={item.name} 
                            className={cn("flex items-center justify-between py-1.5", isRTL && "flex-row-reverse")}
                          >
                            <div className={cn("flex-1", isRTL && "text-right")}>
                              <p className="text-sm font-medium">{item.name}</p>
                              {section.type === 'budget' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={utilization} className="h-1 flex-1 max-w-[100px]" />
                                  <span className="text-[10px] text-muted-foreground">{utilization}% used</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}

          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sections.length * 0.1 }}
          >
            <Card className="p-4 bg-gradient-to-r from-accent/5 via-white to-amber-500/5 dark:from-accent/10 dark:via-card dark:to-amber-500/10 border-accent/20">
              <div className="space-y-3">
                {/* Guaranteed Total */}
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-sm">
                      {isRTL ? 'إجمالي التعويضات المضمونة' : 'Total Guaranteed Compensation'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalGuaranteedCompensation)}</p>
                </div>

                <div className="h-px bg-border/50" />

                {/* Potential Total */}
                <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Gift className="w-4 h-4 text-accent" />
                    <span className="font-medium text-sm">
                      {isRTL ? 'إجمالي الحزمة المحتملة' : 'Total Potential Package'}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-accent">{formatCurrency(totalPotentialCompensation)}</p>
                </div>

                <p className={cn("text-[10px] text-muted-foreground pt-2 border-t border-border/30", isRTL && "text-right")}>
                  {isRTL 
                    ? '* الإجمالي المحتمل يشمل المكافآت والميزانيات المتغيرة التي قد تختلف بناءً على الأداء والاستخدام'
                    : '* Potential total includes variable bonuses and budgets that may vary based on performance and usage'}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
