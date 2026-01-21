/**
 * Policy Capability Display Components
 * 
 * Shows policy configuration status as visual chips/badges
 * derived from actual policy_versions.logic_json data.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Clock,
  FileCheck,
  Users,
  DollarSign,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Settings2,
} from 'lucide-react';
import { PolicyLogic, DEFAULT_POLICY_LOGIC } from '@/lib/policyEngine';

// ============ Policy Model Chip ============

interface PolicyModelChipProps {
  model: string | null;
  compact?: boolean;
}

export function PolicyModelChip({ model, compact = false }: PolicyModelChipProps) {
  const labels: Record<string, { label: string; shortLabel: string; className: string; description: string }> = {
    'request_only': { 
      label: 'Request Only', 
      shortLabel: 'Request',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      description: 'Pre-approval required before expense',
    },
    'claim_only': { 
      label: 'Claim Only', 
      shortLabel: 'Claim',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      description: 'Submit reimbursement after expense',
    },
    'request_and_claim': { 
      label: 'Request + Claim', 
      shortLabel: 'Hybrid',
      className: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
      description: 'Pre-approval then settlement',
    },
  };
  
  const config = labels[model || 'claim_only'] || labels['claim_only'];
  
  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="outline" className={`text-xs ${config.className}`}>
          {compact ? config.shortLabel : config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ============ Policy Capability Chips ============

interface PolicyCapabilityChipsProps {
  logicJson?: PolicyLogic | null;
  transactionModel?: string | null;
  compact?: boolean;
  maxVisible?: number;
}

interface Capability {
  key: string;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  detail: string;
}

export function PolicyCapabilityChips({ 
  logicJson, 
  transactionModel,
  compact = false,
  maxVisible = 4,
}: PolicyCapabilityChipsProps) {
  const logic = logicJson || DEFAULT_POLICY_LOGIC;
  
  // Derive capabilities from actual logic_json
  const capabilities: Capability[] = [
    {
      key: 'sla',
      label: 'SLA',
      icon: <Clock className="w-3 h-3" />,
      enabled: (logic.workflow?.sla_days || 0) > 0,
      detail: logic.workflow?.sla_days 
        ? `${logic.workflow.sla_days} day${logic.workflow.sla_days > 1 ? 's' : ''} SLA`
        : 'No SLA configured',
    },
    {
      key: 'eligibility',
      label: 'Eligibility',
      icon: <Users className="w-3 h-3" />,
      enabled: hasEligibilityRules(logic.eligibility_rules),
      detail: getEligibilityDetail(logic.eligibility_rules),
    },
    {
      key: 'limits',
      label: 'Limits',
      icon: <DollarSign className="w-3 h-3" />,
      enabled: hasLimits(logic.limits_caps),
      detail: getLimitsDetail(logic.limits_caps),
    },
    {
      key: 'workflow',
      label: 'Workflow',
      icon: <GitBranch className="w-3 h-3" />,
      enabled: !!logic.workflow?.approver_role,
      detail: logic.workflow?.approver_role 
        ? `Approver: ${formatApproverRole(logic.workflow.approver_role)}`
        : 'No workflow configured',
    },
  ];
  
  const enabledCapabilities = capabilities.filter(c => c.enabled);
  const disabledCapabilities = capabilities.filter(c => !c.enabled);
  const visibleCapabilities = enabledCapabilities.slice(0, maxVisible);
  const hiddenCount = enabledCapabilities.length - maxVisible;
  
  if (enabledCapabilities.length === 0) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
            <Settings2 className="w-3 h-3" />
            Basic
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Basic Configuration</p>
          <p className="text-xs text-muted-foreground">
            No advanced rules configured. Edit to add eligibility, limits, or SLA.
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <div className="flex gap-1 flex-wrap">
      {visibleCapabilities.map((cap) => (
        <Tooltip key={cap.key}>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className="text-xs gap-1 py-0 px-1.5 bg-primary/5 border-primary/20 text-primary"
            >
              {cap.icon}
              {!compact && cap.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              <span className="font-medium">{cap.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{cap.detail}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      
      {hiddenCount > 0 && (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs py-0 px-1.5">
              +{hiddenCount}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Additional Capabilities</p>
            {enabledCapabilities.slice(maxVisible).map(cap => (
              <p key={cap.key} className="text-xs">{cap.label}: {cap.detail}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ============ Status Badge ============

interface PolicyStatusBadgeProps {
  status: string;
  versionNumber?: number;
  hasDraft?: boolean;
}

export function PolicyStatusBadge({ status, versionNumber, hasDraft }: PolicyStatusBadgeProps) {
  if (status === 'active' || status === 'published') {
    return (
      <div className="flex items-center gap-1">
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          Published {versionNumber ? `v${versionNumber}` : ''}
        </Badge>
        {hasDraft && (
          <Badge variant="outline" className="text-amber-600 border-amber-500/20">
            Draft pending
          </Badge>
        )}
      </div>
    );
  }
  
  if (status === 'draft') {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        Draft {versionNumber ? `v${versionNumber}` : ''}
      </Badge>
    );
  }
  
  if (status === 'archived') {
    return (
      <Badge className="bg-muted text-muted-foreground">
        Archived
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-muted-foreground">
      {status}
    </Badge>
  );
}

// ============ Downstream Effects Preview ============

interface DownstreamEffectsProps {
  logicJson?: PolicyLogic | null;
  transactionModel?: string | null;
  compact?: boolean;
}

export function DownstreamEffects({ logicJson, transactionModel, compact = false }: DownstreamEffectsProps) {
  const logic = logicJson || DEFAULT_POLICY_LOGIC;
  const model = transactionModel || logic.transaction_model || 'claim_only';
  
  const effects = [
    {
      area: 'Claims',
      items: [
        model === 'request_only' 
          ? 'Employees submit requests for pre-approval'
          : model === 'request_and_claim'
          ? 'Requests for pre-approval, settlements for reimbursement'
          : 'Employees submit claims for reimbursement',
        logic.workflow?.sla_days 
          ? `${logic.workflow.sla_days}-day SLA for processing`
          : 'No SLA deadline',
        hasLimits(logic.limits_caps)
          ? 'Cap validation on submission'
          : 'No financial limits',
      ],
    },
    {
      area: 'Employee Portal',
      items: [
        'Policy visible in Knowledge Hub',
        hasEligibilityRules(logic.eligibility_rules)
          ? 'Eligibility check before submission'
          : 'All employees can submit',
      ],
    },
  ];
  
  if (compact) {
    return (
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>• {effects[0].items[0]}</p>
        <p>• {effects[0].items[1]}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {effects.map((effect) => (
        <div key={effect.area}>
          <p className="text-sm font-medium text-foreground">{effect.area}</p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
            {effect.items.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ============ Helper Functions ============

function hasEligibilityRules(rules?: PolicyLogic['eligibility_rules']): boolean {
  if (!rules) return false;
  return (
    (rules.grades?.length || 0) > 0 ||
    (rules.departments?.length || 0) > 0 ||
    (rules.locations?.length || 0) > 0 ||
    (rules.contract_types?.length || 0) > 0 ||
    (rules.min_tenure_months || 0) > 0 ||
    !!rules.probation_passed
  );
}

function getEligibilityDetail(rules?: PolicyLogic['eligibility_rules']): string {
  if (!rules) return 'All employees eligible';
  
  const parts: string[] = [];
  if (rules.grades?.length) parts.push(`${rules.grades.length} grade(s)`);
  if (rules.departments?.length) parts.push(`${rules.departments.length} dept(s)`);
  if (rules.locations?.length) parts.push(`${rules.locations.length} location(s)`);
  if (rules.min_tenure_months) parts.push(`${rules.min_tenure_months}mo tenure`);
  if (rules.probation_passed) parts.push('post-probation');
  
  return parts.length > 0 ? parts.join(', ') : 'All employees eligible';
}

function hasLimits(limits?: PolicyLogic['limits_caps']): boolean {
  if (!limits) return false;
  return (
    (limits.annual_cap ?? 0) > 0 ||
    (limits.per_transaction_cap ?? 0) > 0 ||
    (limits.pre_approval_threshold ?? 0) > 0
  );
}

function getLimitsDetail(limits?: PolicyLogic['limits_caps']): string {
  if (!limits) return 'No limits';
  
  const parts: string[] = [];
  if (limits.annual_cap) {
    parts.push(`${limits.annual_cap.toLocaleString()} ${limits.annual_cap_currency || 'AED'}/yr`);
  }
  if (limits.per_transaction_cap) {
    parts.push(`${limits.per_transaction_cap.toLocaleString()}/txn`);
  }
  if (limits.pre_approval_threshold) {
    parts.push(`Pre-approval > ${limits.pre_approval_threshold.toLocaleString()}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No limits configured';
}

function formatApproverRole(role: string): string {
  const labels: Record<string, string> = {
    manager: 'Line Manager',
    hr: 'HR',
    finance: 'Finance',
    admin: 'Admin',
  };
  return labels[role] || role;
}
