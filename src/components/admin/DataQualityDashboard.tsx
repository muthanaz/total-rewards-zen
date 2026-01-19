import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  FileWarning,
  Link2,
  Link2Off,
  TrendingUp,
  Users,
  Building2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface DataSource {
  id: string;
  name: string;
  type: 'hris' | 'payroll' | 'benefits' | 'claims';
  status: 'connected' | 'warning' | 'disconnected';
  lastSync: string;
  coverage: number;
  recordCount: number;
  missingFields: string[];
}

const dataSources: DataSource[] = [
  { 
    id: 'ds1', 
    name: 'HRIS System', 
    type: 'hris',
    status: 'connected', 
    lastSync: '2026-01-19T10:30:00Z', 
    coverage: 98,
    recordCount: 12847,
    missingFields: ['Work Location (2%)']
  },
  { 
    id: 'ds2', 
    name: 'Payroll Provider', 
    type: 'payroll',
    status: 'connected', 
    lastSync: '2026-01-19T08:00:00Z', 
    coverage: 95,
    recordCount: 12650,
    missingFields: ['Bank Details (3%)', 'Tax ID (2%)']
  },
  { 
    id: 'ds3', 
    name: 'Benefits Platform', 
    type: 'benefits',
    status: 'warning', 
    lastSync: '2026-01-18T14:00:00Z', 
    coverage: 87,
    recordCount: 11200,
    missingFields: ['Dependent Info (8%)', 'Enrollment Date (5%)']
  },
  { 
    id: 'ds4', 
    name: 'Claims System', 
    type: 'claims',
    status: 'connected', 
    lastSync: '2026-01-19T09:15:00Z', 
    coverage: 92,
    recordCount: 45200,
    missingFields: ['Receipt Attachments (5%)', 'Category (3%)']
  },
];

const dataQualityIssues = [
  { id: 'i1', severity: 'high', title: 'Orphaned benefit entitlements', description: '47 entitlements without valid user_id', affectedRecords: 47, action: 'Review & Link' },
  { id: 'i2', severity: 'high', title: 'Missing organization budgets', description: '3 organizations have no budget allocation for 2026', affectedRecords: 3, action: 'Set Budget' },
  { id: 'i3', severity: 'medium', title: 'Stale profile data', description: '234 profiles not updated in 6+ months', affectedRecords: 234, action: 'Request Update' },
  { id: 'i4', severity: 'medium', title: 'Undefined metric keys', description: '12 dashboard metrics missing definitions', affectedRecords: 12, action: 'Define Metrics' },
  { id: 'i5', severity: 'low', title: 'Duplicate vendor entries', description: '5 potential duplicate vendor records detected', affectedRecords: 5, action: 'Merge' },
];

const integrityMetrics = {
  overallHealth: 91,
  dataFreshness: 94,
  fieldCompleteness: 88,
  referentialIntegrity: 96,
};

export function DataQualityDashboard() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'disconnected': return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getTypeIcon = (type: DataSource['type']) => {
    switch (type) {
      case 'hris': return <Users className="w-4 h-4" />;
      case 'payroll': return <Wallet className="w-4 h-4" />;
      case 'benefits': return <TrendingUp className="w-4 h-4" />;
      case 'claims': return <FileWarning className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 5) return t('Just now', 'الآن');
    if (diffMins < 60) return `${diffMins} ${t('mins ago', 'دقيقة مضت')}`;
    if (diffHours < 24) return `${diffHours} ${t('hours ago', 'ساعة مضت')}`;
    return date.toLocaleDateString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground border-border';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Overall Health', 'الصحة العامة')}</p>
                <p className="text-2xl font-bold mt-1">{integrityMetrics.overallHealth}%</p>
              </div>
              <div className={cn(
                "p-2 rounded-lg",
                integrityMetrics.overallHealth >= 90 ? 'bg-success/10' : 'bg-warning/10'
              )}>
                <Database className={cn(
                  "w-5 h-5",
                  integrityMetrics.overallHealth >= 90 ? 'text-success' : 'text-warning'
                )} />
              </div>
            </div>
            <Progress value={integrityMetrics.overallHealth} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Data Freshness', 'حداثة البيانات')}</p>
                <p className="text-2xl font-bold mt-1">{integrityMetrics.dataFreshness}%</p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
            </div>
            <Progress value={integrityMetrics.dataFreshness} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Field Completeness', 'اكتمال الحقول')}</p>
                <p className="text-2xl font-bold mt-1">{integrityMetrics.fieldCompleteness}%</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <Progress value={integrityMetrics.fieldCompleteness} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <p className="text-xs text-muted-foreground">{t('Referential Integrity', 'التكامل المرجعي')}</p>
                <p className="text-2xl font-bold mt-1">{integrityMetrics.referentialIntegrity}%</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <Progress value={integrityMetrics.referentialIntegrity} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Sources */}
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Data Sources', 'مصادر البيانات')}</CardTitle>
                <CardDescription>{t('Integration status and coverage', 'حالة التكامل والتغطية')}</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                {t('Sync All', 'مزامنة الكل')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataSources.map((source) => (
                <div 
                  key={source.id}
                  className={cn(
                    "p-4 rounded-xl border border-border/60 hover:border-accent/30 transition-all",
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className={cn(
                        "p-2 rounded-lg",
                        source.status === 'connected' ? 'bg-success/10' : 
                        source.status === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
                      )}>
                        {getTypeIcon(source.type)}
                      </div>
                      <div>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <span className="font-semibold">{source.name}</span>
                          {getStatusIcon(source.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('Last sync:', 'آخر مزامنة:')} {formatTimeAgo(source.lastSync)}
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <div className="text-sm font-medium">{source.recordCount.toLocaleString()} {t('records', 'سجل')}</div>
                      <div className={cn("flex items-center gap-1 text-xs", isRTL && "flex-row-reverse justify-end")}>
                        <span className={cn(
                          source.coverage >= 95 ? 'text-success' : 
                          source.coverage >= 85 ? 'text-warning' : 'text-destructive'
                        )}>
                          {source.coverage}% {t('coverage', 'تغطية')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {source.missingFields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <p className="text-xs text-muted-foreground mb-1.5">{t('Missing fields:', 'الحقول المفقودة:')}</p>
                      <div className={cn("flex flex-wrap gap-1", isRTL && "flex-row-reverse")}>
                        {source.missingFields.map((field, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Quality Issues */}
        <Card>
          <CardHeader className="pb-3">
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div>
                <CardTitle className="text-lg">{t('Data Quality Issues', 'مشاكل جودة البيانات')}</CardTitle>
                <CardDescription>{t('Action required items', 'العناصر التي تتطلب إجراء')}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                {dataQualityIssues.filter(i => i.severity === 'high').length} {t('Critical', 'حرجة')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataQualityIssues.map((issue) => (
                <div 
                  key={issue.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    getSeverityColor(issue.severity),
                    isRTL && "text-right"
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                    <div className="flex-1">
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        {issue.severity === 'high' ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : issue.severity === 'medium' ? (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        ) : (
                          <FileWarning className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-sm">{issue.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        {issue.affectedRecords} {t('affected', 'متأثر')}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 text-xs">
                      {issue.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
