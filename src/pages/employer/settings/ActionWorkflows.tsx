/**
 * Action Workflows Settings Page
 * Configure approval workflows for claims and actions
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  GitBranch, 
  Plus, 
  Trash2, 
  ChevronRight,
  ArrowDown,
  Clock,
  Users,
  CheckCircle2,
  Edit,
} from 'lucide-react';
import { useWorkflowDefinitions } from '@/hooks/useWorkflowDefinitions';
import { useApproverGroups } from '@/hooks/useApproverGroups';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id?: string;
  step_order: number;
  name: string;
  approver_group_id: string | null;
  sla_hours: number | null;
  allow_skip: boolean;
}

export default function ActionWorkflowsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const { workflows, isLoading, createWorkflow, deleteWorkflow, setDefaultWorkflow, isCreating } = useWorkflowDefinitions('claim_approval');
  const { groups: approverGroups } = useApproverGroups();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowSteps, setNewWorkflowSteps] = useState<WorkflowStep[]>([
    { step_order: 1, name: 'Step 1', approver_group_id: null, sla_hours: 48, allow_skip: false }
  ]);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim() || newWorkflowSteps.length === 0) return;
    
    try {
      const result = await createWorkflow.mutateAsync({ 
        name: newWorkflowName 
      });
      
      // Add steps to the workflow
      for (const step of newWorkflowSteps) {
        await supabase
          .from('workflow_steps')
          .insert({
            workflow_definition_id: result.id,
            step_order: step.step_order,
            name: step.name,
            approver_group_id: step.approver_group_id,
            sla_hours: step.sla_hours,
            allow_skip: step.allow_skip,
            step_type: 'approval',
            assignee_type: 'group',
          });
      }
      
      toast.success('Workflow created with steps');
      setNewWorkflowName('');
      setNewWorkflowSteps([
        { step_order: 1, name: 'Step 1', approver_group_id: null, sla_hours: 48, allow_skip: false }
      ]);
      setCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const addStep = () => {
    setNewWorkflowSteps([
      ...newWorkflowSteps,
      { 
        step_order: newWorkflowSteps.length + 1, 
        name: `Step ${newWorkflowSteps.length + 1}`, 
        approver_group_id: null, 
        sla_hours: 48, 
        allow_skip: false 
      }
    ]);
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const updated = [...newWorkflowSteps];
    updated[index] = { ...updated[index], ...updates };
    setNewWorkflowSteps(updated);
  };

  const removeStep = (index: number) => {
    if (newWorkflowSteps.length <= 1) return;
    const updated = newWorkflowSteps.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      step_order: i + 1,
      name: `Step ${i + 1}`,
    }));
    setNewWorkflowSteps(updated);
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
              {isRTL ? 'سير عمل الإجراءات' : 'Action Workflows'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تكوين سير عمل الموافقات للإجراءات'
                : 'Configure approval workflows for actions'
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إنشاء سير عمل' : 'Create Workflow'}
        </Button>
      </div>

      {/* Workflows Table */}
      {isLoading ? (
        <Card className="animate-pulse">
          <CardContent className="py-8">
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : workflows?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <GitBranch className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isRTL ? 'لا يوجد سير عمل' : 'No Workflows'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {isRTL 
                ? 'أنشئ سير عمل أول للموافقات'
                : 'Create your first workflow for approvals'
              }
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'إنشاء سير عمل' : 'Create Workflow'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">Workflow Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Steps</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows?.map((workflow: any) => {
                // Determine usage based on scope_type
                const usedBy = workflow.scope_type === 'benefit' 
                  ? workflow.name.split(' ')[0] // First word is often the benefit name
                  : 'All Claims';
                
                return (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{workflow.name}</div>
                        {workflow.is_default && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px]">
                            Default
                          </Badge>
                        )}
                      </div>
                      {workflow.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {workflow.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {workflow.scope_type === 'benefit' ? 'Benefit' : 'Claim'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {workflow.is_active ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {workflow.workflow_steps?.length || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{usedBy}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!workflow.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultWorkflow.mutate(workflow.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteWorkflow.mutate(workflow.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {/* Steps Preview Section */}
          <div className="border-t p-4 space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Workflow Steps Preview</h3>
            {workflows?.slice(0, 3).map((workflow: any) => (
              <div key={workflow.id} className="space-y-2">
                <p className="text-sm font-medium">{workflow.name}</p>
                {workflow.workflow_steps && workflow.workflow_steps.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {workflow.workflow_steps
                      .sort((a: any, b: any) => a.step_order - b.step_order)
                      .map((step: any, index: number) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <div className="px-3 py-2 bg-muted rounded-lg text-sm whitespace-nowrap min-w-[120px]">
                            <div className="font-medium text-xs">{step.name}</div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                              {step.approver_group?.name && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {step.approver_group.name}
                                </span>
                              )}
                              {step.sla_hours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.sla_hours}h
                                </span>
                              )}
                            </div>
                          </div>
                          {index < workflow.workflow_steps.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء سير عمل للإجراءات' : 'Create Action Workflow'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="wf-name">{isRTL ? 'اسم سير العمل' : 'Workflow Name'} *</Label>
              <Input
                id="wf-name"
                placeholder={isRTL ? 'مثل: موافقة السياسات' : 'e.g., Policy Change Approval'}
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'خطوات الموافقة' : 'Approval Steps'}</Label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-4">
                {newWorkflowSteps.map((step, index) => (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <Card className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary">Step {step.step_order}</Badge>
                        {newWorkflowSteps.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeStep(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Approver Group</Label>
                          <Select
                            value={step.approver_group_id || ''}
                            onValueChange={(v) => updateStep(index, { approver_group_id: v || null })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select group..." />
                            </SelectTrigger>
                            <SelectContent>
                              {approverGroups.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {g.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">SLA (hours)</Label>
                            <Input
                              type="number"
                              value={step.sla_hours || ''}
                              onChange={(e) => updateStep(index, { sla_hours: parseInt(e.target.value) || null })}
                              placeholder="48"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs">Allow Skip</Label>
                            <div className="flex items-center h-10">
                              <Switch
                                checked={step.allow_skip}
                                onCheckedChange={(v) => updateStep(index, { allow_skip: v })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleCreateWorkflow} 
              disabled={!newWorkflowName.trim() || isCreating}
            >
              {isRTL ? 'إنشاء' : 'Create Workflow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
