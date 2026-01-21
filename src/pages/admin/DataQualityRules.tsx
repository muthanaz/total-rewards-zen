import { useState } from 'react';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  ShieldCheck, Plus, Search, AlertTriangle, CheckCircle, XCircle,
  Settings, Database, Users, FileText, Edit2, Eye, Zap, Building2,
  Download, Ban, FileCheck, Play, Clock, UserPlus, BellOff, Loader2, History
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning/10 text-warning border-warning/30' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-primary/10 text-primary border-primary/30' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground border-border' },
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  acknowledged: { label: 'Acknowledged', color: 'bg-warning/10 text-warning border-warning/30' },
  snoozed: { label: 'Snoozed', color: 'bg-muted text-muted-foreground border-border' },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success border-success/30' },
};

const ENTITY_TYPES = [
  { id: 'employee', label: 'Employee', icon: Users },
  { id: 'claim', label: 'Claim', icon: FileText },
  { id: 'vendor', label: 'Vendor', icon: Building2 },
  { id: 'offer', label: 'Offer', icon: Zap },
];

const CONDITION_TEMPLATES = [
  { id: 'missing_field', label: 'Missing field', template: '${field} IS NULL' },
  { id: 'invalid_value', label: 'Invalid value', template: '${field} <= 0' },
  { id: 'exceeds_cap', label: 'Exceeds cap', template: '${field} > ${cap}' },
  { id: 'duplicate', label: 'Duplicate check', template: 'DUPLICATE(${field})' },
  { id: 'policy_limit', label: 'Exceeds policy limit', template: '${field} > policy.${limit_field}' },
  { id: 'missing_docs', label: 'Missing required docs', template: 'kyb_docs.count < required_count' },
];

const DEFAULT_RULES = [
  { id: '1', name: 'Missing Grade', entity: 'employee', field: 'grade', severity: 'critical', condition: 'grade IS NULL', enabled: true, scope: 'global', lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 2), triggerCount30d: 45, owner: 'HR Ops', notifications: true, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), editedBy: 'Admin' },
  { id: '2', name: 'Invalid Salary', entity: 'employee', field: 'salary', severity: 'critical', condition: 'monthly_salary <= 0', enabled: true, scope: 'global', lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24), triggerCount30d: 12, owner: 'Payroll', notifications: true, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), editedBy: 'System' },
  { id: '3', name: 'Allowance Exceeds Cap', entity: 'employee', field: 'allowances', severity: 'high', condition: 'housing_allowance > grade.housing_cap', enabled: true, scope: 'global', lastTriggered: new Date(Date.now() - 1000 * 60 * 30), triggerCount30d: 28, owner: 'Finance', notifications: false, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), editedBy: 'Finance Admin' },
  { id: '4', name: 'Duplicate Employee ID', entity: 'employee', field: 'employee_id', severity: 'critical', condition: 'DUPLICATE(employee_id)', enabled: true, scope: 'global', lastTriggered: null, triggerCount30d: 3, owner: 'HR Ops', notifications: true, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), editedBy: 'System' },
  { id: '5', name: 'Claim Exceeds Policy Limit', entity: 'claim', field: 'amount', severity: 'high', condition: 'amount > policy.annual_limit', enabled: true, scope: 'global', lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 5), triggerCount30d: 67, owner: 'Claims', notifications: true, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), editedBy: 'Claims Manager' },
  { id: '6', name: 'Vendor KYB Incomplete', entity: 'vendor', field: 'kyb_status', severity: 'medium', condition: 'kyb_docs.count < 6', enabled: true, scope: 'global', lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 12), triggerCount30d: 15, owner: 'Vendor Ops', notifications: false, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), editedBy: 'Vendor Admin' },
  { id: '7', name: 'Offer Missing Terms', entity: 'offer', field: 'terms', severity: 'medium', condition: 'terms IS NULL OR length(terms) < 20', enabled: false, scope: 'connector:csv_sftp', lastTriggered: null, triggerCount30d: 0, owner: 'Marketplace', notifications: false, lastEdited: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), editedBy: 'System' },
];

const SAMPLE_VIOLATIONS = [
  { id: '1', ruleId: '1', rule: 'Missing Grade', entity: 'employee', recordId: 'EMP-2345', recordName: 'Ahmed Al-Rashid', org: 'Acme Corp', scope: 'global', field: 'grade', value: null, detectedAt: new Date(Date.now() - 1000 * 60 * 30), source: 'HRIS Sync', status: 'open', owner: 'HR Ops', affectedRecords: 23, sla: '4h', slaDue: new Date(Date.now() + 1000 * 60 * 60 * 3) },
  { id: '2', ruleId: '2', rule: 'Invalid Salary', entity: 'employee', recordId: 'EMP-5678', recordName: 'Sarah Johnson', org: 'TechStart Inc', scope: 'global', field: 'salary', value: '-500', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), source: 'CSV Import', status: 'open', owner: 'Payroll', affectedRecords: 5, sla: '2h', slaDue: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '3', ruleId: '5', rule: 'Claim Exceeds Policy Limit', entity: 'claim', recordId: 'CLM-9012', recordName: 'Mohammed Hassan', org: 'GlobalBank', scope: 'global', field: 'amount', value: 'AED 15,000 (limit: 10,000)', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), source: 'Manual Entry', status: 'acknowledged', owner: 'Claims', affectedRecords: 12, sla: '8h', slaDue: new Date(Date.now() + 1000 * 60 * 60 * 2) },
  { id: '4', ruleId: '3', rule: 'Allowance Exceeds Cap', entity: 'employee', recordId: 'EMP-3456', recordName: 'Lisa Chen', org: 'RetailMax', scope: 'global', field: 'housing_allowance', value: 'AED 8,000 (cap: 5,000)', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), source: 'Payroll Sync', status: 'snoozed', owner: 'Finance', affectedRecords: 8, sla: '24h', slaDue: new Date(Date.now() + 1000 * 60 * 60 * 20) },
  { id: '5', ruleId: '6', rule: 'Vendor KYB Incomplete', entity: 'vendor', recordId: 'VND-789', recordName: 'TravelWise Agency', org: '—', scope: 'global', field: 'kyb_docs', value: '2/6 docs', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), source: 'Onboarding', status: 'open', owner: 'Vendor Ops', affectedRecords: 1, sla: '48h', slaDue: new Date(Date.now() + 1000 * 60 * 60 * 36) },
];

const SAMPLE_IMPACTED_ROWS = [
  { id: 'EMP-2345', name: 'Ahmed Al-Rashid', department: 'Engineering', field: 'grade', currentValue: 'NULL', expectedValue: 'G4-G7' },
  { id: 'EMP-2346', name: 'Fatima Hassan', department: 'Sales', field: 'grade', currentValue: 'NULL', expectedValue: 'G3-G6' },
  { id: 'EMP-2347', name: 'John Smith', department: 'Marketing', field: 'grade', currentValue: 'NULL', expectedValue: 'G5-G8' },
  { id: 'EMP-2348', name: 'Maria Garcia', department: 'HR', field: 'grade', currentValue: 'NULL', expectedValue: 'G4-G7' },
  { id: 'EMP-2349', name: 'Omar Al-Rashid', department: 'Finance', field: 'grade', currentValue: 'NULL', expectedValue: 'G6-G9' },
];

interface DataQualityRule {
  id: string;
  name: string;
  entity: string;
  field: string;
  severity: string;
  condition: string;
  enabled: boolean;
  scope: string;
  lastTriggered: Date | null;
  triggerCount30d: number;
  owner: string;
  notifications: boolean;
  lastEdited: Date;
  editedBy: string;
}

export default function AdminDataQualityRules() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;
  const { createAuditLog } = useAdminAuditLog();

  const [rules, setRules] = useState<DataQualityRule[]>(DEFAULT_RULES);
  const [violations, setViolations] = useState(SAMPLE_VIOLATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('rules');
  const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DataQualityRule | null>(null);
  const [violationDetailOpen, setViolationDetailOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<typeof SAMPLE_VIOLATIONS[0] | null>(null);
  const [impactedRowsOpen, setImpactedRowsOpen] = useState(false);
  const [suppressReason, setSuppressReason] = useState('');
  const [testingRule, setTestingRule] = useState(false);
  const [testResults, setTestResults] = useState<{ count: number; sample: string[] } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [newRule, setNewRule] = useState({
    name: '',
    entity: 'employee',
    field: '',
    severity: 'medium',
    condition: '',
    scope: 'global',
    owner: '',
    notifications: true,
  });

  const filteredRules = rules.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'all' || r.entity === entityFilter;
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    return matchesSearch && matchesEntity && matchesSeverity;
  });

  const filteredViolations = violations.filter(v => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesEntity = entityFilter === 'all' || v.entity === entityFilter;
    const matchesSeverity = severityFilter === 'all' || rules.find(r => r.name === v.rule)?.severity === severityFilter;
    return matchesStatus && matchesEntity && matchesSeverity;
  });

  const openViolations = violations.filter(v => v.status === 'open');
  const criticalViolations = violations.filter(v => {
    const rule = rules.find(r => r.name === v.rule);
    return rule?.severity === 'critical' && v.status === 'open';
  }).length;

  const metrics = [
    { title: t('Active Rules', 'القواعد النشطة'), value: rules.filter(r => r.enabled).length, icon: ShieldCheck },
    { title: t('Open Violations', 'الانتهاكات المفتوحة'), value: openViolations.length, icon: AlertTriangle },
    { title: t('Critical Issues', 'المشاكل الحرجة'), value: criticalViolations, icon: XCircle },
    { title: t('Triggers (30d)', 'التنبيهات (30 يوم)'), value: rules.reduce((acc, r) => acc + r.triggerCount30d, 0), icon: Zap },
  ];

  const handleToggleRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: ruleId,
      metadata: { setting_type: 'data_quality_rule', action: 'rule_toggled', rule_name: rule.name, new_enabled: !rule.enabled },
    });

    toast.success(t(`Rule ${!rule.enabled ? 'enabled' : 'disabled'}`, `تم ${!rule.enabled ? 'تفعيل' : 'تعطيل'} القاعدة`));
  };

  const handleTestRule = async () => {
    setTestingRule(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestResults({
      count: Math.floor(Math.random() * 50) + 5,
      sample: ['EMP-1234 (Engineering)', 'EMP-5678 (Sales)', 'EMP-9012 (HR)'],
    });
    setTestingRule(false);
  };

  const handleSaveRule = async () => {
    const ruleToSave: DataQualityRule = {
      id: selectedRule?.id || Date.now().toString(),
      ...newRule,
      enabled: true,
      lastTriggered: null,
      triggerCount30d: 0,
      lastEdited: new Date(),
      editedBy: 'Admin',
    };

    if (selectedRule) {
      setRules(prev => prev.map(r => r.id === selectedRule.id ? ruleToSave : r));
    } else {
      setRules(prev => [...prev, ruleToSave]);
    }

    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: ruleToSave.id,
      metadata: { setting_type: 'data_quality_rule', action: selectedRule ? 'rule_updated' : 'rule_created', rule_name: ruleToSave.name },
    });

    toast.success(t(selectedRule ? 'Rule updated' : 'Rule created', selectedRule ? 'تم تحديث القاعدة' : 'تم إنشاء القاعدة'));
    setRuleBuilderOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewRule({ name: '', entity: 'employee', field: '', severity: 'medium', condition: '', scope: 'global', owner: '', notifications: true });
    setSelectedRule(null);
    setTestResults(null);
  };

  const handleEditRule = (rule: DataQualityRule) => {
    setSelectedRule(rule);
    setNewRule({
      name: rule.name,
      entity: rule.entity,
      field: rule.field,
      severity: rule.severity,
      condition: rule.condition,
      scope: rule.scope,
      owner: rule.owner,
      notifications: rule.notifications,
    });
    setRuleBuilderOpen(true);
  };

  const handleViewViolation = (violation: typeof SAMPLE_VIOLATIONS[0]) => {
    setSelectedViolation(violation);
    setViolationDetailOpen(true);
  };

  const handleViewImpactedRows = () => {
    setViolationDetailOpen(false);
    setImpactedRowsOpen(true);
  };

  const handleAssignOwner = async (owner: string) => {
    if (!selectedViolation) return;
    setViolations(prev => prev.map(v => v.id === selectedViolation.id ? { ...v, owner } : v));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: selectedViolation.id,
      metadata: { setting_type: 'violation', action: 'owner_assigned', new_owner: owner },
    });
    toast.success(t(`Assigned to ${owner}`, `تم التعيين إلى ${owner}`));
  };

  const handleSnoozeViolation = async () => {
    if (!selectedViolation) return;
    setViolations(prev => prev.map(v => v.id === selectedViolation.id ? { ...v, status: 'snoozed' } : v));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: selectedViolation.id,
      metadata: { setting_type: 'violation', action: 'snoozed' },
    });
    toast.success(t('Violation snoozed for 24h', 'تم تأجيل الانتهاك لمدة 24 ساعة'));
    setViolationDetailOpen(false);
  };

  const handleSuppressViolation = async () => {
    if (!selectedViolation || !suppressReason) return;
    setViolations(prev => prev.map(v => v.id === selectedViolation.id ? { ...v, status: 'resolved' } : v));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: selectedViolation.id,
      metadata: { setting_type: 'violation', action: 'suppressed', reason: suppressReason },
    });
    toast.success(t('Violation suppressed', 'تم تجاهل الانتهاك'));
    setViolationDetailOpen(false);
    setSuppressReason('');
  };

  const handleMarkResolved = async () => {
    if (!selectedViolation) return;
    setViolations(prev => prev.filter(v => v.id !== selectedViolation.id));
    await createAuditLog({
      action: 'SETTINGS_UPDATE',
      entityType: 'settings',
      entityId: selectedViolation.id,
      metadata: { setting_type: 'violation', action: 'resolved' },
    });
    toast.success(t('Marked as resolved', 'تم تحديده كمحلول'));
    setViolationDetailOpen(false);
  };

  const handleExportViolations = () => {
    const csv = [
      ['Rule', 'Entity', 'Record ID', 'Organization', 'Severity', 'Affected Records', 'Detected At', 'Owner', 'Status'].join(','),
      ...violations.map(v => {
        const rule = rules.find(r => r.name === v.rule);
        return [v.rule, v.entity, v.recordId, v.org, rule?.severity || '', v.affectedRecords, format(v.detectedAt, 'yyyy-MM-dd HH:mm'), v.owner, v.status].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_quality_violations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success(t('Export downloaded', 'تم تنزيل التصدير'));
  };

  return (
    <PageLayout
      title={t('Data Quality Rules', 'قواعد جودة البيانات')}
      description={t('Define and monitor data validation rules across all entities', 'تحديد ومراقبة قواعد التحقق من البيانات')}
      icon={ShieldCheck}
      iconClassName="from-emerald-500 to-teal-500"
      actions={
        <Button onClick={() => { resetForm(); setRuleBuilderOpen(true); }}>
          <Plus className="w-4 h-4 me-2" />
          {t('Add Rule', 'إضافة قاعدة')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('Rules', 'القواعد')} ({rules.length})
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('Violations', 'الانتهاكات')} ({openViolations.length})
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader>
              <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Database className="w-5 h-5" />
                  {t('Validation Rules', 'قواعد التحقق')}
                </CardTitle>
                <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
                  <div className="relative">
                    <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                    <Input
                      placeholder={t('Search rules...', 'البحث عن القواعد...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cn("w-48", isRTL ? "pr-9" : "pl-9")}
                    />
                  </div>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('Entity', 'الكيان')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                      {ENTITY_TYPES.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder={t('Severity', 'الخطورة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All', 'الكل')}</SelectItem>
                      {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Rule', 'القاعدة')}</TableHead>
                    <TableHead>{t('Entity', 'الكيان')}</TableHead>
                    <TableHead>{t('Severity', 'الخطورة')}</TableHead>
                    <TableHead>{t('Scope', 'النطاق')}</TableHead>
                    <TableHead>{t('Last Triggered', 'آخر تفعيل')}</TableHead>
                    <TableHead>{t('Triggers (30d)', '(30 يوم)')}</TableHead>
                    <TableHead>{t('Owner', 'المسؤول')}</TableHead>
                    <TableHead>{t('Enabled', 'مفعل')}</TableHead>
                    <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => {
                    const severityConfig = SEVERITY_CONFIG[rule.severity as keyof typeof SEVERITY_CONFIG];
                    const EntityIcon = ENTITY_TYPES.find(e => e.id === rule.entity)?.icon || Users;
                    
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{rule.condition}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <EntityIcon className="w-3 h-3" />
                            {rule.entity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={severityConfig.color}>
                            {severityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {rule.scope === 'global' ? t('Global', 'عام') : rule.scope}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {rule.lastTriggered 
                            ? format(rule.lastTriggered, 'MMM d, HH:mm')
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell>
                          {rule.triggerCount30d > 0 ? (
                            <Badge variant={rule.triggerCount30d > 20 ? 'destructive' : 'secondary'}>
                              {rule.triggerCount30d}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{rule.owner}</TableCell>
                        <TableCell>
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)} title={t('Edit', 'تعديل')}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)} title={t('History', 'السجل')}>
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="mt-4">
          <Card>
            <CardHeader>
              <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  {t('Data Quality Violations', 'انتهاكات جودة البيانات')}
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder={t('Status', 'الحالة')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('All Status', 'جميع الحالات')}</SelectItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleExportViolations}>
                    <Download className="w-4 h-4 me-2" />
                    {t('Export', 'تصدير')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredViolations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success" />
                  <p className="font-medium">{t('No violations found', 'لا توجد انتهاكات')}</p>
                  <p className="text-sm mt-1">{t('All data quality checks passed', 'جميع فحوصات جودة البيانات ناجحة')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Rule', 'القاعدة')}</TableHead>
                      <TableHead>{t('Entity', 'الكيان')}</TableHead>
                      <TableHead>{t('Org / Scope', 'المنظمة')}</TableHead>
                      <TableHead>{t('Severity', 'الخطورة')}</TableHead>
                      <TableHead>{t('Affected', 'المتأثرين')}</TableHead>
                      <TableHead>{t('Detected', 'تم الكشف')}</TableHead>
                      <TableHead>{t('Owner', 'المسؤول')}</TableHead>
                      <TableHead>{t('SLA', 'SLA')}</TableHead>
                      <TableHead>{t('Status', 'الحالة')}</TableHead>
                      <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.map((v) => {
                      const rule = rules.find(r => r.name === v.rule);
                      const severityConfig = SEVERITY_CONFIG[rule?.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.medium;
                      const statusConfig = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
                      const isOverdue = v.slaDue < new Date() && v.status === 'open';
                      
                      return (
                        <TableRow key={v.id} className={cn(v.status !== 'open' && 'opacity-60', isOverdue && 'bg-destructive/5')}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", severityConfig.color.replace('border-', 'bg-').replace('/30', ''))} />
                              <span className="font-medium text-sm">{v.rule}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{v.entity}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{v.org}</p>
                              <p className="text-xs text-muted-foreground">{v.scope}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={severityConfig.color}>
                              {severityConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={v.affectedRecords > 10 ? 'destructive' : 'secondary'}>
                              {v.affectedRecords}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDistanceToNow(v.detectedAt, { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-sm">{v.owner}</TableCell>
                          <TableCell>
                            <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-xs">
                              {isOverdue ? t('Overdue', 'متأخر') : v.sla}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleViewViolation(v)} title={t('View Details', 'عرض التفاصيل')}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Builder Dialog */}
      <Dialog open={ruleBuilderOpen} onOpenChange={(open) => { setRuleBuilderOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRule ? t('Edit Rule', 'تعديل القاعدة') : t('Create Rule', 'إنشاء قاعدة')}</DialogTitle>
            <DialogDescription>{t('Define a data quality validation rule', 'تحديد قاعدة التحقق من جودة البيانات')}</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <div className="space-y-2">
                <Label>{t('Rule Name', 'اسم القاعدة')}</Label>
                <Input 
                  value={newRule.name} 
                  onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('e.g., Missing Grade', 'مثال: درجة مفقودة')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Entity', 'الكيان')}</Label>
                  <Select value={newRule.entity} onValueChange={(v) => setNewRule(prev => ({ ...prev, entity: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          <span className="flex items-center gap-2">
                            <e.icon className="w-4 h-4" />
                            {e.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('Severity', 'الخطورة')}</Label>
                  <Select value={newRule.severity} onValueChange={(v) => setNewRule(prev => ({ ...prev, severity: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('Field', 'الحقل')}</Label>
                <Input 
                  value={newRule.field} 
                  onChange={(e) => setNewRule(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="e.g., grade, salary, amount"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('Condition', 'الشرط')}</Label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {CONDITION_TEMPLATES.map(ct => (
                    <Button 
                      key={ct.id} 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setNewRule(prev => ({ ...prev, condition: ct.template.replace('${field}', prev.field || 'field') }))}
                    >
                      {ct.label}
                    </Button>
                  ))}
                </div>
                <Textarea 
                  value={newRule.condition} 
                  onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., grade IS NULL"
                  rows={2}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('Scope', 'النطاق')}</Label>
                  <Select value={newRule.scope} onValueChange={(v) => setNewRule(prev => ({ ...prev, scope: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">{t('Global', 'عام')}</SelectItem>
                      <SelectItem value="org:acme">{t('Acme Corp only', 'Acme Corp فقط')}</SelectItem>
                      <SelectItem value="connector:csv_sftp">{t('CSV/SFTP only', 'CSV/SFTP فقط')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('Owner', 'المسؤول')}</Label>
                  <Input 
                    value={newRule.owner} 
                    onChange={(e) => setNewRule(prev => ({ ...prev, owner: e.target.value }))}
                    placeholder="e.g., HR Ops"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{t('Enable notifications', 'تفعيل الإشعارات')}</span>
                </div>
                <Switch 
                  checked={newRule.notifications} 
                  onCheckedChange={(v) => setNewRule(prev => ({ ...prev, notifications: v }))} 
                />
              </div>

              {/* Test Rule Section */}
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('Test Rule', 'اختبار القاعدة')}</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestRule}
                    disabled={!newRule.condition || testingRule}
                  >
                    {testingRule ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Play className="w-4 h-4 me-2" />}
                    {t('Preview Matches', 'معاينة النتائج')}
                  </Button>
                </div>
                {testResults && (
                  <Alert className="border-primary/30 bg-primary/5">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      <p className="font-medium">{testResults.count} {t('records would be affected', 'سجل سيتأثر')}</p>
                      <p className="text-xs mt-1 text-muted-foreground">{t('Sample:', 'عينة:')} {testResults.sample.join(', ')}</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Rule History */}
              {selectedRule && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {t('Rule History', 'سجل القاعدة')}
                    </Label>
                    <div className="text-xs text-muted-foreground space-y-1 p-3 rounded bg-muted/50">
                      <p>{t('Last edited:', 'آخر تعديل:')} {format(selectedRule.lastEdited, 'MMM d, yyyy HH:mm')}</p>
                      <p>{t('Edited by:', 'بواسطة:')} {selectedRule.editedBy}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleBuilderOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button onClick={handleSaveRule} disabled={!newRule.name || !newRule.condition}>
              <CheckCircle className="w-4 h-4 me-2" />
              {t('Save Rule', 'حفظ القاعدة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Violation Detail Sheet */}
      <Sheet open={violationDetailOpen} onOpenChange={setViolationDetailOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('Violation Details', 'تفاصيل الانتهاك')}</SheetTitle>
            <SheetDescription>{selectedViolation?.rule}</SheetDescription>
          </SheetHeader>

          {selectedViolation && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Record', 'السجل')}</span>
                    <span className="font-medium">{selectedViolation.recordName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('ID', 'المعرف')}</span>
                    <span className="font-mono text-sm">{selectedViolation.recordId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Organization', 'المنظمة')}</span>
                    <span>{selectedViolation.org}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Field', 'الحقل')}</span>
                    <span className="font-mono text-sm">{selectedViolation.field}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Value', 'القيمة')}</span>
                    <span className="font-mono text-sm text-destructive">{selectedViolation.value || 'NULL'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Affected Records', 'السجلات المتأثرة')}</span>
                    <Badge variant="destructive">{selectedViolation.affectedRecords}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('Source', 'المصدر')}</span>
                    <Badge variant="secondary">{selectedViolation.source}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Resolution */}
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t('Recommended Resolution', 'الحل الموصى به')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{t('Update the grade field in the source HRIS system or manually correct via CSV import.', 'تحديث حقل الدرجة في نظام HRIS المصدر أو التصحيح يدوياً عبر استيراد CSV.')}</p>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full" onClick={handleViewImpactedRows}>
                <Eye className="w-4 h-4 me-2" />
                {t('View Impacted Records', 'عرض السجلات المتأثرة')}
              </Button>

              <Separator />

              {/* Assign Owner */}
              <div className="space-y-2">
                <Label>{t('Assign Owner', 'تعيين المسؤول')}</Label>
                <Select defaultValue={selectedViolation.owner} onValueChange={handleAssignOwner}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR Ops">HR Ops</SelectItem>
                    <SelectItem value="Payroll">Payroll</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Claims">Claims</SelectItem>
                    <SelectItem value="Vendor Ops">Vendor Ops</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Suppress Reason */}
              <div className="space-y-2">
                <Label>{t('Suppression Reason (if suppressing)', 'سبب التجاهل')}</Label>
                <Textarea
                  value={suppressReason}
                  onChange={(e) => setSuppressReason(e.target.value)}
                  placeholder={t('e.g., False positive - legacy data...', 'مثال: إيجابي كاذب - بيانات قديمة...')}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={handleMarkResolved}>
                  <FileCheck className="w-4 h-4 me-2" />
                  {t('Mark Resolved', 'تحديد كمحلول')}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleSnoozeViolation}>
                  <BellOff className="w-4 h-4 me-2" />
                  {t('Snooze 24h', 'تأجيل 24 ساعة')}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleSuppressViolation} disabled={!suppressReason}>
                  <Ban className="w-4 h-4 me-2" />
                  {t('Suppress (False Positive)', 'تجاهل (إيجابي كاذب)')}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Impacted Records Drawer */}
      <Sheet open={impactedRowsOpen} onOpenChange={setImpactedRowsOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('Impacted Records', 'السجلات المتأثرة')}</SheetTitle>
            <SheetDescription>{selectedViolation?.rule} - {selectedViolation?.affectedRecords} {t('records', 'سجلات')}</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <Alert className="mb-4 border-primary/30 bg-primary/5">
              <Zap className="w-4 h-4" />
              <AlertDescription>
                <p className="font-medium">{t('Recommended Fix', 'الإصلاح الموصى به')}</p>
                <p className="text-sm mt-1">{t('Update the grade field for these employees in the source HRIS or via data import.', 'تحديث حقل الدرجة لهؤلاء الموظفين في HRIS المصدر أو عبر استيراد البيانات.')}</p>
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Record ID', 'المعرف')}</TableHead>
                  <TableHead>{t('Name', 'الاسم')}</TableHead>
                  <TableHead>{t('Department', 'القسم')}</TableHead>
                  <TableHead>{t('Field', 'الحقل')}</TableHead>
                  <TableHead>{t('Current Value', 'القيمة الحالية')}</TableHead>
                  <TableHead>{t('Expected', 'المتوقع')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_IMPACTED_ROWS.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="font-mono text-sm">{row.field}</TableCell>
                    <TableCell className="text-destructive font-mono">{row.currentValue}</TableCell>
                    <TableCell className="text-success font-mono">{row.expectedValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setImpactedRowsOpen(false)}>{t('Close', 'إغلاق')}</Button>
            <Button onClick={() => { toast.success(t('Export started', 'بدأ التصدير')); }}>
              <Download className="w-4 h-4 me-2" />
              {t('Export Records', 'تصدير السجلات')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
