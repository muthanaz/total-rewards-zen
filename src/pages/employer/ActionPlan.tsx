/**
 * Action Plan Page
 * 
 * Governance-grade execution system with mandatory fields,
 * Kanban columns, and portfolio metrics.
 */

import { useState, useMemo } from 'react';
import { ExecPageHeader } from '@/components/employer/ExecPageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Plus, 
  Download, 
  LayoutGrid, 
  List,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  PortfolioHeader,
  GovernanceKanbanView,
  GovernanceActionCard,
  MOCK_ACTIONS,
  calculatePortfolioMetrics,
  type GovernanceAction,
  type KanbanColumn
} from '@/components/employer/actionPlan';
import { toast } from 'sonner';

export default function ActionPlanPage() {
  const [actions, setActions] = useState<GovernanceAction[]>(MOCK_ACTIONS);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list'>('kanban');
  const [selectedAction, setSelectedAction] = useState<GovernanceAction | null>(null);
  
  // Calculate portfolio metrics
  const metrics = useMemo(() => calculatePortfolioMetrics(actions), [actions]);
  
  const handleStatusChange = (actionId: string, newStatus: KanbanColumn) => {
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { 
            ...a, 
            status: newStatus, 
            updatedAt: new Date(),
            completedAt: newStatus === 'done' ? new Date() : a.completedAt
          }
        : a
    ));
    toast.success(`Action moved to ${newStatus.replace('_', ' ')}`);
  };
  
  const handleActionClick = (action: GovernanceAction) => {
    setSelectedAction(action);
    // In full implementation, this would open a detail drawer
    toast.info(`Viewing: ${action.title}`);
  };
  
  const handleExport = () => {
    toast.success('Exporting action plan (demo)');
  };
  
  const handleRefresh = () => {
    setActions(MOCK_ACTIONS);
    toast.success('Data refreshed');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <ExecPageHeader
          title="Action Plan"
          titleAr="خطة العمل"
          description="Governance-grade execution tracking with mandatory accountability fields"
          descriptionAr="تتبع التنفيذ بمستوى الحوكمة مع حقول المساءلة الإلزامية"
        />
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Action
          </Button>
        </div>
      </div>

      {/* Portfolio Header */}
      <PortfolioHeader metrics={metrics} />

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'kanban' | 'list')}>
          <TabsList>
            <TabsTrigger value="kanban" className="gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1.5">
              <List className="h-3.5 w-3.5" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {actions.length} total actions
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'kanban' ? (
        <GovernanceKanbanView
          actions={actions}
          onActionClick={handleActionClick}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <GovernanceActionCard
              key={action.id}
              action={action}
              onClick={() => handleActionClick(action)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {actions.length === 0 && (
        <div className="text-center py-16">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Actions Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first action from Spend, Optimization, or Benchmarks insights
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Create Action
          </Button>
        </div>
      )}

      {/* Governance Note */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <strong>Governance Standard:</strong> Every action requires: verb-led title, assigned owner, 
        due date, expected AED impact, linked KPI with baseline/target, and source insight reference. 
        Actions missing mandatory fields are flagged for review.
      </div>
    </div>
  );
}
