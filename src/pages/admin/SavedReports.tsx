import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileBarChart, 
  Search,
  Plus,
  Download,
  Trash2,
  Calendar,
  Clock,
  Eye,
  Share2,
  MoreVertical,
  FolderOpen,
  Star,
  StarOff,
  Filter,
  Globe,
  Target,
  Wallet,
  Users,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DemoDataGate, DemoModeBadge } from '@/components/shared/DemoDataGate';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SavedReport {
  id: string;
  name: string;
  type: 'benchmark' | 'market' | 'spending' | 'custom';
  description: string;
  createdAt: string;
  lastViewed: string;
  starred: boolean;
  filters: Record<string, string>;
  dataSnapshot: string;
}

// Demo reports (only shown in demo mode)
const DEMO_REPORTS: SavedReport[] = [
  {
    id: '1',
    name: 'Q4 2024 GCC Benchmark Analysis',
    type: 'benchmark',
    description: 'Comprehensive regional benchmark comparison for Q4 2024 across all GCC markets',
    createdAt: '2024-12-15',
    lastViewed: '2025-01-10',
    starred: true,
    filters: { region: 'All GCC', period: 'Q4 2024' },
    dataSnapshot: '47 organizations, 12,847 employees',
  },
  {
    id: '2',
    name: 'High-Intent User Segments - Tech Industry',
    type: 'market',
    description: 'User intent analysis focused on technology sector employees',
    createdAt: '2024-11-20',
    lastViewed: '2025-01-08',
    starred: true,
    filters: { industry: 'Technology', intent: 'High' },
    dataSnapshot: '3,200 high-intent users identified',
  },
  {
    id: '3',
    name: 'Zombie Spend Analysis - December 2024',
    type: 'spending',
    description: 'Monthly underutilized benefits analysis with savings recommendations',
    createdAt: '2025-01-02',
    lastViewed: '2025-01-09',
    starred: false,
    filters: { period: 'Dec 2024', threshold: '<30% utilization' },
    dataSnapshot: 'AED 701K potential savings identified',
  },
  {
    id: '4',
    name: 'Education Benefits Market Opportunity',
    type: 'market',
    description: 'Analysis of education benefit demand and expansion opportunities',
    createdAt: '2024-10-15',
    lastViewed: '2024-12-20',
    starred: false,
    filters: { category: 'Education', segment: 'Working Parents' },
    dataSnapshot: 'AED 2.4M opportunity identified',
  },
  {
    id: '5',
    name: 'Financial Services Industry Deep Dive',
    type: 'benchmark',
    description: 'Detailed benchmark analysis for financial services sector',
    createdAt: '2024-09-10',
    lastViewed: '2024-11-15',
    starred: true,
    filters: { industry: 'Financial Services', region: 'UAE' },
    dataSnapshot: '28 organizations benchmarked',
  },
  {
    id: '6',
    name: 'Custom Executive Dashboard - Board Report',
    type: 'custom',
    description: 'Custom metrics compilation for quarterly board presentation',
    createdAt: '2024-12-01',
    lastViewed: '2025-01-05',
    starred: true,
    filters: { format: 'Executive Summary' },
    dataSnapshot: 'Key KPIs and growth metrics',
  },
];

const reportTypeConfig = {
  benchmark: { icon: Globe, color: 'bg-blue-500/10 text-blue-500', label: 'Benchmark' },
  market: { icon: Target, color: 'bg-purple-500/10 text-purple-500', label: 'Market Intel' },
  spending: { icon: Wallet, color: 'bg-green-500/10 text-green-500', label: 'Spending' },
  custom: { icon: FileBarChart, color: 'bg-orange-500/10 text-orange-500', label: 'Custom' },
};

export default function AdminSavedReports() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { isDemoMode } = useDemoMode();
  
  // Fetch real reports from database
  const { data: realReports = [] } = useQuery({
    queryKey: ['admin_saved_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_saved_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data?.map(r => ({
        id: r.id,
        name: r.report_name,
        type: r.report_type as SavedReport['type'],
        description: '',
        createdAt: r.created_at?.split('T')[0] || '',
        lastViewed: r.updated_at?.split('T')[0] || '',
        starred: false,
        filters: (r.filters as Record<string, string>) || {},
        dataSnapshot: 'Saved report',
      })) || [];
    },
  });
  
  const hasRealReports = realReports.length > 0;
  
  // Use demo reports in demo mode when no real reports exist
  const initialReports = hasRealReports ? realReports : (isDemoMode ? DEMO_REPORTS : []);
  
  const [reports, setReports] = useState<SavedReport[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReportName, setNewReportName] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportType, setNewReportType] = useState<SavedReport['type']>('custom');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const starredReports = filteredReports.filter(r => r.starred);
  const regularReports = filteredReports.filter(r => !r.starred);

  const toggleStar = (id: string) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, starred: !r.starred } : r
    ));
    toast.success(t('Report updated', 'تم تحديث التقرير'));
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast.success(t('Report deleted', 'تم حذف التقرير'));
  };

  const handleCreateReport = () => {
    if (!newReportName.trim()) return;
    
    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: newReportName,
      type: newReportType,
      description: newReportDescription,
      createdAt: new Date().toISOString().split('T')[0],
      lastViewed: new Date().toISOString().split('T')[0],
      starred: false,
      filters: {},
      dataSnapshot: 'New report - no data yet',
    };
    
    setReports([newReport, ...reports]);
    setNewReportName('');
    setNewReportDescription('');
    setShowCreateDialog(false);
    toast.success(t('Report created successfully', 'تم إنشاء التقرير بنجاح'));
  };

  const ReportCard = ({ report }: { report: SavedReport }) => {
    const config = reportTypeConfig[report.type];
    const Icon = config.icon;
    
    return (
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className={cn("flex items-start justify-between mb-4", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
              <div className={cn("p-2 rounded-lg", config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{report.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
              </div>
            </div>
            <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleStar(report.id)}
                className="h-8 w-8"
              >
                {report.starred ? (
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    {t('View Report', 'عرض التقرير')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    {t('Download', 'تحميل')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    {t('Share', 'مشاركة')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => deleteReport(report.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('Delete', 'حذف')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className={cn("flex items-center gap-4 text-sm text-muted-foreground mb-3", isRTL && "flex-row-reverse")}>
            <Badge variant="outline" className={config.color}>
              {config.label}
            </Badge>
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Calendar className="w-3 h-3" />
              {report.createdAt}
            </span>
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Clock className="w-3 h-3" />
              {t('Viewed:', 'آخر عرض:')} {report.lastViewed}
            </span>
          </div>

          <div className={cn("flex items-center justify-between pt-3 border-t", isRTL && "flex-row-reverse")}>
            <div className="text-sm">
              <span className="text-muted-foreground">{t('Snapshot:', 'لقطة:')}</span>{' '}
              <span className="font-medium">{report.dataSnapshot}</span>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              {t('Open', 'فتح')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-8", isRTL && "text-right")}>
      {/* Header */}
      <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between gap-4", isRTL && "md:flex-row-reverse")}>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {t('Saved Reports', 'التقارير المحفوظة')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Access and manage your saved analytics reports and data snapshots', 'الوصول إلى تقارير التحليلات المحفوظة ولقطات البيانات وإدارتها')}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('Create Report', 'إنشاء تقرير')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Create New Report', 'إنشاء تقرير جديد')}</DialogTitle>
              <DialogDescription>
                {t('Save current data view as a report for future reference', 'احفظ عرض البيانات الحالي كتقرير للرجوع إليه في المستقبل')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('Report Name', 'اسم التقرير')}</Label>
                <Input
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder={t('e.g., Q1 2025 Benchmark Analysis', 'مثال: تحليل المعايير للربع الأول 2025')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Report Type', 'نوع التقرير')}</Label>
                <Select value={newReportType} onValueChange={(v: SavedReport['type']) => setNewReportType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benchmark">{t('Benchmark', 'معايير')}</SelectItem>
                    <SelectItem value="market">{t('Market Intelligence', 'ذكاء السوق')}</SelectItem>
                    <SelectItem value="spending">{t('Spending Analysis', 'تحليل الإنفاق')}</SelectItem>
                    <SelectItem value="custom">{t('Custom Report', 'تقرير مخصص')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('Description', 'الوصف')}</Label>
                <Textarea
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  placeholder={t('Brief description of what this report contains...', 'وصف موجز لما يحتويه هذا التقرير...')}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t('Cancel', 'إلغاء')}
              </Button>
              <Button onClick={handleCreateReport} disabled={!newReportName.trim()}>
                {t('Create Report', 'إنشاء التقرير')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={t('Search reports...', 'البحث في التقارير...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(isRTL ? "pr-10" : "pl-10")}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('Filter by type', 'تصفية حسب النوع')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Types', 'جميع الأنواع')}</SelectItem>
                <SelectItem value="benchmark">{t('Benchmark', 'معايير')}</SelectItem>
                <SelectItem value="market">{t('Market Intel', 'ذكاء السوق')}</SelectItem>
                <SelectItem value="spending">{t('Spending', 'إنفاق')}</SelectItem>
                <SelectItem value="custom">{t('Custom', 'مخصص')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Starred Reports */}
      {starredReports.length > 0 && (
        <div className="space-y-4">
          <h2 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            {t('Starred Reports', 'التقارير المميزة')}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {starredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      )}

      {/* All Reports */}
      <div className="space-y-4">
        <h2 className={cn("text-lg font-semibold flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <FolderOpen className="w-5 h-5 text-muted-foreground" />
          {t('All Reports', 'جميع التقارير')} ({regularReports.length})
        </h2>
        {regularReports.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {regularReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileBarChart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg mb-2">{t('No reports found', 'لم يتم العثور على تقارير')}</h3>
              <p className="text-muted-foreground">
                {t('Try adjusting your search or filters', 'حاول تعديل البحث أو الفلاتر')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
