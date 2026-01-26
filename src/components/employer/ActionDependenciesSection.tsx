/**
 * Action Dependencies Section
 * 
 * Manages dependencies and blockers for action items.
 * Prevents misleading progress by tracking unresolved dependencies.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Link2, 
  Plus, 
  X, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  FileText,
  Database,
  Users,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ActionDependency, ActionBlocker } from '@/lib/actions/actionTypes';

interface ActionDependenciesSectionProps {
  dependencies: ActionDependency[];
  blockers: ActionBlocker[];
  onDependenciesChange: (dependencies: ActionDependency[]) => void;
  onBlockersChange: (blockers: ActionBlocker[]) => void;
  className?: string;
}

const DEPENDENCY_TYPES = [
  { value: 'issue', label: 'Issue to Fix', icon: AlertTriangle },
  { value: 'approval', label: 'Approval Needed', icon: FileText },
  { value: 'data', label: 'Data Required', icon: Database },
  { value: 'action', label: 'Other Action', icon: Link2 },
  { value: 'external', label: 'External Party', icon: Users },
] as const;

export function ActionDependenciesSection({
  dependencies,
  blockers,
  onDependenciesChange,
  onBlockersChange,
  className,
}: ActionDependenciesSectionProps) {
  const [showAddDependency, setShowAddDependency] = useState(false);
  const [showAddBlocker, setShowAddBlocker] = useState(false);
  const [newDependencyType, setNewDependencyType] = useState<ActionDependency['type']>('issue');
  const [newDependencyDesc, setNewDependencyDesc] = useState('');
  const [newBlockerDesc, setNewBlockerDesc] = useState('');

  const unresolvedDependencies = dependencies.filter(d => !d.isResolved);
  const resolvedDependencies = dependencies.filter(d => d.isResolved);
  const activeBlockers = blockers.filter(b => !b.resolvedAt);

  const handleAddDependency = () => {
    if (!newDependencyDesc.trim()) return;
    
    const newDep: ActionDependency = {
      id: `dep-${Date.now()}`,
      type: newDependencyType,
      description: newDependencyDesc.trim(),
      isResolved: false,
    };
    
    onDependenciesChange([...dependencies, newDep]);
    setNewDependencyDesc('');
    setShowAddDependency(false);
  };

  const handleToggleDependency = (depId: string) => {
    onDependenciesChange(dependencies.map(d => 
      d.id === depId 
        ? { ...d, isResolved: !d.isResolved, resolvedAt: !d.isResolved ? new Date() : undefined }
        : d
    ));
  };

  const handleRemoveDependency = (depId: string) => {
    onDependenciesChange(dependencies.filter(d => d.id !== depId));
  };

  const handleAddBlocker = () => {
    if (!newBlockerDesc.trim()) return;
    
    const newBlocker: ActionBlocker = {
      id: `blk-${Date.now()}`,
      description: newBlockerDesc.trim(),
      addedAt: new Date(),
      addedBy: 'You',
    };
    
    onBlockersChange([...blockers, newBlocker]);
    setNewBlockerDesc('');
    setShowAddBlocker(false);
  };

  const handleResolveBlocker = (blockerId: string) => {
    onBlockersChange(blockers.map(b => 
      b.id === blockerId 
        ? { ...b, resolvedAt: new Date(), resolvedBy: 'You' }
        : b
    ));
  };

  const handleRemoveBlocker = (blockerId: string) => {
    onBlockersChange(blockers.filter(b => b.id !== blockerId));
  };

  const hasIssues = unresolvedDependencies.length > 0 || activeBlockers.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary warning */}
      {hasIssues && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
          <span className="text-warning font-medium">
            {unresolvedDependencies.length} unresolved {unresolvedDependencies.length === 1 ? 'dependency' : 'dependencies'}
            {activeBlockers.length > 0 && `, ${activeBlockers.length} active ${activeBlockers.length === 1 ? 'blocker' : 'blockers'}`}
          </span>
        </div>
      )}

      {/* Dependencies */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Dependencies
              {dependencies.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {resolvedDependencies.length}/{dependencies.length}
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAddDependency(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Add dependency form */}
          {showAddDependency && (
            <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
              <Select 
                value={newDependencyType} 
                onValueChange={(v) => setNewDependencyType(v as ActionDependency['type'])}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPENDENCY_TYPES.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>
                      <div className="flex items-center gap-2">
                        <dt.icon className="h-3.5 w-3.5" />
                        {dt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Describe the dependency..."
                value={newDependencyDesc}
                onChange={(e) => setNewDependencyDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDependency()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddDependency}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddDependency(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Dependency list */}
          {dependencies.length === 0 && !showAddDependency ? (
            <p className="text-sm text-muted-foreground py-2">No dependencies defined</p>
          ) : (
            <div className="space-y-2">
              {dependencies.map(dep => {
                const typeConfig = DEPENDENCY_TYPES.find(t => t.value === dep.type);
                const Icon = typeConfig?.icon || Link2;
                
                return (
                  <div 
                    key={dep.id}
                    className={cn(
                      'flex items-start gap-3 p-2 rounded-lg border transition-colors',
                      dep.isResolved ? 'bg-success/5 border-success/20' : 'bg-background'
                    )}
                  >
                    <Checkbox
                      checked={dep.isResolved}
                      onCheckedChange={() => handleToggleDependency(dep.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn(
                          'h-3.5 w-3.5',
                          dep.isResolved ? 'text-success' : 'text-muted-foreground'
                        )} />
                        <Badge variant="outline" className="text-xs">
                          {typeConfig?.label || dep.type}
                        </Badge>
                        {dep.isResolved && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        )}
                      </div>
                      <p className={cn(
                        'text-sm',
                        dep.isResolved && 'text-muted-foreground line-through'
                      )}>
                        {dep.description}
                      </p>
                      {dep.isResolved && dep.resolvedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Resolved {format(dep.resolvedAt, 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveDependency(dep.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockers */}
      <Card className={activeBlockers.length > 0 ? 'border-destructive/30' : ''}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className={cn(
                'h-4 w-4',
                activeBlockers.length > 0 ? 'text-destructive' : 'text-muted-foreground'
              )} />
              Blockers
              {activeBlockers.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {activeBlockers.length} active
                </Badge>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAddBlocker(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Add blocker form */}
          {showAddBlocker && (
            <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
              <Input
                placeholder="Describe what's blocking progress..."
                value={newBlockerDesc}
                onChange={(e) => setNewBlockerDesc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBlocker()}
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleAddBlocker}>Add Blocker</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddBlocker(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Blocker list */}
          {blockers.length === 0 && !showAddBlocker ? (
            <p className="text-sm text-muted-foreground py-2">No blockers reported</p>
          ) : (
            <div className="space-y-2">
              {blockers.map(blocker => (
                <div 
                  key={blocker.id}
                  className={cn(
                    'flex items-start gap-3 p-2 rounded-lg border transition-colors',
                    blocker.resolvedAt 
                      ? 'bg-muted/30 border-muted' 
                      : 'bg-destructive/5 border-destructive/20'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      blocker.resolvedAt && 'text-muted-foreground line-through'
                    )}>
                      {blocker.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {blocker.resolvedAt ? (
                        <>Resolved by {blocker.resolvedBy} on {format(blocker.resolvedAt, 'MMM d, yyyy')}</>
                      ) : (
                        <>Added by {blocker.addedBy} on {format(blocker.addedAt, 'MMM d, yyyy')}</>
                      )}
                    </p>
                  </div>
                  {!blocker.resolvedAt ? (
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleResolveBlocker(blocker.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleRemoveBlocker(blocker.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
