/**
 * Integration Connect Wizard
 * 
 * Multi-step wizard for connecting a new integration source.
 * Steps: Connection Method → Field Mapping → Validation → Confirm
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Link2,
  Server,
  Upload,
  Zap,
  Loader2,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IntegrationSource, ConnectionMethod, RequiredField, ValidationResult } from '@/hooks/useIntegrationSources';

interface IntegrationConnectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationSource | null;
  linkedIssueTitle?: string;
  onConnect: (
    integrationId: string,
    connectionMethod: ConnectionMethod,
    fieldMappings: Record<string, string>
  ) => Promise<{ success: boolean; coverage: number; recordCount: number }>;
  onComplete: (integrationId: string) => void;
}

const CONNECTION_METHODS: {
  id: ConnectionMethod;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'api',
    name: 'API Connection',
    description: 'Connect via REST API for real-time sync',
    icon: Zap,
  },
  {
    id: 'sftp',
    name: 'SFTP Transfer',
    description: 'Scheduled file transfers via secure FTP',
    icon: Server,
  },
  {
    id: 'csv',
    name: 'CSV Upload',
    description: 'Manual file upload for one-time imports',
    icon: Upload,
  },
];

// Sample source fields for demo
const SAMPLE_SOURCE_FIELDS = [
  'EMP_ID',
  'EMPLOYEE_ID',
  'STAFF_ID',
  'FIRST_NAME',
  'LAST_NAME',
  'FULL_NAME',
  'WORK_EMAIL',
  'EMAIL_ADDRESS',
  'DEPT_CODE',
  'DEPARTMENT',
  'PAY_GRADE',
  'GRADE_LEVEL',
  'START_DATE',
  'HIRE_DATE',
  'OFFICE_LOCATION',
  'WORK_SITE',
  'MONTHLY_GROSS',
  'BASE_SALARY',
  'CLAIM_REF',
  'CLAIM_ID',
  'AMOUNT_REQUESTED',
  'CLAIM_STATUS',
  'SUBMITTED_AT',
  'SURVEY_DATE',
  'SCORE',
  'RATING',
];

type WizardStep = 'method' | 'mapping' | 'validation' | 'confirm';

export function IntegrationConnectWizard({
  open,
  onOpenChange,
  integration,
  linkedIssueTitle,
  onConnect,
  onComplete,
}: IntegrationConnectWizardProps) {
  const [step, setStep] = useState<WizardStep>('method');
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    coverage: number;
    recordCount: number;
  } | null>(null);

  // Reset state when opening/closing
  useEffect(() => {
    if (open) {
      setStep('method');
      setConnectionMethod(null);
      setFieldMappings({});
      setValidationResults([]);
      setConnectionResult(null);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleNext = async () => {
    if (step === 'method' && connectionMethod) {
      setStep('mapping');
    } else if (step === 'mapping') {
      setStep('validation');
      // Run validation
      setIsValidating(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for unmapped required fields
      const results: ValidationResult[] = [];
      integration?.requiredFields.forEach(field => {
        if (field.required && !fieldMappings[field.id]) {
          results.push({
            field: field.name,
            status: 'error',
            message: 'Required field not mapped',
          });
        } else if (fieldMappings[field.id]) {
          results.push({
            field: field.name,
            status: 'valid',
            message: 'Field mapped successfully',
          });
        }
      });
      
      // Add some sample warnings
      if (results.length > 0 && results.every(r => r.status !== 'error')) {
        results.push({
          field: 'Duplicates',
          status: 'warning',
          message: 'Found 12 potential duplicate records',
          recordsAffected: 12,
        });
      }
      
      setValidationResults(results);
      setIsValidating(false);
    } else if (step === 'validation') {
      setStep('confirm');
      // Perform connection
      if (integration && connectionMethod) {
        setIsConnecting(true);
        const result = await onConnect(integration.id, connectionMethod, fieldMappings);
        setConnectionResult(result);
        setIsConnecting(false);
      }
    } else if (step === 'confirm' && connectionResult?.success) {
      if (integration) {
        onComplete(integration.id);
      }
      handleClose();
    }
  };

  const handleBack = () => {
    if (step === 'mapping') setStep('method');
    else if (step === 'validation') setStep('mapping');
    else if (step === 'confirm') setStep('validation');
  };

  const canProceed = () => {
    if (step === 'method') return !!connectionMethod;
    if (step === 'mapping') {
      const requiredFields = integration?.requiredFields.filter(f => f.required) || [];
      return requiredFields.every(f => fieldMappings[f.id]);
    }
    if (step === 'validation') {
      const hasErrors = validationResults.some(r => r.status === 'error');
      return !hasErrors && !isValidating;
    }
    return true;
  };

  const getStepNumber = () => {
    const steps: WizardStep[] = ['method', 'mapping', 'validation', 'confirm'];
    return steps.indexOf(step) + 1;
  };

  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{integration.icon}</span>
            Connect {integration.name}
          </DialogTitle>
          <DialogDescription>
            Step {getStepNumber()} of 4
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <Progress value={getStepNumber() * 25} className="h-1" />

        {/* Linked Issue Banner */}
        {linkedIssueTitle && step === 'method' && (
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <span className="font-medium">This will resolve:</span> {linkedIssueTitle}
            </AlertDescription>
          </Alert>
        )}

        {/* What This Unlocks */}
        {step === 'method' && integration.unlocksInsights.length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-success/5 to-success/10 border-success/20">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium text-sm">What this unlocks</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {integration.unlocksInsights.map((insight, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-success/10 border-success/30 text-success">
                      {insight}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step Content */}
        <div className="py-4">
          {/* Step 1: Connection Method */}
          {step === 'method' && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Select connection method</Label>
              <RadioGroup
                value={connectionMethod || ''}
                onValueChange={(v) => setConnectionMethod(v as ConnectionMethod)}
                className="grid gap-3"
              >
                {CONNECTION_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = connectionMethod === method.id;
                  
                  return (
                    <Card
                      key={method.id}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        isSelected && 'ring-2 ring-primary border-primary'
                      )}
                      onClick={() => setConnectionMethod(method.id)}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={method.id} />
                        <div className={cn(
                          'p-2 rounded-lg',
                          isSelected ? 'bg-primary/10' : 'bg-muted'
                        )}>
                          <Icon className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </RadioGroup>

              {connectionMethod === 'api' && (
                <div className="mt-4 space-y-3">
                  <Label>API Credentials (Demo)</Label>
                  <Input placeholder="API Key" defaultValue="sk_demo_xxxxxxxxxx" />
                  <Input placeholder="API Secret" type="password" defaultValue="demo_secret" />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Map required fields</Label>
                <Badge variant="outline" className="text-xs">
                  {Object.values(fieldMappings).filter(Boolean).length} / {integration.requiredFields.length} mapped
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {integration.requiredFields.map((field) => (
                  <div
                    key={field.id}
                    className={cn(
                      'p-3 rounded-lg border',
                      field.required && !fieldMappings[field.id] && 'border-destructive/50 bg-destructive/5'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{field.name}</span>
                          {field.required && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                          {fieldMappings[field.id] && (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                      </div>
                      <Select
                        value={fieldMappings[field.id] || ''}
                        onValueChange={(v) => setFieldMappings(prev => ({ ...prev, [field.id]: v }))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select source field" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAMPLE_SOURCE_FIELDS.map((sf) => (
                            <SelectItem key={sf} value={sf}>{sf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Validation */}
          {step === 'validation' && (
            <div className="space-y-4">
              {isValidating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Running validation checks...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Validation Results</Label>
                    <div className="flex gap-2">
                      {validationResults.filter(r => r.status === 'valid').length > 0 && (
                        <Badge className="bg-success/10 text-success border-0">
                          {validationResults.filter(r => r.status === 'valid').length} passed
                        </Badge>
                      )}
                      {validationResults.filter(r => r.status === 'warning').length > 0 && (
                        <Badge className="bg-warning/10 text-warning border-0">
                          {validationResults.filter(r => r.status === 'warning').length} warnings
                        </Badge>
                      )}
                      {validationResults.filter(r => r.status === 'error').length > 0 && (
                        <Badge className="bg-destructive/10 text-destructive border-0">
                          {validationResults.filter(r => r.status === 'error').length} errors
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {validationResults.map((result, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          result.status === 'valid' && 'bg-success/5 border border-success/20',
                          result.status === 'warning' && 'bg-warning/5 border border-warning/20',
                          result.status === 'error' && 'bg-destructive/5 border border-destructive/20'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {result.status === 'valid' && <CheckCircle className="h-4 w-4 text-success" />}
                          {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                          {result.status === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                          <div>
                            <p className="font-medium text-sm">{result.field}</p>
                            <p className="text-xs text-muted-foreground">{result.message}</p>
                          </div>
                        </div>
                        {result.recordsAffected !== undefined && result.recordsAffected > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {result.recordsAffected} records
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  {validationResults.some(r => r.status === 'error') && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please fix the errors above before proceeding.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {isConnecting ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Connecting and syncing data...</p>
                </div>
              ) : connectionResult?.success ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Connection Successful!</h3>
                  <p className="text-muted-foreground mb-6">
                    {integration.name} is now connected and syncing data.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    <Card className="p-4 text-center">
                      <p className="text-2xl font-bold text-success">{connectionResult.coverage}%</p>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <p className="text-2xl font-bold">{connectionResult.recordCount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Records</p>
                    </Card>
                  </div>

                  {linkedIssueTitle && (
                    <Alert className="mt-6 border-success/20 bg-success/5 text-left">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-sm">
                        <span className="font-medium">Issue resolved:</span> {linkedIssueTitle}
                        <br />
                        <span className="text-xs text-muted-foreground">Data confidence score will be updated.</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Connection failed. Please check your credentials and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step !== 'method' && step !== 'confirm' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {step === 'method' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isValidating || isConnecting}
            className="gap-2"
          >
            {isValidating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 'confirm' && connectionResult?.success ? (
              <>
                Done
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                {step === 'validation' ? 'Connect' : 'Continue'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
