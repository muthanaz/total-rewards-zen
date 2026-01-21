/**
 * Issue Resolution Modal
 * 
 * Modal for resolving data confidence issues with different resolution types.
 */

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import {
  Link2,
  Database,
  Shield,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DataConfidenceIssue, ResolutionType } from '@/hooks/useDataConfidenceIssues';

interface IssueResolveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: DataConfidenceIssue | null;
  onResolve: (issueId: string, resolutionType: ResolutionType, note: string) => void;
}

const RESOLUTION_OPTIONS: {
  type: ResolutionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  getActionLink?: (issueId: string) => string;
  rootCauseMatch?: string[]; // Matches issue.rootCause patterns
}[] = [
  {
    type: 'integration',
    label: 'Connect Integration',
    description: 'Link a data source or API to automatically sync data',
    icon: Link2,
    action: 'Go to Integrations',
    getActionLink: (issueId) => `/employer/integrations?view=ops&resolve_issue=${issueId}`,
    rootCauseMatch: ['not connected', 'not integrated', 'missing source'],
  },
  {
    type: 'data_source',
    label: 'Run Sync',
    description: 'Trigger data synchronization to refresh stale data',
    icon: Database,
    action: 'Go to Sync Monitor',
    getActionLink: (issueId) => `/employer/data-quality/sync?resolve_issue=${issueId}`,
    rootCauseMatch: ['stale', 'sync', 'intermittent', 'days ago'],
  },
  {
    type: 'quality_rule',
    label: 'Fix Data Quality',
    description: 'Run validation rules to identify and fix data issues',
    icon: Shield,
    action: 'Go to Data Quality Rules',
    getActionLink: (issueId) => `/employer/data-quality/rules?resolve_issue=${issueId}`,
    rootCauseMatch: ['quality', 'coverage', 'field', 'missing', 'incomplete', 'below'],
  },
  {
    type: 'accepted_risk',
    label: 'Mark as Accepted Risk',
    description: 'Acknowledge limitation and document business justification',
    icon: AlertTriangle,
  },
];

export function IssueResolveModal({
  open,
  onOpenChange,
  issue,
  onResolve,
}: IssueResolveModalProps) {
  const [selectedType, setSelectedType] = useState<ResolutionType | null>(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handleClose = () => {
    setSelectedType(null);
    setNote('');
    setStep('select');
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!issue || !selectedType || !note.trim()) return;
    onResolve(issue.id, selectedType, note.trim());
    handleClose();
  };

  const selectedOption = RESOLUTION_OPTIONS.find(o => o.type === selectedType);

  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve Issue</DialogTitle>
          <DialogDescription>
            {issue.title}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs">{issue.domain}</Badge>
              <Badge 
                className={cn(
                  'text-xs border-0',
                  issue.confidence === 'Low' && 'bg-destructive/10 text-destructive',
                  issue.confidence === 'Medium' && 'bg-warning/10 text-warning',
                  issue.confidence === 'High' && 'bg-success/10 text-success',
                )}
              >
                {issue.confidence} confidence
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              <strong>Recommended:</strong> {issue.recommendedFix}
            </p>

            <Label className="text-sm font-medium">How would you like to resolve this?</Label>
            
            <RadioGroup
              value={selectedType || ''}
              onValueChange={(v) => setSelectedType(v as ResolutionType)}
              className="grid gap-3 mt-2"
            >
              {RESOLUTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;
                
                return (
                  <Card
                    key={option.type}
                    className={cn(
                      'p-3 cursor-pointer transition-all',
                      isSelected && 'ring-2 ring-primary border-primary'
                    )}
                    onClick={() => setSelectedType(option.type)}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={option.type} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className={cn(
                            'h-4 w-4',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )} />
                          <span className="font-medium text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        {option.action && option.getActionLink && isSelected && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-xs"
                            asChild
                          >
                            <Link to={option.getActionLink(issue.id)}>
                              {option.action}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {step === 'confirm' && selectedOption && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <selectedOption.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{selectedOption.label}</p>
                <p className="text-xs text-muted-foreground">{selectedOption.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution-note" className="text-sm font-medium">
                Resolution Note <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="resolution-note"
                placeholder={
                  selectedType === 'accepted_risk'
                    ? 'Explain why this risk is acceptable and any mitigating factors...'
                    : 'Describe what was done to resolve this issue...'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This will be recorded in the audit log.
              </p>
            </div>

            {selectedType === 'accepted_risk' && (
              <div className="p-3 rounded-lg border border-warning/50 bg-warning/5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Accepting Risk</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This issue will be marked as resolved but the underlying data gap will remain.
                      The confidence score will improve, but insights may still be limited.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'select' ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('confirm')} 
                disabled={!selectedType}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!note.trim()}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Resolve Issue
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
