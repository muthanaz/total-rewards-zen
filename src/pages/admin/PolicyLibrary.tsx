import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout, MetricCard, MetricGrid } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, Plus, Search, Edit2, Eye, Clock, CheckCircle, Send,
  BookOpen, AlertTriangle, Copy, Trash2, History, Globe, Building2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  draft: { label: 'Draft', labelAr: 'مسودة', color: 'bg-muted text-muted-foreground border-border', icon: Edit2 },
  review: { label: 'In Review', labelAr: 'قيد المراجعة', color: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  published: { label: 'Published', labelAr: 'منشور', color: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
};

const TEMPLATE_CATEGORIES = ['Policy', 'FAQ', 'Disclaimer', 'Benefit Description', 'Email Template'];

const SAMPLE_TEMPLATES = [
  { id: '1', name: 'Education Benefit Policy', category: 'Policy', status: 'published', version: 3, updated_at: '2025-01-15', published_orgs: 12, content: 'The company provides education support for eligible employees...' },
  { id: '2', name: 'Housing Allowance FAQ', category: 'FAQ', status: 'published', version: 2, updated_at: '2025-01-10', published_orgs: 8, content: 'Q: Who is eligible for housing allowance?\nA: All full-time employees...' },
  { id: '3', name: 'Medical Claim Disclaimer', category: 'Disclaimer', status: 'review', version: 1, updated_at: '2025-01-18', published_orgs: 0, content: 'This benefit is subject to the terms and conditions...' },
  { id: '4', name: 'Transport Benefit Description', category: 'Benefit Description', status: 'draft', version: 1, updated_at: '2025-01-19', published_orgs: 0, content: 'Employees are entitled to a monthly transport allowance...' },
  { id: '5', name: 'Wellness Program Policy', category: 'Policy', status: 'published', version: 4, updated_at: '2025-01-12', published_orgs: 15, content: 'The wellness program includes gym memberships, mental health support...' },
];

const VERSION_HISTORY = [
  { version: 3, status: 'published', author: 'Admin User', date: '2025-01-15', changes: 'Updated eligibility criteria for Grade A employees' },
  { version: 2, status: 'archived', author: 'HR Manager', date: '2024-12-20', changes: 'Added dependent coverage section' },
  { version: 1, status: 'archived', author: 'Admin User', date: '2024-11-10', changes: 'Initial version' },
];

export default function AdminPolicyLibrary() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [templates, setTemplates] = useState(SAMPLE_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof SAMPLE_TEMPLATES[0] | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [historySheetOpen, setHistorySheetOpen] = useState(false);

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ['orgs-for-publish'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('id, name');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const metrics = [
    { title: t('Total Templates', 'إجمالي القوالب'), value: templates.length, icon: FileText },
    { title: t('Published', 'منشور'), value: templates.filter(t => t.status === 'published').length, icon: CheckCircle },
    { title: t('In Review', 'قيد المراجعة'), value: templates.filter(t => t.status === 'review').length, icon: Clock },
    { title: t('Drafts', 'مسودات'), value: templates.filter(t => t.status === 'draft').length, icon: Edit2 },
  ];

  const handleEdit = (template: typeof SAMPLE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setEditorOpen(true);
  };

  const handleSave = (asDraft: boolean) => {
    toast.success(asDraft ? t('Saved as draft', 'تم الحفظ كمسودة') : t('Submitted for review', 'تم التقديم للمراجعة'));
    setEditorOpen(false);
  };

  const handlePublish = () => {
    toast.success(t('Template published successfully', 'تم نشر القالب بنجاح'));
    setPublishDialogOpen(false);
  };

  const handleViewHistory = (template: typeof SAMPLE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setHistorySheetOpen(true);
  };

  return (
    <PageLayout
      title={t('Policy & Content Library', 'مكتبة السياسات والمحتوى')}
      description={t('Manage global policy templates, FAQs, and disclaimers with versioning', 'إدارة قوالب السياسات والأسئلة الشائعة وإخلاء المسؤولية مع التحكم بالإصدارات')}
      icon={BookOpen}
      iconClassName="from-violet-500 to-purple-500"
      actions={
        <Button onClick={() => { setSelectedTemplate(null); setEditorOpen(true); }}>
          <Plus className="w-4 h-4 me-2" />
          {t('New Template', 'قالب جديد')}
        </Button>
      }
    >
      <MetricGrid columns={4}>
        {metrics.map((m) => (
          <MetricCard key={m.title} title={m.title} value={m.value} icon={m.icon} />
        ))}
      </MetricGrid>

      <Card>
        <CardHeader>
          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <FileText className="w-5 h-5" />
              {t('Content Templates', 'قوالب المحتوى')}
            </CardTitle>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-2.5 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search templates...', 'البحث عن القوالب...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("w-64", isRTL ? "pr-9" : "pl-9")}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('Category', 'الفئة')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories', 'جميع الفئات')}</SelectItem>
                  {TEMPLATE_CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const statusConfig = STATUS_CONFIG[template.status as keyof typeof STATUS_CONFIG];
              return (
                <Card key={template.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0", statusConfig.color)}>
                        <statusConfig.icon className="w-3 h-3 me-1" />
                        {isRTL ? statusConfig.labelAr : statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                    
                    <div className={cn("flex items-center justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                      <span>{t('Version', 'الإصدار')} {template.version}</span>
                      <span>{template.updated_at}</span>
                    </div>

                    {template.status === 'published' && (
                      <div className={cn("flex items-center gap-1 text-xs text-success", isRTL && "flex-row-reverse")}>
                        <Globe className="w-3 h-3" />
                        {template.published_orgs} {t('organizations', 'منظمات')}
                      </div>
                    )}

                    <div className={cn("flex items-center gap-1 pt-2 border-t", isRTL && "flex-row-reverse")}>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                        <Edit2 className="w-3 h-3 me-1" />
                        {t('Edit', 'تعديل')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewHistory(template)}>
                        <History className="w-3 h-3 me-1" />
                        {t('History', 'السجل')}
                      </Button>
                      {template.status === 'review' && (
                        <Button variant="ghost" size="sm" className="text-success" onClick={() => { setSelectedTemplate(template); setPublishDialogOpen(true); }}>
                          <Send className="w-3 h-3 me-1" />
                          {t('Publish', 'نشر')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{selectedTemplate ? t('Edit Template', 'تعديل القالب') : t('New Template', 'قالب جديد')}</SheetTitle>
            <SheetDescription>{t('Create or edit content templates', 'إنشاء أو تعديل قوالب المحتوى')}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('Template Name', 'اسم القالب')}</Label>
                <Input defaultValue={selectedTemplate?.name || ''} placeholder={t('e.g., Housing Allowance Policy', 'مثال: سياسة بدل السكن')} />
              </div>
              <div className="space-y-2">
                <Label>{t('Category', 'الفئة')}</Label>
                <Select defaultValue={selectedTemplate?.category || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select category', 'اختر الفئة')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('Content', 'المحتوى')}</Label>
              <Textarea 
                defaultValue={selectedTemplate?.content || ''} 
                placeholder={t('Enter template content...', 'أدخل محتوى القالب...')}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setEditorOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button variant="secondary" onClick={() => handleSave(true)}>
              <Edit2 className="w-4 h-4 me-2" />
              {t('Save Draft', 'حفظ كمسودة')}
            </Button>
            <Button onClick={() => handleSave(false)}>
              <Send className="w-4 h-4 me-2" />
              {t('Submit for Review', 'تقديم للمراجعة')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Version History Sheet */}
      <Sheet open={historySheetOpen} onOpenChange={setHistorySheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('Version History', 'سجل الإصدارات')}</SheetTitle>
            <SheetDescription>{selectedTemplate?.name}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {VERSION_HISTORY.map((v, i) => (
              <div key={v.version} className={cn("p-4 rounded-lg border", i === 0 && "border-primary bg-primary/5")}>
                <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Badge variant={v.status === 'published' ? 'default' : 'secondary'}>
                      v{v.version}
                    </Badge>
                    {i === 0 && <Badge variant="outline" className="bg-success/10 text-success">{t('Current', 'الحالي')}</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{v.date}</span>
                </div>
                <p className="text-sm">{v.changes}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('By', 'بواسطة')} {v.author}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Publish Template', 'نشر القالب')}</DialogTitle>
            <DialogDescription>{t('Select organizations to publish this template to', 'اختر المنظمات لنشر هذا القالب')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Publish To', 'نشر إلى')}</Label>
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
            <div className="p-3 rounded-lg bg-warning/10 text-warning text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{t('Publishing will replace the current version for selected organizations. This action is logged.', 'سيؤدي النشر إلى استبدال الإصدار الحالي للمنظمات المحددة. يتم تسجيل هذا الإجراء.')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>{t('Cancel', 'إلغاء')}</Button>
            <Button onClick={handlePublish}>
              <Send className="w-4 h-4 me-2" />
              {t('Publish', 'نشر')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
