/**
 * Workflow Section Component
 * 
 * Configure transaction model and approval workflow.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GitBranch, Clock, Users, AlertTriangle, FileCheck, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowConfig, TransactionModel } from './types';

interface WorkflowSectionProps {
  workflow: WorkflowConfig;
  approverGroups: { id: string; name: string }[];
  onChange: (workflow: WorkflowConfig) => void;
}

const TRANSACTION_MODELS: {
  value: TransactionModel;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'request_only',
    label: 'Request Only',
    description: 'Employee requests pre-approval before incurring expense',
    icon: Send,
  },
  {
    value: 'claim_only',
    label: 'Claim Only',
    description: 'Employee submits claim after expense is incurred',
    icon: FileCheck,
  },
  {
    value: 'request_and_claim',
    label: 'Request + Claim',
    description: 'Pre-approval required, then claim submitted after expense',
    icon: GitBranch,
  },
];

const ESCALATION_ROLES = [
  { value: 'hr_lead', label: 'HR Lead' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'cfo', label: 'CFO' },
  { value: 'ceo', label: 'CEO' },
];

export function WorkflowSection({
  workflow,
  approverGroups,
  onChange,
}: WorkflowSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          Workflow Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction Model */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Transaction Model</Label>
          <RadioGroup
            value={workflow.transactionModel}
            onValueChange={(value: TransactionModel) =>
              onChange({ ...workflow, transactionModel: value })
            }
            className="space-y-2"
          >
            {TRANSACTION_MODELS.map((model) => {
              const Icon = model.icon;
              const isSelected = workflow.transactionModel === model.value;
              return (
                <div
                  key={model.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                  onClick={() => onChange({ ...workflow, transactionModel: model.value })}
                >
                  <RadioGroupItem value={model.value} id={model.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                      <label htmlFor={model.value} className="font-medium text-sm cursor-pointer">
                        {model.label}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Approver Group */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Users className="w-4 h-4 text-muted-foreground" />
            Approver Group
          </Label>
          <Select
            value={workflow.approverGroupId || ''}
            onValueChange={(value) =>
              onChange({
                ...workflow,
                approverGroupId: value || null,
                approverGroupName: approverGroups.find((g) => g.id === value)?.name,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select approver group..." />
            </SelectTrigger>
            <SelectContent>
              {approverGroups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!workflow.approverGroupId && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              No approver group selected - claims will route to default workflow
            </p>
          )}
        </div>

        {/* SLA & Escalation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              SLA (Days)
            </Label>
            <Input
              type="number"
              min={1}
              value={workflow.slaDays}
              onChange={(e) =>
                onChange({ ...workflow, slaDays: parseInt(e.target.value) || 3 })
              }
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Target time to process claims
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              Escalation Role
            </Label>
            <Select
              value={workflow.escalationRole || ''}
              onValueChange={(value) =>
                onChange({ ...workflow, escalationRole: value || null })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {ESCALATION_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Auto-Approve */}
        <div className="p-4 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-Approve Under Threshold</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically approve claims below the pre-approval threshold
              </p>
            </div>
            <Switch
              checked={workflow.autoApproveUnderThreshold}
              onCheckedChange={(checked) =>
                onChange({ ...workflow, autoApproveUnderThreshold: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
