/**
 * CSV Import Preview
 * 
 * Shows preview table, validation summary, mapping suggestions,
 * and "Fix & re-upload" loop after CSV upload.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, AlertTriangle, XCircle, Upload, Download, 
  FileSpreadsheet, Table, RefreshCw, ArrowRight
} from 'lucide-react';
import { formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImportTemplate {
  name: string;
  description: string;
  fields: number;
  requiredFields: string[];
  optionalFields: string[];
  exampleRows: Record<string, string>[];
  validationRules: string[];
  commonErrors: string[];
}

const IMPORT_TEMPLATES: ImportTemplate[] = [
  {
    name: 'Employee Master',
    description: 'Import employee profiles and demographics',
    fields: 15,
    requiredFields: ['Employee ID', 'First Name', 'Last Name', 'Email', 'Department', 'Grade', 'Hire Date'],
    optionalFields: ['Work Location', 'Manager ID', 'Cost Center', 'Phone Number', 'Birth Date'],
    exampleRows: [
      { 'Employee ID': 'EMP001', 'First Name': 'Ahmed', 'Last Name': 'Hassan', 'Email': 'ahmed.hassan@company.com', 'Department': 'Engineering', 'Grade': 'G5', 'Hire Date': '2022-01-15' },
      { 'Employee ID': 'EMP002', 'First Name': 'Sara', 'Last Name': 'Ali', 'Email': 'sara.ali@company.com', 'Department': 'HR', 'Grade': 'G4', 'Hire Date': '2023-03-20' },
    ],
    validationRules: ['Employee ID must be unique', 'Email must be valid format', 'Hire Date must be YYYY-MM-DD', 'Grade must match existing grades'],
    commonErrors: ['Duplicate Employee IDs', 'Invalid email format', 'Missing required fields', 'Date format mismatch'],
  },
  {
    name: 'Benefit Entitlements',
    description: 'Import allowance allocations by grade',
    fields: 8,
    requiredFields: ['Employee ID', 'Benefit Type', 'Annual Allowance', 'Effective Date'],
    optionalFields: ['Coverage Percent', 'Max Claim', 'Notes'],
    exampleRows: [
      { 'Employee ID': 'EMP001', 'Benefit Type': 'Medical', 'Annual Allowance': '50000', 'Effective Date': '2024-01-01' },
      { 'Employee ID': 'EMP001', 'Benefit Type': 'Education', 'Annual Allowance': '30000', 'Effective Date': '2024-01-01' },
    ],
    validationRules: ['Employee ID must exist', 'Annual Allowance must be numeric', 'Benefit Type must match existing types'],
    commonErrors: ['Employee ID not found', 'Invalid allowance amount', 'Unknown benefit type'],
  },
  {
    name: 'Grade Eligibility Rules',
    description: 'Define benefit eligibility by grade',
    fields: 12,
    requiredFields: ['Grade', 'Benefit Type', 'Is Eligible', 'Annual Allowance'],
    optionalFields: ['Coverage Percent', 'Max Dependents', 'Waiting Period Days', 'Requires Documentation'],
    exampleRows: [
      { 'Grade': 'G5', 'Benefit Type': 'Medical', 'Is Eligible': 'true', 'Annual Allowance': '50000', 'Coverage Percent': '100' },
      { 'Grade': 'G4', 'Benefit Type': 'Medical', 'Is Eligible': 'true', 'Annual Allowance': '40000', 'Coverage Percent': '90' },
    ],
    validationRules: ['Grade must exist', 'Is Eligible must be true/false', 'Numeric fields must be valid'],
    commonErrors: ['Unknown grade code', 'Invalid boolean value', 'Missing required columns'],
  },
  {
    name: 'Utilization Events',
    description: 'Import historical utilization data',
    fields: 10,
    requiredFields: ['Employee ID', 'Benefit Type', 'Amount', 'Transaction Date'],
    optionalFields: ['Claim ID', 'Vendor', 'Description', 'Status'],
    exampleRows: [
      { 'Employee ID': 'EMP001', 'Benefit Type': 'Medical', 'Amount': '1500', 'Transaction Date': '2024-02-15', 'Vendor': 'City Hospital' },
    ],
    validationRules: ['Employee ID must exist', 'Amount must be positive', 'Transaction Date must be valid'],
    commonErrors: ['Employee not found', 'Negative amounts', 'Future dates not allowed'],
  },
];

interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  errors: { row: number; column: string; message: string }[];
  warnings: { row: number; column: string; message: string }[];
  mappingSuggestions: Record<string, string>;
}

interface CSVImportPreviewProps {
  selectedTemplate: string | null;
  previewData: CSVPreviewData | null;
  onDownloadTemplate: (templateName: string) => void;
  onUpload: () => void;
  onConfirmImport: () => void;
  onClearPreview: () => void;
  onDownloadErrors: () => void;
  onDownloadCleanedFile: () => void;
}

export function CSVImportPreview({
  selectedTemplate,
  previewData,
  onDownloadTemplate,
  onUpload,
  onConfirmImport,
  onClearPreview,
  onDownloadErrors,
  onDownloadCleanedFile,
}: CSVImportPreviewProps) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});

  const template = IMPORT_TEMPLATES.find(t => t.name === selectedTemplate);
  
  const hasErrors = previewData && previewData.errors.length > 0;
  const hasWarnings = previewData && previewData.warnings.length > 0;

  return (
    <div className="space-y-4">
      {/* Template Cards */}
      {!previewData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IMPORT_TEMPLATES.map((template) => (
            <Card 
              key={template.name}
              className={cn(
                'transition-all cursor-pointer',
                expandedTemplate === template.name && 'ring-2 ring-primary'
              )}
              onClick={() => setExpandedTemplate(expandedTemplate === template.name ? null : template.name)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.fields} fields
                  </Badge>
                </div>
              </CardHeader>
              
              {expandedTemplate === template.name && (
                <CardContent className="border-t pt-4 space-y-4">
                  {/* Required Fields */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Required Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {template.requiredFields.map((field, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Optional Fields */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Optional Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {template.optionalFields.map((field, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Validation Rules */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Validation Rules</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {template.validationRules.map((rule, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-success shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Common Errors */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Common Errors</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {template.commonErrors.map((error, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Example Rows */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Example Rows</p>
                    <div className="overflow-x-auto">
                      <table className="text-xs w-full">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(template.exampleRows[0] || {}).map((col, i) => (
                              <th key={i} className="p-1 text-left font-medium">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {template.exampleRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-muted">
                              {Object.values(row).map((val, colIdx) => (
                                <td key={colIdx} className="p-1 text-muted-foreground">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadTemplate(template.name);
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Template
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpload();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Preview Data */}
      {previewData && (
        <div className="space-y-4">
          {/* Validation Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total Rows</p>
                <p className="text-xl font-bold">{formatInteger(previewData.totalRows)}</p>
              </CardContent>
            </Card>
            <Card className={cn('bg-muted/30', hasErrors && 'border-destructive/30')}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Errors</p>
                <p className={cn('text-xl font-bold', hasErrors ? 'text-destructive' : 'text-success')}>
                  {previewData.errors.length}
                </p>
              </CardContent>
            </Card>
            <Card className={cn('bg-muted/30', hasWarnings && 'border-warning/30')}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Warnings</p>
                <p className={cn('text-xl font-bold', hasWarnings ? 'text-warning' : 'text-muted-foreground')}>
                  {previewData.warnings.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Errors Alert */}
          {hasErrors && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{previewData.errors.length} errors found. Please fix and re-upload.</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onDownloadErrors}>
                    <Download className="w-4 h-4 mr-1" />
                    Error Report
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings Alert */}
          {hasWarnings && !hasErrors && (
            <Alert className="border-warning/30 bg-warning/5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-warning">{previewData.warnings.length} warnings found. Review before importing.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Field Mapping Suggestions */}
          {Object.keys(previewData.mappingSuggestions).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Field Mapping Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(previewData.mappingSuggestions).map(([source, target]) => (
                    <div key={source} className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="font-mono">{source}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Select 
                        value={fieldMappings[source] || target}
                        onValueChange={(v) => setFieldMappings(prev => ({ ...prev, [source]: v }))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={target}>{target}</SelectItem>
                          <SelectItem value="skip">Skip this field</SelectItem>
                        </SelectContent>
                      </Select>
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Table className="h-4 w-4" />
                Preview (first 5 rows)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left font-medium text-muted-foreground">#</th>
                      {previewData.headers.map((header, i) => (
                        <th key={i} className="p-2 text-left font-medium">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.slice(0, 5).map((row, rowIdx) => {
                      const rowErrors = previewData.errors.filter(e => e.row === rowIdx);
                      const rowWarnings = previewData.warnings.filter(w => w.row === rowIdx);
                      
                      return (
                        <tr 
                          key={rowIdx} 
                          className={cn(
                            'border-b border-muted',
                            rowErrors.length > 0 && 'bg-destructive/5',
                            rowWarnings.length > 0 && !rowErrors.length && 'bg-warning/5'
                          )}
                        >
                          <td className="p-2 text-muted-foreground">{rowIdx + 1}</td>
                          {row.map((cell, colIdx) => {
                            const hasError = rowErrors.some(e => e.column === previewData.headers[colIdx]);
                            const hasWarning = rowWarnings.some(w => w.column === previewData.headers[colIdx]);
                            
                            return (
                              <td 
                                key={colIdx} 
                                className={cn(
                                  'p-2',
                                  hasError && 'text-destructive font-medium',
                                  hasWarning && !hasError && 'text-warning'
                                )}
                              >
                                {cell}
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClearPreview}>
              Cancel
            </Button>
            {hasErrors && (
              <Button variant="outline" onClick={onDownloadCleanedFile}>
                <Download className="w-4 h-4 mr-1" />
                Download Cleaned File
              </Button>
            )}
            <Button onClick={onUpload} variant="outline">
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-upload
            </Button>
            <Button onClick={onConfirmImport} disabled={hasErrors}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirm Import ({formatInteger(previewData.totalRows - previewData.errors.length)} rows)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { IMPORT_TEMPLATES };
export type { ImportTemplate, CSVPreviewData };
