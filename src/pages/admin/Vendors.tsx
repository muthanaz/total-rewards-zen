import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Store, Search, Plus, CheckCircle, XCircle, Clock, 
  Ban, Star, Eye, FileCheck, Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

const STATUS_CONFIG = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Ban },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-muted text-muted-foreground border-border', icon: XCircle },
};

const SAMPLE_VENDORS = [
  { id: '1', company_name: 'HealthPlus Medical', status: 'active', categories: ['Health', 'Wellness'], rating: 4.8, total_offers: 12, total_transactions: 2450, commission_rate: 8, kyb_status: 'verified', created_at: '2024-01-15' },
  { id: '2', company_name: 'EduFirst Academy', status: 'active', categories: ['Education'], rating: 4.6, total_offers: 8, total_transactions: 1890, commission_rate: 10, kyb_status: 'verified', created_at: '2024-02-20' },
  { id: '3', company_name: 'FitLife Gym', status: 'pending', categories: ['Fitness', 'Wellness'], rating: 0, total_offers: 0, total_transactions: 0, commission_rate: 12, kyb_status: 'pending', created_at: '2025-01-10' },
  { id: '4', company_name: 'TechGadgets Store', status: 'active', categories: ['Electronics', 'Lifestyle'], rating: 4.2, total_offers: 15, total_transactions: 3200, commission_rate: 6, kyb_status: 'verified', created_at: '2023-11-05' },
  { id: '5', company_name: 'HomeStyle Furniture', status: 'suspended', categories: ['Home', 'Lifestyle'], rating: 3.1, total_offers: 5, total_transactions: 450, commission_rate: 7, kyb_status: 'verified', created_at: '2024-06-18' },
  { id: '6', company_name: 'TravelWise Agency', status: 'pending', categories: ['Travel', 'Lifestyle'], rating: 0, total_offers: 0, total_transactions: 0, commission_rate: 9, kyb_status: 'in_review', created_at: '2025-01-18' },
];

interface VendorDisplay {
  id: string;
  company_name: string;
  status: string;
  categories: string[];
  rating: number;
  total_offers: number;
  total_transactions: number;
  commission_rate: number;
  kyb_status: string;
  created_at: string;
}

export default function AdminVendors() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorDisplay | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch real vendors from DB
  const { data: dbVendors, isLoading } = useQuery({
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

  // Merge DB vendors with sample data for demo
  const vendors: VendorDisplay[] = dbVendors?.length 
    ? dbVendors.map(v => ({
        id: v.id,
        company_name: v.company_name,
        status: (v as any).status || (v.is_active ? 'active' : 'pending'),
        categories: ['General'],
        rating: 4.5,
        total_offers: 0,
        total_transactions: v.total_transactions || 0,
        commission_rate: v.commission_rate || 10,
        kyb_status: 'verified',
        created_at: v.created_at || '',
      })) 
    : SAMPLE_VENDORS;

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const metrics = [
    { title: t('Total Vendors', 'إجمالي البائعين'), value: vendors.length, icon: Store },
    { title: t('Active', 'نشط'), value: vendors.filter(v => v.status === 'active').length, icon: CheckCircle },
    { title: t('Pending Approval', 'بانتظار الموافقة'), value: vendors.filter(v => v.status === 'pending').length, icon: Clock },
    { title: t('Suspended', 'معلق'), value: vendors.filter(v => v.status === 'suspended').length, icon: Ban },
  ];

  const handleApprove = async (vendor: VendorDisplay) => {
    try {
      await updateVendorMutation.mutateAsync({ vendorId: vendor.id, status: 'active' });
      await createAuditLog({
        action: 'VENDOR_APPROVE',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.company_name, previous_status: vendor.status },
      });
      toast.success(t(`Approved ${vendor.company_name}`, `تمت الموافقة على ${vendor.company_name}`));
      setDetailSheetOpen(false);
    } catch (error) {
      toast.error(t('Failed to approve vendor', 'فشل في الموافقة على البائع'));
    }
  };

  const handleSuspend = async (vendor: VendorDisplay) => {
    try {
      await updateVendorMutation.mutateAsync({ vendorId: vendor.id, status: 'suspended' });
      await createAuditLog({
        action: 'VENDOR_SUSPEND',
        entityType: 'vendor',
        entityId: vendor.id,
        metadata: { vendor_name: vendor.company_name, previous_status: vendor.status },
      });
      toast.warning(t(`Suspended ${vendor.company_name}`, `تم تعليق ${vendor.company_name}`));
      setDetailSheetOpen(false);
    } catch (error) {
      toast.error(t('Failed to suspend vendor', 'فشل في تعليق البائع'));
    }
  };

  const handleViewDetails = (vendor: VendorDisplay) => {
    setSelectedVendor(vendor);
    setDetailSheetOpen(true);
  };

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
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('Status', 'الحالة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  <SelectItem value="active">{t('Active', 'نشط')}</SelectItem>
                  <SelectItem value="pending">{t('Pending', 'قيد الانتظار')}</SelectItem>
                  <SelectItem value="suspended">{t('Suspended', 'معلق')}</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm">
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Vendor', 'البائع')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('KYB', 'التحقق')}</TableHead>
                  <TableHead>{t('Categories', 'الفئات')}</TableHead>
                  <TableHead>{t('Rating', 'التقييم')}</TableHead>
                  <TableHead>{t('Offers', 'العروض')}</TableHead>
                  <TableHead>{t('Commission', 'العمولة')}</TableHead>
                  <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => {
                  const statusConfig = STATUS_CONFIG[vendor.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  return (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.company_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <statusConfig.icon className="w-3 h-3 me-1" />
                          {isRTL ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={vendor.kyb_status === 'verified' ? 'default' : 'secondary'}>
                          {vendor.kyb_status === 'verified' ? <FileCheck className="w-3 h-3 me-1" /> : <Clock className="w-3 h-3 me-1" />}
                          {vendor.kyb_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {vendor.categories?.slice(0, 2).map(c => (
                            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.rating > 0 ? (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            {vendor.rating}
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{vendor.total_offers || 0}</TableCell>
                      <TableCell>{vendor.commission_rate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetails(vendor)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {vendor.status === 'pending' && (
                            <Button variant="ghost" size="icon" onClick={() => handleApprove(vendor)} className="text-success hover:text-success">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {vendor.status === 'active' && (
                            <Button variant="ghost" size="icon" onClick={() => handleSuspend(vendor)} className="text-destructive hover:text-destructive">
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

      {/* Vendor Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedVendor?.company_name}</SheetTitle>
            <SheetDescription>{t('Vendor details and performance', 'تفاصيل البائع والأداء')}</SheetDescription>
          </SheetHeader>
          {selectedVendor && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Total Transactions', 'إجمالي المعاملات')}</p>
                  <p className="text-2xl font-bold">{selectedVendor.total_transactions?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Commission Rate', 'نسبة العمولة')}</p>
                  <p className="text-2xl font-bold">{selectedVendor.commission_rate}%</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">{t('Categories', 'الفئات')}</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedVendor.categories?.map(c => (
                    <Badge key={c} variant="outline">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {selectedVendor.status === 'pending' && (
                  <Button className="flex-1" onClick={() => handleApprove(selectedVendor)}>
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Approve Vendor', 'الموافقة على البائع')}
                  </Button>
                )}
                {selectedVendor.status === 'active' && (
                  <Button variant="destructive" className="flex-1" onClick={() => handleSuspend(selectedVendor)}>
                    <Ban className="w-4 h-4 me-2" />
                    {t('Suspend Vendor', 'تعليق البائع')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
