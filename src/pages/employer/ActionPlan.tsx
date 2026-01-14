import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useEmployerActions, 
  useCreateAction, 
  useUpdateAction, 
  useDeleteAction,
  useActionStats,
  type EmployerAction 
} from '@/hooks/useEmployerActions';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Plus, Target, Clock, CheckCircle2, AlertTriangle, 
  Calendar, User, TrendingUp, Filter, MoreHorizontal,
  Trash2, Edit, Play, Pause, XCircle
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  planned: { label: 'Planned', labelAr: 'مخطط', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Target },
  in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Play },
  completed: { label: 'Completed', labelAr: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  blocked: { label: 'Blocked', labelAr: 'محظور', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', labelAr: 'ملغى', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

const priorityConfig: Record<string, { label: string; labelAr: string; color: string }> = {
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-slate-500/10 text-slate-600' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-blue-500/10 text-blue-600' },
  high: { label: 'High', labelAr: 'مرتفع', color: 'bg-amber-500/10 text-amber-600' },
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-red-500/10 text-red-600' },
};

export default function ActionPlanPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const locale = isArabic ? ar : undefined;

  const { data: actions, isLoading } = useEmployerActions();
  const stats = useActionStats();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();
  const deleteAction = useDeleteAction();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    due_date: '',
    expected_savings: '',
    metric_keys: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      expected_savings: '',
      metric_keys: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    await createAction.mutateAsync({
      title: formData.title,
      description: formData.description || undefined,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      metric_keys: formData.metric_keys ? formData.metric_keys.split(',').map(s => s.trim()) : [],
      expected_impact: formData.expected_savings ? { savings: parseFloat(formData.expected_savings) } : {},
    });

    resetForm();
    setIsCreateOpen(false);
  };

  const handleStatusChange = async (action: EmployerAction, newStatus: string) => {
    await updateAction.mutateAsync({
      id: action.id,
      status: newStatus as EmployerAction['status'],
    });
  };

  const filteredActions = actions?.filter(action => {
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Action Plan"
        titleAr="خطة العمل"
        subtitle="Track and manage strategic initiatives to improve your benefits program"
        subtitleAr="تتبع وإدارة المبادرات الاستراتيجية لتحسين برنامج المزايا"
        primaryAction={{
          label: 'Create Action',
          labelAr: 'إنشاء إجراء',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => setIsCreateOpen(true),
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'الإجمالي' : 'Total'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-blue-500/20">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'مخطط' : 'Planned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Play className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'قيد التنفيذ' : 'In Progress'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-emerald-500/20">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'مكتمل' : 'Completed'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-red-500/20">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'محظور' : 'Blocked'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-destructive/20">
          <CardContent className="pt-4">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="p-2 rounded-lg bg-destructive/10">
                <Calendar className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'متأخر' : 'Overdue'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-4">
          <div className={cn("flex flex-col sm:flex-row gap-4", isRTL && "sm:flex-row-reverse")}>
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'البحث في الإجراءات...' : 'Search actions...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="planned">{isArabic ? 'مخطط' : 'Planned'}</SelectItem>
                <SelectItem value="in_progress">{isArabic ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                <SelectItem value="completed">{isArabic ? 'مكتمل' : 'Completed'}</SelectItem>
                <SelectItem value="blocked">{isArabic ? 'محظور' : 'Blocked'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">{isArabic ? 'الإجراءات' : 'Actions'}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActions.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isArabic ? 'لا توجد إجراءات بعد' : 'No actions yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic 
                  ? 'أنشئ أول إجراء لتتبع مبادرات التحسين'
                  : 'Create your first action to track improvement initiatives'}
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {isArabic ? 'إنشاء إجراء' : 'Create Action'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className={cn("text-left py-3 px-4 font-medium", isRTL && "text-right")}>
                      {isArabic ? 'العنوان' : 'Title'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isRTL && "text-right")}>
                      {isArabic ? 'الحالة' : 'Status'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isRTL && "text-right")}>
                      {isArabic ? 'الأولوية' : 'Priority'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isRTL && "text-right")}>
                      {isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isRTL && "text-right")}>
                      {isArabic ? 'التأثير المتوقع' : 'Expected Impact'}
                    </th>
                    <th className={cn("text-right py-3 px-4 font-medium", isRTL && "text-left")}>
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredActions.map((action, index) => {
                      const status = statusConfig[action.status];
                      const priority = priorityConfig[action.priority];
                      const isOverdue = action.due_date && isPast(new Date(action.due_date)) && 
                        !['completed', 'cancelled'].includes(action.status);
                      const StatusIcon = status.icon;

                      return (
                        <motion.tr
                          key={action.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/30"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{action.title}</p>
                              {action.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {action.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={cn("gap-1", status.color)}>
                              <StatusIcon className="w-3 h-3" />
                              {isArabic ? status.labelAr : status.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary" className={priority.color}>
                              {isArabic ? priority.labelAr : priority.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {action.due_date ? (
                              <div className={cn("text-sm", isOverdue && "text-destructive")}>
                                {format(new Date(action.due_date), 'MMM d, yyyy', { locale })}
                                {isOverdue && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    {isArabic ? 'متأخر' : 'Overdue'}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {action.expected_impact?.savings ? (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span className="text-sm font-medium">
                                  AED {Number(action.expected_impact.savings).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className={cn("py-3 px-4", isRTL ? "text-left" : "text-right")}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                                {action.status === 'planned' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(action, 'in_progress')}>
                                    <Play className="w-4 h-4 mr-2" />
                                    {isArabic ? 'بدء التنفيذ' : 'Start'}
                                  </DropdownMenuItem>
                                )}
                                {action.status === 'in_progress' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleStatusChange(action, 'completed')}>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      {isArabic ? 'تم الإكمال' : 'Complete'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(action, 'blocked')}>
                                      <Pause className="w-4 h-4 mr-2" />
                                      {isArabic ? 'محظور' : 'Block'}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {action.status === 'blocked' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(action, 'in_progress')}>
                                    <Play className="w-4 h-4 mr-2" />
                                    {isArabic ? 'استئناف' : 'Resume'}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => deleteAction.mutate(action.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {isArabic ? 'حذف' : 'Delete'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Action Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'إنشاء إجراء جديد' : 'Create New Action'}</DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'حدد مبادرة تحسين لتتبعها وقياسها'
                : 'Define an improvement initiative to track and measure'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>{isArabic ? 'العنوان' : 'Title'} *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={isArabic ? 'مثال: تحسين استخدام برنامج الصحة' : 'e.g., Improve wellness program utilization'}
              />
            </div>

            <div>
              <Label>{isArabic ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isArabic ? 'وصف الإجراء والنتائج المتوقعة...' : 'Describe the action and expected outcomes...'}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isArabic ? 'الأولوية' : 'Priority'}</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({ ...formData, priority: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{isArabic ? 'منخفض' : 'Low'}</SelectItem>
                    <SelectItem value="medium">{isArabic ? 'متوسط' : 'Medium'}</SelectItem>
                    <SelectItem value="high">{isArabic ? 'مرتفع' : 'High'}</SelectItem>
                    <SelectItem value="critical">{isArabic ? 'حرج' : 'Critical'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{isArabic ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>{isArabic ? 'الوفورات المتوقعة (درهم)' : 'Expected Savings (AED)'}</Label>
              <Input
                type="number"
                value={formData.expected_savings}
                onChange={(e) => setFormData({ ...formData, expected_savings: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>{isArabic ? 'المقاييس المرتبطة' : 'Linked Metrics'}</Label>
              <Input
                value={formData.metric_keys}
                onChange={(e) => setFormData({ ...formData, metric_keys: e.target.value })}
                placeholder={isArabic ? 'مثال: utilization_rate, satisfaction_score' : 'e.g., utilization_rate, satisfaction_score'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic ? 'افصل بين المقاييس بفاصلة' : 'Separate multiple metrics with commas'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!formData.title.trim() || createAction.isPending}
            >
              {createAction.isPending 
                ? (isArabic ? 'جارٍ الإنشاء...' : 'Creating...') 
                : (isArabic ? 'إنشاء' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
