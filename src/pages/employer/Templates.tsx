/**
 * Employer Templates Page
 * 
 * Enterprise-grade template downloads, uploads, and validation.
 */

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Download, Upload, FileSpreadsheet, Users, Gift, 
  Wallet, FileText, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  TEMPLATE_DEFINITIONS, 
  getTemplateById,
  TemplateCard,
  UploadValidationPanel,
  validateUploadedFile,
  ValidationResult,
} from '@/components/employer/templates';

export default function TemplatesPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;

  // Group templates by category
  const employeeTemplates = TEMPLATE_DEFINITIONS.filter(t => t.category === 'employees');
  const benefitTemplates = TEMPLATE_DEFINITIONS.filter(t => t.category === 'benefits');
  const claimTemplates = TEMPLATE_DEFINITIONS.filter(t => t.category === 'claims');

  const handleSelectForUpload = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setValidationResult(null);
    setShowUploadDialog(true);
    // Trigger file input after dialog opens
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;

    setIsValidating(true);
    try {
      const result = await validateUploadedFile(file, selectedTemplate);
      setValidationResult(result);
      
      if (result.isValid) {
        toast.success(t('File validated successfully', 'تم التحقق من الملف بنجاح'));
      } else {
        toast.error(t(`${result.errors.length} errors found`, `تم العثور على ${result.errors.length} خطأ`));
      }
    } catch (err) {
      toast.error(t('Failed to read file', 'فشل في قراءة الملف'));
      console.error(err);
    } finally {
      setIsValidating(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || !selectedTemplate) return;
    
    setIsImporting(true);
    try {
      // TODO: Implement actual import to database
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate import
      
      toast.success(t(
        `Successfully imported ${validationResult.validRows} rows`,
        `تم استيراد ${validationResult.validRows} صفوف بنجاح`
      ));
      
      setShowUploadDialog(false);
      setValidationResult(null);
      setSelectedTemplateId(null);
    } catch (err) {
      toast.error(t('Import failed', 'فشل الاستيراد'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleReupload = () => {
    setValidationResult(null);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleCancel = () => {
    setShowUploadDialog(false);
    setValidationResult(null);
    setSelectedTemplateId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('Templates & Imports', 'القوالب والاستيراد')}</h1>
        <p className="text-muted-foreground mt-1">
          {t(
            'Download enterprise-grade templates and import your HR data with validation.',
            'قم بتنزيل القوالب ذات الجودة المؤسسية واستيراد بيانات الموارد البشرية مع التحقق.'
          )}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Available Templates', 'القوالب المتاحة')}</p>
              <p className="text-xl font-bold">{TEMPLATE_DEFINITIONS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Employee Templates', 'قوالب الموظفين')}</p>
              <p className="text-xl font-bold">{employeeTemplates.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Gift className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Benefits Templates', 'قوالب المزايا')}</p>
              <p className="text-xl font-bold">{benefitTemplates.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Built-in Validation', 'التحقق المدمج')}</p>
              <p className="text-xl font-bold">{t('Yes', 'نعم')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Category */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <Users className="w-4 h-4" />
            {t('Employees', 'الموظفين')}
          </TabsTrigger>
          <TabsTrigger value="benefits" className="gap-2">
            <Gift className="w-4 h-4" />
            {t('Benefits', 'المزايا')}
          </TabsTrigger>
          <TabsTrigger value="claims" className="gap-2">
            <FileText className="w-4 h-4" />
            {t('Claims', 'المطالبات')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {employeeTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onSelectForUpload={handleSelectForUpload}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benefitTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onSelectForUpload={handleSelectForUpload}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {claimTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template}
                onSelectForUpload={handleSelectForUpload}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t('Upload', 'رفع')} {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">{t('Validating file...', 'جاري التحقق من الملف...')}</p>
            </div>
          ) : validationResult && selectedTemplate ? (
            <UploadValidationPanel
              template={selectedTemplate}
              validationResult={validationResult}
              onConfirmImport={handleConfirmImport}
              onReupload={handleReupload}
              onCancel={handleCancel}
              isImporting={isImporting}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {t('Select a file to upload', 'اختر ملفاً للرفع')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('Supported formats: CSV, XLSX, XLS', 'الصيغ المدعومة: CSV, XLSX, XLS')}
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {t('Browse Files', 'تصفح الملفات')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
