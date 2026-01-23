/**
 * Admin Action Center Dashboard
 * 
 * The primary landing page for /admin showing:
 * - Moderation Backlog
 * - Data Quality Blockers
 * - Security Flags
 * - Organization Readiness Overview
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  Shield,
  Database,
  Building2,
  ClipboardList,
  ChevronRight,
  Clock,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Eye,
  Flag,
  Link2,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { PageLayout } from '@/components/shared';
import { 
  useAllClientReadiness, 
  ReadinessCompactCard, 
  ReadinessStatusBadge,
  ReadinessScoreBadge,
  type ClientReadinessResult,
} from './ClientReadinessScore';
import { TooltipProvider } from '@/components/ui/tooltip';

// Action item types
interface ActionItem {
  id: string;
  type: 'moderation' | 'data_quality' | 'security' | 'org_readiness';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count?: number;
  route: string;
  timestamp?: string;
}

// Mock data for action items (will be replaced with real queries)
const generateActionItems = (readinessData: ClientReadinessResult[]): ActionItem[] => {
  const items: ActionItem[] = [
    // Moderation backlog
    {
      id: 'mod-1',
      type: 'moderation',
      title: 'Offers pending review',
      description: '8 vendor offers awaiting approval for 48+ hours',
      severity: 'high',
      count: 8,
      route: '/admin/moderation',
      timestamp: '2h ago',
    },
    {
      id: 'mod-2',
      type: 'moderation',
      title: 'Vendor applications',
      description: '3 new vendor applications pending verification',
      severity: 'medium',
      count: 3,
      route: '/admin/vendors',
      timestamp: '1d ago',
    },
    // Data quality
    {
      id: 'dq-1',
      type: 'data_quality',
      title: 'HRIS sync failures',
      description: '2 organizations with failed syncs in last 24h',
      severity: 'critical',
      count: 2,
      route: '/admin/sync-monitor',
      timestamp: '4h ago',
    },
    {
      id: 'dq-2',
      type: 'data_quality',
      title: 'Stale data warning',
      description: '4 orgs have not synced in 7+ days',
      severity: 'medium',
      count: 4,
      route: '/admin/data-sources',
      timestamp: '1d ago',
    },
    // Security
    {
      id: 'sec-1',
      type: 'security',
      title: 'Unusual login attempts',
      description: '15 failed login attempts from same IP range',
      severity: 'critical',
      count: 15,
      route: '/admin/security',
      timestamp: '1h ago',
    },
    {
      id: 'sec-2',
      type: 'security',
      title: 'Session anomalies',
      description: '3 users with concurrent sessions from different regions',
      severity: 'high',
      count: 3,
      route: '/admin/sessions',
      timestamp: '6h ago',
    },
  ];
  
  // Add org readiness items for orgs that are not ready
  const notReadyOrgs = readinessData.filter(r => r.status === 'not_ready');
  const needsAttentionOrgs = readinessData.filter(r => r.status === 'needs_attention');
  
  if (notReadyOrgs.length > 0) {
    items.push({
      id: 'org-1',
      type: 'org_readiness',
      title: 'Organizations not production ready',
      description: `${notReadyOrgs.length} org(s) missing critical setup steps`,
      severity: 'high',
      count: notReadyOrgs.length,
      route: '/admin/organizations',
    });
  }
  
  if (needsAttentionOrgs.length > 0) {
    items.push({
      id: 'org-2',
      type: 'org_readiness',
      title: 'Organizations need attention',
      description: `${needsAttentionOrgs.length} org(s) with incomplete configuration`,
      severity: 'medium',
      count: needsAttentionOrgs.length,
      route: '/admin/organizations',
    });
  }
  
  return items.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', class: 'bg-destructive text-destructive-foreground', icon: XCircle },
  high: { label: 'High', class: 'bg-warning text-warning-foreground', icon: AlertTriangle },
  medium: { label: 'Medium', class: 'bg-accent text-accent-foreground', icon: Flag },
  low: { label: 'Low', class: 'bg-muted text-muted-foreground', icon: Activity },
};

const TYPE_CONFIG = {
  moderation: { label: 'Moderation', icon: ClipboardList, color: 'text-violet-500' },
  data_quality: { label: 'Data Quality', icon: Database, color: 'text-blue-500' },
  security: { label: 'Security', icon: Shield, color: 'text-red-500' },
  org_readiness: { label: 'Org Readiness', icon: Building2, color: 'text-amber-500' },
};

function ActionItemCard({ item, onClick }: { item: ActionItem; onClick: () => void }) {
  const TypeIcon = TYPE_CONFIG[item.type].icon;
  const SeverityIcon = SEVERITY_CONFIG[item.severity].icon;
  
  return (
    <div 
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
        item.severity === 'critical' && 'border-destructive/30 bg-destructive/5',
        item.severity === 'high' && 'border-warning/30'
      )}
      onClick={onClick}
    >
      <div className={cn('p-2 rounded-lg bg-muted/50', TYPE_CONFIG[item.type].color)}>
        <TypeIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{item.title}</p>
          {item.count && (
            <Badge variant="secondary" className="text-xs">
              {item.count}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        {item.timestamp && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {item.timestamp}
          </p>
        )}
      </div>
      <Badge className={cn('text-xs shrink-0', SEVERITY_CONFIG[item.severity].class)}>
        {SEVERITY_CONFIG[item.severity].label}
      </Badge>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </div>
  );
}

export function AdminActionCenterDashboard() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeTab, setActiveTab] = useState<'all' | 'moderation' | 'data_quality' | 'security' | 'org_readiness'>('all');
  
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  
  // Fetch org readiness data
  const { data: readinessData = [], isLoading: readinessLoading } = useAllClientReadiness();
  
  // Generate action items
  const actionItems = generateActionItems(readinessData);
  
  // Filter by tab
  const filteredItems = activeTab === 'all' 
    ? actionItems 
    : actionItems.filter(item => item.type === activeTab);
  
  // Summary stats
  const stats = {
    critical: actionItems.filter(i => i.severity === 'critical').length,
    high: actionItems.filter(i => i.severity === 'high').length,
    medium: actionItems.filter(i => i.severity === 'medium').length,
    productionReady: readinessData.filter(r => r.status === 'production_ready').length,
    totalOrgs: readinessData.length,
  };

  return (
    <TooltipProvider>
      <PageLayout
        title={t('Action Center', 'مركز العمل')}
        description={t('Critical tasks requiring immediate attention', 'المهام الحرجة التي تتطلب اهتماماً فورياً')}
        icon={Zap}
        iconClassName="from-destructive to-destructive/80"
        badge={{
          label: stats.critical > 0 
            ? `${stats.critical} Critical` 
            : t('All Clear', 'كل شيء واضح'),
          variant: stats.critical > 0 ? 'warning' : 'success',
          icon: stats.critical > 0 ? AlertTriangle : CheckCircle2,
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/organizations')}>
              <Building2 className="w-4 h-4 mr-2" />
              {t('All Organizations', 'جميع المنظمات')}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('Refresh', 'تحديث')}
            </Button>
          </div>
        }
      >
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={cn(stats.critical > 0 && 'border-destructive/30')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">{t('Critical Issues', 'مشاكل حرجة')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.high}</p>
                  <p className="text-xs text-muted-foreground">{t('High Priority', 'أولوية عالية')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Flag className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.medium}</p>
                  <p className="text-xs text-muted-foreground">{t('Medium Priority', 'أولوية متوسطة')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.productionReady}/{stats.totalOrgs}</p>
                  <p className="text-xs text-muted-foreground">{t('Orgs Ready', 'المنظمات الجاهزة')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Action Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      {t('Action Queue', 'قائمة المهام')}
                    </CardTitle>
                    <CardDescription>
                      {t('Items requiring your attention, sorted by priority', 'العناصر التي تتطلب انتباهك، مرتبة حسب الأولوية')}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{filteredItems.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="all" className="gap-1">
                      {t('All', 'الكل')}
                      <Badge variant="secondary" className="text-xs">{actionItems.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="moderation" className="gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      {t('Moderation', 'المراجعة')}
                    </TabsTrigger>
                    <TabsTrigger value="data_quality" className="gap-1">
                      <Database className="w-3.5 h-3.5" />
                      {t('Data', 'البيانات')}
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      {t('Security', 'الأمان')}
                    </TabsTrigger>
                    <TabsTrigger value="org_readiness" className="gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {t('Orgs', 'المنظمات')}
                    </TabsTrigger>
                  </TabsList>
                  
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {filteredItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="font-medium">{t('No pending items', 'لا توجد عناصر معلقة')}</p>
                          <p className="text-sm">{t('All clear in this category!', 'كل شيء واضح في هذه الفئة!')}</p>
                        </div>
                      ) : (
                        filteredItems.map(item => (
                          <ActionItemCard 
                            key={item.id} 
                            item={item} 
                            onClick={() => navigate(item.route)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Organization Readiness Overview */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      {t('Client Readiness', 'جاهزية العملاء')}
                    </CardTitle>
                    <CardDescription>
                      {t('Production readiness by organization', 'الجاهزية للإنتاج حسب المنظمة')}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/admin/organizations')}
                  >
                    {t('View All', 'عرض الكل')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {readinessLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : readinessData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('No organizations found', 'لم يتم العثور على منظمات')}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {readinessData.slice(0, 10).map(result => (
                        <ReadinessCompactCard 
                          key={result.organizationId}
                          result={result}
                          onClick={() => navigate(`/admin/organizations/${result.organizationId}/settings`)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                {/* Readiness Summary Bar */}
                {readinessData.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('Overall Readiness', 'الجاهزية العامة')}</span>
                      <span className="font-medium">
                        {stats.productionReady}/{stats.totalOrgs} {t('ready', 'جاهز')}
                      </span>
                    </div>
                    <Progress 
                      value={(stats.productionReady / Math.max(stats.totalOrgs, 1)) * 100}
                      className="h-2 [&>div]:bg-success"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </TooltipProvider>
  );
}

export default AdminActionCenterDashboard;
