import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseExcelFile, validateData } from './ExcelGenerator';
import { allTemplates, TemplateSection } from './MigrationTemplates';
import { cn } from '@/lib/utils';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ParsedSheet {
  name: string;
  data: Record<string, any>[];
  template: TemplateSection | null;
  validation: {
    valid: boolean;
    errors: ValidationError[];
  } | null;
}

type WizardStep = 'upload' | 'mapping' | 'validation' | 'preview' | 'import';

const steps: { id: WizardStep; label: string }[] = [
  { id: 'upload', label: 'Upload File' },
  { id: 'mapping', label: 'Map Sheets' },
  { id: 'validation', label: 'Validate' },
  { id: 'preview', label: 'Preview' },
  { id: 'import', label: 'Import' },
];

export default function DataImportWizard() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an Excel file (.xlsx, .xls) or CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const result = await parseExcelFile(uploadedFile);
      
      const sheets: ParsedSheet[] = Object.entries(result.sheets).map(([name, data]) => {
        // Try to auto-match template based on sheet name
        const matchedTemplate = allTemplates.find(t => 
          t.id.toLowerCase() === name.toLowerCase() ||
          t.tableName.toLowerCase() === name.toLowerCase() ||
          t.title.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(t.id.toLowerCase())
        );

        return {
          name,
          data,
          template: matchedTemplate || null,
          validation: null,
        };
      });

      setParsedSheets(sheets);
      
      if (sheets.length > 0) {
        setSelectedSheet(sheets[0].name);
        setCurrentStep('mapping');
      }

      if (result.errors.length > 0) {
        toast({
          title: 'Parse Warnings',
          description: `${result.errors.length} warning(s) occurred during parsing.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'File Parsed Successfully',
          description: `Found ${sheets.length} sheet(s) with ${sheets.reduce((acc, s) => acc + s.data.length, 0)} total rows.`,
        });
      }

    } catch (error) {
      console.error('Parse error:', error);
      toast({
        title: 'Parse Error',
        description: 'Failed to parse the uploaded file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleTemplateMapping = (sheetName: string, templateId: string | null) => {
    setParsedSheets(prev => prev.map(sheet => {
      if (sheet.name === sheetName) {
        const template = templateId ? allTemplates.find(t => t.id === templateId) || null : null;
        return {
          ...sheet,
          template,
          validation: null, // Reset validation when template changes
        };
      }
      return sheet;
    }));
  };

  const handleValidation = async () => {
    setIsProcessing(true);

    try {
      const validatedSheets = parsedSheets.map(sheet => {
        if (!sheet.template) {
          return sheet;
        }

        const validation = validateData(sheet.data, sheet.template);
        return {
          ...sheet,
          validation,
        };
      });

      setParsedSheets(validatedSheets);
      setCurrentStep('validation');

      const totalErrors = validatedSheets.reduce((acc, s) => 
        acc + (s.validation?.errors.length || 0), 0
      );

      if (totalErrors === 0) {
        toast({
          title: 'Validation Passed',
          description: 'All data is valid and ready for import.',
        });
      } else {
        toast({
          title: 'Validation Issues Found',
          description: `Found ${totalErrors} validation error(s). Please review and fix.`,
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'An error occurred during validation.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setImportProgress(0);
    setCurrentStep('import');

    try {
      const sheetsToImport = parsedSheets.filter(s => s.template && s.validation?.valid);
      const totalRows = sheetsToImport.reduce((acc, s) => acc + s.data.length, 0);
      let processedRows = 0;

      for (const sheet of sheetsToImport) {
        // Simulate import process
        for (let i = 0; i < sheet.data.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          processedRows++;
          setImportProgress(Math.round((processedRows / totalRows) * 100));
        }
      }

      toast({
        title: 'Import Completed',
        description: `Successfully imported ${processedRows} records.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Error',
        description: 'An error occurred during import.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const canGoNext = currentStep === 'upload' 
    ? file !== null 
    : currentStep === 'mapping'
    ? parsedSheets.some(s => s.template !== null)
    : currentStep === 'validation'
    ? parsedSheets.some(s => s.validation?.valid)
    : true;

  const goToNextStep = () => {
    if (currentStep === 'mapping') {
      handleValidation();
    } else if (currentStep === 'validation') {
      setCurrentStep('preview');
    } else if (currentStep === 'preview') {
      handleImport();
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const resetWizard = () => {
    setCurrentStep('upload');
    setFile(null);
    setParsedSheets([]);
    setSelectedSheet(null);
    setImportProgress(0);
  };

  const currentSheetData = parsedSheets.find(s => s.name === selectedSheet);

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
              index <= currentStepIndex
                ? "bg-accent border-accent text-accent-foreground"
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {index < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={cn(
              "ml-2 text-sm font-medium hidden sm:inline",
              index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 md:w-16 h-0.5 mx-2",
                index < currentStepIndex ? "bg-accent" : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Upload Step */}
          {currentStep === 'upload' && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Migration File</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Upload an Excel file (.xlsx) containing your migration data. 
                Each sheet will be mapped to a data template.
              </p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button asChild className="gap-2 cursor-pointer">
                  <span>
                    <FileSpreadsheet className="w-4 h-4" />
                    Select File
                  </span>
                </Button>
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-accent" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                </div>
              )}
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Processing file...</span>
                </div>
              )}
            </div>
          )}

          {/* Mapping Step */}
          {currentStep === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Map Sheets to Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign each sheet to the appropriate data template
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {parsedSheets.map(sheet => (
                  <div key={sheet.name} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{sheet.name}</p>
                        <p className="text-xs text-muted-foreground">{sheet.data.length} rows</p>
                      </div>
                    </div>
                    <select
                      value={sheet.template?.id || ''}
                      onChange={(e) => handleTemplateMapping(sheet.name, e.target.value || null)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Skip this sheet</option>
                      {allTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Step */}
          {currentStep === 'validation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Validation Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Review validation errors before importing
                  </p>
                </div>
              </div>

              <Tabs value={selectedSheet || ''} onValueChange={setSelectedSheet}>
                <TabsList>
                  {parsedSheets.filter(s => s.template).map(sheet => (
                    <TabsTrigger key={sheet.name} value={sheet.name} className="gap-2">
                      {sheet.name}
                      {sheet.validation && (
                        sheet.validation.valid ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Badge variant="destructive" className="text-[10px] px-1">
                            {sheet.validation.errors.length}
                          </Badge>
                        )
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {parsedSheets.filter(s => s.template).map(sheet => (
                  <TabsContent key={sheet.name} value={sheet.name} className="mt-4">
                    {sheet.validation?.valid ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <p className="font-medium">All {sheet.data.length} rows passed validation</p>
                        <p className="text-sm text-muted-foreground">Ready for import</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">
                            {sheet.validation?.errors.length} validation error(s) found
                          </span>
                        </div>
                        <div className="max-h-64 overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">Row</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sheet.validation?.errors.slice(0, 20).map((error, i) => (
                                <TableRow key={i}>
                                  <TableCell>
                                    <Badge variant="outline">{error.row}</Badge>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">{error.field}</TableCell>
                                  <TableCell className="text-sm text-muted-foreground">{error.message}</TableCell>
                                </TableRow>
                              ))}
                              {(sheet.validation?.errors.length || 0) > 20 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                                    ... and {(sheet.validation?.errors.length || 0) - 20} more errors
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && currentSheetData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Data Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Review data before final import
                  </p>
                </div>
              </div>

              <Tabs value={selectedSheet || ''} onValueChange={setSelectedSheet}>
                <TabsList>
                  {parsedSheets.filter(s => s.template && s.validation?.valid).map(sheet => (
                    <TabsTrigger key={sheet.name} value={sheet.name}>
                      {sheet.name} ({sheet.data.length} rows)
                    </TabsTrigger>
                  ))}
                </TabsList>

                {parsedSheets.filter(s => s.template && s.validation?.valid).map(sheet => (
                  <TabsContent key={sheet.name} value={sheet.name} className="mt-4">
                    <div className="max-h-96 overflow-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {sheet.template?.fields.slice(0, 6).map(field => (
                              <TableHead key={field.name} className="text-xs">
                                {field.name}
                              </TableHead>
                            ))}
                            {(sheet.template?.fields.length || 0) > 6 && (
                              <TableHead className="text-xs">...</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sheet.data.slice(0, 10).map((row, i) => (
                            <TableRow key={i}>
                              {sheet.template?.fields.slice(0, 6).map(field => (
                                <TableCell key={field.name} className="text-xs">
                                  {String(row[field.name] ?? '-').substring(0, 30)}
                                </TableCell>
                              ))}
                              {(sheet.template?.fields.length || 0) > 6 && (
                                <TableCell className="text-xs text-muted-foreground">...</TableCell>
                              )}
                            </TableRow>
                          ))}
                          {sheet.data.length > 10 && (
                            <TableRow>
                              <TableCell 
                                colSpan={(sheet.template?.fields.slice(0, 6).length || 0) + 1} 
                                className="text-center text-muted-foreground"
                              >
                                ... and {sheet.data.length - 10} more rows
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Import Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {parsedSheets.filter(s => s.template && s.validation?.valid).map(sheet => (
                  <div key={sheet.name} className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-accent">{sheet.data.length}</p>
                    <p className="text-xs text-muted-foreground">{sheet.template?.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Step */}
          {currentStep === 'import' && (
            <div className="text-center py-12">
              {isProcessing ? (
                <>
                  <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Importing Data...</h3>
                  <p className="text-muted-foreground mb-4">Please wait while we import your data.</p>
                  <div className="max-w-md mx-auto">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    All data has been successfully imported into the system.
                  </p>
                  <Button onClick={resetWizard} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Start New Import
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {currentStep !== 'import' && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0 || isProcessing}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={!canGoNext || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === 'preview' ? (
              <>
                Start Import
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
