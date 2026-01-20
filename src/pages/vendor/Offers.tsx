import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tag, Search, Plus, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, AlertTriangle, Users, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVendorOffers, useVendorOfferStats, useDeleteOffer, VendorOffer } from '@/hooks/useVendorData';
import { formatCurrencyAED, formatInteger, cn } from '@/lib/utils';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending Review', labelAr: 'قيد المراجعة', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' },
  active: { label: 'Active', labelAr: 'نشط', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' },
  suspended: { label: 'Suspended', labelAr: 'موقوف', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
  rejected: { label: 'Rejected', labelAr: 'مرفوض', icon: XCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
  expired: { label: 'Expired', labelAr: 'منتهي', icon: AlertTriangle, className: 'bg-muted text-muted-foreground border-border' },
};

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  wellness: { en: 'Wellness', ar: 'الصحة' },
  learning: { en: 'Learning', ar: 'التعلم' },
  food: { en: 'Food', ar: 'الطعام' },
  transport: { en: 'Transport', ar: 'المواصلات' },
  family: { en: 'Family', ar: 'الأسرة' },
  entertainment: { en: 'Entertainment', ar: 'الترفيه' },
  retail: { en: 'Retail', ar: 'التسوق' },
  travel: { en: 'Travel', ar: 'السفر' },
  fitness: { en: 'Fitness', ar: 'اللياقة' },
  health: { en: 'Health', ar: 'الصحة' },
};

export default function VendorOffers() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedOffer, setSelectedOffer] = useState<VendorOffer | null>(null);

  const { data: offers, isLoading } = useVendorOffers();
  const { data: stats } = useVendorOfferStats();
  const { mutate: deleteOffer } = useDeleteOffer();

  const filteredOffers = offers?.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const metrics = [
    { title: t('Total Offers', 'إجمالي العروض'), value: formatInteger(offers?.length || 0), icon: Tag },
    { title: t('Active Offers', 'العروض النشطة'), value: formatInteger(offers?.filter(o => o.status === 'active').length || 0), icon: CheckCircle, trend: { value: 5, positive: true } },
    { title: t('Total Activations', 'إجمالي التفعيلات'), value: formatInteger(stats?.activations || 0), icon: Users, trend: { value: 12, positive: true } },
    { title: t('Est. Earnings', 'الأرباح المقدرة'), value: formatCurrencyAED(stats?.redemptions ? stats.redemptions * 500 * 0.1 : 0), icon: Wallet },
  ];

  const handleDelete = (offerId: string) => {
    if (confirm(t('Are you sure you want to delete this offer?', 'هل أنت متأكد من حذف هذا العرض؟'))) {
      deleteOffer(offerId);
    }
  };

  const canEdit = (status: string) => ['pending', 'rejected'].includes(status);
  const categories = [...new Set(offers?.map(o => o.category) || [])];

  return (
    <PageLayout
      title={t('My Offers', 'عروضي')}
      description={t('Manage your marketplace offers and track performance', 'إدارة عروض السوق الخاصة بك وتتبع الأداء')}
      icon={Tag}
      iconClassName="text-primary"
      actions={
        <Button onClick={() => navigate('/vendor/offers/new')}>
          <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
          {t('Create New Offer', 'إنشاء عرض جديد')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((metric, i) => (
          <MetricCard key={i} title={metric.title} value={metric.value} icon={metric.icon} trend={metric.trend} />
        ))}
      </MetricGrid>

      <Card className="mt-6">
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row gap-4 justify-between", isRTL && "sm:flex-row-reverse")}>
            <CardTitle className="text-lg">{t('All Offers', 'جميع العروض')}</CardTitle>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input placeholder={t('Search offers...', 'البحث في العروض...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={cn("w-56", isRTL ? "pr-9" : "pl-9")} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder={t('Status', 'الحالة')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{language === 'ar' ? config.labelAr : config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder={t('Category', 'الفئة')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]?.[language === 'ar' ? 'ar' : 'en'] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredOffers.length === 0 ? (
            <EmptyState
              icon={Tag}
              title={t('No offers found', 'لا توجد عروض')}
              description={t('Create your first offer to start attracting employees', 'أنشئ عرضك الأول لبدء جذب الموظفين')}
              action={{
                label: t('Create Offer', 'إنشاء عرض'),
                onClick: () => navigate('/vendor/offers/new'),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Offer', 'العرض')}</TableHead>
                  <TableHead>{t('Category', 'الفئة')}</TableHead>
                  <TableHead>{t('Discount', 'الخصم')}</TableHead>
                  <TableHead>{t('Validity', 'الصلاحية')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => {
                  const isExpired = offer.valid_to && new Date(offer.valid_to) < new Date();
                  const effectiveStatus = isExpired && offer.status === 'active' ? 'expired' : offer.status;
                  const statusConfig = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          {offer.image_url ? (
                            <img src={offer.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Tag className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className={cn(isRTL && "text-right")}>
                            <p className="font-medium">{offer.title}</p>
                            <p className="text-xs text-muted-foreground">{offer.merchant}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{CATEGORY_LABELS[offer.category]?.[language === 'ar' ? 'ar' : 'en'] || offer.category}</Badge></TableCell>
                      <TableCell className="font-medium">{offer.discount_percent ? `${offer.discount_percent}%` : '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {offer.valid_from && offer.valid_to ? (
                          <span className={isExpired ? 'text-destructive' : ''}>
                            {new Date(offer.valid_from).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE')} - {new Date(offer.valid_to).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-AE')}
                          </span>
                        ) : t('No expiry', 'بدون انتهاء')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3 me-1" />
                          {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center justify-end gap-1", isRTL && "flex-row-reverse justify-start")}>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOffer(offer)}><Eye className="w-4 h-4" /></Button>
                          {canEdit(offer.status) && <Button variant="ghost" size="icon" onClick={() => navigate(`/vendor/offers/new?edit=${offer.id}`)}><Edit className="w-4 h-4" /></Button>}
                          {offer.status !== 'active' && <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
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

      <Sheet open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedOffer?.title}</SheetTitle>
            <SheetDescription>{selectedOffer?.merchant}</SheetDescription>
          </SheetHeader>
          {selectedOffer && (
            <div className="mt-6 space-y-6">
              {selectedOffer.image_url && <img src={selectedOffer.image_url} alt={selectedOffer.title} className="w-full h-48 object-cover rounded-lg" />}
              <div className="grid gap-4">
                <div className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t('Status', 'الحالة')}</span>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedOffer.status]?.className}>
                    {language === 'ar' ? STATUS_CONFIG[selectedOffer.status]?.labelAr : STATUS_CONFIG[selectedOffer.status]?.label}
                  </Badge>
                </div>
                <div className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t('Category', 'الفئة')}</span>
                  <span className="font-medium">{CATEGORY_LABELS[selectedOffer.category]?.[language === 'ar' ? 'ar' : 'en'] || selectedOffer.category}</span>
                </div>
                <div className={cn("flex justify-between", isRTL && "flex-row-reverse")}>
                  <span className="text-muted-foreground">{t('Discount', 'الخصم')}</span>
                  <span className="font-medium">{selectedOffer.discount_percent}%</span>
                </div>
              </div>
              {selectedOffer.description && <div><h4 className="font-medium mb-2">{t('Description', 'الوصف')}</h4><p className="text-sm text-muted-foreground">{selectedOffer.description}</p></div>}
              {selectedOffer.terms && <div><h4 className="font-medium mb-2">{t('Terms & Conditions', 'الشروط والأحكام')}</h4><p className="text-sm text-muted-foreground">{selectedOffer.terms}</p></div>}
              {selectedOffer.status === 'pending' && (
                <Card className="border-warning/30 bg-warning/5"><CardContent className="pt-4">
                  <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse text-right")}>
                    <Clock className="w-5 h-5 text-warning mt-0.5" />
                    <div><p className="text-sm font-medium">{t('Pending Review', 'قيد المراجعة')}</p><p className="text-xs text-muted-foreground mt-1">{t('Your offer is being reviewed by the admin team.', 'يتم مراجعة عرضك من قبل فريق الإدارة.')}</p></div>
                  </div>
                </CardContent></Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
