import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  ShieldCheck, Plus, Search, AlertTriangle, CheckCircle, XCircle,
  Settings, Database, Users, FileText, Edit2, Trash2, Eye, Zap, Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', labelAr: 'حرج', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  high: { label: 'High', labelAr: 'عالي', color: 'bg-warning/10 text-warning border-warning/30' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground border-border' },
};

const FIELD_CATEGORIES = {
  identity: { label: 'Identity', icon: Users, fields: ['employee_id', 'emirates_id', 'passport_number'] },
  employment: { label: 'Employment', icon: Building2, fields: ['grade', 'department', 'position', 'employment_date', 'manager_name'] },
  compensation: { label: 'Compensation', icon: FileText, fields: ['monthly_salary', 'annual_bonus'] },
  location: { label: 'Location', icon: Database, fields: ['work_location', 'home_location'] },
};

const SAMPLE_RULES = [
  { id: '1', field: 'employee_id', name: 'Employee ID Required', severity: 'critical', enabled: true, orgs: 'all', violations: 12, description: 'Every employee must have a unique employee ID for HRIS sync' },
  { id: '2', field: 'grade', name: 'Grade Assignment', severity: 'critical', enabled: true, orgs: 'all', violations: 45, description: 'Grade is required for benefit eligibility determination' },
  { id: '3', field: 'department', name: 'Department Classification', severity: 'high', enabled: true, orgs: 'all', violations: 23, description: 'Department is used for cost center allocation and reporting' },
  { id: '4', field: 'employment_date', name: 'Employment Start Date', severity: 'high', enabled: true, orgs: 'all', violations: 8, description: 'Required for gratuity and leave accrual calculations' },
  { id: '5', field: 'monthly_salary', name: 'Salary Information', severity: 'medium', enabled: false, orgs: ['org_1'], violations: 156, description: 'Salary data needed for housing allowance calculations' },
  { id: '6', field: 'work_location', name: 'Work Location', severity: 'low', enabled: true, orgs: 'all', violations: 34, description: 'Used for regional benefit eligibility and transport allowance' },
];

const SAMPLE_VIOLATIONS = [
  { id: '1', employee: 'Ahmed Al-Rashid', org: 'Acme Corp', field: 'grade', rule: 'Grade Assignment', created_at: '2025-01-19', source: 'HRIS Sync' },
  { id: '2', employee: 'Sarah Johnson', org: 'TechStart Inc', field: 'employee_id', rule: 'Employee ID Required', created_at: '2025-01-18', source: 'Manual Entry' },
  { id: '3', employee: 'Mohammed Hassan', org: 'GlobalBank', field: 'employment_date', rule: 'Employment Start Date', created_at: '2025-01-18', source: 'HRIS Sync' },
  { id: '4', employee: 'Lisa Chen', org: 'Acme Corp', field: 'department', rule: 'Department Classification', created_at: '2025-01-17', source: 'CSV Import' },
];

export default function AdminDataQualityRules() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [rules, setRules] = useState(SAMPLE_RULES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState<typeof SAMPLE_RULES[0] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ['orgs-for-rules'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.field.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalViolations = rules.reduce((acc, r) => acc + r.violations, 0);
  const criticalViolations = rules.filter(r => r.severity === 'critical').reduce((acc, r) => acc + r.violations, 0);

  const metrics = [
    { title: t('Active Rules', 'القواعد النشطة'), value: rules.filter(r => r.enabled).length, icon: ShieldCheck },
    { title: t('Total Violations', 'إجمالي الانتهاكات'), value: totalViolations, icon: AlertTriangle },
    { title: t('Critical Issues', 'المشاكل الحرجة'), value: criticalViolations, icon: XCircle },
    { title: t('Compliance Rate', 'معدل الامتثال'), value: `${Math.max(0, 100 - Math.round((totalViolations / 1000) * 100))}%`, icon: CheckCircle },
  ];

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    toast.success(t('Rule updated', 'تم تحديث القاعدة'));
  };

  const handleEditRule = (rule: typeof SAMPLE_RULES[0]) => {
    setSelectedRule(rule);
    setSheetOpen(true);
  };

  const handleSaveRule = () => {
    toast.success(t('Rule saved successfully', 'تم حفظ القاعدة بنجاح'));
    setSheetOpen(false);
    setSelectedRule(null);
  };

  return (
    <PageLayout
      title={t('Data Quality Rules', 'قواعد جودة البيانات')}
      description={t('Define required fields and validation rules per organization', 'تحديد الحقول المطلوبة وقواعد التحقق لكل منظمة')}
      icon={ShieldCheck}
      iconClassName="from-emerald-500 to-teal-500"
      actions={
        <Button onClick={() => { setSelectedRule(null); setSheetOpen(true); }}>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {t('Rules', 'القواعد')}
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {t('Violations', 'الانتهاكات')} ({totalViolations})
          </TabsTrigger>
          <TabsTrigger value="remediation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {t('Remediation', 'المعالجة')}
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Database className="w-5 h-5" />
                  {t('Validation Rules', 'قواعد التحقق')}
                </CardTitle>
                <div className="relative">
                  <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                  <Input
                    placeholder={t('Search rules...', 'البحث عن القواعد...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Rule', 'القاعدة')}</TableHead>
                    <TableHead>{t('Field', 'الحقل')}</TableHead>
                    <TableHead>{t('Severity', 'الخطورة')}</TableHead>
                    <TableHead>{t('Scope', 'النطاق')}</TableHead>
                    <TableHead>{t('Violations', 'الانتهاكات')}</TableHead>
                    <TableHead>{t('Enabled', 'مفعل')}</TableHead>
                    <TableHead>{t('Actions', 'الإجراءات')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => {
                    const severityConfig = SEVERITY_CONFIG[rule.severity as keyof typeof SEVERITY_CONFIG];
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{rule.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">{rule.field}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={severityConfig.color}>
                            {isRTL ? severityConfig.labelAr : severityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.orgs === 'all' ? t('All Orgs', 'جميع المنظمات') : `${(rule.orgs as string[]).length} ${t('orgs', 'منظمات')}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {rule.violations > 0 ? (
                            <Badge variant="destructive">{rule.violations}</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                              <Edit2 className="w-4 h-4" />
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
        <TabsContent value="violations">
          <Card>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="w-5 h-5 text-warning" />
                {t('Recent Violations', 'الانتهاكات الأخيرة')}
              </CardTitle>
              <CardDescription>{t('Records that do not meet data quality requirements', 'السجلات التي لا تستوفي متطلبات جودة البيانات')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Employee', 'الموظف')}</TableHead>
                    <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                    <TableHead>{t('Missing Field', 'الحقل المفقود')}</TableHead>
                    <TableHead>{t('Rule', 'القاعدة')}</TableHead>
                    <TableHead>{t('Source', 'المصدر')}</TableHead>
                    <TableHead>{t('Detected', 'تم الكشف')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SAMPLE_VIOLATIONS.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.employee}</TableCell>
                      <TableCell>{v.org}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">{v.field}</Badge>
                      </TableCell>
                      <TableCell>{v.rule}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.source}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{v.created_at}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Remediation Tab */}
        <TabsContent value="remediation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(FIELD_CATEGORIES).map(([key, category]) => {
              const relatedRules = rules.filter(r => category.fields.includes(r.field));
              const totalIssues = relatedRules.reduce((acc, r) => acc + r.violations, 0);
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <category.icon className="w-5 h-5 text-primary" />
                      {category.label}
                    </CardTitle>
                    <CardDescription>
                      {totalIssues > 0 
                        ? t(`${totalIssues} issues to resolve`, `${totalIssues} مشكلة للحل`)
                        : t('All data complete', 'جميع البيانات مكتملة')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedRules.map((rule) => (
                      <div key={rule.id} className="p-3 rounded-lg border">
                        <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                          <span className="font-medium text-sm">{rule.name}</span>
                          <Badge variant={rule.violations > 0 ? 'destructive' : 'outline'} className={rule.violations === 0 ? 'bg-success/10 text-success' : ''}>
                            {rule.violations} {t('issues', 'مشاكل')}
                          </Badge>
                        </div>
                        {rule.violations > 0 && (
                          <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">{t('Remediation:', 'المعالجة:')}</p>
                            <p>{t(`Update missing ${rule.field} values via HRIS sync or manual entry in bulk import.`, `تحديث قيم ${rule.field} المفقودة عبر مزامنة HRIS أو الإدخال اليدوي في الاستيراد المجمع.`)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Editor Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedRule ? t('Edit Rule', 'تعديل القاعدة') : t('New Rule', 'قاعدة جديدة')}</SheetTitle>
            <SheetDescription>{t('Define data validation requirements', 'تحديد متطلبات التحقق من البيانات')}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t('Rule Name', 'اسم القاعدة')}</Label>
              <Input defaultValue={selectedRule?.name || ''} placeholder={t('e.g., Employee ID Required', 'مثال: معرف الموظف مطلوب')} />
            </div>
            <div className="space-y-2">
              <Label>{t('Field', 'الحقل')}</Label>
              <Select defaultValue={selectedRule?.field || ''}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select field', 'اختر الحقل')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FIELD_CATEGORIES).flatMap(c => c.fields).map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Severity', 'الخطورة')}</Label>
              <Select defaultValue={selectedRule?.severity || 'medium'}>
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
            <div className="space-y-2">
              <Label>{t('Apply To', 'تطبيق على')}</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
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
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button onClick={handleSaveRule}>{t('Save Rule', 'حفظ القاعدة')}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
