import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Store, Search, Plus, CheckCircle, XCircle, Clock, 
  Ban, Star, Eye, FileCheck, Building2, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { VendorDetailsDrawer, AddVendorModal, type VendorFormData } from '@/components/admin/governance';
import type { VendorDisplay, KYBDocument, KYBStage } from '@/lib/governanceTypes';
import { DEFAULT_KYB_DOCUMENTS, calculateKYBProgress } from '@/lib/governanceTypes';

const STATUS_CONFIG = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Ban },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground', icon: XCircle },
};

const KYB_STAGE_CONFIG: Record<KYBStage, { label: string; color: string; order: number }> = {
  docs_submitted: { label: 'Docs Submitted', color: 'bg-warning/10 text-warning', order: 1 },
  verification_in_progress: { label: 'Verifying', color: 'bg-accent/10 text-accent-foreground', order: 2 },
  contract_signed: { label: 'Contract Signed', color: 'bg-primary/10 text-primary', order: 3 },
  banking_verified: { label: 'Banking OK', color: 'bg-success/10 text-success', order: 4 },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', order: 5 },
};

// Sample vendors with full KYB data
const SAMPLE_VENDORS: VendorDisplay[] = [
  { 
    id: '1', companyName: 'HealthPlus Medical', status: 'active', 
    categories: ['Health', 'Wellness'], rating: 4.8, totalOffers: 12, activeOffers: 10,
    totalRedemptions: 2450, complaintRate: 0.5, commissionRate: 8,
    kybProgress: { 
      stage: 'approved', completedSteps: 6, totalSteps: 6, missingItems: [],
      documents: DEFAULT_KYB_DOCUMENTS.map(d => ({ ...d, status: 'verified' as const }))
    },
    createdAt: new Date('2024-01-15'),
  },
  { 
    id: '2', companyName: 'EduFirst Academy', status: 'active', 
    categories: ['Education'], rating: 4.6, totalOffers: 8, activeOffers: 6,
    totalRedemptions: 1890, complaintRate: 1.2, commissionRate: 10,
    kybProgress: { 
      stage: 'approved', completedSteps: 6, totalSteps: 6, missingItems: [],
      documents: DEFAULT_KYB_DOCUMENTS.map(d => ({ ...d, status: 'verified' as const }))
    },
    createdAt: new Date('2024-02-20'),
  },
  { 
    id: '3', companyName: 'FitLife Gym', status: 'pending', 
    categories: ['Fitness', 'Wellness'], rating: 0, totalOffers: 0, activeOffers: 0,
    totalRedemptions: 0, complaintRate: 0, commissionRate: 12,
    kybProgress: { 
      stage: 'verification_in_progress', completedSteps: 3, totalSteps: 6, 
      missingItems: ['Bank Account Details', 'VAT/TRN Certificate', 'Contract'],
      documents: [
        { ...DEFAULT_KYB_DOCUMENTS[0], status: 'verified' as const },
        { ...DEFAULT_KYB_DOCUMENTS[1], status: 'verified' as const },
        { ...DEFAULT_KYB_DOCUMENTS[2], status: 'pending' as const },
        { ...DEFAULT_KYB_DOCUMENTS[3], status: 'verified' as const },
        { ...DEFAULT_KYB_DOCUMENTS[4], status: 'missing' as const },
        { ...DEFAULT_KYB_DOCUMENTS[5], status: 'pending' as const },
      ]
    },
    createdAt: new Date('2025-01-10'),
  },
  { 
    id: '4', companyName: 'TechGadgets Store', status: 'active', 
    categories: ['Electronics', 'Lifestyle'], rating: 4.2, totalOffers: 15, activeOffers: 12,
    totalRedemptions: 3200, complaintRate: 2.1, commissionRate: 6,
    kybProgress: { 
      stage: 'approved', completedSteps: 6, totalSteps: 6, missingItems: [],
      documents: DEFAULT_KYB_DOCUMENTS.map(d => ({ ...d, status: 'verified' as const }))
    },
    createdAt: new Date('2023-11-05'),
  },
  { 
    id: '5', companyName: 'HomeStyle Furniture', status: 'suspended', 
    categories: ['Home', 'Lifestyle'], rating: 3.1, totalOffers: 5, activeOffers: 0,
    totalRedemptions: 450, complaintRate: 8.5, commissionRate: 7,
    kybProgress: { 
      stage: 'approved', completedSteps: 6, totalSteps: 6, missingItems: [],
      documents: DEFAULT_KYB_DOCUMENTS.map(d => ({ ...d, status: 'verified' as const }))
    },
    createdAt: new Date('2024-06-18'),
  },
  { 
    id: '6', companyName: 'TravelWise Agency', status: 'pending', 
    categories: ['Travel', 'Lifestyle'], rating: 0, totalOffers: 0, activeOffers: 0,
    totalRedemptions: 0, complaintRate: 0, commissionRate: 9,
    kybProgress: { 
      stage: 'docs_submitted', completedSteps: 2, totalSteps: 6, 
      missingItems: ['Owner/Signatory ID', 'Bank Account Details', 'VAT/TRN Certificate', 'Contact Information'],
      documents: [
        { ...DEFAULT_KYB_DOCUMENTS[0], status: 'verified' as const },
        { ...DEFAULT_KYB_DOCUMENTS[1], status: 'missing' as const },
        { ...DEFAULT_KYB_DOCUMENTS[2], status: 'missing' as const },
        { ...DEFAULT_KYB_DOCUMENTS[3], status: 'verified' as const },
        { ...DEFAULT_KYB_DOCUMENTS[4], status: 'missing' as const },
        { ...DEFAULT_KYB_DOCUMENTS[5], status: 'missing' as const },
      ]
    },
    createdAt: new Date('2025-01-18'),
  },
];

export default function AdminVendors() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kybFilter, setKybFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorDisplay | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch real vendors from DB
  const { data: dbVendors, isLoading, error } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation to update vendor status
  const updateVendorMutation = useMutation({
    mutationFn: async ({ vendorId, status }: { vendorId: string; status: string }) => {
      const { error } = await supabase
        .from('vendors')
        .update({ status, is_active: status === 'active' })
        .eq('id', vendorId);
      if (error) throw error;
      return { vendorId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });

  // Merge DB vendors with sample data
  const vendors: VendorDisplay[] = useMemo(() => {
    if (dbVendors?.length) {
      return dbVendors.map(v => ({
        id: v.id,
        companyName: v.company_name,
        status: ((v as any).status || (v.is_active ? 'active' : 'pending')) as any,
        categories: ['General'],
        rating: 4.5,
        totalOffers: 0,
        activeOffers: 0,
        totalRedemptions: v.total_transactions || 0,
        complaintRate: 0,
        commissionRate: v.commission_rate || 10,
        kybProgress: { 
          stage: 'approved' as KYBStage, 
          completedSteps: 6, 
          totalSteps: 6, 
          missingItems: [],
          documents: DEFAULT_KYB_DOCUMENTS.map(d => ({ ...d, status: 'verified' as const }))
        },
        createdAt: new Date(v.created_at || ''),
      }));
    }
    return SAMPLE_VENDORS;
  }, [dbVendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesSearch = v.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchesKyb = kybFilter === 'all' || 
        (kybFilter === 'complete' && v.kybProgress.completedSteps === v.kybProgress.totalSteps) ||
        (kybFilter === 'incomplete' && v.kybProgress.completedSteps < v.kybProgress.totalSteps);
      return matchesSearch && matchesStatus && matchesKyb;
    });
  }, [vendors, searchTerm, statusFilter, kybFilter]);

  const metrics = [
    { title: t('Total Vendors', 'إجمالي البائعين'), value: vendors.length, icon: Store },
    { title: t('Active', 'نشط'), value: vendors.filter(v => v.status === 'active').length, icon: CheckCircle },
    { title: t('Pending Approval', 'بانتظار الموافقة'), value: vendors.filter(v => v.status === 'pending').length, icon: Clock },
    { title: t('Suspended', 'معلق'), value: vendors.filter(v => v.status === 'suspended').length, icon: Ban },
  ];

  const handleApprove = async (vendor: VendorDisplay, notes?: string) => {
    setIsProcessing(true);
    try {
      await updateVendorMutation.mutateAsync({ vendorId: vendor.id, status: 'active' });
      await createAuditLog({
        action: 'VENDOR_APPROVE',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.companyName, previous_status: vendor.status, notes },
      });
      toast.success(t(`Approved ${vendor.companyName}`, `تمت الموافقة على ${vendor.companyName}`));
      setDetailDrawerOpen(false);
    } catch (error) {
      toast.error(t('Failed to approve vendor', 'فشل في الموافقة على البائع'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (vendor: VendorDisplay, reason: string) => {
    setIsProcessing(true);
    try {
      await updateVendorMutation.mutateAsync({ vendorId: vendor.id, status: 'rejected' });
      await createAuditLog({
        action: 'VENDOR_REJECT',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.companyName, previous_status: vendor.status, reason },
      });
      toast.error(t(`Rejected ${vendor.companyName}`, `تم رفض ${vendor.companyName}`));
      setDetailDrawerOpen(false);
    } catch (error) {
      toast.error(t('Failed to reject vendor', 'فشل في رفض البائع'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async (vendor: VendorDisplay, reason: string) => {
    setIsProcessing(true);
    try {
      await updateVendorMutation.mutateAsync({ vendorId: vendor.id, status: 'suspended' });
      await createAuditLog({
        action: 'VENDOR_SUSPEND',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.companyName, previous_status: vendor.status, reason },
      });
      toast.warning(t(`Suspended ${vendor.companyName}`, `تم تعليق ${vendor.companyName}`));
      setDetailDrawerOpen(false);
    } catch (error) {
      toast.error(t('Failed to suspend vendor', 'فشل في تعليق البائع'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async (vendor: VendorDisplay, reason: string) => {
    setIsProcessing(true);
    try {
      await createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.companyName, action: 'request_changes', reason },
      });
      toast.info(t(`Changes requested for ${vendor.companyName}`, `تم طلب تغييرات لـ ${vendor.companyName}`));
      setDetailDrawerOpen(false);
    } catch (error) {
      toast.error(t('Failed to request changes', 'فشل في طلب التغييرات'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddVendor = async (data: VendorFormData) => {
    setIsProcessing(true);
    try {
      // Note: In production, user_id would come from auth context
      // For admin-created vendors, we'll skip the insert and just log the action
      await createAuditLog({
        action: 'ORG_CREATE',
        entityType: 'vendor',
        entityId: 'new',
        metadata: { vendor_name: data.companyName, categories: data.categories },
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast.success(t(`Created vendor: ${data.companyName}`, `تم إنشاء البائع: ${data.companyName}`));
      setAddVendorOpen(false);
    } catch (error) {
      toast.error(t('Failed to create vendor', 'فشل في إنشاء البائع'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetails = (vendor: VendorDisplay) => {
    setSelectedVendor(vendor);
    setDetailDrawerOpen(true);
  };

  // Error state
  if (error) {
    return (
      <PageLayout title={t('Vendor Management', 'إدارة البائعين')} icon={Store}>
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium">{t('Failed to load vendors', 'فشل في تحميل البائعين')}</p>
          <p className="text-muted-foreground">{t('Please try again later', 'يرجى المحاولة لاحقاً')}</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={t('Vendor Management', 'إدارة البائعين')}
      description={t('Manage marketplace vendors, approvals, and KYB verification', 'إدارة بائعي السوق والموافقات والتحقق')}
      icon={Store}
      iconClassName="from-amber-500 to-orange-500"
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Building2 className="w-5 h-5" />
              {t('All Vendors', 'جميع البائعين')}
            </CardTitle>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search vendors...', 'البحث عن البائعين...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('Status', 'الحالة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  <SelectItem value="active">{t('Active', 'نشط')}</SelectItem>
                  <SelectItem value="pending">{t('Pending', 'قيد الانتظار')}</SelectItem>
                  <SelectItem value="suspended">{t('Suspended', 'معلق')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={kybFilter} onValueChange={setKybFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('KYB', 'التحقق')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All KYB', 'جميع التحقق')}</SelectItem>
                  <SelectItem value="complete">{t('Complete', 'مكتمل')}</SelectItem>
                  <SelectItem value="incomplete">{t('Incomplete', 'غير مكتمل')}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setAddVendorOpen(true)}>
                <Plus className="w-4 h-4 me-2" />
                {t('Add Vendor', 'إضافة بائع')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">{t('No vendors found', 'لم يتم العثور على بائعين')}</p>
              <p className="text-sm">{t('Try adjusting your filters', 'حاول تعديل الفلاتر')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Vendor', 'البائع')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('KYB Progress', 'تقدم التحقق')}</TableHead>
                  <TableHead>{t('Categories', 'الفئات')}</TableHead>
                  <TableHead>{t('Rating', 'التقييم')}</TableHead>
                  <TableHead>{t('Offers', 'العروض')}</TableHead>
                  <TableHead>{t('Commission', 'العمولة')}</TableHead>
                  <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => {
                  const statusConfig = STATUS_CONFIG[vendor.status] || STATUS_CONFIG.pending;
                  const kybPercentage = vendor.kybProgress.totalSteps > 0 
                    ? Math.round((vendor.kybProgress.completedSteps / vendor.kybProgress.totalSteps) * 100) 
                    : 0;
                  const stageConfig = KYB_STAGE_CONFIG[vendor.kybProgress.stage];
                  
                  return (
                    <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(vendor)}>
                      <TableCell className="font-medium">{vendor.companyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <statusConfig.icon className="w-3 h-3 me-1" />
                          {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={cn("px-1.5 py-0.5 rounded text-xs", stageConfig.color)}>
                              {stageConfig.label}
                            </span>
                            <span className="font-medium">{kybPercentage}%</span>
                          </div>
                          <Progress value={kybPercentage} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {vendor.categories.slice(0, 2).map(c => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.rating > 0 ? (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            {vendor.rating.toFixed(1)}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <span>{vendor.activeOffers}/{vendor.totalOffers}</span>
                      </TableCell>
                      <TableCell>{vendor.commissionRate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(vendor)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {vendor.status === 'pending' && (
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(vendor)} className="text-success hover:text-success">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {vendor.status === 'active' && (
                            <Button variant="ghost" size="icon" onClick={() => handleSuspend(vendor, 'Quick suspend')} className="text-destructive hover:text-destructive">
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Drawer */}
      <VendorDetailsDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        vendor={selectedVendor}
        onApprove={handleApprove}
        onReject={handleReject}
        onSuspend={handleSuspend}
        onRequestChanges={handleRequestChanges}
        isProcessing={isProcessing}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        open={addVendorOpen}
        onOpenChange={setAddVendorOpen}
        onSubmit={handleAddVendor}
        isSubmitting={isProcessing}
      />
    </PageLayout>
  );
}
