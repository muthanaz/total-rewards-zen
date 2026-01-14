import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Home, GraduationCap, 
  Heart, Car, Dumbbell, PiggyBank, BookOpen, ChevronRight, ChevronLeft, Gift, Wallet, Banknote, AlertCircle, CheckCircle2, Clock, Landmark, TrendingUp, Calendar, Zap, ArrowRight, ArrowLeft, FileText, AlertTriangle, Sparkles
} from 'lucide-react';
import { SatisfactionSurvey } from '@/components/employee/SatisfactionSurvey';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUIVisibility } from '@/contexts/UIVisibilityContext';
import { usePrivacy } from '@/components/ui/privacy-toggle';
import { cn } from '@/lib/utils';
import { CompensationBreakdownModal } from '@/components/employee/CompensationBreakdownModal';
import { PageHeader } from '@/components/ui/page-header';
import { ConfidenceGate } from '@/components/employer/ConfidenceGate';
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
  { id: '1', subject: 'Medical Reimbursement', status: 'in_review', amount: 1250, created_at: '2025-01-10' },
  { id: '2', subject: 'Education Fee Claim', status: 'pending', amount: 8500, created_at: '2025-01-08' },
];

// Demo marketplace offers expiring
const expiringOffers = [
  { id: '1', title: 'Gym Membership - 40% off', merchant: 'Fitness First', expires: '2025-01-20' },
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
    
    // Core benefits = guaranteed cash allowances
    const coreBenefits = benefits
      .filter(b => b.valueType === 'guaranteed')
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
      claimableRemaining,
      utilizationPercent,
      totalCompensation: salaryData.annualSalary + coreBenefits,
    };
  }, []);

  // Get prioritized actions for Benefits Maximizer
  const prioritizedActions = useMemo(() => {
    const now = new Date();
    const actions: Array<{
      id: string;
      title: string;
      titleAr: string;
      value: number;
      route: string;
      icon: React.ElementType;
      urgency: 'high' | 'medium' | 'low';
      reason: string;
      reasonAr: string;
    }> = [];

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
          value: remaining,
          route: b.route,
          icon: b.icon,
          urgency: daysToDeadline && daysToDeadline < 60 ? 'high' : utilization < 30 ? 'medium' : 'low',
          reason: daysToDeadline ? `${daysToDeadline} days left` : `${Math.round(100 - utilization)}% unused`,
          reasonAr: daysToDeadline ? `${daysToDeadline} يوم متبقي` : `${Math.round(100 - utilization)}% غير مستخدم`,
        });
      }
    });

    return actions.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }).slice(0, 3);
  }, []);

  // Get upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      titleAr: string;
      type: 'claim' | 'offer' | 'benefit' | 'document';
      date: string;
      route: string;
      icon: React.ElementType;
      cta: string;
      ctaAr: string;
    }> = [];

    // Pending claims
    pendingRequests.forEach(req => {
      items.push({
        id: `claim-${req.id}`,
        title: req.subject,
        titleAr: req.subject,
        type: 'claim',
        date: req.created_at,
        route: '/employee/documents',
        icon: FileText,
        cta: 'Track',
        ctaAr: 'تتبع',
      });
    });

    // Expiring offers
    expiringOffers.forEach(offer => {
      items.push({
        id: `offer-${offer.id}`,
        title: offer.title,
        titleAr: offer.title,
        type: 'offer',
        date: offer.expires,
        route: '/employee/marketplace',
        icon: Gift,
        cta: 'Claim',
        ctaAr: 'احصل عليه',
      });
    });

    // Benefits with deadlines
    benefits.filter(b => b.deadline && b.utilized < b.value).forEach(b => {
      items.push({
        id: `benefit-${b.category}`,
        title: `${b.name} expires`,
        titleAr: `${b.nameAr} ينتهي`,
        type: 'benefit',
        date: b.deadline!,
        route: b.route,
        icon: Calendar,
        cta: 'Use',
        ctaAr: 'استخدم',
      });
    });

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);
  }, []);

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

      {/* SECTION 1: Benefits Maximizer Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-2 border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
          <CardContent className="p-6">
            <div className={cn("flex flex-col lg:flex-row gap-6", isRTL && "lg:flex-row-reverse")}>
              {/* Left: Unused Value Hero */}
              <div className={cn("flex-1", isRTL && "text-right")}>
                <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-display font-semibold">
                    {isArabic ? 'حاسب المزايا' : 'Benefits Maximizer'}
                  </h2>
                </div>
                
                <ConfidenceGate 
                  confidence={metrics.claimableRemaining > 0 ? 'high' : 'medium'}
                  showEstimatedLabel={metrics.claimableRemaining === 0}
                  metricName={isArabic ? 'القيمة غير المستخدمة' : 'Unused value'}
                >
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      {isArabic ? 'قيمة غير مستخدمة تقديرية' : 'Estimated unused value'}
                    </p>
                    <p className="text-4xl font-bold text-accent tracking-tight">
                      {formatHidden() || formatCurrency(metrics.unusedValue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? `${metrics.utilizationPercent}% مستخدم من الإجمالي` : `${metrics.utilizationPercent}% used of total`}
                    </p>
                  </div>
                </ConfidenceGate>

                <div className="flex items-center gap-2">
                  <Progress value={metrics.utilizationPercent} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{metrics.utilizationPercent}%</span>
                </div>
              </div>

              {/* Right: 3 Prioritized Actions */}
              <div className="flex-1 space-y-3">
                <p className={cn("text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                  {isArabic ? 'إجراءات مقترحة' : 'Suggested Actions'}
                </p>
                {prioritizedActions.map((action, i) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card 
                      className={cn(
                        "cursor-pointer hover:border-accent/40 transition-all",
                        action.urgency === 'high' && "border-amber-500/30 bg-amber-500/5"
                      )}
                      onClick={() => navigate(action.route)}
                    >
                      <CardContent className="p-3">
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            action.urgency === 'high' ? "bg-amber-500/10" : "bg-accent/10"
                          )}>
                            <action.icon className={cn(
                              "w-4 h-4",
                              action.urgency === 'high' ? "text-amber-600" : "text-accent"
                            )} />
                          </div>
                          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                            <p className="text-sm font-medium truncate">
                              {isArabic ? action.titleAr : action.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(action.value)} • {isArabic ? action.reasonAr : action.reason}
                            </p>
                          </div>
                          <ChevronIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SECTION 2: Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div>
          <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
            <h2 className="text-base font-display font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {isArabic ? 'المواعيد القادمة' : 'Upcoming Deadlines'}
            </h2>
            <Badge variant="outline" className="text-xs">
              {upcomingDeadlines.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingDeadlines.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="cursor-pointer hover:border-accent/40 hover:shadow-sm transition-all h-full"
                  onClick={() => navigate(item.route)}
                >
                  <CardContent className="p-4">
                    <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        item.type === 'claim' ? "bg-amber-500/10" : 
                        item.type === 'offer' ? "bg-violet-500/10" : "bg-blue-500/10"
                      )}>
                        <item.icon className={cn(
                          "w-4 h-4",
                          item.type === 'claim' ? "text-amber-600" : 
                          item.type === 'offer' ? "text-violet-600" : "text-blue-600"
                        )} />
                      </div>
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <p className="text-sm font-medium line-clamp-1">
                          {isArabic ? item.titleAr : item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(item.date).toLocaleDateString(isArabic ? 'ar-AE' : 'en-AE', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("w-full mt-3 text-xs justify-between", isRTL && "flex-row-reverse")}
                    >
                      {isArabic ? item.ctaAr : item.cta}
                      <ArrowIcon className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: My Package Snapshot (Compact) */}
      <div>
        <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
          <h2 className="text-base font-display font-semibold flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            {isArabic ? 'ملخص الحزمة' : 'My Package'}
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-accent"
            onClick={() => setCompensationModalOpen(true)}
          >
            {isArabic ? 'التفاصيل' : 'Details'}
            <ChevronIcon className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-4">
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'الراتب السنوي' : 'Annual Salary'}
                </p>
                <p className="text-lg font-bold">
                  {formatHidden() || formatCurrency(salaryData.annualSalary)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/5 to-background">
            <CardContent className="p-4">
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'المزايا الأساسية' : 'Core Benefits'}
                </p>
                <p className="text-lg font-bold">
                  {formatHidden() || formatCurrency(metrics.coreBenefits)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-background">
            <CardContent className="p-4">
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'إجمالي التعويضات' : 'Total Rewards'}
                </p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatHidden() || formatCurrency(metrics.totalCompensation)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className={cn(isRTL && "text-right")}>
                <p className="text-xs text-muted-foreground mb-1">
                  {isArabic ? 'رصيد الإجازات' : 'Leave Balance'}
                </p>
                <p className="text-lg font-bold">
                  {salaryData.leaveBalance - salaryData.leaveUsed} {isArabic ? 'يوم' : 'days'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className={cn("text-base font-display font-semibold mb-3", isRTL && "text-right")}>
          {isArabic ? 'روابط سريعة' : 'Quick Links'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: isArabic ? 'تقديم مطالبة' : 'Submit Claim', icon: FileText, route: '/employee/documents', color: 'bg-blue-500/10 text-blue-600' },
            { label: isArabic ? 'طلب إجازة' : 'Request Leave', icon: Calendar, route: '/employee/leave', color: 'bg-violet-500/10 text-violet-600' },
            { label: isArabic ? 'استكشاف المزايا' : 'Browse Benefits', icon: Gift, route: '/employee/benefits', color: 'bg-emerald-500/10 text-emerald-600' },
            { label: isArabic ? 'السوق' : 'Marketplace', icon: Zap, route: '/employee/marketplace', color: 'bg-amber-500/10 text-amber-600' },
          ].map((link, i) => (
            <Card 
              key={link.route}
              className="cursor-pointer hover:border-accent/40 transition-all"
              onClick={() => navigate(link.route)}
            >
              <CardContent className="p-3">
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className={cn("p-2 rounded-lg", link.color)}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Satisfaction Survey Section */}
      {showSatisfactionSurvey && (
        <SatisfactionSurvey compact={true} />
      )}

      {/* Compensation Breakdown Modal */}
      <CompensationBreakdownModal
        open={compensationModalOpen}
        onOpenChange={setCompensationModalOpen}
        isRTL={isRTL}
        salaryData={salaryData}
        benefits={benefits.map(b => ({
          name: b.name,
          value: b.value,
          utilized: b.utilized,
          valueType: b.valueType,
        }))}
      />
    </div>
  );
}
