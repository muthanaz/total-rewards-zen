/**
 * Policy Import/Export Component
 * Excel-based bulk policy management with validation
 */

import { useState, useCallback } from 'react';
import { 
  Download, Upload, FileSpreadsheet, CheckCircle2, 
  AlertCircle, X, RefreshCw, FileDown, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import * as XLSX from 'xlsx';

interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ParsedPolicy {
  name: string;
  category: string;
  benefitType: string;
  transactionModel: string;
  annualLimit?: number;
  perTransactionLimit?: number;
  eligibleGrades: string[];
  requiredDocs: string[];
  slaDays?: number;
  valid: boolean;
  errors: ValidationError[];
}

interface ImportResult {
  total: number;
  valid: number;
  invalid: number;
  policies: ParsedPolicy[];
  errors: ValidationError[];
}

// Policy template for Excel export
const POLICY_TEMPLATE_HEADERS = [
  'policy_name',
  'category',
  'benefit_type',
  'transaction_model',
  'annual_limit',
  'per_transaction_limit',
  'eligible_grades',
  'required_docs',
  'sla_days',
  'description',
  'description_ar',
];

const SAMPLE_POLICIES = [
  {
    policy_name: 'Medical Insurance',
    category: 'health',
    benefit_type: 'insurance',
    transaction_model: 'claim_only',
    annual_limit: 500000,
    per_transaction_limit: 50000,
    eligible_grades: 'G1,G2,G3,G4,G5,G6,G7',
    required_docs: 'Medical Report,Invoice,Prescription',
    sla_days: 5,
    description: 'Comprehensive medical coverage for employees and dependents',
    description_ar: 'تغطية طبية شاملة للموظفين والمعالين',
  },
  {
    policy_name: 'Education Allowance',
    category: 'education',
    benefit_type: 'allowance',
    transaction_model: 'both',
    annual_limit: 100000,
    per_transaction_limit: 25000,
    eligible_grades: 'G4,G5,G6,G7',
    required_docs: 'School Invoice,Registration Certificate',
    sla_days: 3,
    description: 'Annual education support for employee children',
    description_ar: 'دعم تعليمي سنوي لأبناء الموظفين',
  },
];

export default function PolicyImportExport() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Download policy template
  const downloadTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();
    
    // Data sheet with sample policies
    const dataSheet = XLSX.utils.json_to_sheet(SAMPLE_POLICIES);
    dataSheet['!cols'] = POLICY_TEMPLATE_HEADERS.map(() => ({ wch: 25 }));
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Policies');

    // Instructions sheet
    const instructions = [
      ['Field', 'Description', 'Required', 'Valid Values', 'Example'],
      ['policy_name', 'Unique policy name', 'Yes', 'Any text', 'Medical Insurance'],
      ['category', 'Benefit category', 'Yes', 'health, education, housing, transport, wellbeing, leave, financial', 'health'],
      ['benefit_type', 'Type of benefit', 'Yes', 'allowance, reimbursement, insurance, program, leave', 'insurance'],
      ['transaction_model', 'How benefits are claimed', 'Yes', 'request_only, claim_only, both', 'claim_only'],
      ['annual_limit', 'Maximum annual amount (AED)', 'No', 'Positive number', '500000'],
      ['per_transaction_limit', 'Max per transaction (AED)', 'No', 'Positive number', '50000'],
      ['eligible_grades', 'Comma-separated grade codes', 'Yes', 'Grade codes from your organization', 'G1,G2,G3'],
      ['required_docs', 'Comma-separated document types', 'No', 'Document type names', 'Invoice,Receipt'],
      ['sla_days', 'Processing SLA in days', 'No', 'Positive integer', '5'],
      ['description', 'Policy description (English)', 'No', 'Any text', 'Coverage details...'],
      ['description_ar', 'Policy description (Arabic)', 'No', 'Arabic text', 'تفاصيل التغطية...'],
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
    instructionsSheet['!cols'] = [
      { wch: 20 }, { wch: 40 }, { wch: 10 }, { wch: 50 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, instructionsSheet, 'Instructions');

    XLSX.writeFile(wb, 'policy_import_template.xlsx');
    toast.success(t('Template downloaded', 'تم تحميل القالب'));
  }, [t]);

  // Validate a single policy row
  const validatePolicy = (row: any, rowIndex: number): ParsedPolicy => {
    const errors: ValidationError[] = [];
    
    // Required field validation
    if (!row.policy_name?.trim()) {
      errors.push({ row: rowIndex, column: 'policy_name', value: '', message: 'Policy name is required', severity: 'error' });
    }
    if (!row.category?.trim()) {
      errors.push({ row: rowIndex, column: 'category', value: '', message: 'Category is required', severity: 'error' });
    }
    if (!row.benefit_type?.trim()) {
      errors.push({ row: rowIndex, column: 'benefit_type', value: '', message: 'Benefit type is required', severity: 'error' });
    }
    if (!row.transaction_model?.trim()) {
      errors.push({ row: rowIndex, column: 'transaction_model', value: '', message: 'Transaction model is required', severity: 'error' });
    }

    // Enum validation
    const validCategories = ['health', 'education', 'housing', 'transport', 'wellbeing', 'leave', 'financial'];
    if (row.category && !validCategories.includes(row.category.toLowerCase())) {
      errors.push({ 
        row: rowIndex, 
        column: 'category', 
        value: row.category, 
        message: `Invalid category. Valid: ${validCategories.join(', ')}`, 
        severity: 'error' 
      });
    }

    const validBenefitTypes = ['allowance', 'reimbursement', 'insurance', 'program', 'leave'];
    if (row.benefit_type && !validBenefitTypes.includes(row.benefit_type.toLowerCase())) {
      errors.push({ 
        row: rowIndex, 
        column: 'benefit_type', 
        value: row.benefit_type, 
        message: `Invalid benefit type. Valid: ${validBenefitTypes.join(', ')}`, 
        severity: 'error' 
      });
    }

    const validTransactionModels = ['request_only', 'claim_only', 'both'];
    if (row.transaction_model && !validTransactionModels.includes(row.transaction_model.toLowerCase())) {
      errors.push({ 
        row: rowIndex, 
        column: 'transaction_model', 
        value: row.transaction_model, 
        message: `Invalid transaction model. Valid: ${validTransactionModels.join(', ')}`, 
        severity: 'error' 
      });
    }

    // Numeric validation
    if (row.annual_limit && (isNaN(row.annual_limit) || row.annual_limit < 0)) {
      errors.push({ 
        row: rowIndex, 
        column: 'annual_limit', 
        value: String(row.annual_limit), 
        message: 'Annual limit must be a positive number', 
        severity: 'error' 
      });
    }

    if (row.per_transaction_limit && (isNaN(row.per_transaction_limit) || row.per_transaction_limit < 0)) {
      errors.push({ 
        row: rowIndex, 
        column: 'per_transaction_limit', 
        value: String(row.per_transaction_limit), 
        message: 'Per transaction limit must be a positive number', 
        severity: 'error' 
      });
    }

    // Warning for missing optional fields
    if (!row.eligible_grades?.trim()) {
      errors.push({ 
        row: rowIndex, 
        column: 'eligible_grades', 
        value: '', 
        message: 'No eligible grades specified - policy will apply to all grades', 
        severity: 'warning' 
      });
    }

    return {
      name: row.policy_name || '',
      category: row.category || '',
      benefitType: row.benefit_type || '',
      transactionModel: row.transaction_model || '',
      annualLimit: row.annual_limit,
      perTransactionLimit: row.per_transaction_limit,
      eligibleGrades: row.eligible_grades ? row.eligible_grades.split(',').map((g: string) => g.trim()) : [],
      requiredDocs: row.required_docs ? row.required_docs.split(',').map((d: string) => d.trim()) : [],
      slaDays: row.sla_days,
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
    };
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error(t('Please upload an Excel file (.xlsx or .xls)', 'يرجى تحميل ملف إكسل (.xlsx أو .xls)'));
      return;
    }

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get the first sheet (Policies)
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        toast.error(t('No data found in the file', 'لم يتم العثور على بيانات في الملف'));
        setImporting(false);
        return;
      }

      // Validate each row
      const policies = rows.map((row, index) => validatePolicy(row, index + 2)); // +2 for header row and 1-indexed
      const allErrors = policies.flatMap(p => p.errors);

      setImportResult({
        total: policies.length,
        valid: policies.filter(p => p.valid).length,
        invalid: policies.filter(p => !p.valid).length,
        policies,
        errors: allErrors,
      });

      if (allErrors.filter(e => e.severity === 'error').length === 0) {
        toast.success(t(`${policies.length} policies validated successfully`, `تم التحقق من ${policies.length} سياسة بنجاح`));
      } else {
        toast.warning(t('Validation completed with errors', 'اكتمل التحقق مع وجود أخطاء'));
      }
    } catch (error) {
      console.error('File parse error:', error);
      toast.error(t('Failed to parse file', 'فشل في تحليل الملف'));
    } finally {
      setImporting(false);
    }
  }, [t]);

  // Download error report
  const downloadErrorReport = useCallback(() => {
    if (!importResult) return;

    const wb = XLSX.utils.book_new();
    const errorData = importResult.errors.map(e => ({
      Row: e.row,
      Column: e.column,
      Value: e.value,
      Severity: e.severity,
      Message: e.message,
    }));

    const sheet = XLSX.utils.json_to_sheet(errorData);
    sheet['!cols'] = [
      { wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 50 }
    ];
    XLSX.utils.book_append_sheet(wb, sheet, 'Errors');

    XLSX.writeFile(wb, 'policy_import_errors.xlsx');
    toast.success(t('Error report downloaded', 'تم تحميل تقرير الأخطاء'));
  }, [importResult, t]);

  // Confirm import
  const confirmImport = useCallback(async () => {
    if (!importResult) return;

    const validPolicies = importResult.policies.filter(p => p.valid);
    if (validPolicies.length === 0) {
      toast.error(t('No valid policies to import', 'لا توجد سياسات صالحة للاستيراد'));
      return;
    }

    setImporting(true);
    try {
      // In real implementation, this would call Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t(
        `${validPolicies.length} policies imported successfully`,
        `تم استيراد ${validPolicies.length} سياسة بنجاح`
      ));
      setImportResult(null);
    } catch (error) {
      toast.error(t('Failed to import policies', 'فشل في استيراد السياسات'));
    } finally {
      setImporting(false);
    }
  }, [importResult, t]);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <Card className={cn(isRTL && "text-right")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-accent" />
          {t('Policy Import/Export', 'استيراد/تصدير السياسات')}
        </CardTitle>
        <CardDescription>
          {t('Bulk manage policies using Excel files', 'إدارة السياسات بالجملة باستخدام ملفات إكسل')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('Import', 'استيراد')}
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              {t('Export', 'تصدير')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4 mt-4">
            {!importResult ? (
              <>
                {/* Upload Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive ? "border-accent bg-accent/10" : "border-muted",
                    importing && "opacity-50 pointer-events-none"
                  )}
                >
                  {importing ? (
                    <RefreshCw className="w-12 h-12 mx-auto text-accent animate-spin mb-4" />
                  ) : (
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  )}
                  <h4 className="font-medium mb-2">
                    {importing 
                      ? t('Processing...', 'جارٍ المعالجة...')
                      : t('Drop Excel file here or click to upload', 'أفلت ملف إكسل هنا أو انقر للتحميل')
                    }
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('Supports .xlsx and .xls files', 'يدعم ملفات .xlsx و .xls')}
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    id="policy-file-input"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    disabled={importing}
                  />
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                      <Download className="w-4 h-4" />
                      {t('Download Template', 'تحميل القالب')}
                    </Button>
                    <Button asChild className="gap-2">
                      <label htmlFor="policy-file-input" className="cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {t('Choose File', 'اختر ملف')}
                      </label>
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>{t('Template Required', 'القالب مطلوب')}</AlertTitle>
                  <AlertDescription>
                    {t(
                      'Download the template first to ensure your data is in the correct format.',
                      'قم بتحميل القالب أولاً للتأكد من أن بياناتك بالتنسيق الصحيح.'
                    )}
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                {/* Validation Results */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold text-accent">{importResult.total}</div>
                    <div className="text-sm text-muted-foreground">{t('Total Rows', 'إجمالي الصفوف')}</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold text-success">{importResult.valid}</div>
                    <div className="text-sm text-muted-foreground">{t('Valid', 'صالح')}</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold text-destructive">{importResult.invalid}</div>
                    <div className="text-sm text-muted-foreground">{t('Invalid', 'غير صالح')}</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        {t('Validation Issues', 'مشاكل التحقق')} ({importResult.errors.length})
                      </h4>
                      <Button variant="outline" size="sm" onClick={downloadErrorReport} className="gap-2">
                        <FileDown className="w-4 h-4" />
                        {t('Download Report', 'تحميل التقرير')}
                      </Button>
                    </div>
                    <ScrollArea className="h-48 rounded border p-2">
                      <div className="space-y-2">
                        {importResult.errors.slice(0, 20).map((error, i) => (
                          <div 
                            key={i}
                            className={cn(
                              "p-2 rounded text-sm flex items-start gap-2",
                              error.severity === 'error' ? "bg-destructive/10" : "bg-warning/10"
                            )}
                          >
                            {error.severity === 'error' ? (
                              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-medium">Row {error.row}, {error.column}:</span>{' '}
                              {error.message}
                              {error.value && (
                                <span className="text-muted-foreground"> (value: "{error.value}")</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {importResult.errors.length > 20 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            {t(`+${importResult.errors.length - 20} more issues...`, `+${importResult.errors.length - 20} مشكلة أخرى...`)}
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Valid Policies Preview */}
                {importResult.valid > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      {t('Policies to Import', 'السياسات للاستيراد')} ({importResult.valid})
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {importResult.policies.filter(p => p.valid).slice(0, 6).map((policy, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-success/5">
                          <div className="font-medium text-sm">{policy.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{policy.category}</Badge>
                            <Badge variant="outline" className="text-[10px]">{policy.benefitType}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setImportResult(null)}>
                    {t('Cancel', 'إلغاء')}
                  </Button>
                  <Button 
                    onClick={confirmImport} 
                    disabled={importResult.valid === 0 || importing}
                    className="gap-2"
                  >
                    {importing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {t(`Import ${importResult.valid} Policies`, `استيراد ${importResult.valid} سياسة`)}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="export" className="space-y-4 mt-4">
            <Alert>
              <FileSpreadsheet className="w-4 h-4" />
              <AlertTitle>{t('Export Current Policies', 'تصدير السياسات الحالية')}</AlertTitle>
              <AlertDescription>
                {t(
                  'Download all policies as an Excel file for backup or editing.',
                  'قم بتحميل جميع السياسات كملف إكسل للنسخ الاحتياطي أو التحرير.'
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2">
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                {t('Export All Policies', 'تصدير جميع السياسات')}
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                {t('Export by Category', 'تصدير حسب الفئة')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
