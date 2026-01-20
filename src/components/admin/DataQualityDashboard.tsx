import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  FileWarning,
  Link2,
  TrendingUp,
  Users,
  Building2,
  Wallet,
  Settings,
  Upload,
  FileText,
  MapPin,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

// Types
interface OrganizationHealth {
  id: string;
  name: string;
  rosterCoverage: number;
  policyCoverage: number;
  entitlementCoverage: number;
  lastSync: string;
  syncStatus: 'fresh' | 'stale' | 'critical';
  readiness: 'ready' | 'needs_data' | 'needs_policy' | 'needs_mapping';
  employeeCount: number;
  issues: number;
}

interface ActionableIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedOrgs: string[];
  affectedCount: number;
  actionType: 'settings' | 'import' | 'policy' | 'mapping' | 'review';
  actionLabel: string;
  actionPath: string;
}

// Mock data - Organization health
const organizationHealth: OrganizationHealth[] = [
  { 
    id: 'org1', 
    name: 'Acme Corporation', 
    rosterCoverage: 98,
    policyCoverage: 100,
    entitlementCoverage: 95,
    lastSync: '2026-01-20T08:30:00Z',
    syncStatus: 'fresh',
    readiness: 'ready',
    employeeCount: 1250,
    issues: 0
  },
  { 
    id: 'org2', 
    name: 'TechStart Inc', 
    rosterCoverage: 85,
    policyCoverage: 60,
    entitlementCoverage: 72,
    lastSync: '2026-01-18T14:00:00Z',
    syncStatus: 'stale',
    readiness: 'needs_policy',
    employeeCount: 320,
    issues: 3
  },
  { 
    id: 'org3', 
    name: 'Global Finance LLC', 
    rosterCoverage: 92,
    policyCoverage: 95,
    entitlementCoverage: 45,
    lastSync: '2026-01-19T16:45:00Z',
    syncStatus: 'fresh',
    readiness: 'needs_mapping',
    employeeCount: 890,
    issues: 2
  },
  { 
    id: 'org4', 
    name: 'New Pilot Co', 
    rosterCoverage: 25,
    policyCoverage: 0,
    entitlementCoverage: 0,
    lastSync: '2026-01-15T09:00:00Z',
    syncStatus: 'critical',
    readiness: 'needs_data',
    employeeCount: 150,
    issues: 5
  },
  { 
    id: 'org5', 
    name: 'Metro Services', 
    rosterCoverage: 100,
    policyCoverage: 88,
    entitlementCoverage: 91,
    lastSync: '2026-01-20T06:00:00Z',
    syncStatus: 'fresh',
    readiness: 'ready',
    employeeCount: 2100,
    issues: 1
  },
];

// Mock data - Actionable issues
const actionableIssues: ActionableIssue[] = [
  { 
    id: 'i1', 
    severity: 'critical',
    title: 'Missing 2026 budget allocation',
    description: 'Organizations without budget cannot process claims or show utilization rates',
    affectedOrgs: ['TechStart Inc', 'New Pilot Co'],
    affectedCount: 2,
    actionType: 'settings',
    actionLabel: 'Set Budgets',
    actionPath: '/admin/organizations'
  },
  { 
    id: 'i2', 
    severity: 'critical',
    title: 'No published policies',
    description: 'Employees cannot see benefit rules or submit claims without published policies',
    affectedOrgs: ['New Pilot Co'],
    affectedCount: 1,
    actionType: 'policy',
    actionLabel: 'Publish Policies',
    actionPath: '/admin/organizations'
  },
  { 
    id: 'i3', 
    severity: 'high',
    title: 'Roster sync stale >48h',
    description: 'New employees may not have access; terminated employees may retain access',
    affectedOrgs: ['TechStart Inc', 'New Pilot Co'],
    affectedCount: 2,
    actionType: 'import',
    actionLabel: 'Run Import',
    actionPath: '/admin/data-migration'
  },
  { 
    id: 'i4', 
    severity: 'high',
    title: 'Unmapped benefit entitlements',
    description: 'Grade-to-benefit mappings incomplete; employees see incorrect allowances',
    affectedOrgs: ['Global Finance LLC'],
    affectedCount: 1,
    actionType: 'mapping',
    actionLabel: 'Configure Mapping',
    actionPath: '/admin/organizations'
  },
  { 
    id: 'i5', 
    severity: 'medium',
    title: 'Low policy coverage',
    description: 'Some benefit categories lack documented policies',
    affectedOrgs: ['TechStart Inc'],
    affectedCount: 1,
    actionType: 'policy',
    actionLabel: 'Add Policies',
    actionPath: '/admin/organizations'
  },
  { 
    id: 'i6', 
    severity: 'low',
    title: 'Orphaned entitlement records',
    description: 'Entitlements exist for users no longer in roster',
    affectedOrgs: ['Metro Services'],
    affectedCount: 1,
    actionType: 'review',
    actionLabel: 'Review Records',
    actionPath: '/admin/organizations'
  },
];

// Platform-wide metrics
const platformMetrics = {
  totalOrganizations: 5,
  readyOrgs: 2,
  avgRosterCoverage: 80,
  avgPolicyCoverage: 69,
  avgEntitlementCoverage: 61,
  criticalIssues: 2,
  highIssues: 2,
};

export function DataQualityDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Helper functions
  const getOverallScore = (org: OrganizationHealth) => {
    return Math.round((org.rosterCoverage + org.policyCoverage + org.entitlementCoverage) / 3);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 70) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  const getReadinessConfig = (readiness: OrganizationHealth['readiness']) => {
    switch (readiness) {
      case 'ready':
        return { 
          label: t('Ready', 'جاهز'), 
          icon: CheckCircle, 
          color: 'text-success bg-success/10 border-success/30',
          description: t('Fully configured for production', 'مُهيأ بالكامل للإنتاج')
        };
      case 'needs_data':
        return { 
          label: t('Needs Data', 'يحتاج بيانات'), 
          icon: Database, 
          color: 'text-destructive bg-destructive/10 border-destructive/30',
          description: t('Import employee roster', 'استيراد قائمة الموظفين')
        };
      case 'needs_policy':
        return { 
          label: t('Needs Policy', 'يحتاج سياسات'), 
          icon: FileText, 
          color: 'text-warning bg-warning/10 border-warning/30',
          description: t('Publish benefit policies', 'نشر سياسات المزايا')
        };
      case 'needs_mapping':
        return { 
          label: t('Needs Mapping', 'يحتاج ربط'), 
          icon: MapPin, 
          color: 'text-accent bg-accent/10 border-accent/30',
          description: t('Configure grade entitlements', 'تكوين استحقاقات الدرجات')
        };
    }
  };

  const getSyncStatusBadge = (status: OrganizationHealth['syncStatus']) => {
    switch (status) {
      case 'fresh':
        return <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">{t('Fresh', 'محدث')}</Badge>;
      case 'stale':
        return <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">{t('Stale', 'قديم')}</Badge>;
      case 'critical':
        return <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">{t('Critical', 'حرج')}</Badge>;
    }
  };

  const getSeverityConfig = (severity: ActionableIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-destructive/10 border-destructive/30', icon: XCircle, iconColor: 'text-destructive' };
      case 'high':
        return { bg: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle, iconColor: 'text-orange-500' };
      case 'medium':
        return { bg: 'bg-warning/10 border-warning/30', icon: AlertCircle, iconColor: 'text-warning' };
      case 'low':
        return { bg: 'bg-muted border-border', icon: FileWarning, iconColor: 'text-muted-foreground' };
    }
  };

  const getActionIcon = (type: ActionableIssue['actionType']) => {
    switch (type) {
      case 'settings': return Settings;
      case 'import': return Upload;
      case 'policy': return FileText;
      case 'mapping': return MapPin;
      case 'review': return Eye;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return t('Just now', 'الآن');
    if (diffMins < 60) return `${diffMins}${t('m ago', 'د')}`;
    if (diffHours < 24) return `${diffHours}${t('h ago', 'س')}`;
    return `${diffDays}${t('d ago', 'ي')}`;
  };

  // Computed values
  const criticalAndHighIssues = actionableIssues.filter(i => i.severity === 'critical' || i.severity === 'high');
  const otherIssues = actionableIssues.filter(i => i.severity !== 'critical' && i.severity !== 'high');

  return (
    <div className="space-y-6">
      {/* Command Center Header */}
      <div className={cn(
        "p-4 rounded-xl border border-border/60 bg-gradient-to-r from-primary/5 via-background to-accent/5",
        isRTL && "text-right"
      )}>
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="p-3 rounded-xl bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('Data Quality Command Center', 'مركز قيادة جودة البيانات')}</h2>
              <p className="text-sm text-muted-foreground">
                {platformMetrics.readyOrgs}/{platformMetrics.totalOrganizations} {t('organizations production-ready', 'مؤسسات جاهزة للإنتاج')}
                {platformMetrics.criticalIssues > 0 && (
                  <span className="text-destructive font-medium mx-2">
                    • {platformMetrics.criticalIssues} {t('critical issues', 'مشاكل حرجة')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              {t('Sync All', 'مزامنة الكل')}
            </Button>
            <Button size="sm" className="gap-1.5">
              <Play className="w-3.5 h-3.5" />
              {t('Run Health Check', 'فحص الصحة')}
            </Button>
          </div>
        </div>
      </div>

      {/* Platform-wide Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Avg Roster', 'متوسط القوائم')}</p>
                <p className={cn("text-2xl font-bold mt-1", getScoreColor(platformMetrics.avgRosterCoverage))}>
                  {platformMetrics.avgRosterCoverage}%
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", getScoreBg(platformMetrics.avgRosterCoverage))}>
                <Users className={cn("w-5 h-5", getScoreColor(platformMetrics.avgRosterCoverage))} />
              </div>
            </div>
            <Progress value={platformMetrics.avgRosterCoverage} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Avg Policies', 'متوسط السياسات')}</p>
                <p className={cn("text-2xl font-bold mt-1", getScoreColor(platformMetrics.avgPolicyCoverage))}>
                  {platformMetrics.avgPolicyCoverage}%
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", getScoreBg(platformMetrics.avgPolicyCoverage))}>
                <FileText className={cn("w-5 h-5", getScoreColor(platformMetrics.avgPolicyCoverage))} />
              </div>
            </div>
            <Progress value={platformMetrics.avgPolicyCoverage} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Avg Entitlements', 'متوسط الاستحقاقات')}</p>
                <p className={cn("text-2xl font-bold mt-1", getScoreColor(platformMetrics.avgEntitlementCoverage))}>
                  {platformMetrics.avgEntitlementCoverage}%
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", getScoreBg(platformMetrics.avgEntitlementCoverage))}>
                <TrendingUp className={cn("w-5 h-5", getScoreColor(platformMetrics.avgEntitlementCoverage))} />
              </div>
            </div>
            <Progress value={platformMetrics.avgEntitlementCoverage} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Ready Tenants', 'المستأجرون الجاهزون')}</p>
                <p className="text-2xl font-bold mt-1 text-success">
                  {platformMetrics.readyOrgs}/{platformMetrics.totalOrganizations}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <ShieldCheck className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: platformMetrics.totalOrganizations }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i < platformMetrics.readyOrgs ? 'bg-success' : 'bg-muted'
                  )} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Open Issues', 'المشاكل المفتوحة')}</p>
                <p className="text-2xl font-bold mt-1">
                  <span className="text-destructive">{platformMetrics.criticalIssues}</span>
                  <span className="text-muted-foreground text-lg mx-1">/</span>
                  <span className="text-warning">{platformMetrics.highIssues}</span>
                  <span className="text-muted-foreground text-lg mx-1">/</span>
                  <span className="text-muted-foreground">{actionableIssues.length}</span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{t('Critical / High / Total', 'حرج / عالي / الإجمالي')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Organization Completeness - Takes 2 columns */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Organization Completeness', 'اكتمال المؤسسات')}</CardTitle>
                <CardDescription>{t('Data coverage and readiness per tenant', 'تغطية البيانات والجاهزية لكل مستأجر')}</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Building2 className="w-3 h-3" />
                {platformMetrics.totalOrganizations} {t('Tenants', 'مستأجرين')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizationHealth.map((org) => {
                const readinessConfig = getReadinessConfig(org.readiness);
                const ReadinessIcon = readinessConfig.icon;
                const overallScore = getOverallScore(org);
                
                return (
                  <div 
                    key={org.id}
                    className={cn(
                      "p-4 rounded-xl border border-border/60 hover:border-primary/30 transition-all cursor-pointer",
                      selectedOrg === org.id && "border-primary/50 bg-primary/5",
                      isRTL && "text-right"
                    )}
                    onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
                  >
                    {/* Header Row */}
                    <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-3 flex-1", isRTL && "flex-row-reverse")}>
                        <div className={cn("p-2.5 rounded-lg", getScoreBg(overallScore))}>
                          <Building2 className={cn("w-5 h-5", getScoreColor(overallScore))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                            <span className="font-semibold truncate">{org.name}</span>
                            {getSyncStatusBadge(org.syncStatus)}
                            {org.issues > 0 && (
                              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                                {org.issues} {t('issues', 'مشاكل')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {org.employeeCount.toLocaleString()} {t('employees', 'موظف')} • {t('Synced', 'مزامنة')} {formatTimeAgo(org.lastSync)}
                          </p>
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div className={cn("text-center px-4", isRTL && "border-l-0 border-r border-r-border/40", !isRTL && "border-l border-l-border/40")}>
                        <p className={cn("text-2xl font-bold", getScoreColor(overallScore))}>{overallScore}%</p>
                        <p className="text-[10px] text-muted-foreground">{t('Overall', 'الإجمالي')}</p>
                      </div>

                      {/* Readiness Badge */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border",
                              readinessConfig.color
                            )}>
                              <ReadinessIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">{readinessConfig.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{readinessConfig.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        selectedOrg === org.id && "rotate-90"
                      )} />
                    </div>

                    {/* Expanded Coverage Details */}
                    {selectedOrg === org.id && (
                      <div className={cn(
                        "mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-4",
                        isRTL && "text-right"
                      )}>
                        <div className="space-y-2">
                          <div className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                            <span className="text-muted-foreground">{t('Roster', 'القوائم')}</span>
                            <span className={cn("font-medium", getScoreColor(org.rosterCoverage))}>
                              {org.rosterCoverage}%
                            </span>
                          </div>
                          <Progress value={org.rosterCoverage} className="h-2" />
                          <p className="text-[10px] text-muted-foreground">
                            {t('Employee data completeness', 'اكتمال بيانات الموظفين')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                            <span className="text-muted-foreground">{t('Policies', 'السياسات')}</span>
                            <span className={cn("font-medium", getScoreColor(org.policyCoverage))}>
                              {org.policyCoverage}%
                            </span>
                          </div>
                          <Progress value={org.policyCoverage} className="h-2" />
                          <p className="text-[10px] text-muted-foreground">
                            {t('Published policy coverage', 'تغطية السياسات المنشورة')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className={cn("flex items-center justify-between text-sm", isRTL && "flex-row-reverse")}>
                            <span className="text-muted-foreground">{t('Entitlements', 'الاستحقاقات')}</span>
                            <span className={cn("font-medium", getScoreColor(org.entitlementCoverage))}>
                              {org.entitlementCoverage}%
                            </span>
                          </div>
                          <Progress value={org.entitlementCoverage} className="h-2" />
                          <p className="text-[10px] text-muted-foreground">
                            {t('Grade mapping coverage', 'تغطية ربط الدرجات')}
                          </p>
                        </div>

                        {/* Quick Actions */}
                        <div className={cn("col-span-3 flex items-center gap-2 pt-2", isRTL && "flex-row-reverse")}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Settings className="w-3 h-3" />
                            {t('Org Settings', 'إعدادات المؤسسة')}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Upload className="w-3 h-3" />
                            {t('Import Data', 'استيراد البيانات')}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <FileText className="w-3 h-3" />
                            {t('Manage Policies', 'إدارة السياسات')}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <RefreshCw className="w-3 h-3" />
                            {t('Force Sync', 'فرض المزامنة')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actionable Issues - Takes 1 column */}
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Action Required', 'إجراء مطلوب')}</CardTitle>
                <CardDescription>{t('Issues blocking insights', 'مشاكل تعيق الرؤى')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Critical & High Priority */}
            {criticalAndHighIssues.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-destructive uppercase tracking-wide">
                  {t('Fix Immediately', 'إصلاح فوري')}
                </p>
                {criticalAndHighIssues.map((issue) => {
                  const config = getSeverityConfig(issue.severity);
                  const SeverityIcon = config.icon;
                  const ActionIcon = getActionIcon(issue.actionType);
                  
                  return (
                    <div 
                      key={issue.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        config.bg,
                        isRTL && "text-right"
                      )}
                    >
                      <div className={cn("flex items-start gap-2", isRTL && "flex-row-reverse")}>
                        <SeverityIcon className={cn("w-4 h-4 mt-0.5 shrink-0", config.iconColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{issue.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                          <div className={cn("flex items-center gap-1 mt-2 flex-wrap", isRTL && "flex-row-reverse")}>
                            {issue.affectedOrgs.slice(0, 2).map((org, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px]">
                                {org}
                              </Badge>
                            ))}
                            {issue.affectedOrgs.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{issue.affectedOrgs.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className={cn("w-full mt-3 gap-1.5", 
                          issue.severity === 'critical' ? 'bg-destructive hover:bg-destructive/90' : ''
                        )}
                        variant={issue.severity === 'critical' ? 'default' : 'outline'}
                      >
                        <ActionIcon className="w-3.5 h-3.5" />
                        {issue.actionLabel}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Medium & Low Priority */}
            {otherIssues.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('When Possible', 'عند الإمكان')}
                </p>
                {otherIssues.map((issue) => {
                  const config = getSeverityConfig(issue.severity);
                  const SeverityIcon = config.icon;
                  const ActionIcon = getActionIcon(issue.actionType);
                  
                  return (
                    <div 
                      key={issue.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        config.bg,
                        isRTL && "text-right"
                      )}
                    >
                      <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-start gap-2 flex-1 min-w-0", isRTL && "flex-row-reverse")}>
                          <SeverityIcon className={cn("w-4 h-4 mt-0.5 shrink-0", config.iconColor)} />
                          <div>
                            <p className="text-sm font-medium leading-tight">{issue.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {issue.affectedCount} {t('org(s) affected', 'مؤسسة متأثرة')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="shrink-0 gap-1 text-xs h-7">
                          <ActionIcon className="w-3 h-3" />
                          {issue.actionLabel}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Clear State */}
            {actionableIssues.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-flex p-4 rounded-full bg-success/10 mb-3">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>
                <p className="font-medium text-success">{t('All Systems Healthy', 'جميع الأنظمة سليمة')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('No blocking issues detected', 'لم يتم اكتشاف مشاكل معيقة')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenant Readiness Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('Tenant Readiness Overview', 'نظرة عامة على جاهزية المستأجرين')}</CardTitle>
          <CardDescription>{t('Quick view of all organizations by status', 'عرض سريع لجميع المؤسسات حسب الحالة')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['ready', 'needs_data', 'needs_policy', 'needs_mapping'] as const).map((status) => {
              const config = getReadinessConfig(status);
              const StatusIcon = config.icon;
              const orgsWithStatus = organizationHealth.filter(o => o.readiness === status);
              
              return (
                <div 
                  key={status}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    config.color.replace('text-', 'border-').replace('bg-', '').split(' ')[2] || 'border-border',
                    "hover:shadow-md cursor-pointer"
                  )}
                >
                  <div className={cn("flex items-center gap-2 mb-3", isRTL && "flex-row-reverse")}>
                    <StatusIcon className={cn("w-5 h-5", config.color.split(' ')[0])} />
                    <span className="font-semibold">{config.label}</span>
                  </div>
                  <p className="text-3xl font-bold">{orgsWithStatus.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                  {orgsWithStatus.length > 0 && (
                    <div className={cn("mt-3 pt-3 border-t border-border/40 space-y-1", isRTL && "text-right")}>
                      {orgsWithStatus.slice(0, 3).map(org => (
                        <p key={org.id} className="text-xs truncate">{org.name}</p>
                      ))}
                      {orgsWithStatus.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{orgsWithStatus.length - 3} {t('more', 'المزيد')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
