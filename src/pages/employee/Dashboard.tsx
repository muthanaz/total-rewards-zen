import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock, Landmark, TrendingUp, Calendar, Zap, ArrowRight, ArrowLeft, FileText, Sparkles, Target, Lightbulb, Eye, EyeOff
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { usePrivacy } from '@/components/ui/privacy-toggle';
import { cn } from '@/lib/utils';
import { CompensationBreakdownModal } from '@/components/employee/CompensationBreakdownModal';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { PrimaryInsight } from '@/components/ui/primary-insight';
import { ActionQueue, ActionItem } from '@/components/ui/action-queue';
import { ConfidenceGate } from '@/components/employer/ConfidenceGate';
import { AnimatedDonutChart } from '@/components/charts';
import { MetricTooltip } from '@/components/ui/metric-tooltip';
import { motion } from 'framer-motion';

// Demo data - core salary info
const salaryData = {
  monthlySalary: 35000,
  annualSalary: 420000,
  salaryType: 'gross' as const, // 'gross' | 'net'
  leaveBalance: 22,
  leaveUsed: 8,
  activatedItems: 7,
};

type BenefitValueType = 'guaranteed' | 'employer_cost' | 'performance' | 'budget';

const benefits = [
  { name: 'Housing Allowance', nameAr: 'بدل السكن', icon: Home, value: 120000, utilized: 120000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, route: '/employee/housing', category: 'housing', deadline: null },
  { name: 'Education Allowance', nameAr: 'بدل التعليم', icon: GraduationCap, value: 60000, utilized: 42000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, route: '/employee/schooling', category: 'education', deadline: null },
  { name: 'Health Insurance', nameAr: 'التأمين الصحي', icon: Heart, value: 45000, utilized: 12500, type: 'health_protection', valueType: 'employer_cost' as BenefitValueType, route: '/employee/health', category: 'health', deadline: null },
  { name: 'Transport & Mobility', nameAr: 'النقل والتنقل', icon: Car, value: 39000, utilized: 33000, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, route: '/employee/transport', category: 'transport', deadline: null },
  { name: 'Annual Bonus', nameAr: 'المكافأة السنوية', icon: Gift, value: 70000, utilized: 0, type: 'cash_allowances', valueType: 'performance' as BenefitValueType, route: '/employee/bonus', category: 'rewards', deadline: '2025-03-31' },
  { name: 'Savings Plan', nameAr: 'خطة الادخار', icon: PiggyBank, value: 36000, utilized: 18000, type: 'wealth_ownership', valueType: 'budget' as BenefitValueType, route: '/employee/financial', category: 'financial', deadline: null },
  { name: 'Wellbeing Budget', nameAr: 'ميزانية العافية', icon: Dumbbell, value: 6000, utilized: 3200, type: 'wellbeing', valueType: 'budget' as BenefitValueType, route: '/employee/wellbeing', category: 'wellbeing', deadline: '2025-12-31' },
  { name: 'Learning Budget', nameAr: 'ميزانية التعلم', icon: BookOpen, value: 12000, utilized: 4500, type: 'growth_career', valueType: 'budget' as BenefitValueType, route: '/employee/learning', category: 'learning', deadline: '2025-12-31' },
  { name: 'End of Service', nameAr: 'مكافأة نهاية الخدمة', icon: Landmark, value: 102083, utilized: 102083, type: 'cash_allowances', valueType: 'guaranteed' as BenefitValueType, route: '/employee/gratuity', category: 'gratuity', deadline: null },
  { name: 'Equity & Options', nameAr: 'الأسهم والخيارات', icon: TrendingUp, value: 85000, utilized: 42500, type: 'wealth_ownership', valueType: 'performance' as BenefitValueType, route: '/employee/equity', category: 'equity', deadline: '2025-06-30' },
];

// Demo pending requests
const pendingRequests = [
  { id: '1', subject: 'Medical Reimbursement', subjectAr: 'استرداد طبي', status: 'in_review', amount: 1250, created_at: '2025-01-10' },
  { id: '2', subject: 'Education Fee Claim', subjectAr: 'مطالبة رسوم تعليم', status: 'pending', amount: 8500, created_at: '2025-01-08' },
];

// Demo marketplace offers expiring
const expiringOffers = [
  { id: '1', title: 'Gym Membership - 40% off', titleAr: 'اشتراك نادي - خصم 40%', merchant: 'Fitness First', expires: '2025-01-20' },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isElementVisible } = useUIVisibility();
  const { salaryHidden, toggleSalaryVisibility } = usePrivacy();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const [compensationModalOpen, setCompensationModalOpen] = useState(false);
  
  const showSatisfactionSurvey = isElementVisible('employee', 'dashboard', 'satisfaction_survey');
  
  // Calculate metrics with clear definitions
  const metrics = useMemo(() => {
    const totalBenefitsValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    
    // Core = guaranteed allowances (paid regardless)
    const coreBenefits = benefits
      .filter(b => b.valueType === 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    
    // Variable = performance-based + budgets
    const variableBenefits = benefits
      .filter(b => b.valueType === 'performance' || b.valueType === 'budget')
      .reduce((sum, b) => sum + b.value, 0);
    
    // Long-term = wealth/ownership benefits
    const longTermBenefits = benefits
      .filter(b => b.type === 'wealth_ownership')
      .reduce((sum, b) => sum + b.value, 0);
    
    // Claimable remaining = ONLY budgets with remaining value (not guaranteed allowances)
    const claimableRemaining = benefits
      .filter(b => b.valueType === 'budget')
      .reduce((sum, b) => sum + Math.max(0, b.value - b.utilized), 0);
    
    // Unused value = benefits not yet utilized (for opportunities)
    const unusedValue = benefits
      .filter(b => b.valueType === 'budget' || b.valueType === 'performance')
      .reduce((sum, b) => sum + Math.max(0, b.value - b.utilized), 0);
    
    const utilizationPercent = totalBenefitsValue > 0 
      ? Math.round((totalUtilized / totalBenefitsValue) * 100) 
      : 0;
    
    // Total Rewards = Annual Salary + All Benefits
    const totalRewards = salaryData.annualSalary + totalBenefitsValue;
    
    return {
      totalBenefitsValue,
      totalUtilized,
      unusedValue,
      coreBenefits,
      variableBenefits,
      longTermBenefits,
      claimableRemaining,
      utilizationPercent,
      totalRewards,
    };
  }, []);

  // Build actions for Benefits Maximizer
  const benefitActions = useMemo((): ActionItem[] => {
    const now = new Date();
    const actions: ActionItem[] = [];

    // Find underutilized benefits
    benefits.forEach(b => {
      const remaining = b.value - b.utilized;
      const utilization = (b.utilized / b.value) * 100;
      
      if (remaining > 0 && utilization < 80 && b.valueType === 'budget') {
        const hasDeadline = b.deadline && new Date(b.deadline) > now;
        const daysToDeadline = b.deadline ? Math.ceil((new Date(b.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
        
        actions.push({
          id: b.category,
          title: `Use your ${b.name}`,
          titleAr: `استخدم ${b.nameAr}`,
          description: daysToDeadline ? `${daysToDeadline} days left` : `${Math.round(100 - utilization)}% unused`,
          descriptionAr: daysToDeadline ? `${daysToDeadline} يوم متبقي` : `${Math.round(100 - utilization)}% غير مستخدم`,
          icon: b.icon,
          route: b.route,
          value: `AED ${remaining.toLocaleString()}`,
          priority: daysToDeadline && daysToDeadline < 60 ? 'high' : utilization < 30 ? 'medium' : 'low',
        });
      }
    });

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
      return (priorityOrder[a.priority || 'undefined'] || 3) - (priorityOrder[b.priority || 'undefined'] || 3);
    }).slice(0, 3);
  }, []);

  // Build deadline actions
  const deadlineActions = useMemo((): ActionItem[] => {
    const items: ActionItem[] = [];

    // Pending claims
    pendingRequests.forEach(req => {
      items.push({
        id: `claim-${req.id}`,
        title: req.subject,
        titleAr: req.subjectAr,
        description: `AED ${req.amount?.toLocaleString()}`,
        icon: FileText,
        route: '/employee/documents',
        status: req.status === 'in_review' ? 'in_progress' : 'pending',
      });
    });

    // Expiring offers
    expiringOffers.forEach(offer => {
      items.push({
        id: `offer-${offer.id}`,
        title: offer.title,
        titleAr: offer.titleAr,
        description: offer.merchant,
        icon: Gift,
        route: '/employee/marketplace',
        badge: 'Expiring',
        badgeAr: 'ينتهي قريباً',
        priority: 'medium',
      });
    });

    return items.slice(0, 4);
  }, []);

  // Package breakdown for chart
  const packageBreakdown = useMemo(() => [
    { name: isArabic ? 'الراتب الأساسي' : 'Base Salary', value: salaryData.annualSalary, color: 'hsl(var(--primary))' },
    { name: isArabic ? 'المزايا الأساسية' : 'Core Benefits', value: metrics.coreBenefits, color: 'hsl(var(--accent))' },
    { name: isArabic ? 'المتغيرة' : 'Variable', value: metrics.variableBenefits, color: 'hsl(38 92% 50%)' },
    { name: isArabic ? 'طويلة الأجل' : 'Long-term', value: metrics.longTermBenefits, color: 'hsl(271 81% 56%)' },
  ], [metrics, isArabic]);

  const formatCurrency = (value: number) => `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;
  const formatHidden = () => salaryHidden ? '•••,•••' : null;

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // Utilization chart data
  const utilizationChartData = useMemo(() => [
    { name: isArabic ? 'مستخدم' : 'Utilized', value: metrics.totalUtilized, color: 'hsl(var(--primary))' },
    { name: isArabic ? 'متاح' : 'Available', value: metrics.totalBenefitsValue - metrics.totalUtilized, color: 'hsl(var(--muted))' },
  ], [metrics, isArabic]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title={isArabic ? 'مرحباً بك' : 'Welcome back'}
        subtitle={isArabic ? 'إليك ما يمكنك فعله اليوم' : "Here's what you can do today"}
      />

      {/* Status Strip */}
      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource="Benefits System"
        dataSourceAr="نظام المزايا"
      />

      {/* PRIMARY INSIGHT BLOCK 1: Total Rewards Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Total Rewards Card */}
        <Card className="lg:col-span-2 border-2 border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
          <CardContent className="p-6">
            <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <div className="p-2.5 rounded-xl bg-accent/10">
                  <Wallet className="w-6 h-6 text-accent" />
                </div>
                <div className={isRTL ? "text-right" : ""}>
                  <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {isArabic ? 'إجمالي المكافآت السنوية' : 'Annual Total Rewards'}
                    <MetricTooltip metricKey="total_rewards" confidence="high" />
                  </h2>
                  <p className="text-xs text-muted-foreground/70">
                    {isArabic ? 'الراتب + المزايا' : 'Salary + Benefits'}
                    {salaryData.salaryType === 'gross' && (
                      <Badge variant="outline" className="ml-2 text-[9px] px-1">
                        {isArabic ? 'إجمالي' : 'Gross'}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleSalaryVisibility}
                className="h-8 w-8"
              >
                {salaryHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-4xl font-bold text-foreground tracking-tight mb-4">
              {salaryHidden ? '•••,•••' : formatCurrency(metrics.totalRewards)}
            </p>

            {/* Breakdown */}
            <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", isRTL && "text-right")}>
              {[
                { label: isArabic ? 'الراتب' : 'Salary', value: salaryData.annualSalary, color: 'text-foreground' },
                { label: isArabic ? 'مزايا أساسية' : 'Core Benefits', value: metrics.coreBenefits, color: 'text-accent' },
                { label: isArabic ? 'متغيرة' : 'Variable', value: metrics.variableBenefits, color: 'text-amber-600' },
                { label: isArabic ? 'طويلة الأجل' : 'Long-term', value: metrics.longTermBenefits, color: 'text-purple-600' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={cn("text-sm font-bold tabular-nums", item.color)}>
                    {salaryHidden ? '•••' : formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>

            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setCompensationModalOpen(true)}
              className={cn("mt-3 p-0 h-auto text-accent gap-1", isRTL && "flex-row-reverse")}
            >
              {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Breakdown'}
              <ChevronIcon className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Utilization Donut */}
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className={cn("flex items-center gap-2 mb-4", isRTL && "flex-row-reverse")}>
              <Target className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-medium">
                {isArabic ? 'استخدام المزايا' : 'Benefit Utilization'}
              </h3>
              <MetricTooltip metricKey="utilization_rate" confidence="high" />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 relative">
                <AnimatedDonutChart 
                  data={utilizationChartData}
                  innerRadius={40}
                  outerRadius={55}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{metrics.utilizationPercent}%</span>
                  <span className="text-xs text-muted-foreground">{isArabic ? 'مستخدم' : 'used'}</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قابل للمطالبة' : 'Claimable'}
                </p>
                <p className="text-lg font-bold text-accent">
                  {formatCurrency(metrics.claimableRemaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIMARY INSIGHT BLOCK 2: Opportunities */}
      {metrics.claimableRemaining > 0 && (
        <PrimaryInsight
          title={isArabic ? 'فرص المزايا' : 'Benefit Opportunities'}
          titleAr="فرص المزايا"
          value={formatHidden() || formatCurrency(metrics.claimableRemaining)}
          subtitle={`${benefitActions.length} ${isArabic ? 'إجراءات مقترحة' : 'suggested actions'}`}
          subtitleAr={`${benefitActions.length} إجراءات مقترحة`}
          icon={Lightbulb}
          iconColor="text-amber-500"
          confidence="high"
          source={isArabic ? 'مزايا الميزانية المتبقية' : 'Remaining budget benefits'}
          sourceAr="مزايا الميزانية المتبقية"
          formula="Sum of (Budget - Utilized) for claimable benefits"
          formulaAr="مجموع (الميزانية - المستخدم) للمزايا القابلة للمطالبة"
          variant="warning"
          action={benefitActions.length > 0 ? {
            label: 'View Opportunities',
            labelAr: 'عرض الفرص',
            onClick: () => navigate('/employee/insights'),
          } : undefined}
        />
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isArabic ? 'تقديم مطالبة' : 'Submit Claim', icon: FileText, route: '/employee/documents' },
          { label: isArabic ? 'طلب إجازة' : 'Request Leave', icon: Calendar, route: '/employee/leave' },
          { label: isArabic ? 'السوق' : 'Marketplace', icon: Gift, route: '/employee/marketplace' },
          { label: isArabic ? 'الملف الشخصي' : 'My Profile', icon: Wallet, route: '/employee/profile' },
        ].map((action, i) => (
          <motion.div
            key={action.route}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:border-accent/40 hover:shadow-sm transition-all"
              onClick={() => navigate(action.route)}
            >
              <CardContent className="p-4">
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-accent/10">
                    <action.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Satisfaction Survey */}
      {showSatisfactionSurvey && <SatisfactionSurvey />}

      {/* Compensation Modal */}
      <CompensationBreakdownModal 
        open={compensationModalOpen}
        salaryData={salaryData}
        benefits={benefits.map(b => ({ name: b.name, value: b.value, utilized: b.utilized, valueType: b.valueType }))}
        onOpenChange={setCompensationModalOpen} 
      />
    </div>
  );
}
