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
  Tag, Search, CheckCircle, XCircle, Clock, Eye, Percent, 
  Globe, Building2, Calendar, TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

const OFFER_STATUS = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-warning/10 text-warning border-warning/30' },
  expired: { label: 'Expired', labelAr: 'منتهي', color: 'bg-muted text-muted-foreground border-border' },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export default function AdminOffers() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch offers from DB
  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_offers')
        .select('*, vendors(company_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // P0 FIX: Mutation to approve/reject offers
  const updateOfferMutation = useMutation({
    mutationFn: async ({ offerId, status, isActive }: { offerId: string; status: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('marketplace_offers')
        .update({ status, is_active: isActive })
        .eq('id', offerId);
      if (error) throw error;
      return { offerId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_offers'] }); // Employee side
      queryClient.invalidateQueries({ queryKey: ['vendor-offers'] }); // Vendor side
    },
  });

  const categories = [...new Set(offers?.map(o => o.category) || [])];

  const filteredOffers = offers?.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter || 
                          (statusFilter === 'active' && o.is_active) ||
                          (statusFilter === 'pending' && o.status === 'pending');
    const matchesCategory = categoryFilter === 'all' || o.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const metrics = [
    { title: t('Total Offers', 'إجمالي العروض'), value: offers?.length || 0, icon: Tag },
    { title: t('Active', 'نشط'), value: offers?.filter(o => o.status === 'active' && o.is_active).length || 0, icon: CheckCircle },
    { title: t('Pending Review', 'بانتظار المراجعة'), value: offers?.filter(o => o.status === 'pending').length || 0, icon: Clock },
    { title: t('Avg. Discount', 'متوسط الخصم'), value: `${Math.round((offers?.reduce((acc, o) => acc + (o.discount_percent || 0), 0) || 0) / (offers?.length || 1))}%`, icon: Percent },
  ];

  // P0 FIX: Actually update DB on approve
  const handleApprove = async (offer: any) => {
    try {
      await updateOfferMutation.mutateAsync({ 
        offerId: offer.id, 
        status: 'active', 
        isActive: true 
      });
      await createAuditLog({
        action: 'OFFER_APPROVE',
        entityType: 'offer',
        entityId: offer.id,
        metadata: { 
          offer_title: offer.title, 
          vendor_id: offer.vendor_id,
          previous_status: offer.status,
          actor_role: 'admin',
        },
      });
      toast.success(t(`Approved: ${offer.title}`, `تمت الموافقة: ${offer.title}`));
      setDetailSheetOpen(false);
    } catch (error) {
      toast.error(t('Failed to approve offer', 'فشل في الموافقة على العرض'));
    }
  };

  // P0 FIX: Actually update DB on reject
  const handleReject = async (offer: any) => {
    try {
      await updateOfferMutation.mutateAsync({ 
        offerId: offer.id, 
        status: 'rejected', 
        isActive: false 
      });
      await createAuditLog({
        action: 'OFFER_REJECT',
        entityType: 'offer',
        entityId: offer.id,
        metadata: { 
          offer_title: offer.title, 
          vendor_id: offer.vendor_id,
          previous_status: offer.status,
          actor_role: 'admin',
        },
      });
      toast.error(t(`Rejected: ${offer.title}`, `تم الرفض: ${offer.title}`));
      setDetailSheetOpen(false);
    } catch (error) {
      toast.error(t('Failed to reject offer', 'فشل في رفض العرض'));
    }
  };

  return (
    <PageLayout
      title={t('Offers & Vouchers', 'العروض والقسائم')}
      description={t('Manage marketplace offers, approvals, and voucher redemptions', 'إدارة عروض السوق والموافقات واسترداد القسائم')}
      icon={Tag}
      iconClassName="from-violet-500 to-purple-500"
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
              <Tag className="w-5 h-5" />
              {t('All Offers', 'جميع العروض')}
            </CardTitle>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search offers...', 'البحث عن العروض...')}
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
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('Category', 'الفئة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Offer', 'العرض')}</TableHead>
                  <TableHead>{t('Vendor', 'البائع')}</TableHead>
                  <TableHead>{t('Category', 'الفئة')}</TableHead>
                  <TableHead>{t('Discount', 'الخصم')}</TableHead>
                  <TableHead>{t('Type', 'النوع')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Rating', 'التقييم')}</TableHead>
                  <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const status = offer.is_active ? 'active' : 'pending';
                  const statusConfig = OFFER_STATUS[status];
                  return (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">{offer.title}</TableCell>
                      <TableCell>{offer.merchant}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{offer.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-success font-medium">{offer.discount_percent}% off</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={offer.tags?.includes('sponsored') ? 'bg-accent/10 text-accent border-accent/30' : ''}>
                          {offer.tags?.includes('sponsored') ? (
                            <><Building2 className="w-3 h-3 me-1" /> Sponsored</>
                          ) : (
                            <><Globe className="w-3 h-3 me-1" /> Public</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          {isRTL ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.rating ? `${offer.rating}★` : '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedOffer(offer); setDetailSheetOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!offer.is_active && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(offer)} className="text-success hover:text-success">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleReject(offer)} className="text-destructive hover:text-destructive">
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
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

      {/* Offer Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedOffer?.title}</SheetTitle>
            <SheetDescription>{t('Offer details and moderation', 'تفاصيل العرض والإشراف')}</SheetDescription>
          </SheetHeader>
          {selectedOffer && (
            <div className="mt-6 space-y-6">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                {selectedOffer.image_url ? (
                  <img src={selectedOffer.image_url} alt={selectedOffer.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Tag className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Discount', 'الخصم')}</p>
                  <p className="text-2xl font-bold text-success">{selectedOffer.discount_percent}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Category', 'الفئة')}</p>
                  <p className="text-lg font-semibold">{selectedOffer.category}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('Description', 'الوصف')}</h4>
                <p className="text-sm text-muted-foreground">{selectedOffer.description || t('No description', 'لا يوجد وصف')}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('Terms', 'الشروط')}</h4>
                <p className="text-sm text-muted-foreground">{selectedOffer.terms || t('No terms specified', 'لم يتم تحديد الشروط')}</p>
              </div>
              {!selectedOffer.is_active && (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => handleApprove(selectedOffer)}>
                    <CheckCircle className="w-4 h-4 me-2" />
                    {t('Approve', 'موافقة')}
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedOffer)}>
                    <XCircle className="w-4 h-4 me-2" />
                    {t('Reject', 'رفض')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
