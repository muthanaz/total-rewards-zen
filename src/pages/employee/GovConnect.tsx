import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { StatusStrip } from '@/components/ui/status-strip';
import { 
  Building2, 
  ExternalLink, 
  Fingerprint, 
  Briefcase, 
  MapPin, 
  Heart, 
  Phone,
  Search,
  Star,
  Clock,
  Globe,
  BookmarkPlus,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const GOV_CONNECT_CATEGORIES = [
  {
    id: 'identity',
    name: { en: 'Identity & Immigration', ar: 'الهوية والهجرة' },
    description: { en: 'Manage your identity documents and residency', ar: 'إدارة وثائق الهوية والإقامة' },
    icon: Fingerprint,
    priority: 1,
    links: [
      { name: 'UAE Pass', url: 'https://uaepass.ae', description: { en: 'Digital identity platform', ar: 'منصة الهوية الرقمية' }, popular: true },
      { name: 'ICP Portal', url: 'https://icp.gov.ae', description: { en: 'Immigration services', ar: 'خدمات الهجرة' }, popular: true },
      { name: 'GDRFA Dubai', url: 'https://gdrfad.gov.ae', description: { en: 'Dubai Residency', ar: 'إقامة دبي' }, popular: false },
    ],
  },
  {
    id: 'employment',
    name: { en: 'Employment & HR', ar: 'التوظيف والموارد البشرية' },
    description: { en: 'Labour and employment services', ar: 'خدمات العمل والتوظيف' },
    icon: Briefcase,
    priority: 2,
    links: [
      { name: 'MOHRE', url: 'https://mohre.gov.ae', description: { en: 'Ministry of Human Resources', ar: 'وزارة الموارد البشرية' }, popular: true },
      { name: 'FAHR', url: 'https://fahr.gov.ae', description: { en: 'Federal Authority for HR', ar: 'الهيئة الاتحادية للموارد البشرية' }, popular: false },
      { name: 'WPS Salary', url: 'https://www.mohre.gov.ae/en/services/wage-protection-system.aspx', description: { en: 'Wage Protection System', ar: 'نظام حماية الأجور' }, popular: false },
    ],
  },
  {
    id: 'local',
    name: { en: 'Local Services', ar: 'الخدمات المحلية' },
    description: { en: 'City and utility services', ar: 'خدمات المدينة والمرافق' },
    icon: MapPin,
    priority: 3,
    links: [
      { name: 'TAMM Abu Dhabi', url: 'https://tamm.abudhabi', description: { en: 'Abu Dhabi Government', ar: 'حكومة أبوظبي' }, popular: true },
      { name: 'Dubai Police', url: 'https://www.dubaipolice.gov.ae', description: { en: 'Security services', ar: 'خدمات الأمن' }, popular: true },
      { name: 'DEWA', url: 'https://www.dewa.gov.ae', description: { en: 'Electricity & Water', ar: 'الكهرباء والماء' }, popular: false },
      { name: 'RTA Dubai', url: 'https://www.rta.ae', description: { en: 'Roads & Transport', ar: 'الطرق والمواصلات' }, popular: true },
    ],
  },
  {
    id: 'health',
    name: { en: 'Health Authorities', ar: 'الجهات الصحية' },
    description: { en: 'Healthcare and medical services', ar: 'الخدمات الصحية والطبية' },
    icon: Heart,
    priority: 4,
    links: [
      { name: 'DHA', url: 'https://www.dha.gov.ae', description: { en: 'Dubai Health Authority', ar: 'هيئة الصحة بدبي' }, popular: true },
      { name: 'DOH', url: 'https://www.doh.gov.ae', description: { en: 'Abu Dhabi Health', ar: 'صحة أبوظبي' }, popular: false },
      { name: 'SEHA', url: 'https://www.seha.ae', description: { en: 'Abu Dhabi Healthcare', ar: 'الرعاية الصحية أبوظبي' }, popular: false },
    ],
  },
  {
    id: 'telecom',
    name: { en: 'Telecom & Utilities', ar: 'الاتصالات والمرافق' },
    description: { en: 'Mobile, internet, and utility providers', ar: 'مزودي الهاتف والإنترنت والمرافق' },
    icon: Phone,
    priority: 5,
    links: [
      { name: 'Etisalat (e&)', url: 'https://www.etisalat.ae', description: { en: 'Telecom provider', ar: 'مزود الاتصالات' }, popular: true },
      { name: 'du', url: 'https://www.du.ae', description: { en: 'Telecom provider', ar: 'مزود الاتصالات' }, popular: true },
      { name: 'Salik', url: 'https://www.salik.ae', description: { en: 'Toll payments', ar: 'مدفوعات الطرق' }, popular: false },
    ],
  },
];

// Quick links for common actions
const quickLinks = [
  { name: { en: 'Check Visa Status', ar: 'التحقق من حالة التأشيرة' }, url: 'https://icp.gov.ae', category: 'identity' },
  { name: { en: 'Pay Traffic Fines', ar: 'دفع المخالفات المرورية' }, url: 'https://www.rta.ae', category: 'local' },
  { name: { en: 'Renew Emirates ID', ar: 'تجديد الهوية الإماراتية' }, url: 'https://icp.gov.ae', category: 'identity' },
  { name: { en: 'Pay DEWA Bill', ar: 'دفع فاتورة ديوا' }, url: 'https://www.dewa.gov.ae', category: 'local' },
  { name: { en: 'Labour Contract', ar: 'عقد العمل' }, url: 'https://mohre.gov.ae', category: 'employment' },
];

export default function GovConnectPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const isArabic = language === 'ar';
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [savedLinks, setSavedLinks] = useState<string[]>([]);
  const [recentLinks, setRecentLinks] = useState<string[]>(['UAE Pass', 'MOHRE', 'RTA Dubai']);
  
  const handleLinkClick = (linkName: string) => {
    if (!recentLinks.includes(linkName)) {
      setRecentLinks(prev => [linkName, ...prev.slice(0, 4)]);
    }
  };
  
  const handleSaveLink = (linkName: string) => {
    if (savedLinks.includes(linkName)) {
      setSavedLinks(prev => prev.filter(l => l !== linkName));
      toast({ 
        title: isArabic ? 'تمت الإزالة' : 'Removed', 
        description: isArabic ? 'تم إزالة الرابط من المحفوظات' : 'Link removed from favorites' 
      });
    } else {
      setSavedLinks(prev => [...prev, linkName]);
      toast({ 
        title: isArabic ? 'تم الحفظ' : 'Saved', 
        description: isArabic ? 'تم حفظ الرابط للوصول السريع' : 'Link saved for quick access' 
      });
    }
  };
  
  const filteredCategories = GOV_CONNECT_CATEGORIES.map(cat => ({
    ...cat,
    links: cat.links.filter(link => 
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.en.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.links.length > 0 || searchQuery === '');

  const popularLinks = GOV_CONNECT_CATEGORIES.flatMap(cat => 
    cat.links.filter(l => l.popular).map(l => ({ ...l, category: cat.id }))
  );

  return (
    <div className={cn("space-y-6 animate-fade-in", isRTL && "text-right")}>
      <PageHeader
        title={isArabic ? 'الخدمات الحكومية' : 'Gov Connect'}
        subtitle={isArabic 
          ? 'الوصول السريع إلى البوابات الحكومية الإماراتية وخدمات المرافق'
          : 'Quick access to UAE government and service portals'
        }
        icon={Building2}
      />

      <StatusStrip
        confidence="high"
        lastUpdated={new Date()}
        dataSource={isArabic ? 'روابط حكومية رسمية' : 'Official government links'}
      />
      <div className="relative max-w-md">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
          isRTL ? "right-3" : "left-3"
        )} />
        <Input
          placeholder={isArabic ? 'ابحث عن الخدمات...' : 'Search services...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(isRTL ? "pr-10" : "pl-10")}
        />
      </div>
      
      {/* Quick Actions */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className={cn("text-base font-display flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Clock className="w-4 h-4 text-primary" />
            {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Button 
                key={link.name.en} 
                size="sm" 
                variant="outline"
                className="text-xs"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {isArabic ? link.name.ar : link.name.en}
                  <ExternalLink className={cn("w-3 h-3", isRTL ? "mr-1" : "ml-1")} />
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{isArabic ? 'الكل' : 'All Services'}</TabsTrigger>
          <TabsTrigger value="popular">
            <Star className="w-3.5 h-3.5 mr-1" />
            {isArabic ? 'الأكثر استخداماً' : 'Popular'}
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {isArabic ? 'الأخيرة' : 'Recent'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="benefit-card border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className={cn("text-base font-display flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      {isArabic ? category.name.ar : category.name.en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? category.description.ar : category.description.en}
                    </p>
                    <div className="space-y-2">
                      {category.links.map((link) => (
                        <div 
                          key={link.name} 
                          className={cn(
                            "flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(link.name)}
                            className={cn(
                              "flex-1 flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors",
                              isRTL && "flex-row-reverse"
                            )}
                          >
                            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{link.name}</span>
                            {link.popular && (
                              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                                <Star className="w-2.5 h-2.5 mr-0.5" />
                                {isArabic ? 'شائع' : 'Popular'}
                              </Badge>
                            )}
                          </a>
                          <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleSaveLink(link.name)}
                            >
                              <BookmarkPlus className={cn(
                                "w-3.5 h-3.5",
                                savedLinks.includes(link.name) ? "text-primary fill-primary" : "text-muted-foreground"
                              )} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="popular" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularLinks.map((link) => (
              <Card key={link.name} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                      <div className={isRTL ? "text-right" : ""}>
                        <p className="font-medium text-sm">{link.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isArabic ? link.description.ar : link.description.en}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => handleLinkClick(link.name)}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          {recentLinks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentLinks.map((linkName, index) => {
                const link = GOV_CONNECT_CATEGORIES.flatMap(c => c.links).find(l => l.name === linkName);
                if (!link) return null;
                return (
                  <Card key={linkName} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                          <div className="p-2 rounded-lg bg-muted">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className={isRTL ? "text-right" : ""}>
                            <p className="font-medium text-sm">{link.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isArabic ? link.description.ar : link.description.en}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => handleLinkClick(link.name)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'لا توجد روابط حديثة بعد' : 'No recent links yet'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Helpful Tips */}
      <Card className="border-border/50 bg-gradient-to-r from-blue-500/5 to-transparent">
        <CardContent className="p-4">
          <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <p className="font-medium text-sm">
                {isArabic ? 'نصيحة: استخدم UAE Pass' : 'Tip: Use UAE Pass'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isArabic 
                  ? 'يمكنك تسجيل الدخول إلى معظم الخدمات الحكومية باستخدام UAE Pass لتجربة سلسة.'
                  : 'You can log in to most government services using UAE Pass for a seamless experience.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
