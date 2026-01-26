import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  PiggyBank, 
  TrendingDown, 
  Plus, 
  Pencil, 
  Trash2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useEmployeeBudgetItems, DEMO_BUDGET_ITEMS, BudgetItem } from '@/hooks/useEmployeeBudgetItems';
import { Currency } from '@/components/ui/Currency';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { toast } from 'sonner';

// Demo salary for fallback
const DEMO_MONTHLY_SALARY = 25000;

// Commitment categories
const COMMITMENT_CATEGORIES = [
  'Rent',
  'Loan EMI',
  'School Fees',
  'Utilities',
  'Insurance',
  'Groceries',
  'Transport',
  'Other',
];

interface InsightItem {
  id: string;
  message: string;
  type: 'warning' | 'tip' | 'action';
  cta?: {
    label: string;
    path: string;
  };
}

export default function MoneyPlannerPage() {
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  const { flags, loading: flagsLoading } = useFeatureFlags();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => (language === 'ar' ? ar : en);

  const {
    items,
    commitments,
    savingsGoal,
    otherIncome,
    totalCommitments,
    totalOtherIncome,
    savingsAmount,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    currentMonth,
  } = useEmployeeBudgetItems();

  // State for UI
  const [insightsOpen, setInsightsOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<'commitment' | 'savings_goal' | 'other_income'>('commitment');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Check demo mode
  const isDemo = !user || items.length === 0;

  // Calculate values
  const monthlyIncome = DEMO_MONTHLY_SALARY + totalOtherIncome;
  const effectiveCommitments = isDemo 
    ? DEMO_BUDGET_ITEMS.filter(i => i.item_type === 'commitment').reduce((sum, i) => sum + i.amount, 0)
    : totalCommitments;
  const effectiveSavings = isDemo
    ? DEMO_BUDGET_ITEMS.find(i => i.item_type === 'savings_goal')?.amount || 0
    : savingsAmount;
  const safeToSpend = monthlyIncome - effectiveCommitments - effectiveSavings;

  // Display items (demo or real)
  const displayCommitments = isDemo
    ? DEMO_BUDGET_ITEMS.filter(i => i.item_type === 'commitment').map((i, idx) => ({
        ...i,
        id: `demo-${idx}`,
        organization_id: '',
        user_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
    : commitments;

  const displaySavingsGoal = isDemo
    ? (() => {
        const s = DEMO_BUDGET_ITEMS.find(i => i.item_type === 'savings_goal');
        return s ? {
          ...s,
          id: 'demo-savings',
          organization_id: '',
          user_id: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } : null;
      })()
    : savingsGoal;

  // Generate insights
  const insights = useMemo<InsightItem[]>(() => {
    const result: InsightItem[] = [];
    
    const commitmentRatio = (effectiveCommitments / monthlyIncome) * 100;
    
    if (commitmentRatio > 60) {
      result.push({
        id: 'high-commitments',
        message: t(
          `Your commitments are ${Math.round(commitmentRatio)}% of income—consider reviewing expenses`,
          `التزاماتك تمثل ${Math.round(commitmentRatio)}% من الدخل—فكر في مراجعة النفقات`
        ),
        type: 'warning',
      });
    }

    if (!effectiveSavings) {
      result.push({
        id: 'no-savings',
        message: t(
          'You haven\'t set a savings goal yet',
          'لم تحدد هدفًا للادخار بعد'
        ),
        type: 'action',
        cta: {
          label: t('Add savings goal', 'أضف هدف ادخار'),
          path: '#add-savings',
        },
      });
    }

    result.push({
      id: 'optimizer-link',
      message: t(
        'You may have pending reimbursements that could ease cashflow',
        'قد يكون لديك تعويضات معلقة يمكن أن تحسن السيولة'
      ),
      type: 'tip',
      cta: {
        label: t('Check Optimizer', 'تحقق من المحسّن'),
        path: '/employee/out-of-pocket',
      },
    });

    return result.slice(0, 3);
  }, [effectiveCommitments, monthlyIncome, effectiveSavings, t]);

  // Handle add item
  const handleAddItem = async () => {
    if (!newCategory || !newAmount) {
      toast.error(t('Please fill all fields', 'يرجى ملء جميع الحقول'));
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('Please enter a valid amount', 'يرجى إدخال مبلغ صالح'));
      return;
    }

    try {
      await addItem.mutateAsync({
        month: currentMonth,
        item_type: addType,
        category: newCategory,
        amount,
        source: 'employee_input',
        confidence: 'employee_reported',
        notes: null,
      });
      toast.success(t('Item added', 'تمت الإضافة'));
      setAddDialogOpen(false);
      setNewCategory('');
      setNewAmount('');
    } catch (error) {
      toast.error(t('Failed to add item', 'فشل في الإضافة'));
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('Please enter a valid amount', 'يرجى إدخال مبلغ صالح'));
      return;
    }

    try {
      await updateItem.mutateAsync({
        id: editingItem.id,
        category: newCategory || editingItem.category,
        amount,
      });
      toast.success(t('Item updated', 'تم التحديث'));
      setEditingItem(null);
      setNewCategory('');
      setNewAmount('');
    } catch (error) {
      toast.error(t('Failed to update item', 'فشل في التحديث'));
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    if (id.startsWith('demo-')) {
      toast.info(t('Demo items cannot be deleted', 'لا يمكن حذف العناصر التجريبية'));
      return;
    }

    try {
      await deleteItem.mutateAsync(id);
      toast.success(t('Item deleted', 'تم الحذف'));
    } catch (error) {
      toast.error(t('Failed to delete item', 'فشل في الحذف'));
    }
  };

  // Feature gate check
  if (flagsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!flags.moneyPlannerEnabled && !isDemo) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center border-dashed border-2">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary/60" />
            </div>
            <Badge variant="outline" className="w-fit mx-auto mb-3 text-xs">
              <Lock className="w-3 h-3 mr-1.5" />
              {t('Feature Not Enabled', 'الميزة غير مفعلة')}
            </Badge>
            <CardTitle>{t('Money Planner', 'مخطط الأموال')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {t(
                'This feature is not enabled for your organization. Contact your administrator to enable it.',
                'هذه الميزة غير مفعلة لمؤسستك. تواصل مع المسؤول لتفعيلها.'
              )}
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/employee">{t('Back to Dashboard', 'العودة للوحة التحكم')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('Money Planner', 'مخطط الأموال')}
        description={t(
          `Plan your monthly budget and track commitments (${currentMonth})`,
          `خطط ميزانيتك الشهرية وتتبع الالتزامات (${currentMonth})`
        )}
        icon={Wallet}
        badge={isDemo ? { label: t('Demo', 'تجريبي'), variant: 'accent' } : undefined}
      />

      {/* Privacy Notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        <span>{t('This data is private and only visible to you', 'هذه البيانات خاصة ومرئية لك فقط')}</span>
      </div>

      {/* KPI Strip - Monthly Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Wallet className="w-4 h-4" />
                    <span>{t('Income', 'الدخل')}</span>
                  </div>
                  <Currency amount={monthlyIncome} size="lg" abbreviate={false} />
                  <Badge variant="outline" className="mt-2 text-xs">
                    {isDemo ? t('Demo', 'تجريبي') : t('Payroll', 'الرواتب')}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {t('Source: Payroll | Confidence: ', 'المصدر: الرواتب | الثقة: ')}
                {isDemo ? t('Estimated', 'تقديري') : t('Measured', 'محسوب')}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>{t('Commitments', 'الالتزامات')}</span>
                  </div>
                  <Currency amount={effectiveCommitments} size="lg" abbreviate={false} />
                  <Badge variant="outline" className="mt-2 text-xs">
                    {t('Employee input', 'إدخال الموظف')}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {t('Source: Employee input | Confidence: Reported', 'المصدر: إدخال الموظف | الثقة: مُبلغ عنه')}
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <PiggyBank className="w-4 h-4" />
                    <span>{t('Savings Goal', 'هدف الادخار')}</span>
                  </div>
                  <Currency amount={effectiveSavings} size="lg" abbreviate={false} />
                  <Badge variant="outline" className="mt-2 text-xs">
                    {t('Employee input', 'إدخال الموظف')}
                  </Badge>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {t('Source: Employee input | Confidence: Reported', 'المصدر: إدخال الموظف | الثقة: مُبلغ عنه')}
              </p>
            </TooltipContent>
          </Tooltip>

          <Card className={cn(
            "bg-gradient-to-br",
            safeToSpend >= 0 
              ? "from-success/10 to-success/5 border-success/30" 
              : "from-destructive/10 to-destructive/5 border-destructive/30"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Wallet className="w-4 h-4" />
                <span>{t('Safe to Spend', 'المتاح للإنفاق')}</span>
              </div>
              <Currency 
                amount={safeToSpend} 
                size="lg" 
                abbreviate={false}
                className={safeToSpend < 0 ? 'text-destructive' : 'text-success'}
              />
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Plan Builder */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t('Plan Builder', 'بناء الخطة')}</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setAddType('commitment');
              setAddDialogOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {t('Add Item', 'إضافة عنصر')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Commitments Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              {t('Commitments', 'الالتزامات')}
            </h4>
            <div className="space-y-2">
              {displayCommitments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t('No commitments added', 'لم تتم إضافة التزامات')}
                </p>
              ) : (
                displayCommitments.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Currency amount={item.amount} abbreviate={false} size="sm" />
                      {!item.id.startsWith('demo-') && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingItem(item);
                              setNewCategory(item.category);
                              setNewAmount(item.amount.toString());
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Savings Goal Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <PiggyBank className="w-4 h-4" />
              {t('Savings Goal', 'هدف الادخار')}
            </h4>
            {displaySavingsGoal ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{displaySavingsGoal.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Currency amount={displaySavingsGoal.amount} abbreviate={false} size="sm" />
                  {!displaySavingsGoal.id.startsWith('demo-') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingItem(displaySavingsGoal);
                        setNewCategory(displaySavingsGoal.category);
                        setNewAmount(displaySavingsGoal.amount.toString());
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                id="add-savings"
                onClick={() => {
                  setAddType('savings_goal');
                  setNewCategory('Savings');
                  setAddDialogOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {t('Add Savings Goal', 'إضافة هدف ادخار')}
              </Button>
            )}
          </div>

          {/* Other Income Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {t('Other Income', 'دخل إضافي')}
            </h4>
            {otherIncome.length === 0 && isDemo ? (
              <p className="text-sm text-muted-foreground italic">
                {t('No additional income added', 'لم تتم إضافة دخل إضافي')}
              </p>
            ) : otherIncome.length === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddType('other_income');
                  setAddDialogOpen(true);
                }}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {t('Add Other Income', 'إضافة دخل إضافي')}
              </Button>
            ) : (
              <div className="space-y-2">
                {otherIncome.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="flex items-center gap-3">
                      <Currency amount={item.amount} abbreviate={false} size="sm" />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingItem(item);
                            setNewCategory(item.category);
                            setNewAmount(item.amount.toString());
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights Section (Collapsible) */}
      <Collapsible open={insightsOpen} onOpenChange={setInsightsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  {t('Insights', 'رؤى')}
                </CardTitle>
                {insightsOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    insight.type === 'warning' && "bg-warning/10 border border-warning/30",
                    insight.type === 'tip' && "bg-primary/10 border border-primary/30",
                    insight.type === 'action' && "bg-accent/10 border border-accent/30"
                  )}
                >
                  {insight.type === 'warning' && <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
                  {insight.type === 'tip' && <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />}
                  {insight.type === 'action' && <Plus className="w-4 h-4 text-accent mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{insight.message}</p>
                    {insight.cta && (
                      insight.cta.path.startsWith('#') ? (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 gap-1"
                          onClick={() => {
                            setAddType('savings_goal');
                            setNewCategory('Savings');
                            setAddDialogOpen(true);
                          }}
                        >
                          {insight.cta.label}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button variant="link" size="sm" className="h-auto p-0 mt-1 gap-1" asChild>
                          <Link to={insight.cta.path}>
                            {insight.cta.label}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </Button>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {addType === 'commitment' && t('Add Commitment', 'إضافة التزام')}
              {addType === 'savings_goal' && t('Add Savings Goal', 'إضافة هدف ادخار')}
              {addType === 'other_income' && t('Add Other Income', 'إضافة دخل إضافي')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Category', 'الفئة')}</Label>
              {addType === 'commitment' ? (
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select category', 'اختر الفئة')} />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMITMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={addType === 'savings_goal' ? 'Savings' : t('e.g., Freelance', 'مثال: عمل حر')}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>{t('Amount (AED)', 'المبلغ (درهم)')}</Label>
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleAddItem} disabled={addItem.isPending}>
              {t('Add', 'إضافة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Edit Item', 'تعديل العنصر')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Category', 'الفئة')}</Label>
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Amount (AED)', 'المبلغ (درهم)')}</Label>
              <Input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleUpdateItem} disabled={updateItem.isPending}>
              {t('Save', 'حفظ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
