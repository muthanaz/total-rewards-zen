import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { 
  Database, CheckCircle, XCircle, Clock, AlertTriangle, 
  RefreshCw, Link2, Unlink, Settings, Plus, Activity
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const CONNECTOR_TYPES = {
  hris: { label: 'HRIS', icon: '👥', description: 'Human Resources Information System' },
  payroll: { label: 'Payroll', icon: '💰', description: 'Payroll & Compensation' },
  benefits: { label: 'Benefits Vendor', icon: '🎁', description: 'Benefits Administration' },
  finance: { label: 'Finance', icon: '📊', description: 'Financial Systems' },
};

const STATUS_CONFIG = {
  connected: { label: 'Connected', labelAr: 'متصل', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
  syncing: { label: 'Syncing', labelAr: 'مزامنة', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: RefreshCw },
  error: { label: 'Error', labelAr: 'خطأ', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  disconnected: { label: 'Disconnected', labelAr: 'غير متصل', color: 'bg-muted text-muted-foreground border-border', icon: Unlink },
};

const SAMPLE_SOURCES = [
  { id: '1', name: 'SAP SuccessFactors', type: 'hris', status: 'connected', coverage: 95, last_sync: new Date(Date.now() - 1000 * 60 * 15), records_synced: 12450, missing_fields: ['manager_id'] },
  { id: '2', name: 'Oracle HCM', type: 'payroll', status: 'connected', coverage: 88, last_sync: new Date(Date.now() - 1000 * 60 * 60), records_synced: 8920, missing_fields: ['bonus_date'] },
  { id: '3', name: 'Cigna Benefits', type: 'benefits', status: 'syncing', coverage: 72, last_sync: new Date(Date.now() - 1000 * 60 * 60 * 2), records_synced: 5600, missing_fields: ['dependent_info', 'plan_tier'] },
  { id: '4', name: 'Workday Finance', type: 'finance', status: 'error', coverage: 45, last_sync: new Date(Date.now() - 1000 * 60 * 60 * 24), records_synced: 2100, missing_fields: ['cost_center', 'budget_code'], error: 'API rate limit exceeded' },
];

export default function AdminDataSources() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [sources] = useState(SAMPLE_SOURCES);
  const [selectedSource, setSelectedSource] = useState<typeof SAMPLE_SOURCES[0] | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Fetch real integration runs from DB
  const { data: integrationRuns } = useQuery({
    queryKey: ['integration-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_runs')
        .select('*')
        .order('last_sync_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const avgCoverage = Math.round(sources.reduce((acc, s) => acc + s.coverage, 0) / sources.length);

  const metrics = [
    { title: t('Data Sources', 'مصادر البيانات'), value: sources.length, icon: Database },
    { title: t('Connected', 'متصل'), value: sources.filter(s => s.status === 'connected').length, icon: CheckCircle },
    { title: t('Avg Coverage', 'متوسط التغطية'), value: `${avgCoverage}%`, icon: Activity },
    { title: t('Errors', 'أخطاء'), value: sources.filter(s => s.status === 'error').length, icon: AlertTriangle },
  ];

  const handleSync = (source: typeof SAMPLE_SOURCES[0]) => {
    toast.info(t(`Syncing ${source.name}...`, `جاري مزامنة ${source.name}...`));
  };

  const handleViewDetails = (source: typeof SAMPLE_SOURCES[0]) => {
    setSelectedSource(source);
    setDetailSheetOpen(true);
  };

  return (
    <PageLayout
      title={t('Data Sources', 'مصادر البيانات')}
      description={t('Manage HRIS, payroll, and benefits vendor connections', 'إدارة اتصالات الموارد البشرية والرواتب والمزايا')}
      icon={Database}
      iconClassName="from-cyan-500 to-blue-500"
      actions={
        <Button>
          <Plus className="w-4 h-4 me-2" />
          {t('Add Connection', 'إضافة اتصال')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((source) => {
          const typeConfig = CONNECTOR_TYPES[source.type as keyof typeof CONNECTOR_TYPES];
          const statusConfig = STATUS_CONFIG[source.status as keyof typeof STATUS_CONFIG];
          return (
            <Card key={source.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                    <div className="text-3xl">{typeConfig.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <CardDescription>{typeConfig.label}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", statusConfig.color)}>
                    <statusConfig.icon className={cn("w-3 h-3 me-1", source.status === 'syncing' && 'animate-spin')} />
                    {isRTL ? statusConfig.labelAr : statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {source.status === 'error' && source.error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {source.error}
                  </div>
                )}

                <div>
                  <div className={cn("flex items-center justify-between text-sm mb-1", isRTL && "flex-row-reverse")}>
                    <span className="text-muted-foreground">{t('Data Coverage', 'تغطية البيانات')}</span>
                    <span className="font-medium">{source.coverage}%</span>
                  </div>
                  <Progress value={source.coverage} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('Records Synced', 'السجلات المتزامنة')}</p>
                    <p className="font-semibold">{source.records_synced.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('Last Sync', 'آخر مزامنة')}</p>
                    <p className="font-semibold">{formatDistanceToNow(source.last_sync, { addSuffix: true })}</p>
                  </div>
                </div>

                {source.missing_fields.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{t('Missing Fields', 'الحقول المفقودة')}</p>
                    <div className="flex gap-1 flex-wrap">
                      {source.missing_fields.map(f => (
                        <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className={cn("flex gap-2 pt-2", isRTL && "flex-row-reverse")}>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSync(source)}>
                    <RefreshCw className="w-4 h-4 me-2" />
                    {t('Sync Now', 'مزامنة الآن')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(source)}>
                    <Settings className="w-4 h-4 me-2" />
                    {t('Configure', 'تكوين')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Source Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedSource?.name}</SheetTitle>
            <SheetDescription>{t('Connection configuration and field mapping', 'تكوين الاتصال وتعيين الحقول')}</SheetDescription>
          </SheetHeader>
          {selectedSource && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Coverage', 'التغطية')}</p>
                  <p className="text-2xl font-bold">{selectedSource.coverage}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">{t('Records', 'السجلات')}</p>
                  <p className="text-2xl font-bold">{selectedSource.records_synced.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('Field Mapping', 'تعيين الحقول')}</h4>
                <p className="text-sm text-muted-foreground">{t('Configure how source fields map to platform fields', 'تكوين كيفية تعيين حقول المصدر إلى حقول المنصة')}</p>
                <Button variant="outline" className="mt-2 w-full">
                  <Settings className="w-4 h-4 me-2" />
                  {t('Open Field Mapper', 'فتح معين الحقول')}
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">{t('Sync Schedule', 'جدول المزامنة')}</h4>
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p>{t('Every 6 hours', 'كل 6 ساعات')}</p>
                </div>
              </div>

              <Button className="w-full" onClick={() => handleSync(selectedSource)}>
                <RefreshCw className="w-4 h-4 me-2" />
                {t('Sync Now', 'مزامنة الآن')}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
