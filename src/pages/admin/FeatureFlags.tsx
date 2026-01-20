import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ToggleLeft, Search, Building2, Globe, Save, RefreshCw,
  ShoppingBag, FileText, BarChart3, Zap, Shield, Users
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

// Feature flag definitions with DB key mapping
const FEATURE_FLAG_DEFINITIONS = [
  { id: 'marketplace_enabled', name: 'Marketplace', nameAr: 'السوق', description: 'Employee perks and offers marketplace', descriptionAr: 'سوق الامتيازات والعروض للموظفين', icon: ShoppingBag },
  { id: 'gov_connect_enabled', name: 'GovConnect', nameAr: 'الربط الحكومي', description: 'Government services integration', descriptionAr: 'تكامل الخدمات الحكومية', icon: FileText },
  { id: 'advanced_insights_enabled', name: 'Advanced Analytics', nameAr: 'التحليلات المتقدمة', description: 'AI-powered insights and predictions', descriptionAr: 'رؤى وتنبؤات مدعومة بالذكاء الاصطناعي', icon: BarChart3 },
  { id: 'benefits_ai_enabled', name: 'Benefits AI', nameAr: 'ذكاء المزايا', description: 'AI recommendations for benefit optimization', descriptionAr: 'توصيات الذكاء الاصطناعي لتحسين المزايا', icon: Zap },
  { id: 'sso_enabled', name: 'SSO Integration', nameAr: 'تسجيل الدخول الموحد', description: 'Enterprise single sign-on support', descriptionAr: 'دعم تسجيل الدخول الموحد للمؤسسات', icon: Shield },
  { id: 'mobile_app_enabled', name: 'Mobile App Access', nameAr: 'الوصول عبر التطبيق', description: 'Native mobile application access', descriptionAr: 'الوصول عبر التطبيق المحمول', icon: Users },
];

interface OrgSettings {
  marketplace_enabled?: boolean;
  gov_connect_enabled?: boolean;
  advanced_insights_enabled?: boolean;
  benefits_ai_enabled?: boolean;
  sso_enabled?: boolean;
  mobile_app_enabled?: boolean;
}

interface Organization {
  id: string;
  name: string;
  settings: OrgSettings | null;
}

export default function AdminFeatureFlags() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const queryClient = useQueryClient();
  const { createAuditLog } = useAdminAuditLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');

  // Fetch all organizations with their settings
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['admin-orgs-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, settings')
        .order('name');
      if (error) throw error;
      return (data || []) as Organization[];
    },
  });

  // Mutation to update organization settings (feature flags)
  const updateFlagMutation = useMutation({
    mutationFn: async ({ orgId, flagKey, value }: { orgId: string; flagKey: string; value: boolean }) => {
      // Get current settings
      const org = organizations?.find(o => o.id === orgId);
      const currentSettings = (org?.settings || {}) as OrgSettings;
      
      const newSettings = {
        ...currentSettings,
        [flagKey]: value,
      };

      const { error } = await supabase
        .from('organizations')
        .update({ settings: newSettings })
        .eq('id', orgId);

      if (error) throw error;
      return { orgId, flagKey, value };
    },
    onSuccess: async ({ orgId, flagKey, value }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orgs-feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['org-feature-flags'] });
      
      const flagDef = FEATURE_FLAG_DEFINITIONS.find(f => f.id === flagKey);
      const org = organizations?.find(o => o.id === orgId);
      
      await createAuditLog({
        action: 'FLAG_TOGGLE',
        entityType: 'feature_flag',
        entityId: flagKey,
        metadata: { 
          flag_name: flagDef?.name,
          organization_id: orgId,
          organization_name: org?.name,
          new_value: value,
        },
      });
      
      toast.success(t('Feature flag updated', 'تم تحديث علامة الميزة'));
    },
    onError: () => {
      toast.error(t('Failed to update flag', 'فشل في تحديث العلامة'));
    },
  });

  // Filter flag definitions by search
  const filteredFlags = FEATURE_FLAG_DEFINITIONS.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!organizations?.length) return { total: 0, globallyEnabled: 0, orgSpecific: 0 };
    
    let globallyEnabled = 0;
    let orgSpecific = 0;
    
    FEATURE_FLAG_DEFINITIONS.forEach(flag => {
      const enabledCount = organizations.filter(org => {
        const settings = org.settings as OrgSettings | null;
        return settings?.[flag.id as keyof OrgSettings] === true;
      }).length;
      
      if (enabledCount === organizations.length) {
        globallyEnabled++;
      } else if (enabledCount > 0) {
        orgSpecific++;
      }
    });
    
    return { total: FEATURE_FLAG_DEFINITIONS.length, globallyEnabled, orgSpecific };
  }, [organizations]);

  // Get flag value for a specific org
  const getFlagValue = (orgId: string, flagKey: string): boolean => {
    const org = organizations?.find(o => o.id === orgId);
    const settings = org?.settings as OrgSettings | null;
    return settings?.[flagKey as keyof OrgSettings] ?? false;
  };

  // Handle toggle for a specific org
  const handleToggle = (orgId: string, flagKey: string, currentValue: boolean) => {
    updateFlagMutation.mutate({ orgId, flagKey, value: !currentValue });
  };

  // Batch enable/disable for all orgs
  const handleBatchToggle = async (flagKey: string, enable: boolean) => {
    if (!organizations?.length) return;
    
    for (const org of organizations) {
      await updateFlagMutation.mutateAsync({ orgId: org.id, flagKey, value: enable });
    }
  };

  return (
    <PageLayout
      title={t('Feature Flags', 'علامات الميزات')}
      description={t('Control feature availability per organization', 'التحكم في توفر الميزات لكل منظمة')}
      icon={ToggleLeft}
      iconClassName="from-violet-500 to-purple-500"
      actions={
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orgs-feature-flags'] })}
        >
          <RefreshCw className="w-4 h-4 me-2" />
          {t('Refresh', 'تحديث')}
        </Button>
      }
    >
      <MetricGrid columns={3}>
        <MetricCard title={t('Total Features', 'إجمالي الميزات')} value={metrics.total} icon={ToggleLeft} />
        <MetricCard 
          title={t('Globally Enabled', 'مفعل عالمياً')} 
          value={metrics.globallyEnabled} 
          icon={Globe}
          iconClassName="from-success to-success/80"
        />
        <MetricCard 
          title={t('Org-Specific', 'خاص بالمنظمة')} 
          value={metrics.orgSpecific} 
          icon={Building2}
          iconClassName="from-primary to-primary/80"
        />
      </MetricGrid>

      {/* Feature Flag Cards */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <div>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <ToggleLeft className="w-5 h-5" />
                {t('Feature Configuration', 'تكوين الميزات')}
              </CardTitle>
              <CardDescription>{t('Toggle features per organization', 'تبديل الميزات لكل منظمة')}</CardDescription>
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
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFlags.map((flag) => {
                const Icon = flag.icon;
                const enabledOrgs = organizations?.filter(org => getFlagValue(org.id, flag.id)) || [];
                const isGlobal = enabledOrgs.length === organizations?.length;
                
                return (
                  <div 
                    key={flag.id} 
                    className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className={cn("flex items-start justify-between gap-4", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <h4 className="font-medium">{isRTL ? flag.nameAr : flag.name}</h4>
                            {isGlobal && organizations?.length ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                                <Globe className="w-3 h-3 me-1" />
                                {t('Global', 'عالمي')}
                              </Badge>
                            ) : enabledOrgs.length > 0 ? (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <Building2 className="w-3 h-3 me-1" />
                                {enabledOrgs.length} {t('orgs', 'منظمات')}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                {t('Disabled', 'معطل')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? flag.descriptionAr : flag.description}
                          </p>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBatchToggle(flag.id, true)}
                          disabled={isGlobal || updateFlagMutation.isPending}
                        >
                          {t('Enable All', 'تفعيل الكل')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleBatchToggle(flag.id, false)}
                          disabled={enabledOrgs.length === 0 || updateFlagMutation.isPending}
                        >
                          {t('Disable All', 'تعطيل الكل')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Organization Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Building2 className="w-5 h-5" />
            {t('Organization Settings', 'إعدادات المنظمة')}
          </CardTitle>
          <CardDescription>
            {t('Enable or disable features for specific organizations', 'تمكين أو تعطيل الميزات لمنظمات محددة')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !organizations?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('No organizations found', 'لم يتم العثور على منظمات')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">{t('Organization', 'المنظمة')}</TableHead>
                    {FEATURE_FLAG_DEFINITIONS.slice(0, 5).map(f => (
                      <TableHead key={f.id} className="text-center min-w-[100px]">
                        {isRTL ? f.nameAr : f.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations
                    .filter(org => selectedOrgId === 'all' || org.id === selectedOrgId)
                    .map(org => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      {FEATURE_FLAG_DEFINITIONS.slice(0, 5).map(flag => {
                        const isEnabled = getFlagValue(org.id, flag.id);
                        return (
                          <TableCell key={flag.id} className="text-center">
                            <Switch 
                              checked={isEnabled}
                              onCheckedChange={() => handleToggle(org.id, flag.id, isEnabled)}
                              disabled={updateFlagMutation.isPending}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
