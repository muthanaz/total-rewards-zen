import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Download,
  FileText,
  Calendar,
  User,
  ChevronRight,
  Lock,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const complianceItems = [
  { 
    id: 1, 
    name: 'Data Privacy Policy', 
    category: 'Privacy', 
    status: 'compliant', 
    lastReview: '2024-01-15', 
    nextReview: '2025-01-15',
    owner: 'HR Department'
  },
  { 
    id: 2, 
    name: 'Benefits Eligibility Rules', 
    category: 'Policy', 
    status: 'compliant', 
    lastReview: '2024-02-01', 
    nextReview: '2024-08-01',
    owner: 'Compensation Team'
  },
  { 
    id: 3, 
    name: 'GDPR Compliance', 
    category: 'Privacy', 
    status: 'review_needed', 
    lastReview: '2023-06-15', 
    nextReview: '2024-06-15',
    owner: 'Legal'
  },
  { 
    id: 4, 
    name: 'Labor Law Compliance', 
    category: 'Regulatory', 
    status: 'compliant', 
    lastReview: '2024-03-01', 
    nextReview: '2025-03-01',
    owner: 'Legal'
  },
  { 
    id: 5, 
    name: 'Health Insurance Regulations', 
    category: 'Regulatory', 
    status: 'action_required', 
    lastReview: '2024-01-10', 
    nextReview: '2024-07-10',
    owner: 'Benefits Team'
  },
  { 
    id: 6, 
    name: 'Employee Consent Forms', 
    category: 'Privacy', 
    status: 'compliant', 
    lastReview: '2024-02-20', 
    nextReview: '2025-02-20',
    owner: 'HR Department'
  },
];

const auditLogs = [
  { id: 1, action: 'Policy Updated', resource: 'Housing Allowance Policy', user: 'Ahmed Hassan', timestamp: '2024-08-15 14:32', type: 'update' },
  { id: 2, action: 'Access Granted', resource: 'Salary Data Export', user: 'Sara Ali', timestamp: '2024-08-15 11:20', type: 'access' },
  { id: 3, action: 'Report Generated', resource: 'Q2 Benefits Report', user: 'Mohammed Khan', timestamp: '2024-08-14 16:45', type: 'export' },
  { id: 4, action: 'Setting Changed', resource: 'Auto-approval Threshold', user: 'Fatima Omar', timestamp: '2024-08-14 10:15', type: 'setting' },
  { id: 5, action: 'User Deactivated', resource: 'John Smith Account', user: 'Ahmed Hassan', timestamp: '2024-08-13 09:30', type: 'user' },
  { id: 6, action: 'Bulk Approval', resource: '15 Claims Approved', user: 'Sara Ali', timestamp: '2024-08-12 15:00', type: 'approval' },
];

const regulatoryRequirements = [
  { id: 1, name: 'UAE Labor Law Article 29', status: 'compliant', deadline: null, description: 'End of service benefits calculation' },
  { id: 2, name: 'DHA Health Insurance', status: 'compliant', deadline: null, description: 'Minimum coverage requirements' },
  { id: 3, name: 'WPS Compliance', status: 'compliant', deadline: null, description: 'Wage protection system adherence' },
  { id: 4, name: 'MOHRE Regulations', status: 'pending', deadline: '2024-09-30', description: 'New remote work policy requirements' },
];

export default function ComplianceAuditPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [selectedTab, setSelectedTab] = useState('compliance');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'compliant':
        return { label: 'Compliant', labelAr: 'متوافق', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'review_needed':
        return { label: 'Review Needed', labelAr: 'يحتاج مراجعة', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'action_required':
        return { label: 'Action Required', labelAr: 'إجراء مطلوب', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'pending':
        return { label: 'Pending', labelAr: 'قيد الانتظار', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      default:
        return { label: status, labelAr: status, icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
    }
  };

  const compliantCount = complianceItems.filter(i => i.status === 'compliant').length;
  const reviewCount = complianceItems.filter(i => i.status === 'review_needed').length;
  const actionCount = complianceItems.filter(i => i.status === 'action_required').length;
  const complianceRate = ((compliantCount / complianceItems.length) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        isRTL && "sm:flex-row-reverse"
      )}>
        <div className={isRTL ? "text-right" : ""}>
          <h1 className="text-2xl font-display font-bold tracking-tight">
            {isRTL ? "الامتثال والتدقيق" : "Compliance & Audit"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? "تتبع الامتثال التنظيمي وسجلات التدقيق"
              : "Track regulatory compliance and audit trails"
            }
          </p>
        </div>
        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Button variant="outline">
            <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
            {isRTL ? "تصدير التقرير" : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-5">
              <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "معدل الامتثال" : "Compliance Rate"}
                </span>
              </div>
              <div className="text-3xl font-bold text-primary">{complianceRate}%</div>
              <Progress value={Number(complianceRate)} className="h-2 mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-emerald-500/20">
            <CardContent className="p-5">
              <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "متوافق" : "Compliant"}
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-600">{compliantCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{isRTL ? "عنصر" : "items"}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-amber-500/20">
            <CardContent className="p-5">
              <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "يحتاج مراجعة" : "Review Needed"}
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-600">{reviewCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{isRTL ? "عنصر" : "items"}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-red-500/20">
            <CardContent className="p-5">
              <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  {isRTL ? "إجراء مطلوب" : "Action Required"}
                </span>
              </div>
              <div className="text-3xl font-bold text-red-600">{actionCount}</div>
              <p className="text-xs text-muted-foreground mt-1">{isRTL ? "عنصر" : "items"}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="compliance">
            <Shield className="w-4 h-4 mr-2" />
            {isRTL ? "قائمة الامتثال" : "Compliance Checklist"}
          </TabsTrigger>
          <TabsTrigger value="regulatory">
            <FileText className="w-4 h-4 mr-2" />
            {isRTL ? "المتطلبات التنظيمية" : "Regulatory Requirements"}
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Eye className="w-4 h-4 mr-2" />
            {isRTL ? "سجل التدقيق" : "Audit Trail"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-4">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "العنصر" : "Item"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "الفئة" : "Category"}
                      </th>
                      <th className={cn("text-center py-3 px-4 text-sm font-medium text-muted-foreground")}>
                        {isRTL ? "الحالة" : "Status"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "آخر مراجعة" : "Last Review"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "المراجعة القادمة" : "Next Review"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "المسؤول" : "Owner"}
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceItems.map((item, index) => {
                      const status = getStatusConfig(item.status);
                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <td className={cn("py-3 px-4 font-medium", isRTL && "text-right")}>
                            {item.name}
                          </td>
                          <td className={cn("py-3 px-4", isRTL && "text-right")}>
                            <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant="outline" className={cn("text-xs", status.bg, status.color, status.border)}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {isRTL ? status.labelAr : status.label}
                            </Badge>
                          </td>
                          <td className={cn("py-3 px-4 text-sm", isRTL && "text-right")}>
                            {item.lastReview}
                          </td>
                          <td className={cn("py-3 px-4 text-sm", isRTL && "text-right")}>
                            {item.nextReview}
                          </td>
                          <td className={cn("py-3 px-4 text-sm text-muted-foreground", isRTL && "text-right")}>
                            {item.owner}
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {regulatoryRequirements.map((req, index) => {
              const status = getStatusConfig(req.status);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn("border", status.border)}>
                    <CardContent className="p-4">
                      <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
                        <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                          <div className={cn("p-2 rounded-lg", status.bg)}>
                            <status.icon className={cn("w-5 h-5", status.color)} />
                          </div>
                          <div className={isRTL ? "text-right" : ""}>
                            <h3 className="font-medium">{req.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                            {req.deadline && (
                              <div className={cn("flex items-center gap-1 mt-2 text-xs", isRTL && "flex-row-reverse")}>
                                <Calendar className="w-3 h-3 text-amber-600" />
                                <span className="text-amber-600 font-medium">
                                  {isRTL ? "الموعد النهائي:" : "Deadline:"} {req.deadline}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("text-xs shrink-0", status.bg, status.color, status.border)}>
                          {isRTL ? status.labelAr : status.label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Lock className="w-5 h-5 text-primary" />
                  {isRTL ? "سجل التدقيق" : "Audit Log"}
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                  {isRTL ? "تصدير" : "Export"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "الإجراء" : "Action"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "المورد" : "Resource"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "المستخدم" : "User"}
                      </th>
                      <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground", isRTL && "text-right")}>
                        {isRTL ? "الوقت" : "Timestamp"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <td className={cn("py-3 px-4", isRTL && "text-right")}>
                          <Badge variant="outline" className="text-xs">{log.action}</Badge>
                        </td>
                        <td className={cn("py-3 px-4 font-medium", isRTL && "text-right")}>
                          {log.resource}
                        </td>
                        <td className={cn("py-3 px-4", isRTL && "text-right")}>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <User className="w-4 h-4 text-muted-foreground" />
                            {log.user}
                          </div>
                        </td>
                        <td className={cn("py-3 px-4 text-sm text-muted-foreground", isRTL && "text-right")}>
                          {log.timestamp}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
