/**
 * Enhanced Workflows Page
 * 
 * Step definitions, SLAs, escalation rules, and "waiting on" pause.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  GitBranch, 
  Plus, 
  FileCheck, 
  FileText, 
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  Pause,
  Play,
  Trash2,
  Settings2,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  stepOrder: number;
  name: string;
  approverGroupId: string | null;
  approverGroupName?: string;
  slaDays: number;
  escalationAfterDays: number | null;
  escalationRole: string | null;
  pauseOnWaitingFor: string[];
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  workflowType: 'claim_approval' | 'policy_change';
  isDefault: boolean;
  isActive: boolean;
  steps: WorkflowStep[];
}

// Mock data
const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-1',
    name: 'Standard Claims Workflow',
    description: 'Default approval workflow for employee claims',
    workflowType: 'claim_approval',
    isDefault: true,
    isActive: true,
    steps: [
      {
        id: 'step-1',
        stepOrder: 1,
        name: 'Line Manager Approval',
        approverGroupId: 'group-1',
        approverGroupName: 'Line Managers',
        slaDays: 2,
        escalationAfterDays: 3,
        escalationRole: 'hr_lead',
        pauseOnWaitingFor: ['employee', 'document'],
      },
      {
        id: 'step-2',
        stepOrder: 2,
        name: 'HR Review',
        approverGroupId: 'group-2',
        approverGroupName: 'HR Team',
        slaDays: 1,
        escalationAfterDays: 2,
        escalationRole: 'hr_director',
        pauseOnWaitingFor: [],
      },
    ],
  },
  {
    id: 'wf-2',
    name: 'High-Value Claims',
    description: 'For claims above AED 10,000',
    workflowType: 'claim_approval',
    isDefault: false,
    isActive: true,
    steps: [
      {
        id: 'step-3',
        stepOrder: 1,
        name: 'Department Head',
        approverGroupId: 'group-3',
        approverGroupName: 'Department Heads',
        slaDays: 2,
        escalationAfterDays: null,
        escalationRole: null,
        pauseOnWaitingFor: [],
      },
      {
        id: 'step-4',
        stepOrder: 2,
        name: 'Finance Review',
        approverGroupId: 'group-4',
        approverGroupName: 'Finance Team',
        slaDays: 2,
        escalationAfterDays: 3,
        escalationRole: 'cfo',
        pauseOnWaitingFor: [],
      },
      {
        id: 'step-5',
        stepOrder: 3,
        name: 'CFO Approval',
        approverGroupId: 'group-5',
        approverGroupName: 'Executive',
        slaDays: 3,
        escalationAfterDays: null,
        escalationRole: null,
        pauseOnWaitingFor: [],
      },
    ],
  },
];

const MOCK_APPROVER_GROUPS = [
  { id: 'group-1', name: 'Line Managers' },
  { id: 'group-2', name: 'HR Team' },
  { id: 'group-3', name: 'Department Heads' },
  { id: 'group-4', name: 'Finance Team' },
  { id: 'group-5', name: 'Executive' },
];

const ESCALATION_ROLES = [
  { value: 'hr_lead', label: 'HR Lead' },
  { value: 'hr_director', label: 'HR Director' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'cfo', label: 'CFO' },
  { value: 'ceo', label: 'CEO' },
];

const PAUSE_CONDITIONS = [
  { value: 'employee', label: 'Waiting on Employee Response' },
  { value: 'document', label: 'Waiting on Document Upload' },
  { value: 'external', label: 'Waiting on External Party' },
];

export default function WorkflowsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [activeType, setActiveType] = useState<'claim_approval' | 'policy_change'>('claim_approval');
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(MOCK_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  const filteredWorkflows = workflows.filter((w) => w.workflowType === activeType);
  const defaultWorkflow = filteredWorkflows.find((w) => w.isDefault);
  const otherWorkflows = filteredWorkflows.filter((w) => !w.isDefault);

  const handleOpenEditor = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow);
    setEditorOpen(true);
  };

  const handleAddStep = () => {
    if (!selectedWorkflow) return;
    
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      stepOrder: selectedWorkflow.steps.length + 1,
      name: `Step ${selectedWorkflow.steps.length + 1}`,
      approverGroupId: null,
      slaDays: 2,
      escalationAfterDays: null,
      escalationRole: null,
      pauseOnWaitingFor: [],
    };
    
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep],
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!selectedWorkflow) return;
    
    const newSteps = selectedWorkflow.steps
      .filter((s) => s.id !== stepId)
      .map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
    
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: newSteps,
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return;
    
    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    });
  };

  const handleSaveWorkflow = () => {
    if (!selectedWorkflow) return;
    
    setWorkflows(workflows.map((w) =>
      w.id === selectedWorkflow.id ? selectedWorkflow : w
    ));
    
    toast.success('Workflow saved successfully');
    setEditorOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GitBranch className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'سير العمل' : 'Workflows'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تكوين خطوات الموافقة والتصعيد والإيقاف المؤقت'
                : 'Configure approval steps, escalation rules, and pause conditions'
              }
            </p>
          </div>
        </div>
        
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </Button>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as typeof activeType)}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="claim_approval" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Claim Approval
          </TabsTrigger>
          <TabsTrigger value="policy_change" className="gap-2">
            <FileText className="w-4 h-4" />
            Policy Changes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeType} className="mt-6 space-y-6">
          {/* Default Workflow */}
          {defaultWorkflow && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">Default Workflow</h2>
                <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
              </div>
              <WorkflowCard
                workflow={defaultWorkflow}
                onEdit={() => handleOpenEditor(defaultWorkflow)}
              />
            </div>
          )}

          {/* Other Workflows */}
          {otherWorkflows.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Other Workflows</h2>
              <div className="grid gap-4">
                {otherWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onEdit={() => handleOpenEditor(workflow)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredWorkflows.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <GitBranch className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Workflows</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your first workflow to manage approvals
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              {selectedWorkflow?.name || 'Edit Workflow'}
            </SheetTitle>
            <SheetDescription>
              Configure approval steps, SLAs, and escalation rules
            </SheetDescription>
          </SheetHeader>

          {selectedWorkflow && (
            <div className="py-6 space-y-6">
              {/* Workflow Name */}
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={selectedWorkflow.name}
                  onChange={(e) =>
                    setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })
                  }
                />
              </div>

              <Separator />

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Approval Steps</Label>
                  <Button variant="outline" size="sm" onClick={handleAddStep}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedWorkflow.steps.map((step, idx) => (
                    <Card key={step.id} className="relative">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Step {step.stepOrder}
                            </Badge>
                            <Input
                              value={step.name}
                              onChange={(e) =>
                                handleUpdateStep(step.id, { name: e.target.value })
                              }
                              className="h-7 w-48 text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Approver Group */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Approver Group</Label>
                            <Select
                              value={step.approverGroupId || ''}
                              onValueChange={(value) =>
                                handleUpdateStep(step.id, {
                                  approverGroupId: value || null,
                                  approverGroupName: MOCK_APPROVER_GROUPS.find(
                                    (g) => g.id === value
                                  )?.name,
                                })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select group..." />
                              </SelectTrigger>
                              <SelectContent>
                                {MOCK_APPROVER_GROUPS.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">SLA (Days)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={step.slaDays}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  slaDays: parseInt(e.target.value) || 1,
                                })
                              }
                              className="h-8 w-20"
                            />
                          </div>
                        </div>

                        {/* Escalation */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Escalate After (Days)</Label>
                            <Input
                              type="number"
                              min={1}
                              placeholder="No escalation"
                              value={step.escalationAfterDays || ''}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  escalationAfterDays: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                })
                              }
                              className="h-8 w-32"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Escalate To</Label>
                            <Select
                              value={step.escalationRole || ''}
                              onValueChange={(value) =>
                                handleUpdateStep(step.id, {
                                  escalationRole: value || null,
                                })
                              }
                              disabled={!step.escalationAfterDays}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                              <SelectContent>
                                {ESCALATION_ROLES.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Pause Conditions */}
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-1">
                            <Pause className="w-3 h-3" />
                            Pause SLA When
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {PAUSE_CONDITIONS.map((condition) => (
                              <Badge
                                key={condition.value}
                                variant={
                                  step.pauseOnWaitingFor.includes(condition.value)
                                    ? 'default'
                                    : 'outline'
                                }
                                className="cursor-pointer text-xs"
                                onClick={() => {
                                  const newPause = step.pauseOnWaitingFor.includes(
                                    condition.value
                                  )
                                    ? step.pauseOnWaitingFor.filter(
                                        (p) => p !== condition.value
                                      )
                                    : [...step.pauseOnWaitingFor, condition.value];
                                  handleUpdateStep(step.id, {
                                    pauseOnWaitingFor: newPause,
                                  });
                                }}
                              >
                                {condition.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>

                      {/* Step Connector */}
                      {idx < selectedWorkflow.steps.length - 1 && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow}>
              Save Workflow
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Workflow Card Component
function WorkflowCard({
  workflow,
  onEdit,
}: {
  workflow: WorkflowDefinition;
  onEdit: () => void;
}) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{workflow.name}</CardTitle>
            {workflow.description && (
              <CardDescription className="mt-1">{workflow.description}</CardDescription>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Settings2 className="w-3 h-3" />
            Configure
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Steps Visual */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflow.steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="p-2 rounded-lg bg-primary/10 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-medium text-center">{step.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {step.slaDays}d SLA
                  </span>
                </div>
                {step.pauseOnWaitingFor.length > 0 && (
                  <Badge variant="secondary" className="text-[9px] mt-1 gap-0.5">
                    <Pause className="w-2.5 h-2.5" />
                    Pause enabled
                  </Badge>
                )}
              </div>
              {idx < workflow.steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{workflow.steps.length} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {workflow.steps.reduce((sum, s) => sum + s.slaDays, 0)}d total SLA
            </span>
          </div>
          {workflow.steps.some((s) => s.escalationRole) && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Escalation configured</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
