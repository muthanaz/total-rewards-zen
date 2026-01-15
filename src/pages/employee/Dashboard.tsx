import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock, Landmark, TrendingUp, Calendar, Zap, ArrowRight, ArrowLeft, FileText, Sparkles
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
import { AnimatedBarChart } from '@/components/charts';
import { motion } from 'framer-motion';

// Demo data - core salary info
const salaryData = {
  monthlySalary: 35000,
  annualSalary: 420000,
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
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    const unusedValue = totalValue - totalUtilized;
    
    // Core = guaranteed, Variable = performance, Long-term = wealth
    const coreBenefits = benefits
      .filter(b => b.valueType === 'guaranteed')
      .reduce((sum, b) => sum + b.value, 0);
    const variableBenefits = benefits
      .filter(b => b.valueType === 'performance' || b.valueType === 'budget')
      .reduce((sum, b) => sum + b.value, 0);
    const longTermBenefits = benefits
      .filter(b => b.type === 'wealth_ownership')
      .reduce((sum, b) => sum + b.value, 0);
    
    // Claimable remaining = budgets with remaining value
    const claimableRemaining = benefits
      .filter(b => b.valueType === 'budget')
      .reduce((sum, b) => sum + (b.value - b.utilized), 0);
    
    const utilizationPercent = Math.round((totalUtilized / totalValue) * 100);
    
    return {
      totalValue,
      totalUtilized,
      unusedValue,
      coreBenefits,
      variableBenefits,
      longTermBenefits,
      claimableRemaining,
      utilizationPercent,
      totalCompensation: salaryData.annualSalary + coreBenefits,
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

      {/* SECTION 1: Benefits Maximizer - Primary Insight */}
      <PrimaryInsight
        title={isArabic ? 'حاسب المزايا' : 'Benefits Maximizer'}
        titleAr="حاسب المزايا"
        value={formatHidden() || formatCurrency(metrics.unusedValue)}
        subtitle={`${metrics.utilizationPercent}% ${isArabic ? 'مستخدم من الإجمالي' : 'used of total'}`}
        subtitleAr={`${metrics.utilizationPercent}% مستخدم من الإجمالي`}
        icon={Sparkles}
        confidence={metrics.claimableRemaining > 0 ? 'high' : 'medium'}
        source={isArabic ? 'القيمة غير المستخدمة التقديرية' : 'Estimated unused value'}
        sourceAr="القيمة غير المستخدمة التقديرية"
        formula="Total Benefits - Utilized Amount"
        formulaAr="إجمالي المزايا - المبلغ المستخدم"
        action={benefitActions.length > 0 ? {
          label: 'View Opportunities',
          labelAr: 'عرض الفرص',
          onClick: () => navigate('/employee/insights'),
        } : undefined}
      />

      {/* Top 3 Actions */}
      {benefitActions.length > 0 && (
        <ActionQueue
          title={isArabic ? 'إجراءات مقترحة' : 'Suggested Actions'}
          titleAr="إجراءات مقترحة"
          actions={benefitActions}
          maxItems={3}
          allLink="/employee/insights"
        />
      )}

      {/* SECTION 2: Deadlines Panel */}
      {deadlineActions.length > 0 && (
        <ActionQueue
          title={isArabic ? 'المواعيد والطلبات' : 'Deadlines & Requests'}
          titleAr="المواعيد والطلبات"
          actions={deadlineActions}
          maxItems={4}
          allLink="/employee/documents"
          emptyMessage="No pending items"
          emptyMessageAr="لا توجد عناصر معلقة"
        />
      )}

      {/* SECTION 3: Total Rewards Snapshot - Stacked Bar */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
            <h2 className={cn("text-base font-display font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Wallet className="w-5 h-5 text-muted-foreground" />
              {isArabic ? 'ملخص الحزمة السنوية' : 'Annual Package Snapshot'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCompensationModalOpen(true)}
              className={cn("text-xs text-accent gap-1", isRTL && "flex-row-reverse")}
            >
              {isArabic ? 'عرض التفاصيل' : 'View Details'}
              <ChevronIcon className="w-3 h-3" />
            </Button>
          </div>

          <div className={cn("flex flex-wrap gap-4 justify-center", isRTL && "flex-row-reverse")}>
            {packageBreakdown.map((item) => (
              <div key={item.name} className={cn("flex items-center gap-2 text-xs", isRTL && "flex-row-reverse")}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>

          <div className={cn("text-center mt-4 pt-4 border-t border-border/50")}>
            <p className="text-sm text-muted-foreground">{isArabic ? 'إجمالي الحزمة السنوية' : 'Total Annual Package'}</p>
            <p className="text-2xl font-bold text-foreground">
              {formatHidden() || formatCurrency(salaryData.annualSalary + metrics.totalValue)}
            </p>
          </div>
        </CardContent>
      </Card>

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
        benefits={benefits.map(b => ({ name: b.name, nameAr: b.nameAr, value: b.value, utilized: b.utilized, type: b.type }))}
        onOpenChange={setCompensationModalOpen} 
      />
    </div>
  );
}
