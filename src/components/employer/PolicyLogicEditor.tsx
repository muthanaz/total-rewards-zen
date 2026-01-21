/**
 * Policy Logic Editor
 * 
 * Structured editor for policy business rules:
 * - Transaction Model
 * - Eligibility Rules
 * - Limits & Caps
 * - Required Documents
 * - Workflow
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Settings2,
  Users,
  DollarSign,
  FileCheck,
  GitBranch,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  PolicyLogic,
  PolicyRequiredDoc,
  EligibilityRules,
  LimitsCaps,
  WorkflowRules,
  TransactionModel,
  TRANSACTION_MODEL_OPTIONS,
  APPROVER_ROLE_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  COMMON_DOC_TYPES,
  DEFAULT_ELIGIBILITY_RULES,
  DEFAULT_LIMITS_CAPS,
  DEFAULT_WORKFLOW,
  ApproverRole,
} from '@/lib/policyEngine';

interface PolicyLogicEditorProps {
  logic: PolicyLogic;
  requiredDocs: PolicyRequiredDoc[];
  onChange: (logic: PolicyLogic, docs: PolicyRequiredDoc[]) => void;
  readOnly?: boolean;
}

// Sample data for multi-select (would come from org config)
const SAMPLE_GRADES = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];
const SAMPLE_DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
const SAMPLE_LOCATIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];

export function PolicyLogicEditor({
  logic,
  requiredDocs,
  onChange,
  readOnly = false,
}: PolicyLogicEditorProps) {
  const [localLogic, setLocalLogic] = useState<PolicyLogic>(logic);
  const [localDocs, setLocalDocs] = useState<PolicyRequiredDoc[]>(requiredDocs);

  useEffect(() => {
    setLocalLogic(logic);
    setLocalDocs(requiredDocs);
  }, [logic, requiredDocs]);

  const updateLogic = (updates: Partial<PolicyLogic>) => {
    const newLogic = { ...localLogic, ...updates };
    setLocalLogic(newLogic);
    onChange(newLogic, localDocs);
  };

  const updateEligibility = (updates: Partial<EligibilityRules>) => {
    const newRules = { ...localLogic.eligibility_rules, ...updates };
    updateLogic({ eligibility_rules: newRules });
  };

  const updateLimits = (updates: Partial<LimitsCaps>) => {
    const newLimits = { ...localLogic.limits_caps, ...updates };
    updateLogic({ limits_caps: newLimits });
  };

  const updateWorkflow = (updates: Partial<WorkflowRules>) => {
    const newWorkflow = { ...localLogic.workflow, ...updates };
    updateLogic({ workflow: newWorkflow });
  };

  const addDoc = (transactionType: 'request' | 'claim') => {
    const newDoc: PolicyRequiredDoc = {
      transaction_type: transactionType,
      doc_type: 'invoice',
      doc_name: 'New Document',
      is_required: true,
      conditions_json: {},
    };
    const newDocs = [...localDocs, newDoc];
    setLocalDocs(newDocs);
    onChange(localLogic, newDocs);
  };

  const updateDoc = (index: number, updates: Partial<PolicyRequiredDoc>) => {
    const newDocs = [...localDocs];
    newDocs[index] = { ...newDocs[index], ...updates };
    setLocalDocs(newDocs);
    onChange(localLogic, newDocs);
  };

  const removeDoc = (index: number) => {
    const newDocs = localDocs.filter((_, i) => i !== index);
    setLocalDocs(newDocs);
    onChange(localLogic, newDocs);
  };

  const toggleArrayValue = (
    field: 'grades' | 'departments' | 'locations' | 'contract_types',
    value: string
  ) => {
    const current = localLogic.eligibility_rules[field] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateEligibility({ [field]: newValues });
  };

  const requestDocs = localDocs.filter((d) => d.transaction_type === 'request' || d.transaction_type === 'both');
  const claimDocs = localDocs.filter((d) => d.transaction_type === 'claim' || d.transaction_type === 'both');

  return (
    <div className="space-y-6">
      {/* Transaction Model */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Transaction Model
          </CardTitle>
          <CardDescription>
            How employees interact with this benefit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRANSACTION_MODEL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  localLogic.transaction_model === opt.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${readOnly ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="radio"
                  name="transactionModel"
                  value={opt.value}
                  checked={localLogic.transaction_model === opt.value}
                  onChange={() => !readOnly && updateLogic({ transaction_model: opt.value })}
                  disabled={readOnly}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Eligibility Rules
          </CardTitle>
          <CardDescription>
            Define who can access this benefit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Grades */}
          <div className="space-y-2">
            <Label>Eligible Grades</Label>
            <p className="text-xs text-muted-foreground">Leave empty to allow all grades</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_GRADES.map((grade) => (
                <Badge
                  key={grade}
                  variant={localLogic.eligibility_rules.grades.includes(grade) ? 'default' : 'outline'}
                  className={`cursor-pointer ${readOnly ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !readOnly && toggleArrayValue('grades', grade)}
                >
                  {grade}
                </Badge>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-2">
            <Label>Eligible Departments</Label>
            <p className="text-xs text-muted-foreground">Leave empty to allow all departments</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DEPARTMENTS.map((dept) => (
                <Badge
                  key={dept}
                  variant={localLogic.eligibility_rules.departments.includes(dept) ? 'default' : 'outline'}
                  className={`cursor-pointer ${readOnly ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !readOnly && toggleArrayValue('departments', dept)}
                >
                  {dept}
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label>Eligible Locations</Label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_LOCATIONS.map((loc) => (
                <Badge
                  key={loc}
                  variant={localLogic.eligibility_rules.locations.includes(loc) ? 'default' : 'outline'}
                  className={`cursor-pointer ${readOnly ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !readOnly && toggleArrayValue('locations', loc)}
                >
                  {loc}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contract Types */}
          <div className="space-y-2">
            <Label>Contract Types</Label>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TYPE_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  variant={localLogic.eligibility_rules.contract_types.includes(opt.value) ? 'default' : 'outline'}
                  className={`cursor-pointer ${readOnly ? 'cursor-not-allowed' : ''}`}
                  onClick={() => !readOnly && toggleArrayValue('contract_types', opt.value)}
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tenure & Probation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTenure">Minimum Tenure (months)</Label>
              <Input
                id="minTenure"
                type="number"
                min="0"
                value={localLogic.eligibility_rules.min_tenure_months}
                onChange={(e) => updateEligibility({ min_tenure_months: parseInt(e.target.value) || 0 })}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="probation">Probation Requirement</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="probation"
                  checked={localLogic.eligibility_rules.probation_passed}
                  onCheckedChange={(checked) => updateEligibility({ probation_passed: checked })}
                  disabled={readOnly}
                />
                <span className="text-sm">Must complete probation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limits & Caps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Limits & Caps
          </CardTitle>
          <CardDescription>
            Set financial limits for this benefit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualCap">Annual Cap</Label>
              <div className="flex gap-2">
                <Input
                  id="annualCap"
                  type="number"
                  min="0"
                  placeholder="No limit"
                  value={localLogic.limits_caps.annual_cap || ''}
                  onChange={(e) => updateLimits({ annual_cap: e.target.value ? parseInt(e.target.value) : null })}
                  disabled={readOnly}
                />
                <Select
                  value={localLogic.limits_caps.annual_cap_currency}
                  onValueChange={(v) => updateLimits({ annual_cap_currency: v })}
                  disabled={readOnly}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perTxCap">Per-Transaction Cap</Label>
              <Input
                id="perTxCap"
                type="number"
                min="0"
                placeholder="No limit"
                value={localLogic.limits_caps.per_transaction_cap || ''}
                onChange={(e) => updateLimits({ per_transaction_cap: e.target.value ? parseInt(e.target.value) : null })}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={localLogic.limits_caps.frequency}
                onValueChange={(v: 'monthly' | 'annual') => updateLimits({ frequency: v })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetMonth">Reset Month</Label>
              <Select
                value={String(localLogic.limits_caps.reset_month)}
                onValueChange={(v) => updateLimits({ reset_month: parseInt(v) })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2000, m - 1, 1).toLocaleString('en', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="preApproval">Pre-Approval Threshold</Label>
            <p className="text-xs text-muted-foreground">
              Require pre-approval for amounts above this threshold
            </p>
            <Input
              id="preApproval"
              type="number"
              min="0"
              placeholder="No threshold (always/never)"
              value={localLogic.limits_caps.pre_approval_threshold || ''}
              onChange={(e) => updateLimits({ pre_approval_threshold: e.target.value ? parseInt(e.target.value) : null })}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Define what documents employees must provide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="request">
            <TabsList className="mb-4">
              <TabsTrigger value="request">For Requests</TabsTrigger>
              <TabsTrigger value="claim">For Claims</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="space-y-3">
              {requestDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No documents required for requests
                </p>
              ) : (
                requestDocs.map((doc, idx) => {
                  const actualIdx = localDocs.findIndex((d) => d === doc);
                  return (
                    <DocumentRow
                      key={actualIdx}
                      doc={doc}
                      onUpdate={(updates) => updateDoc(actualIdx, updates)}
                      onRemove={() => removeDoc(actualIdx)}
                      readOnly={readOnly}
                    />
                  );
                })
              )}
              {!readOnly && (
                <Button variant="outline" size="sm" onClick={() => addDoc('request')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              )}
            </TabsContent>

            <TabsContent value="claim" className="space-y-3">
              {claimDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No documents required for claims
                </p>
              ) : (
                claimDocs.map((doc, idx) => {
                  const actualIdx = localDocs.findIndex((d) => d === doc);
                  return (
                    <DocumentRow
                      key={actualIdx}
                      doc={doc}
                      onUpdate={(updates) => updateDoc(actualIdx, updates)}
                      onRemove={() => removeDoc(actualIdx)}
                      readOnly={readOnly}
                    />
                  );
                })
              )}
              {!readOnly && (
                <Button variant="outline" size="sm" onClick={() => addDoc('claim')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Workflow
          </CardTitle>
          <CardDescription>
            Configure approval workflow settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Approver Role</Label>
              <Select
                value={localLogic.workflow.approver_role}
                onValueChange={(v: ApproverRole) => updateWorkflow({ approver_role: v })}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVER_ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slaDays">SLA (days)</Label>
              <Input
                id="slaDays"
                type="number"
                min="1"
                value={localLogic.workflow.sla_days}
                onChange={(e) => updateWorkflow({ sla_days: parseInt(e.target.value) || 3 })}
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Escalation Role (optional)</Label>
            <Select
              value={localLogic.workflow.escalation_role || 'none'}
              onValueChange={(v) => updateWorkflow({ escalation_role: v === 'none' ? null : v as ApproverRole })}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="No escalation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No escalation</SelectItem>
                {APPROVER_ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-component for document rows
function DocumentRow({
  doc,
  onUpdate,
  onRemove,
  readOnly,
}: {
  doc: PolicyRequiredDoc;
  onUpdate: (updates: Partial<PolicyRequiredDoc>) => void;
  onRemove: () => void;
  readOnly: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
      <div className="flex-1 grid grid-cols-3 gap-2">
        <Select
          value={doc.doc_type}
          onValueChange={(v) => onUpdate({ doc_type: v })}
          disabled={readOnly}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_DOC_TYPES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={doc.doc_name}
          onChange={(e) => onUpdate({ doc_name: e.target.value })}
          placeholder="Display name"
          disabled={readOnly}
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={doc.is_required}
            onCheckedChange={(v) => onUpdate({ is_required: v })}
            disabled={readOnly}
          />
          <span className="text-xs">{doc.is_required ? 'Required' : 'Optional'}</span>
        </div>
      </div>
      {!readOnly && (
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
