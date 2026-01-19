import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tag, 
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  Users,
  DollarSign,
  Calendar,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { OfferQualityScore } from '@/components/vendor/OfferQualityScore';

interface Offer {
  id: number;
  title: string;
  titleAr: string;
  category: string;
  discount: string;
  views: number;
  redemptions: number;
  earnings: number;
  status: 'active' | 'paused' | 'expired';
  expiresAt: string;
  createdAt: string;
}

const offers: Offer[] = [
  { 
    id: 1, 
    title: '20% Off Premium Gym Membership', 
    titleAr: '٢٠٪ خصم على عضوية النادي المميزة',
    category: 'Fitness',
    discount: '20%',
    views: 1250, 
    redemptions: 245, 
    earnings: 8500,
    status: 'active',
    expiresAt: '2026-03-31',
    createdAt: '2025-10-15',
  },
  { 
    id: 2, 
    title: 'Free Trial - Wellness App', 
    titleAr: 'تجربة مجانية - تطبيق العافية',
    category: 'Wellness',
    discount: 'Free Trial',
    views: 890, 
    redemptions: 167, 
    earnings: 4200,
    status: 'active',
    expiresAt: '2026-02-28',
    createdAt: '2025-11-01',
  },
  { 
    id: 3, 
    title: '15% Off Health Checkup', 
    titleAr: '١٥٪ خصم على الفحص الصحي',
    category: 'Health',
    discount: '15%',
    views: 720, 
    redemptions: 134, 
    earnings: 5800,
    status: 'active',
    expiresAt: '2026-04-15',
    createdAt: '2025-09-20',
  },
  { 
    id: 4, 
    title: 'Buy 1 Get 1 - Spa Treatment', 
    titleAr: 'اشترِ واحداً واحصل على الثاني - علاج سبا',
    category: 'Wellness',
    discount: 'BOGO',
    views: 1102, 
    redemptions: 201, 
    earnings: 6000,
    status: 'paused',
    expiresAt: '2026-02-15',
    createdAt: '2025-08-10',
  },
  { 
    id: 5, 
    title: '30% Off Annual Dental Plan', 
    titleAr: '٣٠٪ خصم على خطة طب الأسنان السنوية',
    category: 'Health',
    discount: '30%',
    views: 560, 
    redemptions: 89, 
    earnings: 3200,
    status: 'expired',
    expiresAt: '2025-12-31',
    createdAt: '2025-06-01',
  },
];

const categoryColors: Record<string, string> = {
  'Fitness': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Wellness': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Health': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const statusConfig = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-green-500/10 text-green-600' },
  paused: { label: 'Paused', labelAr: 'متوقف', color: 'bg-amber-500/10 text-amber-600' },
  expired: { label: 'Expired', labelAr: 'منتهي', color: 'bg-gray-500/10 text-gray-600' },
};

export default function VendorOffers() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || offer.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(offers.map(o => o.category))];

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('My Offers', 'عروضي')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Manage and track all your marketplace offers', 'إدارة وتتبع جميع عروضك في السوق')}
          </p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('Create New Offer', 'إنشاء عرض جديد')}
        </Button>
      </div>

      {/* Tabs for Offers List and Quality Score */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">{t('All Offers', 'جميع العروض')}</TabsTrigger>
          <TabsTrigger value="quality" className="gap-1.5">
            <Star className="w-3.5 h-3.5" />
            {t('Quality Score', 'نقاط الجودة')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input 
                placeholder={t('Search offers...', 'البحث عن عروض...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('Status', 'الحالة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Statuses', 'جميع الحالات')}</SelectItem>
                <SelectItem value="active">{t('Active', 'نشط')}</SelectItem>
                <SelectItem value="paused">{t('Paused', 'متوقف')}</SelectItem>
                <SelectItem value="expired">{t('Expired', 'منتهي')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('Category', 'الفئة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOffers.map((offer) => (
          <Card key={offer.id} className="group hover:shadow-lg transition-all duration-300 hover:border-accent/30">
            <CardContent className="p-6">
              <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                <div className="flex-1">
                  <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                    <Badge variant="outline" className={categoryColors[offer.category]}>
                      {offer.category}
                    </Badge>
                    <Badge className={statusConfig[offer.status].color}>
                      {language === 'ar' ? statusConfig[offer.status].labelAr : statusConfig[offer.status].label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">
                    {language === 'ar' ? offer.titleAr : offer.title}
                  </h3>
                  <div className={cn("flex items-center gap-1 mt-1 text-sm text-muted-foreground", isRTL && "flex-row-reverse")}>
                    <Calendar className="w-3 h-3" />
                    <span>{t('Expires:', 'ينتهي:')} {offer.expiresAt}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-accent/10">
                  <Tag className="w-6 h-6 text-accent" />
                </div>
              </div>

              {/* Stats */}
              <div className={cn("grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border", isRTL && "text-right")}>
                <div>
                  <div className={cn("flex items-center gap-1.5 text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('Views', 'مشاهدات')}</span>
                  </div>
                  <p className="font-bold mt-1">{offer.views.toLocaleString()}</p>
                </div>
                <div>
                  <div className={cn("flex items-center gap-1.5 text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('Redeemed', 'مُسترد')}</span>
                  </div>
                  <p className="font-bold mt-1">{offer.redemptions.toLocaleString()}</p>
                </div>
                <div>
                  <div className={cn("flex items-center gap-1.5 text-muted-foreground", isRTL && "flex-row-reverse justify-end")}>
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-xs">{t('Earnings', 'الأرباح')}</span>
                  </div>
                  <p className="font-bold mt-1 text-accent">AED {offer.earnings.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className={cn("flex items-center gap-2 mt-4 pt-4 border-t border-border", isRTL && "flex-row-reverse")}>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                  <Edit className="w-3.5 h-3.5" />
                  {t('Edit', 'تعديل')}
                </Button>
                {offer.status !== 'expired' && (
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                    {offer.status === 'active' ? (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5" />
                        {t('Pause', 'إيقاف')}
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-3.5 h-3.5" />
                        {t('Activate', 'تفعيل')}
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <Card className="py-16">
          <div className="text-center">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">{t('No offers found', 'لم يتم العثور على عروض')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('Try adjusting your filters or create a new offer', 'حاول تعديل الفلاتر أو أنشئ عرضاً جديداً')}
            </p>
          </div>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <OfferQualityScore 
            offerTitle={t('20% Off Premium Gym Membership', '٢٠٪ خصم على عضوية النادي المميزة')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
