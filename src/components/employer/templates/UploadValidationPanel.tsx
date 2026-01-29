/**
 * Upload Validation Panel Component
 * 
 * Shows validation results, error details, and column mapping UI
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, XCircle, AlertTriangle, Download, 
  ArrowRight, RefreshCw, Table, FileWarning, Upload
} from 'lucide-react';
import { cn, formatInteger } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { ValidationResult, ValidationError, generateErrorReport } from './uploadValidator';
import { TemplateDefinition } from './templateDefinitions';

interface UploadValidationPanelProps {
  template: TemplateDefinition;
  validationResult: ValidationResult;
  onConfirmImport: () => void;
  onReupload: () => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export function UploadValidationPanel({
  template,
  validationResult,
  onConfirmImport,
  onReupload,
  onCancel,
  isImporting,
}: UploadValidationPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(
    validationResult.mappingSuggestions
  );
  const [showAllErrors, setShowAllErrors] = useState(false);

  const t = (en: string, ar?: string) => language === 'ar' && ar ? ar : en;

  const { isValid, totalRows, validRows, errors, warnings, headers } = validationResult;
  const errorCount = errors.length;
  const warningCount = warnings.length;
  const successRate = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0;

  // Group errors by type for summary
  const errorsByType = errors.reduce((acc, err) => {
    acc[err.errorType] = (acc[err.errorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const displayedErrors = showAllErrors ? errors : errors.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{t('Total Rows', 'إجمالي الصفوف')}</p>
            <p className="text-2xl font-bold">{formatInteger(totalRows)}</p>
          </CardContent>
        </Card>
        <Card className={cn(isValid && 'border-success/30')}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{t('Valid Rows', 'الصفوف الصحيحة')}</p>
            <p className={cn('text-2xl font-bold', isValid && 'text-success')}>
              {formatInteger(validRows)}
            </p>
          </CardContent>
        </Card>
        <Card className={cn(errorCount > 0 && 'border-destructive/30')}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{t('Errors', 'الأخطاء')}</p>
            <p className={cn('text-2xl font-bold', errorCount > 0 && 'text-destructive')}>
              {formatInteger(errorCount)}
            </p>
          </CardContent>
        </Card>
        <Card className={cn(warningCount > 0 && 'border-warning/30')}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{t('Warnings', 'التحذيرات')}</p>
            <p className={cn('text-2xl font-bold', warningCount > 0 && 'text-warning')}>
              {formatInteger(warningCount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t('Validation Progress', 'تقدم التحقق')}</span>
          <span className={cn(isValid ? 'text-success' : 'text-muted-foreground')}>
            {successRate}% {t('valid', 'صحيح')}
          </span>
        </div>
        <Progress 
          value={successRate} 
          className={cn('h-2', isValid ? '[&>div]:bg-success' : '[&>div]:bg-warning')} 
        />
      </div>

      {/* Status Alert */}
      {isValid ? (
        <Alert className="border-success/30 bg-success/5">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">{t('Ready to Import', 'جاهز للاستيراد')}</AlertTitle>
          <AlertDescription>
            {t(
              `All ${totalRows} rows passed validation. You can proceed with the import.`,
              `جميع ${totalRows} صفوف اجتازت التحقق. يمكنك المتابعة مع الاستيراد.`
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{t('Validation Failed', 'فشل التحقق')}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {t(
                `${errorCount} errors found in ${totalRows - validRows} rows. Please fix and re-upload.`,
                `تم العثور على ${errorCount} خطأ في ${totalRows - validRows} صفوف. يرجى الإصلاح وإعادة الرفع.`
              )}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => generateErrorReport(errors)}
              className="shrink-0"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {t('Error Report', 'تقرير الأخطاء')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Summary by Type */}
      {errorCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-destructive" />
              {t('Error Breakdown', 'تفصيل الأخطاء')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(errorsByType).map(([type, count]) => (
                <Badge key={type} variant="destructive" className="gap-1.5">
                  {type.replace(/_/g, ' ')}
                  <span className="bg-destructive-foreground/20 px-1.5 rounded text-xs">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column Mapping */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            {t('Column Mapping', 'تعيين الأعمدة')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {headers.map(header => {
              const mappedTo = columnMappings[header];
              const isMapped = !!mappedTo && mappedTo !== 'skip';
              
              return (
                <div key={header} className={cn('flex items-center gap-3 text-sm', isRTL && 'flex-row-reverse')}>
                  <Badge variant="outline" className="font-mono min-w-[150px] justify-center">
                    {header}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Select 
                    value={mappedTo || 'skip'}
                    onValueChange={(v) => setColumnMappings(prev => ({ ...prev, [header]: v }))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">
                        <span className="text-muted-foreground">{t('Skip this column', 'تخطي هذا العمود')}</span>
                      </SelectItem>
                      {template.fields.map(field => (
                        <SelectItem key={field.name} value={field.name}>
                          {field.name}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isMapped ? (
                    <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {errorCount > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Table className="h-4 w-4" />
                {t('Error Details', 'تفاصيل الأخطاء')}
              </CardTitle>
              {errors.length > 10 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAllErrors(!showAllErrors)}
                >
                  {showAllErrors 
                    ? t('Show Less', 'عرض أقل') 
                    : t(`Show All (${errors.length})`, `عرض الكل (${errors.length})`)
                  }
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium">{t('Row', 'صف')}</th>
                      <th className="p-2 text-left font-medium">{t('Column', 'عمود')}</th>
                      <th className="p-2 text-left font-medium">{t('Value', 'قيمة')}</th>
                      <th className="p-2 text-left font-medium">{t('Error', 'خطأ')}</th>
                      <th className="p-2 text-left font-medium">{t('Fix', 'إصلاح')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedErrors.map((error, idx) => (
                      <tr key={idx} className="border-b border-muted hover:bg-muted/50">
                        <td className="p-2 font-mono">{error.row}</td>
                        <td className="p-2 font-mono">{error.column}</td>
                        <td className="p-2 text-destructive max-w-[150px] truncate">
                          {error.value || <span className="text-muted-foreground italic">empty</span>}
                        </td>
                        <td className="p-2">{error.message}</td>
                        <td className="p-2 text-muted-foreground">{error.suggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Table className="h-4 w-4" />
            {t('Data Preview (first 5 rows)', 'معاينة البيانات (أول 5 صفوف)')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-2 text-left font-medium">#</th>
                  {headers.map(h => (
                    <th key={h} className="p-2 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validationResult.rows.slice(0, 5).map((row, idx) => {
                  const rowErrors = errors.filter(e => e.row === idx + 2);
                  const hasErrors = rowErrors.length > 0;
                  
                  return (
                    <tr 
                      key={idx} 
                      className={cn(
                        'border-t',
                        hasErrors && 'bg-destructive/5'
                      )}
                    >
                      <td className="p-2 text-muted-foreground">{idx + 1}</td>
                      {row.map((cell, cellIdx) => {
                        const cellError = rowErrors.find(e => e.column === headers[cellIdx]);
                        return (
                          <td 
                            key={cellIdx} 
                            className={cn(
                              'p-2 whitespace-nowrap',
                              cellError && 'text-destructive font-medium'
                            )}
                          >
                            {String(cell ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className={cn('flex gap-3 pt-2', isRTL && 'flex-row-reverse')}>
        <Button variant="outline" onClick={onCancel}>
          {t('Cancel', 'إلغاء')}
        </Button>
        <Button variant="outline" onClick={onReupload}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          {t('Re-upload', 'إعادة الرفع')}
        </Button>
        <Button 
          className="ml-auto"
          disabled={!isValid || isImporting}
          onClick={onConfirmImport}
        >
          {isImporting ? (
            <>
              <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
              {t('Importing...', 'جاري الاستيراد...')}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-1.5" />
              {t(`Import ${validRows} Rows`, `استيراد ${validRows} صفوف`)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
