import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Calendar, Send, Activity, CheckCircle, AlertTriangle, 
  Clock, X, Plus, ExternalLink, TrendingUp, FileText, Users, 
  BarChart3, Info, CircleDot, PlayCircle, PauseCircle, CheckCircle2,
  XCircle, Lightbulb, Settings, Megaphone, Store, Zap, AlertCircle,
  Trash2, Link
} from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { 
  ActionItem, Status, Priority, ActionType, Confidence, SourceType 
} from '@/hooks/useEmployerActions';

// ============= CONFIGS =============

const typeConfig: Record<ActionType, { label: string; icon: React.ElementType; color: string }> = {
  policy: { label: 'Policy', icon: FileText, color: 'text-purple-500' },
  process: { label: 'Process', icon: Settings, color: 'text-blue-500' },
  comms: { label: 'Comms', icon: Megaphone, color: 'text-green-500' },
  vendor: { label: 'Vendor', icon: Store, color: 'text-orange-500' },
  analytics: { label: 'Analytics', icon: BarChart3, color: 'text-teal-500' },
};

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  P0: { label: 'P0 - Critical', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  P1: { label: 'P1 - High', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  P2: { label: 'P2 - Medium', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
};

const statusConfig: Record<Status, { label: string; icon: React.ElementType; color: string }> = {
  backlog: { label: 'Backlog', icon: CircleDot, color: 'text-muted-foreground' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'text-blue-500' },
  blocked: { label: 'Blocked', icon: PauseCircle, color: 'text-red-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-muted-foreground' },
};

const confidenceConfig: Record<Confidence, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High', color: 'text-green-600', bgColor: 'bg-green-500/10' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  low: { label: 'Low', color: 'text-red-500', bgColor: 'bg-red-500/10' },
};

const sourceConfig: Record<SourceType, { label: string; path: string }> = {
  zombie_spend: { label: 'Zombie Spend', path: '/employer/zombie-spend' },
  segments: { label: 'Employee Segments', path: '/employer/segments' },
  claims: { label: 'Claims Analysis', path: '/employer/claims' },
  policies: { label: 'Policy Insights', path: '/employer/policy-insights' },
  survey: { label: 'Employee Survey', path: '/employer/dashboard' },
  manual: { label: 'Manual', path: '' },
};

interface ActionDetailDrawerProps {
  action: ActionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (actionId: string, newStatus: Status) => void;
  onOwnerChange: (actionId: string, ownerId: string | null, ownerName: string) => void;
  onAddComment: (actionId: string, comment: string) => void;
  onAddBlocker: (actionId: string, description: string) => void;
  onRemoveBlocker: (actionId: string, blockerId: string) => void;
  owners: Array<{ id: string | null; name: string }>;
  isLoading?: boolean;
}

export function ActionDetailDrawer({
  action,
  open,
  onOpenChange,
  onStatusChange,
  onOwnerChange,
  onAddComment,
  onAddBlocker,
  onRemoveBlocker,
  owners,
  isLoading = false,
}: ActionDetailDrawerProps) {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [newBlocker, setNewBlocker] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);
  
  if (!action && !isLoading) return null;
  
  const handleAddComment = () => {
    if (comment.trim() && action) {
      onAddComment(action.id, comment);
      setComment('');
    }
  };
  
  const handleAddBlocker = () => {
    if (newBlocker.trim() && action) {
      onAddBlocker(action.id, newBlocker);
      setNewBlocker('');
      setShowBlockerInput(false);
    }
  };
  
  const handleViewSource = () => {
    if (action?.sourceType && action.sourceType !== 'manual') {
      const config = sourceConfig[action.sourceType];
      const path = action.sourceRefId 
        ? `${config.path}?ref=${action.sourceRefId}` 
        : config.path;
      navigate(path);
      onOpenChange(false);
    }
  };
  
  const handleNavigateToCategory = (categoryName: string) => {
    navigate(`/employer/spend?category=${encodeURIComponent(categoryName)}`);
    onOpenChange(false);
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl w-full overflow-hidden flex flex-col">
          <SheetHeader className="shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </SheetHeader>
          <div className="flex-1 space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  if (!action) return null;
  
  const TypeIcon = typeConfig[action.type].icon;
  const StatusIcon = statusConfig[action.status].icon;
  const isOverdue = action.dueDate && isPast(action.dueDate) && !['completed', 'cancelled'].includes(action.status);
  const hasBlockers = action.blockers.length > 0;
  
  // Validation checks
  const canMoveToInProgress = action.ownerId !== null;
  const canMarkComplete = action.ownerId !== null && action.dueDate !== null && (action.linkedCategories.length > 0 || action.sourceType !== 'manual');
  
  // Calculate total impact
  const totalImpact = action.expectedImpact.costAvoidance || 0;
  const impactRange = action.confidence === 'low' && action.expectedImpact.costAvoidanceLow && action.expectedImpact.costAvoidanceHigh;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="shrink-0 p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`p-2 rounded-lg ${typeConfig[action.type].color} bg-background border`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <Badge className={`${priorityConfig[action.priority].bgColor} ${priorityConfig[action.priority].color} border-0`}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className={statusConfig[action.status].color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig[action.status].label}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{action.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Status & Owner Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select 
                  value={action.status} 
                  onValueChange={(v) => {
                    if (v === 'in_progress' && !canMoveToInProgress) {
                      return; // Block if no owner
                    }
                    onStatusChange(action.id, v as Status);
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const disabled = key === 'in_progress' && !canMoveToInProgress;
                      return (
                        <SelectItem key={key} value={key} disabled={disabled}>
                          <div className="flex items-center gap-2">
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                            {config.label}
                            {disabled && <span className="text-xs text-muted-foreground">(needs owner)</span>}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Owner</Label>
                <Select 
                  value={action.ownerId || 'unassigned'} 
                  onValueChange={(v) => {
                    const owner = owners.find(o => (o.id || 'unassigned') === v);
                    if (owner) {
                      onOwnerChange(action.id, owner.id, owner.name);
                    }
                  }}
                >
                  <SelectTrigger className={`h-9 ${!action.ownerId ? 'border-amber-500/50 bg-amber-500/5' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id || 'unassigned'} value={owner.id || 'unassigned'}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {owner.name === 'Unassigned' ? '?' : owner.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {owner.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!action.ownerId && (
                  <p className="text-xs text-amber-600">⚠ Owner required to move to In Progress</p>
                )}
              </div>
            </div>
            
            {/* Due Date & Source Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Due Date</Label>
                <div className={`flex items-center gap-2 p-2 h-9 border rounded-md text-sm ${isOverdue ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                  <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                    {action.dueDate ? format(action.dueDate, 'MMM d, yyyy') : 'Not set'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Source</Label>
                <div className="flex items-center gap-2 p-2 h-9 border rounded-md text-sm">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{sourceConfig[action.sourceType].label}</span>
                  {action.sourceType !== 'manual' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-auto shrink-0"
                      onClick={handleViewSource}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Expected Impact Card */}
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-accent" />
                    Expected Impact
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${confidenceConfig[action.confidence].bgColor} ${confidenceConfig[action.confidence].color} border-0 text-xs`}>
                          {confidenceConfig[action.confidence].label} confidence
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">
                          Data completeness: {action.dataCompletenessPct}%
                          {action.confidenceNote && (
                            <>
                              <br />
                              <span className="italic">"{action.confidenceNote}"</span>
                            </>
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {action.expectedImpact.utilizationChange && (
                    <div>
                      <p className="text-muted-foreground text-xs">Utilization Uplift</p>
                      <p className="font-semibold text-green-600">+{action.expectedImpact.utilizationChange}%</p>
                    </div>
                  )}
                  {action.expectedImpact.slaReduction && (
                    <div>
                      <p className="text-muted-foreground text-xs">SLA Reduction</p>
                      <p className="font-semibold text-blue-600">-{action.expectedImpact.slaReduction} days</p>
                    </div>
                  )}
                  {totalImpact > 0 && (
                    <div>
                      <p className="text-muted-foreground text-xs">Cost Avoidance</p>
                      <p className="font-semibold text-amber-600">
                        {impactRange ? (
                          <>
                            {formatCurrencyAED(action.expectedImpact.costAvoidanceLow!, { abbreviate: true })}
                            {' – '}
                            {formatCurrencyAED(action.expectedImpact.costAvoidanceHigh!, { abbreviate: true })}
                          </>
                        ) : (
                          formatCurrencyAED(totalImpact, { abbreviate: true })
                        )}
                      </p>
                    </div>
                  )}
                  {action.expectedImpact.satisfactionChange && (
                    <div>
                      <p className="text-muted-foreground text-xs">Satisfaction</p>
                      <p className="font-semibold text-purple-600">+{action.expectedImpact.satisfactionChange} pts</p>
                    </div>
                  )}
                </div>
                
                {/* Data completeness bar */}
                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Data Completeness</span>
                    <span className={action.dataCompletenessPct < 70 ? 'text-amber-600' : 'text-green-600'}>
                      {action.dataCompletenessPct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        action.dataCompletenessPct >= 80 ? 'bg-green-500' :
                        action.dataCompletenessPct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${action.dataCompletenessPct}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Linked Items */}
            {(action.linkedCategories.length > 0 || action.linkedEntities.length > 0 || action.linkedMetrics.length > 0) && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <Link className="h-3.5 w-3.5" />
                  Linked Items
                </Label>
                <div className="flex flex-wrap gap-2">
                  {action.linkedCategories.map((cat, idx) => (
                    <Badge 
                      key={`cat-${idx}`} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleNavigateToCategory(cat)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {cat}
                    </Badge>
                  ))}
                  {action.linkedEntities.map((entity, idx) => (
                    <Badge key={`ent-${idx}`} variant="secondary" className="text-xs">
                      {entity.type === 'benefit' && <TrendingUp className="h-3 w-3 mr-1" />}
                      {entity.type === 'policy' && <FileText className="h-3 w-3 mr-1" />}
                      {entity.type === 'segment' && <Users className="h-3 w-3 mr-1" />}
                      {entity.type === 'metric' && <BarChart3 className="h-3 w-3 mr-1" />}
                      {entity.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Blockers Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Blockers
                  {hasBlockers && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1">
                      {action.blockers.length}
                    </Badge>
                  )}
                </Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setShowBlockerInput(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              
              {hasBlockers && (
                <div className="space-y-2">
                  {action.blockers.map((blocker) => (
                    <div 
                      key={blocker.id} 
                      className="flex items-start gap-2 p-2 rounded-md bg-red-500/5 border border-red-500/20 text-sm"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{blocker.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDistanceToNow(blocker.addedAt, { addSuffix: true })} by {blocker.addedBy}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500"
                        onClick={() => onRemoveBlocker(action.id, blocker.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {!hasBlockers && !showBlockerInput && (
                <p className="text-xs text-muted-foreground italic">No blockers</p>
              )}
              
              {showBlockerInput && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe the blocker..."
                    value={newBlocker}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBlocker()}
                    className="text-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleAddBlocker} disabled={!newBlocker.trim()}>
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowBlockerInput(false); setNewBlocker(''); }}>
                    Cancel
                  </Button>
                </div>
              )}
              
              {action.status === 'blocked' && !hasBlockers && (
                <p className="text-xs text-amber-600">⚠ Blocked status requires at least one blocker</p>
              )}
            </div>
            
            <Separator />
            
            {/* Activity Log */}
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Activity Log
              </Label>
              <div className="space-y-3 max-h-[240px] overflow-y-auto">
                {action.activityLog.slice().reverse().map((entry) => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {entry.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-xs">{entry.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.details}</p>
                      {entry.previousValue && entry.newValue && (
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <Badge variant="outline" className="text-[10px] h-4">
                            {entry.previousValue}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {entry.newValue}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Add Comment */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleAddComment} disabled={!comment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="shrink-0 p-4 border-t bg-muted/30 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(action.updatedAt, { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {action.status !== 'completed' && action.status !== 'cancelled' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button 
                        size="sm"
                        disabled={!canMarkComplete}
                        onClick={() => onStatusChange(action.id, 'completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canMarkComplete && (
                    <TooltipContent>
                      <p className="text-xs">Requires: owner, due date, and linked category or source</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
