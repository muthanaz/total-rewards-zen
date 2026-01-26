/**
 * Policy Enforcement Mode Selector
 * 
 * Allows setting SOFT or STRICT enforcement mode at policy level.
 * - SOFT: Flag non-compliant submissions but allow them
 * - STRICT: Block non-compliant submissions entirely
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react';

export type EnforcementMode = 'soft' | 'strict';

interface PolicyEnforcementModeSelectorProps {
  value: EnforcementMode;
  onChange: (mode: EnforcementMode) => void;
  disabled?: boolean;
}

export function PolicyEnforcementModeSelector({
  value,
  onChange,
  disabled = false,
}: PolicyEnforcementModeSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Enforcement Mode
        </CardTitle>
        <CardDescription>
          How should policy rules be enforced during claim submission?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={value}
          onValueChange={(v) => onChange(v as EnforcementMode)}
          disabled={disabled}
          className="space-y-3"
        >
          <div className={`flex items-start space-x-3 p-3 rounded-lg border ${value === 'soft' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value="soft" id="soft" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="soft" className="flex items-center gap-2 cursor-pointer">
                <span className="font-medium">Soft Gating</span>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Non-compliant submissions are flagged for review but allowed. 
                HR Ops can manually approve or reject with full visibility.
              </p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 p-3 rounded-lg border ${value === 'strict' ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <RadioGroupItem value="strict" id="strict" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="strict" className="flex items-center gap-2 cursor-pointer">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                <span className="font-medium">Strict Blocking</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Non-compliant submissions are blocked at submission time.
                Employees must meet all requirements before submitting.
              </p>
            </div>
          </div>
        </RadioGroup>

        {value === 'strict' && (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Strict mode may reduce employee satisfaction if rules are too restrictive.
              Ensure all eligibility criteria and required documents are clearly communicated.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
