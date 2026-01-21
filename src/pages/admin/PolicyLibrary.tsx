import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { 
  FileText, Plus, Search, Edit2, Eye, Clock, CheckCircle, Send, Archive,
  BookOpen, AlertTriangle, Copy, Trash2, History, Globe, Building2, Users,
  CalendarIcon, MoreHorizontal, Link2, ChevronRight, Download, Upload,
  Bell, FileCheck, ArrowRight, GitBranch, Shield, RefreshCw, UserCheck,
  Mail, Filter, Percent, ExternalLink, Languages
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, addMonths, addDays, differenceInDays } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Status configuration
const STATUS_CONFIG = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground border-border', icon: Edit2 },
  in_review: { label: 'In Review', labelAr: 'قيد المراجعة', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  approved: { label: 'Approved', labelAr: 'موافق عليه', color: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle },
  published: { label: 'Published', labelAr: 'منشور', color: 'bg-success/10 text-success border-success/30', icon: Globe },
  archived: { label: 'Archived', labelAr: 'مؤرشف', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Archive },
};

const POLICY_CATEGORIES = [
  { value: 'hr', label: 'HR', labelAr: 'الموارد البشرية' },
  { value: 'benefits', label: 'Benefits', labelAr: 'المزايا' },
  { value: 'claims', label: 'Claims', labelAr: 'المطالبات' },
  { value: 'leave', label: 'Leave', labelAr: 'الإجازات' },
  { value: 'conduct', label: 'Code of Conduct', labelAr: 'قواعد السلوك' },
  { value: 'privacy', label: 'Data Privacy', labelAr: 'خصوصية البيانات' },
  { value: 'security', label: 'Security', labelAr: 'الأمان' },
  { value: 'marketplace', label: 'Vendor Marketplace', labelAr: 'سوق البائعين' },
  { value: 'finance', label: 'Finance', labelAr: 'المالية' },
];

const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global', labelAr: 'عالمي', icon: Globe },
  { value: 'organization', label: 'Organization(s)', labelAr: 'منظمة', icon: Building2 },
  { value: 'plan', label: 'Plan(s)', labelAr: 'خطة', icon: FileText },
];

const AUDIENCE_OPTIONS = [
  { value: 'employee', label: 'Employee', labelAr: 'موظف' },
  { value: 'employer', label: 'Employer (HR)', labelAr: 'صاحب العمل' },
  { value: 'vendor', label: 'Vendor', labelAr: 'بائع' },
  { value: 'admin', label: 'Admin', labelAr: 'مدير' },
];

const REVIEW_CADENCE = [
  { value: 'quarterly', label: 'Quarterly', labelAr: 'ربع سنوي', months: 3 },
  { value: 'biannual', label: 'Biannual', labelAr: 'نصف سنوي', months: 6 },
  { value: 'annual', label: 'Annual', labelAr: 'سنوي', months: 12 },
  { value: 'custom', label: 'Custom', labelAr: 'مخصص', months: 0 },
];

const BENEFIT_LINKS = ['Health', 'Education', 'Housing', 'Transport', 'Wellness', 'Leave'];
const PROCESS_LINKS = ['Claims', 'Leave Requests', 'Vendor Onboarding', 'Employee Onboarding'];

const TEAM_MEMBERS = [
  { id: 'usr_1', name: 'Sarah Miller', role: 'Policy Manager' },
  { id: 'usr_2', name: 'John Doe', role: 'HR Director' },
  { id: 'usr_3', name: 'Ahmed Khan', role: 'Compliance Officer' },
  { id: 'usr_4', name: 'Lisa Chen', role: 'Legal Counsel' },
];

interface PolicyVersion {
  version: string;
  status: string;
  author: string;
  date: Date;
  changes: string;
  attachmentUrl?: string;
}

interface PolicyActivity {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details?: string;
}

interface Policy {
  id: string;
  title: string;
  titleAr?: string;
  category: string;
  status: string;
  version: string;
  scope: string;
  scopeOrgs?: string[];
  audience: string[];
  owner: string;
  approver?: string;
  effectiveDate: Date;
  reviewCadence: string;
  nextReviewDate: Date;
  updatedAt: Date;
  createdAt: Date;
  contentEn: string;
  contentAr?: string;
  attachmentUrl?: string;
  requiresAcknowledgement: boolean;
  acknowledgementDeadline?: Date;
  acknowledgedCount: number;
  targetedCount: number;
  linkedBenefits: string[];
  linkedProcesses: string[];
  versions: PolicyVersion[];
  activity: PolicyActivity[];
}

const SAMPLE_POLICIES: Policy[] = [
  {
    id: 'pol_1',
    title: 'Medical Benefits Policy',
    titleAr: 'سياسة المزايا الطبية',
    category: 'benefits',
    status: 'published',
    version: '2.1',
    scope: 'global',
    audience: ['employee', 'employer'],
    owner: 'Sarah Miller',
    approver: 'John Doe',
    effectiveDate: new Date('2024-01-01'),
    reviewCadence: 'annual',
    nextReviewDate: new Date('2025-01-01'),
    updatedAt: new Date('2024-12-15'),
    createdAt: new Date('2023-06-01'),
    contentEn: 'This policy outlines the medical benefits available to all eligible employees...',
    contentAr: 'توضح هذه السياسة المزايا الطبية المتاحة لجميع الموظفين المؤهلين...',
    requiresAcknowledgement: true,
    acknowledgementDeadline: new Date('2024-02-01'),
    acknowledgedCount: 847,
    targetedCount: 912,
    linkedBenefits: ['Health'],
    linkedProcesses: ['Claims'],
    versions: [
      { version: '2.1', status: 'published', author: 'Sarah Miller', date: new Date('2024-12-15'), changes: 'Updated dependent coverage limits' },
      { version: '2.0', status: 'archived', author: 'Sarah Miller', date: new Date('2024-06-01'), changes: 'Major revision: added mental health coverage' },
      { version: '1.0', status: 'archived', author: 'John Doe', date: new Date('2023-06-01'), changes: 'Initial policy creation' },
    ],
    activity: [
      { id: '1', action: 'Published v2.1', actor: 'Sarah Miller', timestamp: new Date('2024-12-15') },
      { id: '2', action: 'Approved', actor: 'John Doe', timestamp: new Date('2024-12-14'), details: 'Approved with minor edits' },
      { id: '3', action: 'Submitted for review', actor: 'Sarah Miller', timestamp: new Date('2024-12-10') },
    ],
  },
  {
    id: 'pol_2',
    title: 'Annual Leave Policy',
    titleAr: 'سياسة الإجازة السنوية',
    category: 'leave',
    status: 'published',
    version: '3.0',
    scope: 'global',
    audience: ['employee', 'employer'],
    owner: 'John Doe',
    approver: 'Lisa Chen',
    effectiveDate: new Date('2024-01-01'),
    reviewCadence: 'annual',
    nextReviewDate: new Date('2025-01-15'),
    updatedAt: new Date('2024-11-20'),
    createdAt: new Date('2022-01-01'),
    contentEn: 'Employees are entitled to annual leave as per UAE Labor Law...',
    contentAr: 'يحق للموظفين الحصول على إجازة سنوية وفقًا لقانون العمل الإماراتي...',
    requiresAcknowledgement: true,
    acknowledgementDeadline: new Date('2024-02-15'),
    acknowledgedCount: 912,
    targetedCount: 912,
    linkedBenefits: ['Leave'],
    linkedProcesses: ['Leave Requests'],
    versions: [
      { version: '3.0', status: 'published', author: 'John Doe', date: new Date('2024-11-20'), changes: 'Updated carry-forward rules' },
    ],
    activity: [],
  },
  {
    id: 'pol_3',
    title: 'Data Privacy Policy',
    category: 'privacy',
    status: 'in_review',
    version: '1.2',
    scope: 'global',
    audience: ['employee', 'employer', 'vendor', 'admin'],
    owner: 'Ahmed Khan',
    effectiveDate: new Date('2025-02-01'),
    reviewCadence: 'biannual',
    nextReviewDate: new Date('2025-08-01'),
    updatedAt: new Date('2025-01-15'),
    createdAt: new Date('2024-08-01'),
    contentEn: 'This policy governs how personal data is collected, processed, and stored...',
    requiresAcknowledgement: true,
    acknowledgedCount: 0,
    targetedCount: 1250,
    linkedBenefits: [],
    linkedProcesses: [],
    versions: [
      { version: '1.2', status: 'in_review', author: 'Ahmed Khan', date: new Date('2025-01-15'), changes: 'Added GDPR compliance section' },
      { version: '1.1', status: 'archived', author: 'Ahmed Khan', date: new Date('2024-11-01'), changes: 'Minor clarifications' },
    ],
    activity: [
      { id: '1', action: 'Submitted for review', actor: 'Ahmed Khan', timestamp: new Date('2025-01-15') },
    ],
  },
  {
    id: 'pol_4',
    title: 'Vendor Onboarding Policy',
    category: 'marketplace',
    status: 'approved',
    version: '1.0',
    scope: 'global',
    audience: ['vendor', 'admin'],
    owner: 'Lisa Chen',
    approver: 'John Doe',
    effectiveDate: new Date('2025-02-01'),
    reviewCadence: 'annual',
    nextReviewDate: new Date('2026-02-01'),
    updatedAt: new Date('2025-01-18'),
    createdAt: new Date('2025-01-10'),
    contentEn: 'All vendors must complete the onboarding process including KYB verification...',
    requiresAcknowledgement: false,
    acknowledgedCount: 0,
    targetedCount: 45,
    linkedBenefits: [],
    linkedProcesses: ['Vendor Onboarding'],
    versions: [
      { version: '1.0', status: 'approved', author: 'Lisa Chen', date: new Date('2025-01-18'), changes: 'Initial policy creation' },
    ],
    activity: [
      { id: '1', action: 'Approved', actor: 'John Doe', timestamp: new Date('2025-01-18'), details: 'Ready for publishing' },
      { id: '2', action: 'Submitted for review', actor: 'Lisa Chen', timestamp: new Date('2025-01-15') },
      { id: '3', action: 'Created', actor: 'Lisa Chen', timestamp: new Date('2025-01-10') },
    ],
  },
  {
    id: 'pol_5',
    title: 'Education Assistance Policy',
    titleAr: 'سياسة المساعدة التعليمية',
    category: 'benefits',
    status: 'draft',
    version: '0.1',
    scope: 'organization',
    scopeOrgs: ['RetailMax', 'TechStart Inc'],
    audience: ['employee'],
    owner: 'Sarah Miller',
    effectiveDate: new Date('2025-03-01'),
    reviewCadence: 'annual',
    nextReviewDate: new Date('2026-03-01'),
    updatedAt: new Date('2025-01-19'),
    createdAt: new Date('2025-01-19'),
    contentEn: 'Eligible employees may receive education assistance for approved courses...',
    requiresAcknowledgement: true,
    acknowledgedCount: 0,
    targetedCount: 0,
    linkedBenefits: ['Education'],
    linkedProcesses: ['Claims'],
    versions: [
      { version: '0.1', status: 'draft', author: 'Sarah Miller', date: new Date('2025-01-19'), changes: 'Initial draft' },
    ],
    activity: [
      { id: '1', action: 'Created', actor: 'Sarah Miller', timestamp: new Date('2025-01-19') },
    ],
  },
  {
    id: 'pol_6',
    title: 'Code of Conduct',
    category: 'conduct',
    status: 'published',
    version: '4.0',
    scope: 'global',
    audience: ['employee', 'employer', 'vendor', 'admin'],
    owner: 'John Doe',
    approver: 'Lisa Chen',
    effectiveDate: new Date('2024-01-01'),
    reviewCadence: 'biannual',
    nextReviewDate: new Date('2025-01-20'),
    updatedAt: new Date('2024-07-01'),
    createdAt: new Date('2020-01-01'),
    contentEn: 'All employees must adhere to the highest standards of professional conduct...',
    requiresAcknowledgement: true,
    acknowledgementDeadline: new Date('2024-01-31'),
    acknowledgedCount: 845,
    targetedCount: 912,
    linkedBenefits: [],
    linkedProcesses: [],
    versions: [],
    activity: [],
  },
];

const ORGS = ['RetailMax', 'TechStart Inc', 'GlobalBank', 'Acme Corp', 'FinServe Ltd'];

export default function AdminPolicyLibrary() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [policies, setPolicies] = useState<Policy[]>(SAMPLE_POLICIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [acknowledgementsOpen, setAcknowledgementsOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  // Editor state
  const [editorTab, setEditorTab] = useState('details');
  const [contentTab, setContentTab] = useState('english');
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    category: '',
    scope: 'global',
    scopeOrgs: [] as string[],
    audience: [] as string[],
    owner: '',
    effectiveDate: new Date(),
    reviewCadence: 'annual',
    nextReviewDate: addMonths(new Date(), 12),
    contentEn: '',
    contentAr: '',
    requiresAcknowledgement: false,
    acknowledgementDeadline: undefined as Date | undefined,
    linkedBenefits: [] as string[],
    linkedProcesses: [] as string[],
  });

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ['orgs-for-policy'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  // Filtered policies
  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesScope = scopeFilter === 'all' || p.scope === scopeFilter;
    const matchesOrg = orgFilter === 'all' || p.scopeOrgs?.includes(orgFilter);
    
    let matchesReview = true;
    if (reviewFilter !== 'all') {
      const daysUntilReview = differenceInDays(p.nextReviewDate, new Date());
      if (reviewFilter === '30') matchesReview = daysUntilReview <= 30 && daysUntilReview >= 0;
      else if (reviewFilter === '60') matchesReview = daysUntilReview <= 60 && daysUntilReview >= 0;
      else if (reviewFilter === '90') matchesReview = daysUntilReview <= 90 && daysUntilReview >= 0;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesScope && matchesOrg && matchesReview;
  });

  // Metrics
  const totalPolicies = policies.length;
  const publishedCount = policies.filter(p => p.status === 'published').length;
  const draftsCount = policies.filter(p => p.status === 'draft').length;
  const expiringCount = policies.filter(p => differenceInDays(p.nextReviewDate, new Date()) <= 30 && differenceInDays(p.nextReviewDate, new Date()) >= 0).length;
  const avgAckRate = policies.filter(p => p.requiresAcknowledgement && p.status === 'published').length > 0
    ? Math.round(
        policies
          .filter(p => p.requiresAcknowledgement && p.status === 'published')
          .reduce((acc, p) => acc + (p.targetedCount > 0 ? (p.acknowledgedCount / p.targetedCount) * 100 : 0), 0) /
        policies.filter(p => p.requiresAcknowledgement && p.status === 'published').length
      )
    : 0;

  const metrics = [
    { title: t('Total Policies', 'إجمالي السياسات'), value: totalPolicies, icon: FileText },
    { title: t('Published', 'منشور'), value: publishedCount, icon: Globe },
    { title: t('Drafts', 'مسودات'), value: draftsCount, icon: Edit2 },
    { title: t('Expiring in 30 Days', 'تنتهي خلال 30 يومًا'), value: expiringCount, icon: AlertTriangle, highlight: expiringCount > 0 },
    { title: t('Avg Acknowledgement', 'متوسط الإقرار'), value: `${avgAckRate}%`, icon: UserCheck },
  ];

  // Handlers
  const handleCreateNew = () => {
    setSelectedPolicy(null);
    setFormData({
      title: '',
      titleAr: '',
      category: '',
      scope: 'global',
      scopeOrgs: [],
      audience: [],
      owner: '',
      effectiveDate: new Date(),
      reviewCadence: 'annual',
      nextReviewDate: addMonths(new Date(), 12),
      contentEn: '',
      contentAr: '',
      requiresAcknowledgement: false,
      acknowledgementDeadline: undefined,
      linkedBenefits: [],
      linkedProcesses: [],
    });
    setEditorTab('details');
    setEditorOpen(true);
  };

  const handleEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title,
      titleAr: policy.titleAr || '',
      category: policy.category,
      scope: policy.scope,
      scopeOrgs: policy.scopeOrgs || [],
      audience: policy.audience,
      owner: policy.owner,
      effectiveDate: policy.effectiveDate,
      reviewCadence: policy.reviewCadence,
      nextReviewDate: policy.nextReviewDate,
      contentEn: policy.contentEn,
      contentAr: policy.contentAr || '',
      requiresAcknowledgement: policy.requiresAcknowledgement,
      acknowledgementDeadline: policy.acknowledgementDeadline,
      linkedBenefits: policy.linkedBenefits,
      linkedProcesses: policy.linkedProcesses,
    });
    setEditorTab('details');
    setEditorOpen(true);
  };

  const handleViewDetails = (policy: Policy) => {
    setSelectedPolicy(policy);
    setDetailsOpen(true);
  };

  const handleSaveDraft = async () => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'policy',
      entityId: selectedPolicy?.id || 'new',
      metadata: { action: 'policy_saved_draft', title: formData.title },
    });
    toast.success(t('Policy saved as draft', 'تم حفظ السياسة كمسودة'));
    setEditorOpen(false);
  };

  const handleSubmitForReview = async () => {
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'policy',
      entityId: selectedPolicy?.id || 'new',
      metadata: { action: 'policy_submitted_for_review', title: formData.title },
    });
    toast.success(t('Policy submitted for review', 'تم تقديم السياسة للمراجعة'));
    setEditorOpen(false);
  };

  const handleApprove = async (policy: Policy) => {
    setPolicies(prev => prev.map(p => 
      p.id === policy.id ? { ...p, status: 'approved', activity: [
        { id: String(Date.now()), action: 'Approved', actor: 'Current User', timestamp: new Date() },
        ...p.activity
      ] } : p
    ));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'policy',
      entityId: policy.id,
      metadata: { action: 'policy_approved', title: policy.title },
    });
    toast.success(t('Policy approved', 'تمت الموافقة على السياسة'));
  };

  const handlePublish = async (policy: Policy) => {
    setPolicies(prev => prev.map(p => 
      p.id === policy.id ? { ...p, status: 'published', activity: [
        { id: String(Date.now()), action: 'Published', actor: 'Current User', timestamp: new Date() },
        ...p.activity
      ] } : p
    ));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'policy',
      entityId: policy.id,
      metadata: { action: 'policy_published', title: policy.title },
    });
    toast.success(t('Policy published', 'تم نشر السياسة'));
    setDetailsOpen(false);
  };

  const handleArchive = async () => {
    if (!selectedPolicy || !archiveReason.trim()) {
      toast.error(t('Archive reason required', 'سبب الأرشفة مطلوب'));
      return;
    }
    setPolicies(prev => prev.map(p => 
      p.id === selectedPolicy.id ? { ...p, status: 'archived', activity: [
        { id: String(Date.now()), action: 'Archived', actor: 'Current User', timestamp: new Date(), details: archiveReason },
        ...p.activity
      ] } : p
    ));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'policy',
      entityId: selectedPolicy.id,
      metadata: { action: 'policy_archived', title: selectedPolicy.title, reason: archiveReason },
    });
    toast.success(t('Policy archived', 'تم أرشفة السياسة'));
    setArchiveDialogOpen(false);
    setArchiveReason('');
  };

  const handleSendReminder = (policy: Policy) => {
    toast.success(t('Reminder sent to pending users', 'تم إرسال تذكير للمستخدمين المعلقين'));
  };

  const getAckRate = (policy: Policy) => {
    if (policy.targetedCount === 0) return 0;
    return Math.round((policy.acknowledgedCount / policy.targetedCount) * 100);
  };

  const getDaysUntilReview = (date: Date) => {
    return differenceInDays(date, new Date());
  };

  return (
    <PageLayout
      title={t('Policy Library', 'مكتبة السياسات')}
      description={t('Manage policies with version control, approvals, and acknowledgement tracking', 'إدارة السياسات مع التحكم بالإصدارات والموافقات وتتبع الإقرار')}
      icon={BookOpen}
      iconClassName="from-violet-500 to-purple-500"
      actions={
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 me-2" />
          {t('Create Policy', 'إنشاء سياسة')}
        </Button>
      }
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Card key={m.title} className={cn(m.highlight && 'border-warning')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", m.highlight ? 'bg-warning/10' : 'bg-muted')}>
                  <m.icon className={cn("w-5 h-5", m.highlight ? 'text-warning' : 'text-muted-foreground')} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('Policies', 'السياسات')}
              <Badge variant="secondary">{filteredPolicies.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('Search policies...', 'البحث عن السياسات...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-52"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('Category', 'الفئة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                  {POLICY_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('Status', 'الحالة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('Scope', 'النطاق')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Scopes', 'جميع النطاقات')}</SelectItem>
                  {SCOPE_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={reviewFilter} onValueChange={setReviewFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t('Review Due', 'موعد المراجعة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                  <SelectItem value="30">{t('Next 30 days', 'خلال 30 يومًا')}</SelectItem>
                  <SelectItem value="60">{t('Next 60 days', 'خلال 60 يومًا')}</SelectItem>
                  <SelectItem value="90">{t('Next 90 days', 'خلال 90 يومًا')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[280px]">{t('Policy Title', 'عنوان السياسة')}</TableHead>
                  <TableHead>{t('Category', 'الفئة')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Version', 'الإصدار')}</TableHead>
                  <TableHead>{t('Scope', 'النطاق')}</TableHead>
                  <TableHead>{t('Owner', 'المالك')}</TableHead>
                  <TableHead>{t('Effective', 'ساري')}</TableHead>
                  <TableHead>{t('Next Review', 'المراجعة التالية')}</TableHead>
                  <TableHead>{t('Ack Rate', 'نسبة الإقرار')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                      <p className="font-medium text-muted-foreground">{t('No policies found', 'لا توجد سياسات')}</p>
                      <p className="text-sm text-muted-foreground">{t('Create your first policy to get started', 'أنشئ سياستك الأولى للبدء')}</p>
                      <Button variant="outline" className="mt-4" onClick={handleCreateNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('Create Policy', 'إنشاء سياسة')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => {
                    const statusConfig = STATUS_CONFIG[policy.status as keyof typeof STATUS_CONFIG];
                    const daysUntilReview = getDaysUntilReview(policy.nextReviewDate);
                    const ackRate = getAckRate(policy);
                    const categoryLabel = POLICY_CATEGORIES.find(c => c.value === policy.category)?.label || policy.category;
                    const scopeLabel = SCOPE_OPTIONS.find(s => s.value === policy.scope)?.label || policy.scope;

                    return (
                      <TableRow key={policy.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(policy)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium">{policy.title}</p>
                              {policy.linkedBenefits.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Link2 className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{policy.linkedBenefits.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{categoryLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", statusConfig?.color)}>
                            {statusConfig && <statusConfig.icon className="w-3 h-3 mr-1" />}
                            {statusConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">v{policy.version}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {policy.scope === 'global' && <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
                            {policy.scope === 'organization' && <Building2 className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className="text-sm">{scopeLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{policy.owner}</TableCell>
                        <TableCell className="text-sm">{format(policy.effectiveDate, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className={cn("text-sm", daysUntilReview <= 30 && daysUntilReview >= 0 && "text-warning font-medium")}>
                            {format(policy.nextReviewDate, 'MMM d, yyyy')}
                            {daysUntilReview <= 30 && daysUntilReview >= 0 && (
                              <Badge variant="outline" className="ml-2 text-[10px] bg-warning/10 text-warning border-warning/30">
                                {daysUntilReview}d
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {policy.requiresAcknowledgement && policy.status === 'published' ? (
                            <div className="flex items-center gap-2">
                              <Progress value={ackRate} className="w-16 h-2" />
                              <span className={cn("text-sm font-medium", ackRate < 80 ? 'text-warning' : 'text-success')}>
                                {ackRate}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(policy); }}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(policy); }}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPolicy(policy); setHistoryOpen(true); }}>
                                <History className="w-4 h-4 mr-2" /> Version History
                              </DropdownMenuItem>
                              {policy.status === 'in_review' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleApprove(policy); }}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                                </DropdownMenuItem>
                              )}
                              {policy.status === 'approved' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePublish(policy); }}>
                                  <Send className="w-4 h-4 mr-2" /> Publish
                                </DropdownMenuItem>
                              )}
                              {policy.requiresAcknowledgement && policy.status === 'published' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedPolicy(policy); setAcknowledgementsOpen(true); }}>
                                    <UserCheck className="w-4 h-4 mr-2" /> View Acknowledgements
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendReminder(policy); }}>
                                    <Mail className="w-4 h-4 mr-2" /> Send Reminder
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive" 
                                onClick={(e) => { e.stopPropagation(); setSelectedPolicy(policy); setArchiveDialogOpen(true); }}
                              >
                                <Archive className="w-4 h-4 mr-2" /> Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Policy Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedPolicy ? t('Edit Policy', 'تعديل السياسة') : t('Create Policy', 'إنشاء سياسة')}</SheetTitle>
            <SheetDescription>{t('Configure policy details, content, and distribution settings', 'تكوين تفاصيل السياسة والمحتوى وإعدادات التوزيع')}</SheetDescription>
          </SheetHeader>

          <Tabs value={editorTab} onValueChange={setEditorTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">{t('Details', 'التفاصيل')}</TabsTrigger>
              <TabsTrigger value="content">{t('Content', 'المحتوى')}</TabsTrigger>
              <TabsTrigger value="distribution">{t('Distribution', 'التوزيع')}</TabsTrigger>
              <TabsTrigger value="links">{t('Links', 'الروابط')}</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Policy Title (English)', 'عنوان السياسة (إنجليزي)')}</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Medical Benefits Policy"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('Policy Title (Arabic)', 'عنوان السياسة (عربي)')}</Label>
                  <Input 
                    value={formData.titleAr} 
                    onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                    placeholder="مثال: سياسة المزايا الطبية"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Category', 'الفئة')}</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select category', 'اختر الفئة')} />
                    </SelectTrigger>
                    <SelectContent>
                      {POLICY_CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('Owner', 'المالك')}</Label>
                  <Select value={formData.owner} onValueChange={(v) => setFormData(prev => ({ ...prev, owner: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select owner', 'اختر المالك')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_MEMBERS.map(m => (
                        <SelectItem key={m.id} value={m.name}>{m.name} ({m.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Effective Date', 'تاريخ السريان')}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(formData.effectiveDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.effectiveDate}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, effectiveDate: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>{t('Review Cadence', 'دورة المراجعة')}</Label>
                  <Select 
                    value={formData.reviewCadence} 
                    onValueChange={(v) => {
                      const cadence = REVIEW_CADENCE.find(r => r.value === v);
                      setFormData(prev => ({ 
                        ...prev, 
                        reviewCadence: v,
                        nextReviewDate: cadence?.months ? addMonths(formData.effectiveDate, cadence.months) : prev.nextReviewDate
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEW_CADENCE.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Next Review Date', 'تاريخ المراجعة التالية')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(formData.nextReviewDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.nextReviewDate}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, nextReviewDate: date }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-4">
              <Tabs value={contentTab} onValueChange={setContentTab}>
                <TabsList>
                  <TabsTrigger value="english" className="gap-2">
                    <Languages className="w-4 h-4" /> English
                  </TabsTrigger>
                  <TabsTrigger value="arabic" className="gap-2">
                    <Languages className="w-4 h-4" /> العربية
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="english" className="mt-4">
                  <div className="space-y-2">
                    <Label>{t('Policy Content (English)', 'محتوى السياسة (إنجليزي)')}</Label>
                    <Textarea 
                      value={formData.contentEn}
                      onChange={(e) => setFormData(prev => ({ ...prev, contentEn: e.target.value }))}
                      placeholder="Enter policy content..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="arabic" className="mt-4">
                  <div className="space-y-2">
                    <Label>{t('Policy Content (Arabic)', 'محتوى السياسة (عربي)')}</Label>
                    <Textarea 
                      value={formData.contentAr}
                      onChange={(e) => setFormData(prev => ({ ...prev, contentAr: e.target.value }))}
                      placeholder="أدخل محتوى السياسة..."
                      rows={12}
                      className="font-mono text-sm"
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">{t('Attachment (Optional)', 'مرفق (اختياري)')}</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('Upload PDF attachment', 'رفع ملف PDF')}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('Choose File', 'اختر ملف')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Scope', 'النطاق')}</Label>
                <Select value={formData.scope} onValueChange={(v) => setFormData(prev => ({ ...prev, scope: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCOPE_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>
                        <span className="flex items-center gap-2">
                          <s.icon className="w-4 h-4" />
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.scope === 'organization' && (
                <div className="space-y-2">
                  <Label>{t('Select Organizations', 'اختر المنظمات')}</Label>
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                    {ORGS.map(org => (
                      <div key={org} className="flex items-center gap-2">
                        <Checkbox 
                          id={org}
                          checked={formData.scopeOrgs.includes(org)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              scopeOrgs: checked 
                                ? [...prev.scopeOrgs, org]
                                : prev.scopeOrgs.filter(o => o !== org)
                            }));
                          }}
                        />
                        <label htmlFor={org} className="text-sm">{org}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('Target Audience', 'الجمهور المستهدف')}</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                  {AUDIENCE_OPTIONS.map(aud => (
                    <div key={aud.value} className="flex items-center gap-2">
                      <Checkbox 
                        id={aud.value}
                        checked={formData.audience.includes(aud.value)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            audience: checked 
                              ? [...prev.audience, aud.value]
                              : prev.audience.filter(a => a !== aud.value)
                          }));
                        }}
                      />
                      <label htmlFor={aud.value} className="text-sm">{aud.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="reqAck"
                    checked={formData.requiresAcknowledgement}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresAcknowledgement: !!checked }))}
                  />
                  <label htmlFor="reqAck" className="text-sm font-medium">{t('Require Acknowledgement', 'يتطلب الإقرار')}</label>
                </div>

                {formData.requiresAcknowledgement && (
                  <div className="space-y-2 pl-6">
                    <Label>{t('Acknowledgement Deadline (Optional)', 'موعد الإقرار (اختياري)')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formData.acknowledgementDeadline 
                            ? format(formData.acknowledgementDeadline, 'PPP') 
                            : t('No deadline', 'بدون موعد')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.acknowledgementDeadline}
                          onSelect={(date) => setFormData(prev => ({ ...prev, acknowledgementDeadline: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="links" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Link to Benefits', 'ربط بالمزايا')}</Label>
                <div className="grid grid-cols-3 gap-2 p-3 border rounded-lg">
                  {BENEFIT_LINKS.map(b => (
                    <div key={b} className="flex items-center gap-2">
                      <Checkbox 
                        id={`benefit-${b}`}
                        checked={formData.linkedBenefits.includes(b)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            linkedBenefits: checked 
                              ? [...prev.linkedBenefits, b]
                              : prev.linkedBenefits.filter(x => x !== b)
                          }));
                        }}
                      />
                      <label htmlFor={`benefit-${b}`} className="text-sm">{b}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Link to Processes', 'ربط بالعمليات')}</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
                  {PROCESS_LINKS.map(p => (
                    <div key={p} className="flex items-center gap-2">
                      <Checkbox 
                        id={`process-${p}`}
                        checked={formData.linkedProcesses.includes(p)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            linkedProcesses: checked 
                              ? [...prev.linkedProcesses, p]
                              : prev.linkedProcesses.filter(x => x !== p)
                          }));
                        }}
                      />
                      <label htmlFor={`process-${p}`} className="text-sm">{p}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4" /> {t('Smart Linking', 'الربط الذكي')}
                </h5>
                <p className="text-sm text-muted-foreground">
                  {t('Linked policies will appear in relevant contexts: on benefit pages, during claims, and in the employee knowledge center.', 'ستظهر السياسات المرتبطة في السياقات ذات الصلة: في صفحات المزايا وأثناء المطالبات وفي مركز معرفة الموظف.')}
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="secondary" onClick={handleSaveDraft}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t('Save Draft', 'حفظ كمسودة')}
            </Button>
            <Button onClick={handleSubmitForReview}>
              <Send className="w-4 h-4 mr-2" />
              {t('Submit for Review', 'تقديم للمراجعة')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Policy Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedPolicy && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_CONFIG[selectedPolicy.status as keyof typeof STATUS_CONFIG]?.color}>
                    {STATUS_CONFIG[selectedPolicy.status as keyof typeof STATUS_CONFIG]?.label}
                  </Badge>
                  <Badge variant="secondary">v{selectedPolicy.version}</Badge>
                </div>
                <SheetTitle className="text-xl">{selectedPolicy.title}</SheetTitle>
                {selectedPolicy.titleAr && (
                  <p className="text-muted-foreground" dir="rtl">{selectedPolicy.titleAr}</p>
                )}
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Category</p>
                    <p className="font-medium">{POLICY_CATEGORIES.find(c => c.value === selectedPolicy.category)?.label}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Scope</p>
                    <p className="font-medium flex items-center gap-1.5">
                      {selectedPolicy.scope === 'global' && <Globe className="w-3.5 h-3.5" />}
                      {selectedPolicy.scope === 'organization' && <Building2 className="w-3.5 h-3.5" />}
                      {SCOPE_OPTIONS.find(s => s.value === selectedPolicy.scope)?.label}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Owner</p>
                    <p className="font-medium">{selectedPolicy.owner}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Approver</p>
                    <p className="font-medium">{selectedPolicy.approver || '—'}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Effective Date</p>
                    <p className="font-medium">{format(selectedPolicy.effectiveDate, 'MMM d, yyyy')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-muted-foreground text-xs">Next Review</p>
                    <p className="font-medium">{format(selectedPolicy.nextReviewDate, 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Target Audience</h5>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPolicy.audience.map(a => (
                      <Badge key={a} variant="outline">{AUDIENCE_OPTIONS.find(x => x.value === a)?.label}</Badge>
                    ))}
                  </div>
                </div>

                {/* Acknowledgement Stats */}
                {selectedPolicy.requiresAcknowledgement && selectedPolicy.status === 'published' && (
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" /> Acknowledgement Tracking
                    </h5>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{selectedPolicy.acknowledgedCount} of {selectedPolicy.targetedCount}</span>
                          <span className="font-medium">{getAckRate(selectedPolicy)}%</span>
                        </div>
                        <Progress value={getAckRate(selectedPolicy)} className="h-2" />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setAcknowledgementsOpen(true)}>
                        <Eye className="w-4 h-4 mr-1" /> Details
                      </Button>
                    </div>
                    {selectedPolicy.acknowledgementDeadline && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Deadline: {format(selectedPolicy.acknowledgementDeadline, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                )}

                {/* Links */}
                {(selectedPolicy.linkedBenefits.length > 0 || selectedPolicy.linkedProcesses.length > 0) && (
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Link2 className="w-4 h-4" /> Linked To
                    </h5>
                    <div className="flex gap-2 flex-wrap">
                      {selectedPolicy.linkedBenefits.map(b => (
                        <Badge key={b} variant="secondary">{b}</Badge>
                      ))}
                      {selectedPolicy.linkedProcesses.map(p => (
                        <Badge key={p} variant="outline">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Activity Timeline */}
                <div>
                  <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <History className="w-4 h-4" /> Activity Timeline
                  </h5>
                  <div className="space-y-3">
                    {selectedPolicy.activity.slice(0, 5).map((act) => (
                      <div key={act.id} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <p className="font-medium">{act.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {act.actor} • {format(act.timestamp, 'MMM d, HH:mm')}
                          </p>
                          {act.details && <p className="text-xs text-muted-foreground italic">"{act.details}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setHistoryOpen(true)}>
                    View Full History <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleEdit(selectedPolicy)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  {selectedPolicy.status === 'in_review' && (
                    <Button onClick={() => handleApprove(selectedPolicy)}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                  )}
                  {selectedPolicy.status === 'approved' && (
                    <Button onClick={() => handlePublish(selectedPolicy)}>
                      <Send className="w-4 h-4 mr-2" /> Publish
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Version History Sheet */}
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              {t('Version History', 'سجل الإصدارات')}
            </SheetTitle>
            <SheetDescription>{selectedPolicy?.title}</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[600px] mt-6 pr-4">
            <div className="space-y-4">
              {selectedPolicy?.versions.map((v, i) => (
                <div key={v.version} className={cn("p-4 rounded-lg border", i === 0 && "border-primary bg-primary/5")}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={v.status === 'published' || v.status === 'approved' ? 'default' : 'secondary'}>
                        v{v.version}
                      </Badge>
                      {i === 0 && <Badge variant="outline" className="bg-success/10 text-success">{t('Current', 'الحالي')}</Badge>}
                    </div>
                    <span className="text-xs text-muted-foreground">{format(v.date, 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-sm">{v.changes}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('By', 'بواسطة')} {v.author}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    {v.attachmentUrl && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3 mr-1" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Acknowledgements Sheet */}
      <Sheet open={acknowledgementsOpen} onOpenChange={setAcknowledgementsOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              {t('Acknowledgement Report', 'تقرير الإقرار')}
            </SheetTitle>
            <SheetDescription>{selectedPolicy?.title}</SheetDescription>
          </SheetHeader>
          
          {selectedPolicy && (
            <div className="mt-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-success/10 text-center">
                  <p className="text-2xl font-bold text-success">{selectedPolicy.acknowledgedCount}</p>
                  <p className="text-xs text-muted-foreground">Acknowledged</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 text-center">
                  <p className="text-2xl font-bold text-warning">{selectedPolicy.targetedCount - selectedPolicy.acknowledgedCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <p className="text-2xl font-bold">{getAckRate(selectedPolicy)}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>

              {/* By Organization */}
              <div>
                <h5 className="text-sm font-medium mb-3">By Organization</h5>
                <div className="space-y-2">
                  {['RetailMax', 'TechStart Inc', 'GlobalBank'].map((org, i) => (
                    <div key={org} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{org}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={90 - i * 10} className="w-24 h-2" />
                        <span className="text-sm font-medium w-12 text-right">{90 - i * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSendReminder(selectedPolicy)}>
                  <Mail className="w-4 h-4 mr-2" /> Send Reminder
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" /> Export Report
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Archive className="w-5 h-5" />
              {t('Archive Policy', 'أرشفة السياسة')}
            </DialogTitle>
            <DialogDescription>
              {t('Archiving will remove this policy from active distribution. This action is logged.', 'ستؤدي الأرشفة إلى إزالة هذه السياسة من التوزيع النشط. يتم تسجيل هذا الإجراء.')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>{t('Archive Reason', 'سبب الأرشفة')} *</Label>
            <Textarea 
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              placeholder={t('Enter reason for archiving this policy...', 'أدخل سبب أرشفة هذه السياسة...')}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="destructive" onClick={handleArchive}>
              <Archive className="w-4 h-4 mr-2" />
              {t('Archive', 'أرشفة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
