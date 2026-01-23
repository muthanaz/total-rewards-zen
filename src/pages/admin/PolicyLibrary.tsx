/**
 * Admin Policy Library
 * 
 * Create and manage organization-specific policies from templates.
 * This is the admin-led flow for quickly onboarding client organizations
 * with pre-configured policies.
 */

import { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  FileText,
  Building2,
  LayoutTemplate,
  CheckCircle,
  Clock,
  Send,
  Eye,
  Loader2,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Edit2,
  Archive,
  Globe,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { LIFE_AREA_LABELS } from '@/lib/constants';
import { useAllPolicyTemplates, type PolicyTemplate } from '@/hooks/usePolicyTemplates';
import { createPolicyWithVersion, type CreatePolicyResult } from '@/hooks/usePolicyRPC';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import type { TransactionModel, PolicyContent, PolicyLogic } from '@/lib/policyEngine';

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Edit2 },
  submitted: { label: 'Submitted', color: 'bg-amber-500/10 text-amber-600', icon: Send },
  approved: { label: 'Approved', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  published: { label: 'Published', color: 'bg-emerald-500/10 text-emerald-600', icon: Globe },
  archived: { label: 'Archived', color: 'bg-destructive/10 text-destructive', icon: Archive },
};

interface OrgPolicy {
  id: string;
  organization_id: string;
  organization_name: string;
  policy_ref: string;
  title: string;
  category: string;
  status: string;
  benefit_type: string | null;
  transaction_model: string | null;
  effective_from: string | null;
  created_at: string;
  updated_at: string;
  version_count: number;
  latest_version_status: string;
}

export default function AdminPolicyLibrary() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { createAuditLog } = useAdminAuditLog();
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<OrgPolicy | null>(null);

  // Create form state
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [policyName, setPolicyName] = useState('');
  const [lifeArea, setLifeArea] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Idempotency key - stable per dialog open
  const clientRequestIdRef = useRef<string | null>(null);

  // Fetch organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all policies across organizations (admin view)
  const { data: allPolicies = [], isLoading: policiesLoading, refetch: refetchPolicies } = useQuery({
    queryKey: ['admin-all-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policies')
        .select(`
          id,
          organization_id,
          policy_ref,
          title,
          category,
          status,
          benefit_type,
          transaction_model,
          effective_from,
          created_at,
          updated_at,
          is_deleted,
          organizations!inner(name)
        `)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Also fetch version counts
      const policyIds = (data || []).map(p => p.id);
      const { data: versionCounts } = await supabase
        .from('policy_versions')
        .select('policy_id, status')
        .in('policy_id', policyIds);

      const versionMap = new Map<string, { count: number; latestStatus: string }>();
      (versionCounts || []).forEach(v => {
        const existing = versionMap.get(v.policy_id) || { count: 0, latestStatus: 'draft' };
        existing.count++;
        // Prioritize published > approved > submitted > draft
        const statusPriority: Record<string, number> = { published: 4, approved: 3, submitted: 2, draft: 1 };
        if ((statusPriority[v.status] || 0) > (statusPriority[existing.latestStatus] || 0)) {
          existing.latestStatus = v.status;
        }
        versionMap.set(v.policy_id, existing);
      });

      return (data || []).map(p => ({
        id: p.id,
        organization_id: p.organization_id,
        organization_name: (p.organizations as any)?.name || 'Unknown',
        policy_ref: p.policy_ref,
        title: p.title,
        category: p.category,
        status: p.status,
        benefit_type: p.benefit_type,
        transaction_model: p.transaction_model,
        effective_from: p.effective_from,
        created_at: p.created_at,
        updated_at: p.updated_at,
        version_count: versionMap.get(p.id)?.count || 1,
        latest_version_status: versionMap.get(p.id)?.latestStatus || p.status,
      })) as OrgPolicy[];
    },
  });

  // Fetch templates
  const { data: templates = [] } = useAllPolicyTemplates();
  const activeTemplates = templates.filter(t => t.is_active);

  // Filter policies
  const filteredPolicies = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allPolicies.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.policy_ref.toLowerCase().includes(q) ||
        p.organization_name.toLowerCase().includes(q);
      const matchesOrg = orgFilter === 'all' || p.organization_id === orgFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesOrg && matchesStatus;
    });
  }, [allPolicies, searchQuery, orgFilter, statusFilter]);

  // Stats
  const totalPolicies = allPolicies.length;
  const publishedCount = allPolicies.filter(p => p.status === 'published').length;
  const draftCount = allPolicies.filter(p => p.status === 'draft').length;
  const pendingCount = allPolicies.filter(p => ['submitted', 'approved'].includes(p.status)).length;

  // Life area options
  const lifeAreaOptions = Object.entries(LIFE_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  // Reset create form
  const resetCreateForm = () => {
    setSelectedOrg('');
    setSelectedTemplate('');
    setPolicyName('');
    setLifeArea('');
    clientRequestIdRef.current = null;
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    resetCreateForm();
    clientRequestIdRef.current = crypto.randomUUID(); // Generate stable ID for this session
    setCreateDialogOpen(true);
  };

  // Apply template to form
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = activeTemplates.find(t => t.id === templateId);
    if (template) {
      setPolicyName(template.name);
      setLifeArea(template.category);
    }
  };

  // Create policy for org
  const handleCreatePolicy = async () => {
    if (!selectedOrg || !policyName.trim() || !lifeArea) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    // Ensure we have idempotency key
    if (!clientRequestIdRef.current) {
      clientRequestIdRef.current = crypto.randomUUID();
    }

    setIsCreating(true);

    try {
      const template = selectedTemplate
        ? activeTemplates.find(t => t.id === selectedTemplate)
        : null;

      const result: CreatePolicyResult = await createPolicyWithVersion({
        orgId: selectedOrg,
        createdBy: user.id,
        policyName: policyName.trim(),
        lifeArea,
        benefitType: template?.benefit_type || 'allowance',
        transactionModel: template?.transaction_model || 'claim_only',
        // Pass content and logic as-is - the RPC handles defaults
        contentJson: template?.default_content as PolicyContent | undefined,
        logicJson: template
          ? ({
              transaction_model: (template.transaction_model || 'claim_only') as TransactionModel,
              eligibility_rules: template.default_eligibility_rules || {},
              limits_caps: template.default_limits || {},
              workflow: template.default_workflow || {},
            } as PolicyLogic)
          : undefined,
        clientRequestId: clientRequestIdRef.current,
      });

      if (result.success) {
        if (result.already_exists) {
          toast.info('Policy already exists (idempotent match)');
        } else {
          toast.success('Policy created successfully');
          createAuditLog({
            action: 'POLICY_PUBLISH', // Closest available action for policy creation
            entityType: 'policy',
            entityId: result.policy_id || '',
            metadata: {
              policy_ref: result.policy_ref,
              organization_id: selectedOrg,
              template_id: selectedTemplate || null,
              created_by_admin: true,
            },
          });
        }
        setCreateDialogOpen(false);
        refetchPolicies();
      } else {
        toast.error(result.error || 'Failed to create policy');
      }
    } catch (error: any) {
      console.error('Create policy error:', error);
      toast.error(error.message || 'Failed to create policy');
    } finally {
      setIsCreating(false);
    }
  };

  // View policy details
  const handleViewDetails = (policy: OrgPolicy) => {
    setSelectedPolicy(policy);
    setDetailsSheetOpen(true);
  };

  return (
    <PageLayout
      title={t('Policy Library', 'مكتبة السياسات')}
      description={t(
        'Create and manage benefit policies for client organizations',
        'إنشاء وإدارة سياسات المزايا للمنظمات العميلة'
      )}
      icon={BookOpen}
      actions={
        <Button className="gap-2" onClick={handleOpenCreateDialog}>
          <Plus className="w-4 h-4" />
          {t('Create Policy', 'إنشاء سياسة')}
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Policies', 'إجمالي السياسات')}</p>
                <p className="text-2xl font-bold">{totalPolicies}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Published', 'منشور')}</p>
                <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
              </div>
              <Globe className="w-8 h-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Drafts', 'مسودات')}</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Edit2 className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Pending Review', 'في الانتظار')}</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="text-lg">{t('All Organization Policies', 'جميع سياسات المنظمات')}</CardTitle>
              <CardDescription>
                {t('Policies created by admin for client organizations', 'السياسات التي أنشأها المسؤول للمنظمات العميلة')}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('Search policies...', 'بحث في السياسات...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('All Orgs', 'جميع المنظمات')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Organizations', 'جميع المنظمات')}</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('All Status', 'جميع الحالات')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  <SelectItem value="draft">{t('Draft', 'مسودة')}</SelectItem>
                  <SelectItem value="submitted">{t('Submitted', 'مقدم')}</SelectItem>
                  <SelectItem value="approved">{t('Approved', 'موافق عليه')}</SelectItem>
                  <SelectItem value="published">{t('Published', 'منشور')}</SelectItem>
                  <SelectItem value="archived">{t('Archived', 'مؤرشف')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {policiesLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{t('No policies found', 'لم يتم العثور على سياسات')}</p>
              <p className="text-sm mt-1">
                {searchQuery || orgFilter !== 'all' || statusFilter !== 'all'
                  ? t('Try adjusting your filters', 'جرب تعديل عوامل التصفية')
                  : t('Create your first policy to get started', 'أنشئ أول سياسة للبدء')}
              </p>
              {!searchQuery && orgFilter === 'all' && statusFilter === 'all' && (
                <Button className="mt-4 gap-2" onClick={handleOpenCreateDialog}>
                  <Plus className="w-4 h-4" />
                  {t('Create Policy', 'إنشاء سياسة')}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Policy', 'السياسة')}</TableHead>
                  <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                  <TableHead>{t('Category', 'الفئة')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Updated', 'محدث')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => {
                  const statusConfig = STATUS_CONFIG[policy.status] || STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="font-medium">{policy.title}</p>
                            <p className="text-xs text-muted-foreground">{policy.policy_ref}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">{policy.organization_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {LIFE_AREA_LABELS[policy.category as keyof typeof LIFE_AREA_LABELS] || policy.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('gap-1', statusConfig.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(policy.updated_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(policy)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('View', 'عرض')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('Create Policy for Organization', 'إنشاء سياسة للمنظمة')}</DialogTitle>
            <DialogDescription>
              {t(
                'Select an organization and optionally use a template to create a new policy draft.',
                'اختر منظمة واستخدم قالبًا اختياريًا لإنشاء مسودة سياسة جديدة.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Organization Select */}
            <div className="space-y-2">
              <Label>
                {t('Organization', 'المنظمة')} <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select organization...', 'اختر المنظمة...')} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {org.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Select (optional) */}
            <div className="space-y-2">
              <Label>{t('Template (optional)', 'القالب (اختياري)')}</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Start from template...', 'ابدأ من قالب...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {t('Blank Policy', 'سياسة فارغة')}
                    </div>
                  </SelectItem>
                  {activeTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-primary" />
                        <span>{template.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {LIFE_AREA_LABELS[template.category as keyof typeof LIFE_AREA_LABELS] || template.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTemplate && (
                <p className="text-xs text-muted-foreground">
                  {activeTemplates.find(t => t.id === selectedTemplate)?.description || 
                   t('Template will pre-fill policy configuration', 'سيقوم القالب بملء تكوين السياسة مسبقًا')}
                </p>
              )}
            </div>

            {/* Policy Name */}
            <div className="space-y-2">
              <Label>
                {t('Policy Name', 'اسم السياسة')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder={t('e.g., Medical Insurance Policy', 'مثال: سياسة التأمين الطبي')}
              />
            </div>

            {/* Life Area */}
            <div className="space-y-2">
              <Label>
                {t('Life Area / Category', 'مجال الحياة / الفئة')} <span className="text-destructive">*</span>
              </Label>
              <Select value={lifeArea} onValueChange={setLifeArea}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select category...', 'اختر الفئة...')} />
                </SelectTrigger>
                <SelectContent>
                  {lifeAreaOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleCreatePolicy} disabled={isCreating || !selectedOrg || !policyName.trim() || !lifeArea}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('Creating...', 'جاري الإنشاء...')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('Create Draft Policy', 'إنشاء مسودة سياسة')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Details Sheet */}
      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedPolicy?.title}</SheetTitle>
            <SheetDescription>{selectedPolicy?.policy_ref}</SheetDescription>
          </SheetHeader>

          {selectedPolicy && (
            <ScrollArea className="h-[calc(100vh-200px)] mt-6">
              <div className="space-y-6 pr-4">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{t('Status:', 'الحالة:')}</span>
                  {(() => {
                    const config = STATUS_CONFIG[selectedPolicy.status] || STATUS_CONFIG.draft;
                    const Icon = config.icon;
                    return (
                      <Badge className={cn('gap-1', config.color)}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    );
                  })()}
                </div>

                {/* Organization */}
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t('Organization', 'المنظمة')}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedPolicy.organization_name}</span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t('Category', 'الفئة')}
                  </Label>
                  <p className="mt-1">
                    {LIFE_AREA_LABELS[selectedPolicy.category as keyof typeof LIFE_AREA_LABELS] || selectedPolicy.category}
                  </p>
                </div>

                {/* Benefit Type */}
                {selectedPolicy.benefit_type && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      {t('Benefit Type', 'نوع المزايا')}
                    </Label>
                    <p className="mt-1 capitalize">{selectedPolicy.benefit_type}</p>
                  </div>
                )}

                {/* Transaction Model */}
                {selectedPolicy.transaction_model && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      {t('Transaction Model', 'نموذج المعاملة')}
                    </Label>
                    <p className="mt-1 capitalize">{selectedPolicy.transaction_model.replace('_', ' ')}</p>
                  </div>
                )}

                {/* Effective Date */}
                {selectedPolicy.effective_from && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      {t('Effective From', 'ساري من')}
                    </Label>
                    <p className="mt-1">{format(new Date(selectedPolicy.effective_from), 'MMM d, yyyy')}</p>
                  </div>
                )}

                {/* Versions */}
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    {t('Versions', 'الإصدارات')}
                  </Label>
                  <p className="mt-1">{selectedPolicy.version_count}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      {t('Created', 'تاريخ الإنشاء')}
                    </Label>
                    <p className="mt-1 text-sm">{format(new Date(selectedPolicy.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                      {t('Updated', 'تاريخ التحديث')}
                    </Label>
                    <p className="mt-1 text-sm">{format(new Date(selectedPolicy.updated_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t(
                      'The employer can edit and publish this policy from their Policies page.',
                      'يمكن لصاحب العمل تحرير ونشر هذه السياسة من صفحة السياسات الخاصة به.'
                    )}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setDetailsSheetOpen(false)}>
              {t('Close', 'إغلاق')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
