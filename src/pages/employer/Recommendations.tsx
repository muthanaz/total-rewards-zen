import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, Plus, Download, LayoutGrid, List, PlayCircle, AlertTriangle, 
  PauseCircle, DollarSign, Clock, Info, RefreshCw, UserX
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics, NarrativeInsights } from '@/components/employer';
import { ActionDetailDrawer } from '@/components/employer/ActionDetailDrawer';
import { ActionCreateModal } from '@/components/employer/ActionCreateModal';
import { ActionKanbanView } from '@/components/employer/ActionKanbanView';
import { ActionTableView } from '@/components/employer/ActionTableView';
import { ActionFilters } from '@/components/employer/ActionFilters';
import { useEmployerActions, type ActionItem, type Status, type Priority, type ActionType, type SourceType, type Confidence } from '@/hooks/useEmployerActions';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

export default function RecommendationsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ActionType | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string | 'all'>('all');
  
  const coverageMetrics = useDataCoverageMetrics();
  
  const {
    filteredActions,
    isLoading,
    owners,
    metrics,
    updateStatus,
    updateOwner,
    addComment,
    addBlocker,
    removeBlocker,
    createAction,
    refetch,
    lastRefreshed,
  } = useEmployerActions({
    statusFilter,
    priorityFilter,
    typeFilter,
    sourceFilter,
    confidenceFilter,
    ownerFilter,
  });
  
  const handleOpenDetail = (action: ActionItem) => {
    setSelectedAction(action);
    setDetailDrawerOpen(true);
  };
  
  const handleStatusChange = (actionId: string, newStatus: Status) => {
    updateStatus(actionId, newStatus);
    // Update selected action if open
    if (selectedAction?.id === actionId) {
      setSelectedAction(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
  };
  
  const handleOwnerChange = (actionId: string, ownerId: string | null, ownerName: string) => {
    updateOwner(actionId, ownerId, ownerName);
    if (selectedAction?.id === actionId) {
      setSelectedAction(prev => prev ? { ...prev, ownerId, owner: ownerName } : null);
    }
    toast.success(`Assigned to ${ownerName}`);
  };
  
  const handleAddComment = (actionId: string, comment: string) => {
    addComment(actionId, comment);
    toast.success('Comment added');
  };
  
  const handleAddBlocker = (actionId: string, description: string) => {
    addBlocker(actionId, description);
    toast.success('Blocker added');
  };
  
  const handleRemoveBlocker = (actionId: string, blockerId: string) => {
    removeBlocker(actionId, blockerId);
    toast.success('Blocker removed');
  };
  
  const handleCreate = (action: Partial<ActionItem>) => {
    createAction(action);
    toast.success('Action created');
  };
  
  const handleBulkAction = (ids: string[], action: 'complete' | 'assign' | 'delete') => {
    if (action === 'complete') {
      ids.forEach(id => updateStatus(id, 'completed'));
      toast.success(`${ids.length} actions marked complete`);
    }
  };
  
  const handleExport = () => {
    toast.success('Export started (demo)');
  };
  
  const clearAllFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
    setSourceFilter('all');
    setConfidenceFilter('all');
    setOwnerFilter('all');
  };
  
  // Calculate impact range for low confidence items
  const lowConfImpactMin = metrics.totalImpact * 0.7;
  const lowConfImpactMax = metrics.totalImpact * 1.3;
  const hasLowConfidenceImpact = metrics.lowConfidenceImpact > 0;
  
  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Target className="h-8 w-8 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-foreground">Benefits Action Plan</h1>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-xs cursor-help">
                        79% Estimated
                        <Info className="h-3 w-3 ml-1" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Impact estimates are weighted by data completeness: High confidence (100%), Medium (70%), Low (40%).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground text-sm">Track and measure recommendations with full confidence transparency</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Action
            </Button>
            <DataConfidenceBadge metrics={coverageMetrics} />
          </div>
        </div>
        
        <EmployerGlobalFiltersBar />
        
        {/* Narrative Insights */}
        <NarrativeInsights
          insights={[
            {
              id: 'blocked',
              change: `${metrics.blocked} action${metrics.blocked !== 1 ? 's' : ''} blocked`,
              metricValue: metrics.blocked > 0 ? formatCurrencyAED(metrics.blocked * 25000, { abbreviate: true }) : undefined,
              impact: metrics.blocked > 0 
                ? 'Blocked items are preventing value realization. Resolve dependencies to unblock progress.'
                : 'No blocked items. All active actions are progressing.',
              action: metrics.blocked > 0 ? 'View blocked items' : 'Maintain momentum',
              trend: metrics.blocked > 0 ? 'down' : 'neutral',
              trendIsPositive: metrics.blocked === 0,
              confidence: 'high',
            },
            {
              id: 'overdue',
              change: `${metrics.overdue} overdue action${metrics.overdue !== 1 ? 's' : ''}`,
              impact: metrics.overdue > 0 
                ? 'Overdue items indicate resource constraints or scope issues.'
                : 'All actions are on track.',
              action: metrics.overdue > 0 ? 'Triage overdue items' : 'Keep tracking',
              trend: metrics.overdue > 0 ? 'down' : 'up',
              trendIsPositive: metrics.overdue === 0,
              confidence: 'high',
            },
            ...(metrics.noOwnerCount > 0 ? [{
              id: 'no-owner',
              change: `${metrics.noOwnerCount} action${metrics.noOwnerCount !== 1 ? 's' : ''} unassigned`,
              impact: 'Unassigned actions won\'t progress. Assign owners to drive accountability.',
              action: 'Assign owners',
              trend: 'down' as const,
              trendIsPositive: false,
              confidence: 'high' as const,
            }] : []),
          ]}
          coverageMetrics={coverageMetrics}
          title="Action Plan Insights"
          subtitle={`Last refreshed ${formatDistanceToNow(lastRefreshed, { addSuffix: true })}`}
        />
        
        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{metrics.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={metrics.overdue > 0 ? 'bg-red-500/5 border-red-500/20' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${metrics.overdue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-red-500' : ''}`}>{metrics.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={metrics.blocked > 0 ? 'bg-amber-500/5 border-amber-500/20' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <PauseCircle className={`h-5 w-5 ${metrics.blocked > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-2xl font-bold ${metrics.blocked > 0 ? 'text-amber-500' : ''}`}>{metrics.blocked}</p>
                  <p className="text-xs text-muted-foreground">Blocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={metrics.noOwnerCount > 0 ? 'bg-orange-500/5 border-orange-500/20' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <UserX className={`h-5 w-5 ${metrics.noOwnerCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-2xl font-bold ${metrics.noOwnerCount > 0 ? 'text-orange-500' : ''}`}>{metrics.noOwnerCount}</p>
                  <p className="text-xs text-muted-foreground">No Owner</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-3 cursor-help">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xl font-bold text-green-600">
                            {hasLowConfidenceImpact 
                              ? `${formatCurrencyAED(lowConfImpactMin, { abbreviate: true })}–${formatCurrencyAED(lowConfImpactMax, { abbreviate: true })}`
                              : formatCurrencyAED(metrics.totalImpact, { abbreviate: true })
                            }
                          </p>
                          {hasLowConfidenceImpact && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 h-4">~</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Expected Impact</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Range shown due to {Math.round((metrics.lowConfidenceImpact / metrics.totalImpact) * 100)}% of impact from low-confidence estimates
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <ActionFilters
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            typeFilter={typeFilter}
            sourceFilter={sourceFilter}
            confidenceFilter={confidenceFilter}
            ownerFilter={ownerFilter}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onTypeChange={setTypeFilter}
            onSourceChange={setSourceFilter}
            onConfidenceChange={setConfidenceFilter}
            onOwnerChange={setOwnerFilter}
            onClearAll={clearAllFilters}
            owners={owners}
          />
          
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
        
        {/* Workboard */}
        {viewMode === 'kanban' ? (
          <ActionKanbanView
            actions={filteredActions}
            onOpenAction={handleOpenDetail}
            onStatusChange={handleStatusChange}
            onQuickAssign={(action) => {
              setSelectedAction(action);
              setDetailDrawerOpen(true);
            }}
          />
        ) : (
          <ActionTableView
            actions={filteredActions}
            onOpenAction={handleOpenDetail}
            onStatusChange={handleStatusChange}
            onBulkAction={handleBulkAction}
          />
        )}
        
        {/* Empty State */}
        {filteredActions.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No actions found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first action to get started'}
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Action
            </Button>
          </div>
        )}
        
        {/* Detail Drawer */}
        <ActionDetailDrawer
          action={selectedAction}
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
          onStatusChange={handleStatusChange}
          onOwnerChange={handleOwnerChange}
          onAddComment={handleAddComment}
          onAddBlocker={handleAddBlocker}
          onRemoveBlocker={handleRemoveBlocker}
          owners={owners}
          isLoading={isLoading}
        />
        
        {/* Create Modal */}
        <ActionCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onCreate={handleCreate}
          owners={owners}
        />
      </div>
    </PageConfidenceGate>
  );
}
