import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Eye, 
  Bell,
  AlertTriangle,
  CheckCircle2,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CampaignPurpose, PURPOSE_CONFIG } from './types';

interface CampaignGuardrailsProps {
  purpose: CampaignPurpose;
  onPurposeChange: (purpose: CampaignPurpose) => void;
  requiresPreview: boolean;
  onRequiresPreviewChange: (value: boolean) => void;
  previewApproved: boolean;
  previewApprovedBy?: string;
  optOutHandling: 'respect' | 'override_critical';
  onOptOutHandlingChange: (value: 'respect' | 'override_critical') => void;
  onRequestPreviewApproval?: () => void;
}

export function CampaignGuardrails({
  purpose,
  onPurposeChange,
  requiresPreview,
  onRequiresPreviewChange,
  previewApproved,
  previewApprovedBy,
  optOutHandling,
  onOptOutHandlingChange,
  onRequestPreviewApproval,
}: CampaignGuardrailsProps) {
  const purposes = Object.entries(PURPOSE_CONFIG) as [CampaignPurpose, typeof PURPOSE_CONFIG[CampaignPurpose]][];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Campaign Guardrails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Purpose Tag */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Purpose Tag <span className="text-destructive">*</span>
          </Label>
          <Select value={purpose} onValueChange={(v) => onPurposeChange(v as CampaignPurpose)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {purposes.map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                      {config.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Purpose determines opt-out rules and reporting categories
          </p>
        </div>

        {/* Preview Approval */}
        <div className="space-y-3 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="preview" className="text-sm">Require Preview Approval</Label>
            </div>
            <Switch
              id="preview"
              checked={requiresPreview}
              onCheckedChange={onRequiresPreviewChange}
            />
          </div>
          
          {requiresPreview && (
            <div className="pt-2 border-t">
              {previewApproved ? (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved by {previewApprovedBy}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Pending approval</span>
                  </div>
                  <button
                    onClick={onRequestPreviewApproval}
                    className="text-xs text-primary hover:underline"
                  >
                    Request Approval
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Opt-Out Handling */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <UserX className="w-3 h-3" />
            Opt-Out Handling
          </Label>
          <RadioGroup
            value={optOutHandling}
            onValueChange={(v) => onOptOutHandlingChange(v as any)}
            className="space-y-2"
          >
            <Label
              htmlFor="respect"
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                optOutHandling === 'respect' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value="respect" id="respect" className="mt-0.5" />
              <div>
                <span className="text-sm font-medium">Respect Preferences</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Skip employees who opted out of this message type
                </p>
              </div>
            </Label>
            <Label
              htmlFor="override"
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                optOutHandling === 'override_critical' ? 'border-warning bg-warning/5' : 'border-border hover:bg-muted/50'
              )}
            >
              <RadioGroupItem value="override_critical" id="override" className="mt-0.5" />
              <div>
                <span className="text-sm font-medium flex items-center gap-1">
                  Override (Critical)
                  <Badge variant="outline" className="text-[10px] border-warning text-warning">
                    Requires Approval
                  </Badge>
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send to all recipients regardless of preferences (policy updates, compliance)
                </p>
              </div>
            </Label>
          </RadioGroup>
        </div>

        {/* Guardrail Summary */}
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Guardrail Checklist</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className={cn('w-3 h-3', purpose ? 'text-success' : 'text-muted-foreground')} />
              <span className={purpose ? '' : 'text-muted-foreground'}>Purpose tagged</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className={cn('w-3 h-3', !requiresPreview || previewApproved ? 'text-success' : 'text-muted-foreground')} />
              <span className={!requiresPreview || previewApproved ? '' : 'text-muted-foreground'}>
                Preview {requiresPreview ? (previewApproved ? 'approved' : 'pending') : 'not required'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-success" />
              <span>Opt-out handling configured</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
