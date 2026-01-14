import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { PageHeader } from '@/components/ui/page-header';
import { 
  Home, GraduationCap, Heart, Car, Dumbbell, PiggyBank, 
  BookOpen, Search, ChevronRight, Filter, CheckCircle2, TrendingUp, Award, Clock, AlertCircle, Landmark,
  SortAsc, FileText, Calendar, Sparkles
} from 'lucide-react';
import { BENEFIT_CATEGORIES } from '@/lib/benefitCategories';
import { getRAGIndicator, getProgressColorClass } from '@/lib/colorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const benefits = [
  { name: 'Housing Allowance', nameAr: 'بدل السكن', icon: Home, value: 120000, utilized: 120000, category: 'housing', route: '/employee/housing', description: 'Monthly housing allowance paid with salary', descriptionAr: 'بدل السكن الشهري يُدفع مع الراتب', bullets: ['Paid monthly with salary', 'Can be used for rent or mortgage'], requiresAction: false, expiresEnd: true },
  { name: 'Education Allowance', nameAr: 'بدل التعليم', icon: GraduationCap, value: 60000, utilized: 42000, category: 'education', route: '/employee/schooling', description: 'Education support for dependents', descriptionAr: 'دعم تعليمي للمعالين', bullets: ['Per child up to 18 years', 'Covers tuition fees only'], requiresAction: true, expiresEnd: true },
  { name: 'Health Insurance', nameAr: 'التأمين الصحي', icon: Heart, value: 45000, utilized: 12500, category: 'health', route: '/employee/health', description: 'Comprehensive health coverage', descriptionAr: 'تغطية صحية شاملة', bullets: ['Includes dental and optical', 'Covers spouse and children'], requiresAction: false, expiresEnd: false },
  { name: 'Transport & Mobility', nameAr: 'النقل والتنقل', icon: Car, value: 39000, utilized: 33000, category: 'transport', route: '/employee/transport', description: 'Monthly transport and flight tickets', descriptionAr: 'بدل النقل الشهري وتذاكر الطيران', bullets: ['Paid monthly with salary', 'Includes annual flight tickets'], requiresAction: false, expiresEnd: true },
  { name: 'Annual Bonus', nameAr: 'المكافأة السنوية', icon: Award, value: 70000, utilized: 0, category: 'rewards', route: '/employee/bonus', description: 'Performance-based annual bonus', descriptionAr: 'مكافأة سنوية مبنية على الأداء', bullets: ['Performance-based (0-200%)', 'Target: 2 months salary'], requiresAction: false, expiresEnd: false },
  { name: 'Equity & Options', nameAr: 'الأسهم والخيارات', icon: TrendingUp, value: 50000, utilized: 50000, category: 'equity', route: '/employee/equity', description: 'Company stock options and RSUs', descriptionAr: 'خيارات الأسهم ووحدات الأسهم المقيدة', bullets: ['4-year vesting schedule', 'Quarterly vesting after cliff'], requiresAction: false, expiresEnd: false },
  { name: 'Financial Planning', nameAr: 'التخطيط المالي', icon: PiggyBank, value: 36000, utilized: 18000, category: 'financial', route: '/employee/financial', description: 'Retirement savings with employer match', descriptionAr: 'مدخرات التقاعد مع مطابقة صاحب العمل', bullets: ['5% employer match', 'Multiple fund options'], requiresAction: true, expiresEnd: true },
  { name: 'Wellbeing Program', nameAr: 'برنامج الرفاهية', icon: Dumbbell, value: 6000, utilized: 3200, category: 'wellbeing', route: '/employee/wellbeing', description: 'Health and wellness benefits', descriptionAr: 'مزايا الصحة والعافية', bullets: ['Gym membership covered', 'Wellness app subscription'], requiresAction: true, expiresEnd: true },
  { name: 'Learning & Development', nameAr: 'التعلم والتطوير', icon: BookOpen, value: 12000, utilized: 4500, category: 'learning', route: '/employee/learning', description: 'Professional development budget', descriptionAr: 'ميزانية التطوير المهني', bullets: ['Courses and certifications', 'Pre-approval required'], requiresAction: true, expiresEnd: true },
  { name: 'End of Service Gratuity', nameAr: 'مكافأة نهاية الخدمة', icon: Landmark, value: 102083, utilized: 102083, category: 'gratuity', route: '/employee/gratuity', description: 'Statutory end of service payment', descriptionAr: 'مكافأة نهاية الخدمة القانونية', bullets: ['UAE Labor Law entitlement', 'Paid on end of service'], requiresAction: false, expiresEnd: false },
];

type SortOption = 'remaining' | 'underutilized' | 'expiring' | 'action-needed' | 'name';

const sortOptions: { value: SortOption; label: string; labelAr: string }[] = [
  { value: 'remaining', label: 'Highest Remaining', labelAr: 'الأعلى متبقياً' },
  { value: 'underutilized', label: 'Most Underutilized', labelAr: 'الأقل استخداماً' },
  { value: 'expiring', label: 'Expiring Soon', labelAr: 'تنتهي قريباً' },
  { value: 'action-needed', label: 'Action Needed', labelAr: 'يتطلب إجراء' },
  { value: 'name', label: 'Name (A-Z)', labelAr: 'الاسم (أ-ي)' },
];

const categoryFilters = [
  { value: 'all', label: 'All Categories', labelAr: 'جميع الفئات' },
  ...Object.entries(BENEFIT_CATEGORIES).map(([key, cat]) => ({ value: key, label: cat.label, labelAr: cat.label })),
];

const utilizationFilters = [
  { value: 'all', label: 'All Status', labelAr: 'كل الحالات' },
  { value: 'fully-utilized', label: 'Fully Utilized (80%+)', labelAr: 'مستخدم بالكامل (80%+)' },
  { value: 'partial', label: 'Partially Used (30-79%)', labelAr: 'مستخدم جزئياً (30-79%)' },
  { value: 'underutilized', label: 'Underutilized (<30%)', labelAr: 'غير مستغل (<30%)' },
];

const RAGIcon = ({ status }: { status: 'green' | 'amber' | 'red' }) => {
  if (status === 'green') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === 'amber') return <Clock className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
};

export default function BenefitsPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [utilizationFilter, setUtilizationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('remaining');
  const [selectedBenefit, setSelectedBenefit] = useState<typeof benefits[0] | null>(null);

  const formatCurrency = (value: number) => 
    `${isRTL ? '' : 'AED '}${value.toLocaleString(isRTL ? 'ar-AE' : 'en-AE')}${isRTL ? ' درهم' : ''}`;

  const benefitHighlights = useMemo(() => {
    const fullyUtilized = benefits.filter(b => (b.utilized / b.value) >= 0.8);
    const roomToUse = benefits.filter(b => (b.utilized / b.value) < 0.8 && (b.value - b.utilized) > 1000);
    const actionNeeded = benefits.filter(b => b.requiresAction && (b.utilized / b.value) < 0.8);
    const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
    const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
    return { 
      fullyUtilized, 
      roomToUse, 
      fullyUtilizedCount: fullyUtilized.length, 
      roomToUseCount: roomToUse.length, 
      actionNeededCount: actionNeeded.length,
      totalRemaining: totalValue - totalUtilized 
    };
  }, []);

  const filteredAndSortedBenefits = useMemo(() => {
    let result = benefits.filter(benefit => {
      const name = isArabic ? benefit.nameAr : benefit.name;
      const desc = isArabic ? benefit.descriptionAr : benefit.description;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                           desc.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || benefit.category === categoryFilter;
      const utilization = (benefit.utilized / benefit.value) * 100;
      let matchesUtilization = true;
      if (utilizationFilter === 'fully-utilized') matchesUtilization = utilization >= 80;
      else if (utilizationFilter === 'partial') matchesUtilization = utilization >= 30 && utilization < 80;
      else if (utilizationFilter === 'underutilized') matchesUtilization = utilization < 30;
      return matchesSearch && matchesCategory && matchesUtilization;
    });
    
    // Sort based on selected option
    result.sort((a, b) => {
      const aRemaining = a.value - a.utilized;
      const bRemaining = b.value - b.utilized;
      const aUtil = a.utilized / a.value;
      const bUtil = b.utilized / b.value;
      
      switch (sortBy) {
        case 'remaining':
          return bRemaining - aRemaining;
        case 'underutilized':
          return aUtil - bUtil;
        case 'expiring':
          // Benefits that expire at year-end come first
          if (a.expiresEnd && !b.expiresEnd) return -1;
          if (!a.expiresEnd && b.expiresEnd) return 1;
          return bRemaining - aRemaining;
        case 'action-needed':
          if (a.requiresAction && !b.requiresAction) return -1;
          if (!a.requiresAction && b.requiresAction) return 1;
          return bRemaining - aRemaining;
        case 'name':
          const aName = isArabic ? a.nameAr : a.name;
          const bName = isArabic ? b.nameAr : b.name;
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });
    
    return result;
  }, [search, categoryFilter, utilizationFilter, sortBy, isArabic]);

  const totalValue = benefits.reduce((sum, b) => sum + b.value, 0);
  const totalUtilized = benefits.reduce((sum, b) => sum + b.utilized, 0);
  const overallUtilization = Math.round((totalUtilized / totalValue) * 100);

  const getBadges = (benefit: typeof benefits[0]) => {
    const badges: { label: string; labelAr: string; variant: 'warning' | 'info' | 'destructive' | 'default' }[] = [];
    const utilization = (benefit.utilized / benefit.value) * 100;
    
    if (benefit.requiresAction && utilization < 80) {
      badges.push({ label: 'Action needed', labelAr: 'يتطلب إجراء', variant: 'warning' });
    }
    if (utilization < 30) {
      badges.push({ label: 'Underutilized', labelAr: 'غير مستغل', variant: 'destructive' });
    }
    if (benefit.expiresEnd && utilization < 80) {
      badges.push({ label: 'Expires year-end', labelAr: 'تنتهي نهاية العام', variant: 'info' });
    }
    
    return badges;
  };

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      <PageHeader
        title={isArabic ? 'جميع المزايا' : 'All Benefits'}
        subtitle={`${benefits.length} ${isArabic ? 'مزايا' : 'benefits'} • ${formatCurrency(totalValue)} ${isArabic ? 'القيمة الإجمالية' : 'total value'} • ${overallUtilization}% ${isArabic ? 'مستخدم' : 'utilized'}`}
        icon={Sparkles}
      />

      {/* RAG Summary Cards - Clickable filters */}
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3", isRTL && "direction-rtl")}>
        <Card 
          className={cn(
            "cursor-pointer bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all",
            utilizationFilter === 'fully-utilized' && "ring-2 ring-emerald-500/50 border-emerald-500/50"
          )}
          onClick={() => setUtilizationFilter(utilizationFilter === 'fully-utilized' ? 'all' : 'fully-utilized')}
        >
          <CardContent className={cn("p-4 flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h3 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                {isArabic ? 'مستخدم بالكامل' : 'Fully Utilized'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {benefitHighlights.fullyUtilizedCount} {isArabic ? 'مزايا عند 80%+' : 'benefits at 80%+'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all",
            sortBy === 'action-needed' && "ring-2 ring-amber-500/50 border-amber-500/50"
          )}
          onClick={() => setSortBy(sortBy === 'action-needed' ? 'remaining' : 'action-needed')}
        >
          <CardContent className={cn("p-4 flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-amber-500/10"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h3 className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                {isArabic ? 'يتطلب إجراء' : 'Action Needed'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {benefitHighlights.actionNeededCount} {isArabic ? 'مزايا تحتاج انتباه' : 'benefits need attention'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className={cn(
            "cursor-pointer bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all",
            sortBy === 'remaining' && "ring-2 ring-blue-500/50 border-blue-500/50"
          )}
          onClick={() => setSortBy('remaining')}
        >
          <CardContent className={cn("p-4 flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <div className={cn("flex-1", isRTL && "text-right")}>
              <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400">
                {isArabic ? 'متاح للاستخدام' : 'Available to Use'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(benefitHighlights.totalRemaining)} {isArabic ? 'متاح' : 'remaining'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
          <Input 
            placeholder={isArabic ? 'البحث في المزايا...' : 'Search benefits...'} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className={isRTL ? "pr-9" : "pl-9"} 
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder={isArabic ? 'الترتيب' : 'Sort by'} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {isArabic ? opt.labelAr : opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={isArabic ? 'الفئة' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            {categoryFilters.map(c => (
              <SelectItem key={c.value} value={c.value}>
                {isArabic ? c.labelAr : c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Benefits Grid */}
      {filteredAndSortedBenefits.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{isArabic ? 'لا توجد مزايا مطابقة' : 'No benefits match your filters'}</p>
          <Button variant="link" onClick={() => { setSearch(''); setCategoryFilter('all'); setUtilizationFilter('all'); setSortBy('remaining'); }}>
            {isArabic ? 'مسح الفلاتر' : 'Clear filters'}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAndSortedBenefits.map((benefit, index) => {
            const utilization = Math.round((benefit.utilized / benefit.value) * 100);
            const remaining = benefit.value - benefit.utilized;
            const rag = getRAGIndicator(utilization);
            const badges = getBadges(benefit);
            
            return (
              <Card 
                key={benefit.name} 
                className="group cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-200 flex flex-col p-4"
                onClick={() => setSelectedBenefit(benefit)} 
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors shrink-0">
                    <benefit.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                    <div className={cn("flex items-center justify-between gap-2", isRTL && "flex-row-reverse")}>
                      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors truncate">
                        {isArabic ? benefit.nameAr : benefit.name}
                      </h3>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0", isRTL && "rotate-180")} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {isArabic ? benefit.descriptionAr : benefit.description}
                    </p>
                  </div>
                </div>
                
                {/* Tag Badges */}
                {badges.length > 0 && (
                  <div className={cn("flex flex-wrap gap-1 mt-2", isRTL && "flex-row-reverse")}>
                    {badges.map((badge, i) => (
                      <Badge 
                        key={i} 
                        variant={badge.variant === 'warning' ? 'secondary' : badge.variant === 'destructive' ? 'destructive' : 'outline'}
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          badge.variant === 'warning' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                          badge.variant === 'info' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        )}
                      >
                        {isArabic ? badge.labelAr : badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Utilization Progress */}
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(benefit.utilized)} / {formatCurrency(benefit.value)}
                    </span>
                    <Badge className={cn("text-[10px] px-1.5 py-0 gap-1 border-0", rag.bgClass, rag.textClass)}>
                      <RAGIcon status={rag.status} />
                      {utilization}%
                    </Badge>
                  </div>
                  <Progress value={utilization} className={cn("h-1.5", getProgressColorClass(utilization))} />
                  {remaining > 0 && (
                    <p className={cn("text-xs font-medium", rag.textClass)}>
                      {formatCurrency(remaining)} {isArabic ? 'متاح' : 'available'}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Benefit Side Sheet */}
      <Sheet open={!!selectedBenefit} onOpenChange={() => setSelectedBenefit(null)}>
        <SheetContent side={isRTL ? "left" : "right"} className="w-full sm:max-w-md">
          {selectedBenefit && (
            <>
              <SheetHeader>
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-3 rounded-xl bg-accent/10">
                    <selectedBenefit.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <SheetTitle>{isArabic ? selectedBenefit.nameAr : selectedBenefit.name}</SheetTitle>
                    <SheetDescription>
                      {isArabic ? selectedBenefit.descriptionAr : selectedBenefit.description}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Utilization Summary */}
                <div className="space-y-3">
                  <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{isArabic ? 'الاستخدام' : 'Utilization'}</span>
                    <span className="font-bold">{Math.round((selectedBenefit.utilized / selectedBenefit.value) * 100)}%</span>
                  </div>
                  <Progress value={(selectedBenefit.utilized / selectedBenefit.value) * 100} className="h-2" />
                  <div className={cn("grid grid-cols-2 gap-4 pt-2", isRTL && "direction-rtl")}>
                    <div className={cn("text-center p-3 rounded-lg bg-muted/50", isRTL && "text-right")}>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'القيمة السنوية' : 'Annual Value'}</p>
                      <p className="font-bold">{formatCurrency(selectedBenefit.value)}</p>
                    </div>
                    <div className={cn("text-center p-3 rounded-lg bg-muted/50", isRTL && "text-right")}>
                      <p className="text-xs text-muted-foreground">{isArabic ? 'المتبقي' : 'Remaining'}</p>
                      <p className="font-bold text-emerald-600">{formatCurrency(selectedBenefit.value - selectedBenefit.utilized)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Key Points */}
                <div>
                  <h4 className={cn("text-sm font-semibold mb-2", isRTL && "text-right")}>
                    {isArabic ? 'تفاصيل السياسة' : 'Policy Details'}
                  </h4>
                  <ul className={cn("space-y-2", isRTL && "text-right")}>
                    {selectedBenefit.bullets.map((bullet, i) => (
                      <li key={i} className={cn("flex items-start gap-2 text-sm", isRTL && "flex-row-reverse")}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  <Button className="w-full" onClick={() => navigate(selectedBenefit.route)}>
                    <FileText className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                    {isArabic ? 'عرض التفاصيل الكاملة' : 'View Full Details'}
                  </Button>
                  {selectedBenefit.value - selectedBenefit.utilized > 0 && (
                    <Button variant="outline" className="w-full" onClick={() => navigate('/employee/documents')}>
                      <Calendar className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isArabic ? 'تقديم مطالبة' : 'Submit Claim'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}