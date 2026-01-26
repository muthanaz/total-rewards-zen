/**
 * Workflow Builder Page
 * 
 * Configure approval workflows for claims and policy changes.
 * Simple sequential workflow with up to 3 steps.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  GitBranch, 
  FileCheck, 
  FileText, 
  Settings,
  Play,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useWorkflowDefinitions } from '@/hooks/useWorkflowDefinitions';
import { WorkflowCard } from '@/components/employer/settings/WorkflowCard';
import { CreateWorkflowDialog } from '@/components/employer/settings/CreateWorkflowDialog';
import { WorkflowSimulator } from '@/components/employer/settings/WorkflowSimulator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WORKFLOW_TYPES = [
  { 
    id: 'claim_approval', 
    label: 'Claim Approval', 
    labelAr: 'موافقة المطالبات',
    description: 'Approval workflow for employee claims and requests',
    descriptionAr: 'سير العمل للموافقة على مطالبات وطلبات الموظفين',
    icon: FileCheck,
  },
  { 
    id: 'policy_change', 
    label: 'Policy Changes', 
    labelAr: 'تغييرات السياسات',
    description: 'Approval workflow for policy updates and publishing',
    descriptionAr: 'سير العمل للموافقة على تحديثات ونشر السياسات',
    icon: FileText,
  },
] as const;

type WorkflowType = typeof WORKFLOW_TYPES[number]['id'];

export default function WorkflowBuilderPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeType, setActiveType] = useState<WorkflowType>('claim_approval');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  
  const { 
    workflows, 
    isLoading, 
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    setDefaultWorkflow,
    isCreating,
  } = useWorkflowDefinitions(activeType);

  const activeTypeConfig = WORKFLOW_TYPES.find(t => t.id === activeType)!;
  const TypeIcon = activeTypeConfig.icon;
  
  const defaultWorkflow = workflows?.find(w => w.is_default);
  const otherWorkflows = workflows?.filter(w => !w.is_default) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GitBranch className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {isRTL ? 'منشئ سير العمل' : 'Workflow Builder'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'تكوين سير عمل الموافقات للمطالبات وتغييرات السياسات'
                  : 'Configure approval workflows for claims and policy changes'
                }
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSimulatorOpen(true)} className="gap-2">
              <Play className="w-4 h-4" />
              {isRTL ? 'محاكاة' : 'Simulate'}
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {isRTL ? 'إنشاء سير عمل' : 'Create Workflow'}
            </Button>
          </div>
        </div>
      </div>

      {/* Workflow Type Tabs */}
      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as WorkflowType)}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          {WORKFLOW_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.id} value={type.id} className="gap-2">
                <Icon className="w-4 h-4" />
                {isRTL ? type.labelAr : type.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {WORKFLOW_TYPES.map((type) => (
          <TabsContent key={type.id} value={type.id} className="mt-6 space-y-6">
            {/* Type Description */}
            <Card className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <TypeIcon className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? type.descriptionAr : type.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Default Workflow */}
            {defaultWorkflow && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">
                    {isRTL ? 'سير العمل الافتراضي' : 'Default Workflow'}
                  </h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Active
                  </Badge>
                </div>
                <WorkflowCard
                  workflow={defaultWorkflow}
                  isDefault={true}
                  onEdit={() => {
                    setSelectedWorkflowId(defaultWorkflow.id);
                    // Open edit dialog
                  }}
                  onDelete={() => deleteWorkflow.mutate(defaultWorkflow.id)}
                  onSetDefault={() => {}}
                />
              </div>
            )}

            {/* Other Workflows */}
            {otherWorkflows.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-medium">
                  {isRTL ? 'سير عمل أخرى' : 'Other Workflows'}
                </h2>
                <div className="grid gap-4">
                  {otherWorkflows.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      isDefault={false}
                      onEdit={() => {
                        setSelectedWorkflowId(workflow.id);
                      }}
                      onDelete={() => deleteWorkflow.mutate(workflow.id)}
                      onSetDefault={() => setDefaultWorkflow.mutate(workflow.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && workflows?.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <GitBranch className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {isRTL ? 'لا يوجد سير عمل' : 'No Workflows'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {isRTL 
                      ? 'أنشئ سير عمل أول لإدارة الموافقات'
                      : 'Create your first workflow to manage approvals'
                    }
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إنشاء سير عمل' : 'Create Workflow'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {isRTL 
                  ? 'سير العمل الافتراضي سيُطبق على جميع الطلبات الجديدة ما لم يتم تحديد سير عمل خاص'
                  : 'The default workflow will apply to all new requests unless a specific workflow is configured'
                }
              </AlertDescription>
            </Alert>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Dialog */}
      <CreateWorkflowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workflowType={activeType}
        onSubmit={(data) => {
          createWorkflow.mutate(data, {
            onSuccess: () => setCreateDialogOpen(false),
          });
        }}
        isLoading={isCreating}
      />

      {/* Simulator Dialog */}
      <WorkflowSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        workflowType={activeType}
        workflows={workflows || []}
      />
    </div>
  );
}
