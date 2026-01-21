import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  ClipboardList, CheckCircle, XCircle, Clock, AlertTriangle, 
  Store, Tag, Image, FileText, MessageSquare, Eye, UserPlus
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { differenceInHours } from 'date-fns';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import {
  ModerationFilters,
  ModerationFiltersState,
  ModerationBulkActions,
  ModerationQueueItem,
  ModerationItem,
  getSLAStatusForItem,
  VendorReviewPanel,
  OfferReviewPanel,
  ImageReviewPanel,
  CopyReviewPanel,
  DecisionTemplates,
} from '@/components/admin/moderation';

// Demo moderation items with richer data
const MODERATION_ITEMS: ModerationItem[] = [
  { id: '1', type: 'vendor', entity: 'FitLife Gym', reason: 'New vendor application', submitted_at: new Date(Date.now() - 1000 * 60 * 30), priority: 'high', details: 'Complete KYB documents submitted', vendor_name: 'FitLife Gym', organization: 'N/A', status: 'pending' },
  { id: '2', type: 'offer', entity: '50% Off Spa Treatment', reason: 'New offer submission', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2), priority: 'medium', details: 'Offer from HealthPlus Medical', vendor_name: 'HealthPlus Medical', organization: 'TechCorp', status: 'pending' },
  { id: '3', type: 'image', entity: 'Product Banner', reason: 'Image quality review', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 4), priority: 'low', details: 'Updated promotional banner for TechGadgets', vendor_name: 'TechGadgets', status: 'pending' },
  { id: '4', type: 'vendor', entity: 'TravelWise Agency', reason: 'Document verification', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 50), priority: 'high', details: 'Trade license pending verification', vendor_name: 'TravelWise Agency', status: 'pending' },
  { id: '5', type: 'copy', entity: 'Terms Update', reason: 'Legal copy review', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 8), priority: 'medium', details: 'Updated T&C for EduFirst Academy offers', vendor_name: 'EduFirst Academy', status: 'pending' },
  { id: '6', type: 'offer', entity: '30% Learning Discount', reason: 'Discount validation', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 72), priority: 'high', details: 'Annual learning platform subscription', vendor_name: 'LearnHub', status: 'changes_requested' },
  { id: '7', type: 'image', entity: 'Vendor Logo', reason: 'Logo replacement', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 6), priority: 'low', details: 'Updated branding for WellnessFirst', vendor_name: 'WellnessFirst', status: 'pending' },
];

const DEFAULT_FILTERS: ModerationFiltersState = {
  itemType: [],
  priority: [],
  status: [],
  age: 'all',
  vendor: '',
  organization: '',
  sortBy: 'oldest',
  myQueue: false,
};

export default function AdminModeration() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [items, setItems] = useState<ModerationItem[]>(MODERATION_ITEMS);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<ModerationFiltersState>(DEFAULT_FILTERS);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.itemType.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.status.length > 0) count++;
    if (filters.age !== 'all') count++;
    if (filters.myQueue) count++;
    return count;
  }, [filters]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(i => i.type === activeTab);
    }
    
    // Type filter
    if (filters.itemType.length > 0) {
      result = result.filter(i => filters.itemType.includes(i.type));
    }
    
    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter(i => filters.priority.includes(i.priority));
    }
    
    // Status filter
    if (filters.status.length > 0) {
      result = result.filter(i => filters.status.includes(i.status));
    }
    
    // Age filter
    if (filters.age !== 'all') {
      const thresholds = { '24h': 24, '48h': 48, '7d': 168 };
      const threshold = thresholds[filters.age as keyof typeof thresholds];
      if (threshold) {
        result = result.filter(i => differenceInHours(new Date(), i.submitted_at) >= threshold);
      }
    }
    
    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'oldest') {
        return a.submitted_at.getTime() - b.submitted_at.getTime();
      } else if (filters.sortBy === 'newest') {
        return b.submitted_at.getTime() - a.submitted_at.getTime();
      } else if (filters.sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
    
    // Pin SLA breach + high priority items at top
    result.sort((a, b) => {
      const aStatus = getSLAStatusForItem(a);
      const bStatus = getSLAStatusForItem(b);
      const aScore = (aStatus.status === 'breach' ? 0 : aStatus.status === 'warning' ? 1 : 2) + (a.priority === 'high' ? 0 : 3);
      const bScore = (bStatus.status === 'breach' ? 0 : bStatus.status === 'warning' ? 1 : 2) + (b.priority === 'high' ? 0 : 3);
      return aScore - bScore;
    });
    
    return result;
  }, [items, activeTab, filters]);

  // SLA summary
  const slaSummary = useMemo(() => {
    const breach = items.filter(i => getSLAStatusForItem(i).status === 'breach').length;
    const warning = items.filter(i => getSLAStatusForItem(i).status === 'warning').length;
    return { breach, warning };
  }, [items]);

  // Metrics
  const metrics = [
    { title: t('Pending Items', 'العناصر المعلقة'), value: items.length, icon: ClipboardList },
    { title: t('SLA Breach', 'خرق SLA'), value: slaSummary.breach, icon: AlertTriangle, variant: slaSummary.breach > 0 ? 'destructive' as const : undefined },
    { title: t('High Priority', 'أولوية عالية'), value: items.filter(i => i.priority === 'high').length, icon: Clock },
    { title: t('Vendors', 'البائعون'), value: items.filter(i => i.type === 'vendor').length, icon: Store },
  ];

  // Moderation mutation
  const moderationMutation = useMutation({
    mutationFn: async ({ item, action, reason }: { item: ModerationItem; action: 'approve' | 'reject' | 'request_changes'; reason?: string }) => {
      if (item.type === 'vendor') {
        const newStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'pending';
        const { error } = await supabase
          .from('vendors')
          .update({ status: newStatus, is_active: action === 'approve' })
          .eq('id', item.id);
        if (error && error.code !== 'PGRST116') throw error;
      }
      
      if (item.type === 'offer') {
        const newStatus = action === 'approve' ? 'active' : action === 'reject' ? 'rejected' : 'pending';
        const { error } = await supabase
          .from('marketplace_offers')
          .update({ status: newStatus, is_active: action === 'approve' })
          .eq('id', item.id);
        if (error && error.code !== 'PGRST116') throw error;
      }

      return { item, action, reason };
    },
    onSuccess: async ({ item, action, reason }) => {
      await createAuditLog({
        action: action === 'approve' 
          ? (item.type === 'vendor' ? 'VENDOR_APPROVE' : 'OFFER_APPROVE')
          : action === 'reject'
            ? (item.type === 'vendor' ? 'VENDOR_REJECT' : 'OFFER_REJECT')
            : 'SETTINGS_UPDATE',
        entityType: item.type as any,
        entityId: item.id,
        metadata: { 
          entity_name: item.entity,
          item_type: item.type,
          action_taken: action,
          reason: reason || null,
          timestamp: new Date().toISOString(),
        },
      });

      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace_offers'] });
    },
  });

  const handleApprove = async (item: ModerationItem) => {
    try {
      await moderationMutation.mutateAsync({ item, action: 'approve' });
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast.success(t(`Approved: ${item.entity}`, `تمت الموافقة: ${item.entity}`));
      setSelectedItem(null);
      setSelectedIds(prev => { prev.delete(item.id); return new Set(prev); });
    } catch (error) {
      toast.error(t('Failed to approve', 'فشل في الموافقة'));
    }
  };

  const handleReject = async (item: ModerationItem, reason: string) => {
    if (!reason.trim()) {
      toast.error(t('Please provide a rejection reason', 'يرجى تقديم سبب الرفض'));
      return;
    }
    try {
      await moderationMutation.mutateAsync({ item, action: 'reject', reason });
      setItems(prev => prev.filter(i => i.id !== item.id));
      toast.error(t(`Rejected: ${item.entity}`, `تم الرفض: ${item.entity}`));
      setSelectedItem(null);
      setNotes('');
      setSelectedIds(prev => { prev.delete(item.id); return new Set(prev); });
    } catch (error) {
      toast.error(t('Failed to reject', 'فشل في الرفض'));
    }
  };

  const handleRequestChanges = async (item: ModerationItem, reason: string) => {
    if (!reason.trim()) {
      toast.error(t('Please specify the required changes', 'يرجى تحديد التغييرات المطلوبة'));
      return;
    }
    try {
      await moderationMutation.mutateAsync({ item, action: 'request_changes', reason });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'changes_requested' as const } : i));
      toast.info(t(`Changes requested for: ${item.entity}`, `تم طلب تغييرات لـ: ${item.entity}`));
      setSelectedItem(null);
      setNotes('');
    } catch (error) {
      toast.error(t('Failed to request changes', 'فشل في طلب التغييرات'));
    }
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    setIsProcessing(true);
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    for (const item of selectedItems) {
      await handleApprove(item);
    }
    setSelectedIds(new Set());
    setIsProcessing(false);
  };

  const handleBulkReject = async (reason: string) => {
    setIsProcessing(true);
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    for (const item of selectedItems) {
      await handleReject(item, reason);
    }
    setSelectedIds(new Set());
    setIsProcessing(false);
  };

  const handleBulkRequestChanges = async (reason: string) => {
    setIsProcessing(true);
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    for (const item of selectedItems) {
      await handleRequestChanges(item, reason);
    }
    setSelectedIds(new Set());
    setIsProcessing(false);
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const renderReviewPanel = () => {
    if (!selectedItem) return null;

    switch (selectedItem.type) {
      case 'vendor':
        return <VendorReviewPanel vendorName={selectedItem.entity} documents={[]} vendorDetails={{}} />;
      case 'offer':
        return (
          <OfferReviewPanel 
            offerName={selectedItem.entity} 
            offerDetails={{}}
            vendorContext={{ 
              name: selectedItem.vendor_name || 'Unknown Vendor', 
              status: 'active', 
              totalOffers: 12, 
              avgRating: 4.5 
            }}
          />
        );
      case 'image':
        return <ImageReviewPanel imageName={selectedItem.entity} metadata={{}} />;
      case 'copy':
        return <CopyReviewPanel copyName={selectedItem.entity} beforeText="" afterText="" />;
      default:
        return null;
    }
  };

  return (
    <PageLayout
      title={t('Moderation Queue', 'قائمة المراجعة')}
      description={t('Review and approve vendors, offers, images, and copy changes', 'مراجعة والموافقة على البائعين والعروض والصور وتغييرات النصوص')}
      icon={ClipboardList}
      iconClassName="from-rose-500 to-pink-500"
    >
      {/* Metrics */}
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      {/* SLA Alert Banner */}
      {slaSummary.breach > 0 && (
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30",
          isRTL && "flex-row-reverse"
        )}>
          <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
          <span className="text-sm font-medium">
            {slaSummary.breach} {t('items have breached SLA', 'عناصر تجاوزت SLA')}
            {slaSummary.warning > 0 && ` · ${slaSummary.warning} ${t('at risk', 'في خطر')}`}
          </span>
        </div>
      )}

      {/* Filters */}
      <ModerationFilters
        filters={filters}
        onFiltersChange={setFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Bulk Actions */}
      <ModerationBulkActions
        selectedCount={selectedIds.size}
        onApprove={handleBulkApprove}
        onRequestChanges={handleBulkRequestChanges}
        onReject={handleBulkReject}
        onClearSelection={() => setSelectedIds(new Set())}
        isProcessing={isProcessing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <ClipboardList className="w-5 h-5" />
                {t('Pending Reviews', 'المراجعات المعلقة')}
                <Badge variant="secondary" className="ms-auto">
                  {filteredItems.length} {t('items', 'عناصر')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start mb-4 flex-wrap">
                  <TabsTrigger value="all">{t('All', 'الكل')} ({items.length})</TabsTrigger>
                  <TabsTrigger value="vendor">{t('Vendors', 'البائعون')} ({items.filter(i => i.type === 'vendor').length})</TabsTrigger>
                  <TabsTrigger value="offer">{t('Offers', 'العروض')} ({items.filter(i => i.type === 'offer').length})</TabsTrigger>
                  <TabsTrigger value="image">{t('Images', 'الصور')} ({items.filter(i => i.type === 'image').length})</TabsTrigger>
                  <TabsTrigger value="copy">{t('Copy', 'النصوص')} ({items.filter(i => i.type === 'copy').length})</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[500px]">
                  <div className="space-y-3 pe-4">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                        <p className="font-medium">{t('All caught up!', 'تم الانتهاء من كل شيء!')}</p>
                        <p className="text-sm">{t('No items pending review', 'لا توجد عناصر بانتظار المراجعة')}</p>
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <ModerationQueueItem
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.has(item.id)}
                          isActive={selectedItem?.id === item.id}
                          onSelect={(checked) => toggleSelection(item.id, checked)}
                          onClick={() => setSelectedItem(item)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Eye className="w-5 h-5" />
                {t('Review Panel', 'لوحة المراجعة')}
              </CardTitle>
              <CardDescription>
                {selectedItem 
                  ? t('Review and take action', 'مراجعة واتخاذ إجراء')
                  : t('Select an item to review', 'اختر عنصراً للمراجعة')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4 pe-4">
                    {/* Evidence Panel */}
                    {renderReviewPanel()}

                    {/* Notes with Templates */}
                    <div>
                      <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                        <label className="text-sm font-medium">
                          {t('Notes / Reason', 'ملاحظات / السبب')}
                        </label>
                        <DecisionTemplates
                          type="changes"
                          itemType={selectedItem.type}
                          onSelect={(text) => setNotes(text)}
                        />
                      </div>
                      <Textarea
                        placeholder={t('Enter notes or reason...', 'أدخل ملاحظات أو سبب...')}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button 
                        className="w-full bg-success hover:bg-success/90" 
                        onClick={() => handleApprove(selectedItem)}
                      >
                        <CheckCircle className="w-4 h-4 me-2" />
                        {t('Approve', 'موافقة')}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => handleRequestChanges(selectedItem, notes)}
                      >
                        <MessageSquare className="w-4 h-4 me-2" />
                        {t('Request Changes', 'طلب تغييرات')}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => handleReject(selectedItem, notes)}
                      >
                        <XCircle className="w-4 h-4 me-2" />
                        {t('Reject', 'رفض')}
                      </Button>
                    </div>

                    {/* Assign Action */}
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                      <UserPlus className="w-4 h-4 me-2" />
                      {t('Assign to Me', 'تعيين لي')}
                    </Button>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{t('Click an item to review', 'انقر على عنصر للمراجعة')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
