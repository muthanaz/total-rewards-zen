import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TableProperties, 
  Download, 
  FileSpreadsheet,
  Calendar,
  Users,
  Banknote,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const reportTemplates = [
  {
    id: 'claims-summary',
    name: 'Claims Summary Report',
    nameAr: 'تقرير ملخص المطالبات',
    description: 'Monthly breakdown of all claims by category, status, and department',
    icon: FileSpreadsheet,
    format: 'Excel',
    lastGenerated: '2026-01-25',
  },
  {
    id: 'employee-benefits',
    name: 'Employee Benefits Utilization',
    nameAr: 'استخدام مزايا الموظفين',
    description: 'Per-employee benefit usage and remaining allowances',
    icon: Users,
    format: 'Excel',
    lastGenerated: '2026-01-20',
  },
  {
    id: 'budget-variance',
    name: 'Budget Variance Report',
    nameAr: 'تقرير انحراف الميزانية',
    description: 'Actual vs. budgeted spend by benefit category',
    icon: TrendingUp,
    format: 'Excel',
    lastGenerated: '2026-01-15',
  },
  {
    id: 'settlements-export',
    name: 'Settlements Export (Payroll)',
    nameAr: 'تصدير التسويات (الرواتب)',
    description: 'Approved claims formatted for payroll system import',
    icon: Banknote,
    format: 'CSV',
    lastGenerated: '2026-01-27',
  },
  {
    id: 'headcount-report',
    name: 'Headcount & Eligibility',
    nameAr: 'تقرير عدد الموظفين والأهلية',
    description: 'Active employees with benefit eligibility status',
    icon: Users,
    format: 'Excel',
    lastGenerated: '2026-01-10',
  },
];

const scheduledReports = [
  { name: 'Weekly Claims Summary', frequency: 'Every Monday', nextRun: '2026-02-03' },
  { name: 'Monthly Budget Report', frequency: '1st of month', nextRun: '2026-02-01' },
];

export default function ReportsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn('p-6 space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {language === 'ar' ? 'التقارير' : 'Reports'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'ar' 
              ? 'تصدير البيانات التشغيلية بتنسيق Excel/CSV'
              : 'Export operational data in Excel/CSV format'
            }
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Report
        </Button>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Scheduled Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scheduledReports.map((report) => (
              <div 
                key={report.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div>
                  <p className="font-medium text-sm">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.frequency}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Next: {report.nextRun}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TableProperties className="w-4 h-4 text-muted-foreground" />
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportTemplates.map((report) => {
              const Icon = report.icon;

              return (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {language === 'ar' ? report.nameAr : report.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">
                        {report.format}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last: {report.lastGenerated}
                      </p>
                    </div>
                    <Button size="sm" className="gap-1">
                      <Download className="w-3 h-3" />
                      Generate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
