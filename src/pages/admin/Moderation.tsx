import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  ClipboardList, CheckCircle, XCircle, Clock, AlertTriangle, 
  Store, Tag, Image, FileText, MessageSquare, Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const MODERATION_ITEMS = [
  { id: '1', type: 'vendor', entity: 'FitLife Gym', reason: 'New vendor application', submitted_at: new Date(Date.now() - 1000 * 60 * 30), priority: 'high', details: 'Complete KYB documents submitted' },
  { id: '2', type: 'offer', entity: '50% Off Spa Treatment', reason: 'New offer submission', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 2), priority: 'medium', details: 'Offer from HealthPlus Medical' },
  { id: '3', type: 'image', entity: 'Product Banner', reason: 'Image quality review', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 4), priority: 'low', details: 'Updated promotional banner for TechGadgets' },
  { id: '4', type: 'vendor', entity: 'TravelWise Agency', reason: 'Document verification', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 6), priority: 'high', details: 'Trade license pending verification' },
  { id: '5', type: 'copy', entity: 'Terms Update', reason: 'Legal copy review', submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 8), priority: 'medium', details: 'Updated T&C for EduFirst Academy offers' },
];

const TYPE_CONFIG = {
  vendor: { icon: Store, label: 'Vendor', labelAr: 'بائع', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  offer: { icon: Tag, label: 'Offer', labelAr: 'عرض', color: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  image: { icon: Image, label: 'Image', labelAr: 'صورة', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  copy: { icon: FileText, label: 'Copy', labelAr: 'نص', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', labelAr: 'عالي', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground border-border' },
};

export default function AdminModeration() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [items, setItems] = useState(MODERATION_ITEMS);
  const [selectedItem, setSelectedItem] = useState<typeof MODERATION_ITEMS[0] | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = activeTab === 'all' ? items : items.filter(i => i.type === activeTab);

  const metrics = [
    { title: t('Pending Items', 'العناصر المعلقة'), value: items.length, icon: ClipboardList },
    { title: t('High Priority', 'أولوية عالية'), value: items.filter(i => i.priority === 'high').length, icon: AlertTriangle },
    { title: t('Vendors', 'البائعون'), value: items.filter(i => i.type === 'vendor').length, icon: Store },
    { title: t('Offers', 'العروض'), value: items.filter(i => i.type === 'offer').length, icon: Tag },
  ];

  const handleApprove = (item: typeof MODERATION_ITEMS[0]) => {
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast.success(t(`Approved: ${item.entity}`, `تمت الموافقة: ${item.entity}`));
    setSelectedItem(null);
  };

  const handleReject = (item: typeof MODERATION_ITEMS[0]) => {
    if (!rejectionReason.trim()) {
      toast.error(t('Please provide a rejection reason', 'يرجى تقديم سبب الرفض'));
      return;
    }
    setItems(prev => prev.filter(i => i.id !== item.id));
    toast.error(t(`Rejected: ${item.entity}`, `تم الرفض: ${item.entity}`));
    setSelectedItem(null);
    setRejectionReason('');
  };

  const handleRequestChanges = (item: typeof MODERATION_ITEMS[0]) => {
    if (!rejectionReason.trim()) {
      toast.error(t('Please specify the required changes', 'يرجى تحديد التغييرات المطلوبة'));
      return;
    }
    toast.info(t(`Changes requested for: ${item.entity}`, `تم طلب تغييرات لـ: ${item.entity}`));
    setSelectedItem(null);
    setRejectionReason('');
  };

  return (
    <PageLayout
      title={t('Moderation Queue', 'قائمة المراجعة')}
      description={t('Review and approve vendors, offers, images, and copy changes', 'مراجعة والموافقة على البائعين والعروض والصور وتغييرات النصوص')}
      icon={ClipboardList}
      iconClassName="from-rose-500 to-pink-500"
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <ClipboardList className="w-5 h-5" />
                {t('Pending Reviews', 'المراجعات المعلقة')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start mb-4">
                  <TabsTrigger value="all">{t('All', 'الكل')} ({items.length})</TabsTrigger>
                  <TabsTrigger value="vendor">{t('Vendors', 'البائعون')} ({items.filter(i => i.type === 'vendor').length})</TabsTrigger>
                  <TabsTrigger value="offer">{t('Offers', 'العروض')} ({items.filter(i => i.type === 'offer').length})</TabsTrigger>
                  <TabsTrigger value="image">{t('Images', 'الصور')} ({items.filter(i => i.type === 'image').length})</TabsTrigger>
                  <TabsTrigger value="copy">{t('Copy', 'النصوص')} ({items.filter(i => i.type === 'copy').length})</TabsTrigger>
                </TabsList>

                <div className="space-y-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                      <p className="font-medium">{t('All caught up!', 'تم الانتهاء من كل شيء!')}</p>
                      <p className="text-sm">{t('No items pending review', 'لا توجد عناصر بانتظار المراجعة')}</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const typeConfig = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG];
                      const priorityConfig = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG];
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all",
                            isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                              <div className={cn("p-2 rounded-lg", typeConfig.color)}>
                                <typeConfig.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">{item.entity}</h4>
                                <p className="text-sm text-muted-foreground">{item.reason}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(item.submitted_at, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <Badge variant="outline" className={priorityConfig.color}>
                                {isRTL ? priorityConfig.labelAr : priorityConfig.label}
                              </Badge>
                              <Badge variant="outline" className={typeConfig.color}>
                                {isRTL ? typeConfig.labelAr : typeConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
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
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">{selectedItem.entity}</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.details}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('Notes / Rejection Reason', 'ملاحظات / سبب الرفض')}
                    </label>
                    <Textarea
                      placeholder={t('Enter notes or reason for rejection...', 'أدخل ملاحظات أو سبب الرفض...')}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => handleApprove(selectedItem)}>
                      <CheckCircle className="w-4 h-4 me-2" />
                      {t('Approve', 'موافقة')}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleRequestChanges(selectedItem)}>
                      <MessageSquare className="w-4 h-4 me-2" />
                      {t('Request Changes', 'طلب تغييرات')}
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={() => handleReject(selectedItem)}>
                      <XCircle className="w-4 h-4 me-2" />
                      {t('Reject', 'رفض')}
                    </Button>
                  </div>
                </div>
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
