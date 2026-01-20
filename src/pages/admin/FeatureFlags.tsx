import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  ToggleLeft, Search, Plus, Building2, Globe, Users, 
  ShoppingBag, BarChart3, FileText, Zap, Shield, Save
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const FEATURE_FLAGS = [
  { id: 'marketplace', name: 'Marketplace', description: 'Employee perks and offers marketplace', icon: ShoppingBag, enabled_globally: true, orgs_override: [] },
  { id: 'gov_connect', name: 'GovConnect', description: 'Government services integration', icon: FileText, enabled_globally: false, orgs_override: ['org_1', 'org_2'] },
  { id: 'advanced_analytics', name: 'Advanced Analytics', description: 'AI-powered insights and predictions', icon: BarChart3, enabled_globally: true, orgs_override: [] },
  { id: 'benefits_ai', name: 'Benefits AI', description: 'AI recommendations for benefit optimization', icon: Zap, enabled_globally: false, orgs_override: ['org_1'] },
  { id: 'sso_integration', name: 'SSO Integration', description: 'Enterprise single sign-on support', icon: Shield, enabled_globally: true, orgs_override: [] },
  { id: 'mobile_app', name: 'Mobile App Access', description: 'Native mobile application access', icon: Users, enabled_globally: false, orgs_override: [] },
];

export default function AdminFeatureFlags() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('all');

  // Fetch organizations for the filter
  const { data: organizations } = useQuery({
    queryKey: ['admin-orgs-for-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredFlags = flags.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleGlobal = (flagId: string) => {
    setFlags(prev => prev.map(f => 
      f.id === flagId ? { ...f, enabled_globally: !f.enabled_globally } : f
    ));
    toast.success(t('Feature flag updated', 'تم تحديث علامة الميزة'));
  };

  const handleSaveAll = () => {
    toast.success(t('All feature flags saved', 'تم حفظ جميع علامات الميزات'));
  };

  const metrics = [
    { title: t('Total Features', 'إجمالي الميزات'), value: flags.length, icon: ToggleLeft },
    { title: t('Enabled Globally', 'مفعل عالمياً'), value: flags.filter(f => f.enabled_globally).length, icon: Globe },
    { title: t('Org-Specific', 'خاص بالمنظمة'), value: flags.filter(f => f.orgs_override.length > 0).length, icon: Building2 },
  ];

  return (
    <PageLayout
      title={t('Feature Flags', 'علامات الميزات')}
      description={t('Control feature availability across the platform and per organization', 'التحكم في توفر الميزات عبر المنصة ولكل منظمة')}
      icon={ToggleLeft}
      iconClassName="from-violet-500 to-purple-500"
      actions={
        <Button onClick={handleSaveAll}>
          <Save className="w-4 h-4 me-2" />
          {t('Save All', 'حفظ الكل')}
        </Button>
      }
    >
      <MetricGrid columns={3}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <ToggleLeft className="w-5 h-5" />
                {t('Feature Configuration', 'تكوين الميزات')}
              </CardTitle>
              <CardDescription>{t('Toggle features globally or per organization', 'تبديل الميزات عالمياً أو لكل منظمة')}</CardDescription>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search features...', 'البحث عن الميزات...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
                />
              </div>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('Filter by org', 'تصفية حسب المنظمة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Organizations', 'جميع المنظمات')}</SelectItem>
                  {organizations?.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFlags.map((flag) => (
              <div 
                key={flag.id} 
                className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <flag.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <h4 className="font-medium">{flag.name}</h4>
                        {flag.enabled_globally && (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                            <Globe className="w-3 h-3 me-1" />
                            {t('Global', 'عالمي')}
                          </Badge>
                        )}
                        {flag.orgs_override.length > 0 && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                            <Building2 className="w-3 h-3 me-1" />
                            {flag.orgs_override.length} {t('orgs', 'منظمات')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">{t('Global', 'عالمي')}</p>
                      <Switch 
                        checked={flag.enabled_globally} 
                        onCheckedChange={() => handleToggleGlobal(flag.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Per-Organization Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Building2 className="w-5 h-5" />
            {t('Organization Overrides', 'تجاوزات المنظمة')}
          </CardTitle>
          <CardDescription>
            {t('Enable features for specific organizations that differ from global settings', 'تمكين الميزات لمنظمات محددة تختلف عن الإعدادات العالمية')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                {flags.slice(0, 4).map(f => (
                  <TableHead key={f.id} className="text-center">{f.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations?.slice(0, 5).map(org => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  {flags.slice(0, 4).map(f => (
                    <TableCell key={f.id} className="text-center">
                      <Switch 
                        checked={f.enabled_globally || f.orgs_override.includes(org.id)}
                        disabled={f.enabled_globally}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
