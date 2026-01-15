import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { MetricTooltip } from '@/components/ui/metric-tooltip';
import { PageHeader } from '@/components/ui/page-header';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { RequestTimeline } from '@/components/employer/RequestTimeline';
import { usePagination } from '@/hooks/usePagination';
import { useOrgRequests, useUpdateRequest, useRequestStats, type Request } from '@/hooks/useRequests';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye,
  AlertCircle,
  Send,
  CreditCard,
  Archive,
  Timer,
  User,
  UserCheck,
  Users,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'submitted' | 'in_review' | 'paid' | 'closed';

const statusConfig: Record<RequestStatus, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground', icon: ClipboardCheck },
  submitted: { label: 'Submitted', labelAr: 'مُقدم', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Send },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  in_review: { label: 'In Review', labelAr: 'قيد المراجعة', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', icon: Eye },
  approved: { label: 'Approved', labelAr: 'موافق عليه', color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle },
  paid: { label: 'Paid', labelAr: 'مدفوع', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CreditCard },
  closed: { label: 'Closed', labelAr: 'مغلق', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: Archive },
};

const typeConfig: Record<string, { label: string; labelAr: string; color: string }> = {
  claim: { label: 'Claim', labelAr: 'مطالبة', color: 'border-primary/50 text-primary' },
  request: { label: 'Request', labelAr: 'طلب', color: 'border-accent/50 text-accent' },
  question: { label: 'Question', labelAr: 'سؤال', color: 'border-muted-foreground/50 text-muted-foreground' },
};

// Decision templates for quick responses
const decisionTemplates = {
  approved: [
    { id: 'approved_standard', label: 'Standard Approval', labelAr: 'موافقة قياسية', note: 'Claim approved. Payment will be processed in the next payroll cycle.' },
    { id: 'approved_priority', label: 'Priority Approval', labelAr: 'موافقة ذات أولوية', note: 'Claim fast-tracked and approved. Payment processed within 48 hours.' },
    { id: 'approved_partial', label: 'Partial Approval', labelAr: 'موافقة جزئية', note: 'Claim partially approved. See notes for details on approved amount.' },
  ],
  rejected: [
    { id: 'rejected_docs', label: 'Missing Documents', labelAr: 'مستندات ناقصة', note: 'Claim rejected due to missing supporting documents. Please resubmit with required documentation.' },
    { id: 'rejected_policy', label: 'Policy Violation', labelAr: 'مخالفة السياسة', note: 'Claim rejected. The request does not comply with current company policy guidelines.' },
    { id: 'rejected_duplicate', label: 'Duplicate Claim', labelAr: 'مطالبة مكررة', note: 'Claim rejected. A similar claim has already been submitted and processed.' },
    { id: 'rejected_exceeded', label: 'Limit Exceeded', labelAr: 'تجاوز الحد', note: 'Claim rejected. The request exceeds your remaining benefit allowance for this period.' },
    { id: 'rejected_ineligible', label: 'Not Eligible', labelAr: 'غير مؤهل', note: 'Claim rejected. You are not eligible for this benefit based on current enrollment.' },
    { id: 'rejected_expired', label: 'Expired Period', labelAr: 'فترة منتهية', note: 'Claim rejected. The submission deadline for this period has passed.' },
  ],
};

// SLA filter options
const slaFilterOptions = [
  { value: 'all', label: 'All SLA', labelAr: 'كل SLA' },
  { value: 'overdue', label: 'Overdue', labelAr: 'متأخر' },
  { value: 'due_today', label: 'Due Today', labelAr: 'مستحق اليوم' },
  { value: 'due_week', label: 'Due This Week', labelAr: 'مستحق هذا الأسبوع' },
  { value: 'on_track', label: 'On Track', labelAr: 'في الموعد' },
];

export default function ClaimsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const { data: requests, isLoading, error } = useOrgRequests();
  const { data: stats } = useRequestStats();
  const updateRequest = useUpdateRequest();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [slaFilter, setSlaFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dialogTab, setDialogTab] = useState<'details' | 'timeline'>('details');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionDialog, setBulkActionDialog] = useState<'approve' | 'reject' | null>(null);
  
  // Low-risk threshold for bulk approve
  const LOW_RISK_THRESHOLD = 5000;

  // Filter requests first
  const filteredRequests = useMemo(() => {
    return (requests || []).filter(req => {
      const employeeName = `${req.profile?.first_name || ''} ${req.profile?.last_name || ''}`.toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchQuery.toLowerCase()) ||
        req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesType = typeFilter === 'all' || req.request_type === typeFilter;
      
      // SLA filter
      let matchesSla = true;
      if (slaFilter !== 'all' && req.sla_due_at) {
        const hoursRemaining = differenceInHours(new Date(req.sla_due_at), new Date());
        if (slaFilter === 'overdue') matchesSla = hoursRemaining < 0;
        else if (slaFilter === 'due_today') matchesSla = hoursRemaining >= 0 && hoursRemaining < 24;
        else if (slaFilter === 'due_week') matchesSla = hoursRemaining >= 0 && hoursRemaining < 168;
        else if (slaFilter === 'on_track') matchesSla = hoursRemaining >= 24;
      } else if (slaFilter !== 'all' && !req.sla_due_at) {
        matchesSla = false;
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesSla;
    });
  }, [requests, searchQuery, statusFilter, typeFilter, slaFilter]);

  // Apply pagination to filtered requests
  const pagination = usePagination(filteredRequests, { initialPageSize: 10 });

  // Get pending low-risk claims for bulk approval
  const lowRiskPendingClaims = useMemo(() => {
    return filteredRequests.filter(req => 
      ['pending', 'submitted'].includes(req.status || '') &&
      req.request_type === 'claim' &&
      (req.amount || 0) <= LOW_RISK_THRESHOLD
    );
  }, [filteredRequests]);

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Select all pending
  const selectAllPending = () => {
    const pendingIds = filteredRequests
      .filter(req => ['pending', 'submitted'].includes(req.status || ''))
      .map(req => req.id);
    setSelectedIds(new Set(pendingIds));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleAction = async (action: 'approved' | 'rejected' | 'in_review' | 'paid') => {
    if (!selectedRequest) return;
    
    await updateRequest.mutateAsync({
      requestId: selectedRequest.id,
      status: action,
      reviewerNotes: reviewNotes || undefined,
      internalNotes: internalNotes || undefined,
    });
    
    setSelectedRequest(null);
    setReviewNotes('');
    setInternalNotes('');
  };

  // Bulk action handler
  const handleBulkAction = async (action: 'approved' | 'rejected') => {
    const idsToProcess = Array.from(selectedIds);
    let successCount = 0;
    
    for (const id of idsToProcess) {
      try {
        await updateRequest.mutateAsync({
          requestId: id,
          status: action,
          reviewerNotes: action === 'approved' ? 'Bulk approved' : 'Bulk rejected',
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to ${action} request ${id}`, e);
      }
    }
    
    toast({
      title: isArabic ? 'تم الإجراء' : 'Action Completed',
      description: isArabic 
        ? `تم ${action === 'approved' ? 'الموافقة على' : 'رفض'} ${successCount} من ${idsToProcess.length} طلب`
        : `${successCount} of ${idsToProcess.length} requests ${action}`,
    });
    
    setSelectedIds(new Set());
    setBulkActionDialog(null);
  };

  const getStatusBadge = (status: RequestStatus | null) => {
    const config = statusConfig[status || 'pending'];
    return (
      <Badge variant="secondary" className={config.color}>
        {isArabic ? config.labelAr : config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = typeConfig[type] || typeConfig.request;
    return (
      <Badge variant="outline" className={config.color}>
        {isArabic ? config.labelAr : config.label}
      </Badge>
    );
  };

  const getSLAStatus = (request: Request) => {
    if (!request.sla_due_at) return null;
    const hoursRemaining = differenceInHours(new Date(request.sla_due_at), new Date());
    
    if (hoursRemaining < 0) {
      return <Badge variant="destructive" className="text-xs"><Timer className="h-3 w-3 mr-1" />Overdue</Badge>;
    }
    if (hoursRemaining < 24) {
      return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs"><Timer className="h-3 w-3 mr-1" />{hoursRemaining}h left</Badge>;
    }
    return null;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isArabic ? 'المطالبات والموافقات' : 'Claims & Approvals'}
          </h1>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{isArabic ? 'فشل في تحميل الطلبات' : 'Failed to load requests'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={isArabic ? 'المطالبات والموافقات' : 'Claims & Approvals'}
        subtitle={isArabic ? 'مراجعة وإدارة طلبات ومطالبات الموظفين' : 'Review and manage employee requests and claims'}
        icon={ClipboardCheck}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  {isLoading ? (
                    <Skeleton className="h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  )}
                  <MetricTooltip metricKey="total_requests" />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'الإجمالي' : 'Total'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500 shrink-0" />
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-amber-600">{(stats?.pending || 0) + (stats?.submitted || 0)}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'قيد الانتظار' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-purple-500 shrink-0" />
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-purple-600">{stats?.in_review || 0}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'قيد المراجعة' : 'In Review'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'موافق عليه' : 'Approved'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-emerald-600">{stats?.paid || 0}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'مدفوع' : 'Paid'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500 shrink-0" />
              <div className="min-w-0">
                {isLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                )}
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? 'مرفوض' : 'Rejected'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isArabic ? 'البحث بالموظف أو الموضوع أو الفئة...' : 'Search by employee, subject, or category...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل الحالات' : 'All Status'}</SelectItem>
                <SelectItem value="pending">{isArabic ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                <SelectItem value="submitted">{isArabic ? 'مُقدم' : 'Submitted'}</SelectItem>
                <SelectItem value="in_review">{isArabic ? 'قيد المراجعة' : 'In Review'}</SelectItem>
                <SelectItem value="approved">{isArabic ? 'موافق عليه' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{isArabic ? 'مرفوض' : 'Rejected'}</SelectItem>
                <SelectItem value="paid">{isArabic ? 'مدفوع' : 'Paid'}</SelectItem>
                <SelectItem value="closed">{isArabic ? 'مغلق' : 'Closed'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={isArabic ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'كل الأنواع' : 'All Types'}</SelectItem>
                <SelectItem value="claim">{isArabic ? 'مطالبات' : 'Claims'}</SelectItem>
                <SelectItem value="request">{isArabic ? 'طلبات' : 'Requests'}</SelectItem>
                <SelectItem value="question">{isArabic ? 'أسئلة' : 'Questions'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={slaFilter} onValueChange={setSlaFilter}>
              <SelectTrigger className="w-40">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder={isArabic ? 'SLA' : 'SLA'} />
              </SelectTrigger>
              <SelectContent>
                {slaFilterOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {isArabic ? opt.labelAr : opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <Card className="card-elevated border-primary/30 bg-primary/5">
          <CardContent className="py-3">
            <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {selectedIds.size} {isArabic ? 'محدد' : 'selected'}
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  {isArabic ? 'إلغاء التحديد' : 'Clear'}
                </Button>
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkActionDialog('reject')}
                  className="text-red-600 hover:text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {isArabic ? 'رفض المحدد' : 'Reject Selected'}
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setBulkActionDialog('approve')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {isArabic ? 'موافقة على المحدد' : 'Approve Selected'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low-Risk Quick Approve */}
      {lowRiskPendingClaims.length > 0 && selectedIds.size === 0 && (
        <Card className="card-elevated border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="py-3">
            <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div className={cn(isRTL && "text-right")}>
                  <p className="font-medium text-sm">
                    {lowRiskPendingClaims.length} {isArabic ? 'مطالبات منخفضة المخاطر' : 'low-risk claims'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? `أقل من ${LOW_RISK_THRESHOLD.toLocaleString()} درهم` : `Under AED ${LOW_RISK_THRESHOLD.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                onClick={() => {
                  setSelectedIds(new Set(lowRiskPendingClaims.map(c => c.id)));
                }}
              >
                {isArabic ? 'تحديد الكل للموافقة السريعة' : 'Select for Quick Approve'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card className="card-elevated">
        <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className="text-lg">{isArabic ? 'كل الطلبات' : 'All Requests'}</CardTitle>
          {filteredRequests.filter(r => ['pending', 'submitted'].includes(r.status || '')).length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAllPending}>
              <Users className="w-4 h-4 mr-1" />
              {isArabic ? 'تحديد كل المعلق' : 'Select All Pending'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border-b border-border/50">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-2 w-10">
                      <span className="sr-only">{isArabic ? 'تحديد' : 'Select'}</span>
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'الموظف' : 'Employee'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'النوع' : 'Type'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'الفئة' : 'Category'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'الموضوع' : 'Subject'}
                    </th>
                    <th className={cn("text-right py-3 px-4 font-medium", isArabic && "text-left")}>
                      {isArabic ? 'المبلغ' : 'Amount'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'الحالة' : 'Status'}
                    </th>
                    <th className={cn("text-left py-3 px-4 font-medium", isArabic && "text-right")}>
                      {isArabic ? 'تاريخ الإرسال' : 'Submitted'}
                    </th>
                    <th className={cn("text-right py-3 px-4 font-medium", isArabic && "text-left")}>
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.currentData.map((request) => (
                    <tr key={request.id} className={cn(
                      "border-b border-border/50 hover:bg-muted/30",
                      selectedIds.has(request.id) && "bg-primary/5"
                    )}>
                      <td className="py-3 px-2">
                        {['pending', 'submitted', 'in_review'].includes(request.status || '') && (
                          <Checkbox
                            checked={selectedIds.has(request.id)}
                            onCheckedChange={() => toggleSelection(request.id)}
                          />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {request.profile?.first_name || ''} {request.profile?.last_name || ''}
                            </p>
                            <p className="text-xs text-muted-foreground">{request.profile?.department || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getTypeBadge(request.request_type)}</td>
                      <td className="py-3 px-4 text-sm">{request.category}</td>
                      <td className="py-3 px-4 text-sm max-w-xs truncate">{request.subject}</td>
                      <td className={cn("py-3 px-4 text-sm", isArabic ? "text-left" : "text-right")}>
                        {request.amount ? `AED ${request.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status as RequestStatus)}
                          {getSLAStatus(request)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {request.created_at 
                          ? formatDistanceToNow(new Date(request.created_at), { addSuffix: true })
                          : '-'}
                      </td>
                      <td className={cn("py-3 px-4", isArabic ? "text-left" : "text-right")}>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDialogTab('details');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isArabic ? 'لم يتم العثور على طلبات مطابقة للفلاتر.' : 'No requests found matching your filters.'}</p>
                </div>
              )}
              {/* Pagination Controls */}
              {filteredRequests.length > 0 && (
                <PaginationControls
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                  pageSizeOptions={pagination.pageSizeOptions}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={pagination.goToPage}
                  onPageSizeChange={pagination.setPageSize}
                  onNextPage={pagination.nextPage}
                  onPrevPage={pagination.prevPage}
                  onFirstPage={pagination.goToFirstPage}
                  onLastPage={pagination.goToLastPage}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.subject}</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selectedRequest?.profile?.first_name} {selectedRequest?.profile?.last_name}
              {selectedRequest?.profile?.department && (
                <span className="text-muted-foreground">• {selectedRequest.profile.department}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <Tabs value={dialogTab} onValueChange={(v) => setDialogTab(v as 'details' | 'timeline')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">{isArabic ? 'التفاصيل' : 'Details'}</TabsTrigger>
                <TabsTrigger value="timeline">{isArabic ? 'الجدول الزمني' : 'Timeline'}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {getTypeBadge(selectedRequest.request_type)}
                  {getStatusBadge(selectedRequest.status as RequestStatus)}
                  {selectedRequest.priority && (
                    <Badge variant="outline">{selectedRequest.priority}</Badge>
                  )}
                  {getSLAStatus(selectedRequest)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{isArabic ? 'الفئة' : 'Category'}</p>
                    <p className="font-medium">{selectedRequest.category}</p>
                  </div>
                  {selectedRequest.amount && (
                    <div>
                      <p className="text-muted-foreground">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="font-medium">AED {selectedRequest.amount.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">{isArabic ? 'تاريخ الإرسال' : 'Submitted'}</p>
                    <p className="font-medium">
                      {selectedRequest.created_at 
                        ? format(new Date(selectedRequest.created_at), 'PPp')
                        : '-'}
                    </p>
                  </div>
                  {selectedRequest.sla_due_at && (
                    <div>
                      <p className="text-muted-foreground">{isArabic ? 'موعد SLA' : 'SLA Due'}</p>
                      <p className="font-medium">
                        {format(new Date(selectedRequest.sla_due_at), 'PPp')}
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedRequest.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{isArabic ? 'الوصف' : 'Description'}</p>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedRequest.description}</p>
                  </div>
                )}

                {selectedRequest.reviewer_notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{isArabic ? 'ملاحظات المراجع' : 'Reviewer Notes'}</p>
                    <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedRequest.reviewer_notes}</p>
                  </div>
                )}

                {['pending', 'submitted', 'in_review'].includes(selectedRequest.status || '') && (
                  <>
                    {/* Quick Decision Templates */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {isArabic ? 'قوالب القرارات السريعة' : 'Quick Decision Templates'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Select value={selectedTemplate} onValueChange={(v) => {
                          setSelectedTemplate(v);
                          const allTemplates = [...decisionTemplates.approved, ...decisionTemplates.rejected];
                          const template = allTemplates.find(t => t.id === v);
                          if (template) setReviewNotes(template.note);
                        }}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={isArabic ? 'اختر قالب...' : 'Choose template...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="" disabled>{isArabic ? 'الموافقة' : 'Approval'}</SelectItem>
                            {decisionTemplates.approved.map(t => (
                              <SelectItem key={t.id} value={t.id}>✓ {isArabic ? t.labelAr : t.label}</SelectItem>
                            ))}
                            <SelectItem value="" disabled>{isArabic ? 'الرفض' : 'Rejection'}</SelectItem>
                            {decisionTemplates.rejected.map(t => (
                              <SelectItem key={t.id} value={t.id}>✗ {isArabic ? t.labelAr : t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {isArabic ? 'ملاحظات للموظف' : 'Notes for Employee'}
                      </p>
                      <Textarea
                        placeholder={isArabic ? 'أضف ملاحظات للموظف...' : 'Add notes for the employee...'}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {isArabic ? 'ملاحظات داخلية' : 'Internal Notes'} 
                        <span className="text-xs ml-1">{isArabic ? '(للموظفين فقط)' : '(staff only)'}</span>
                      </p>
                      <Textarea
                        placeholder={isArabic ? 'أضف ملاحظات داخلية...' : 'Add internal notes...'}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-4">
                <RequestTimeline requestId={selectedRequest.id} />
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="flex-wrap gap-2">
            {selectedRequest?.status === 'pending' || selectedRequest?.status === 'submitted' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('in_review')}
                  disabled={updateRequest.isPending}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isArabic ? 'بدء المراجعة' : 'Start Review'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('rejected')}
                  disabled={updateRequest.isPending}
                  className="text-red-600 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isArabic ? 'رفض' : 'Reject'}
                </Button>
                <Button 
                  onClick={() => handleAction('approved')}
                  disabled={updateRequest.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isArabic ? 'موافقة' : 'Approve'}
                </Button>
              </>
            ) : selectedRequest?.status === 'in_review' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleAction('rejected')}
                  disabled={updateRequest.isPending}
                  className="text-red-600 hover:text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isArabic ? 'رفض' : 'Reject'}
                </Button>
                <Button 
                  onClick={() => handleAction('approved')}
                  disabled={updateRequest.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isArabic ? 'موافقة' : 'Approve'}
                </Button>
              </>
            ) : selectedRequest?.status === 'approved' ? (
              <Button 
                onClick={() => handleAction('paid')}
                disabled={updateRequest.isPending}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isArabic ? 'تحديد كمدفوع' : 'Mark as Paid'}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                {isArabic ? 'إغلاق' : 'Close'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={!!bulkActionDialog} onOpenChange={() => setBulkActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionDialog === 'approve' 
                ? (isArabic ? 'تأكيد الموافقة الجماعية' : 'Confirm Bulk Approval')
                : (isArabic ? 'تأكيد الرفض الجماعي' : 'Confirm Bulk Rejection')}
            </DialogTitle>
            <DialogDescription>
              {bulkActionDialog === 'approve'
                ? (isArabic 
                    ? `سيتم الموافقة على ${selectedIds.size} طلب. هل أنت متأكد؟`
                    : `${selectedIds.size} requests will be approved. Are you sure?`)
                : (isArabic 
                    ? `سيتم رفض ${selectedIds.size} طلب. هل أنت متأكد؟`
                    : `${selectedIds.size} requests will be rejected. Are you sure?`)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className={cn(
              "p-3 rounded-lg flex items-center gap-3",
              bulkActionDialog === 'approve' ? 'bg-emerald-500/10' : 'bg-red-500/10',
              isRTL && "flex-row-reverse"
            )}>
              {bulkActionDialog === 'approve' 
                ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                : <AlertTriangle className="w-5 h-5 text-red-600" />}
              <span className="text-sm">
                {isArabic ? 'لا يمكن التراجع عن هذا الإجراء.' : 'This action cannot be undone.'}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant={bulkActionDialog === 'reject' ? 'destructive' : 'default'}
              onClick={() => handleBulkAction(bulkActionDialog === 'approve' ? 'approved' : 'rejected')}
              disabled={updateRequest.isPending}
            >
              {bulkActionDialog === 'approve' 
                ? (isArabic ? 'تأكيد الموافقة' : 'Confirm Approval')
                : (isArabic ? 'تأكيد الرفض' : 'Confirm Rejection')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
