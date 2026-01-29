/**
 * QA Checklist Panel
 * 
 * Internal QA verification tool for preventing regressions.
 */

import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
  Filter,
  Download,
  RotateCcw,
  Type,
  Calculator,
  Navigation,
  AlertCircle,
  Shield,
  Smartphone,
  Languages,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  QA_CHECKLIST_ITEMS,
  QA_CATEGORIES,
  QACategory,
  QAChecklistItem,
  QAChecklistResult,
} from './qaChecklistData';

// Icon mapping for categories
const CATEGORY_ICONS: Record<QACategory, React.ElementType> = {
  terminology: Type,
  metrics: Calculator,
  navigation: Navigation,
  states: AlertCircle,
  permissions: Shield,
  mobile: Smartphone,
  rtl: Languages,
};

type CheckStatus = 'pass' | 'fail' | 'skip' | 'pending';

interface CheckItemState {
  status: CheckStatus;
  notes: string;
}

export function QAChecklistPanel() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<QACategory | 'all'>('all');
  const [checkStates, setCheckStates] = useState<Record<string, CheckItemState>>({});
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Build version (would come from build system in production)
  const buildVersion = `v${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}.1`;

  // Filter items
  const filteredItems = useMemo(() => {
    return QA_CHECKLIST_ITEMS.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
      return true;
    });
  }, [activeCategory, filterPriority]);

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<QACategory, QAChecklistItem[]> = {
      terminology: [],
      metrics: [],
      navigation: [],
      states: [],
      permissions: [],
      mobile: [],
      rtl: [],
    };
    
    filteredItems.forEach(item => {
      groups[item.category].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = QA_CHECKLIST_ITEMS.length;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    
    Object.values(checkStates).forEach(state => {
      if (state.status === 'pass') passed++;
      else if (state.status === 'fail') failed++;
      else if (state.status === 'skip') skipped++;
    });
    
    const pending = total - passed - failed - skipped;
    const progress = total > 0 ? ((passed + failed + skipped) / total) * 100 : 0;
    
    return { total, passed, failed, skipped, pending, progress };
  }, [checkStates]);

  const updateItemStatus = (itemId: string, status: CheckStatus) => {
    setCheckStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status, notes: prev[itemId]?.notes || '' },
    }));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCheckStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes, status: prev[itemId]?.status || 'pending' },
    }));
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const resetChecklist = () => {
    setCheckStates({});
    setExpandedItems([]);
    toast({
      title: 'Checklist Reset',
      description: 'All items have been reset to pending.',
    });
  };

  const saveSnapshot = () => {
    const results: QAChecklistResult[] = Object.entries(checkStates).map(([itemId, state]) => ({
      itemId,
      status: state.status === 'pending' ? 'skip' : state.status,
      notes: state.notes || undefined,
      checkedAt: new Date().toISOString(),
    }));

    // In production, this would save to DB
    console.log('QA Snapshot:', { buildVersion, results, summary });
    
    toast({
      title: 'Snapshot Saved',
      description: `QA results saved for ${buildVersion}`,
    });
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="size-5 text-success" />;
      case 'fail': return <XCircle className="size-5 text-destructive" />;
      case 'skip': return <MinusCircle className="size-5 text-muted-foreground" />;
      default: return <div className="size-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'destructive' | 'warning' | 'secondary'> = {
      critical: 'destructive',
      high: 'warning',
      medium: 'secondary',
    };
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QA Verification Checklist</CardTitle>
              <CardDescription>
                Build {buildVersion} • {summary.total} checks
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={resetChecklist}>
                <RotateCcw className="size-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={saveSnapshot}>
                <Save className="size-4 mr-2" />
                Save Snapshot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="tabular-nums">{Math.round(summary.progress)}%</span>
            </div>
            <Progress value={summary.progress} className="h-2" />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-success/10 text-center">
              <div className="text-2xl font-semibold text-success tabular-nums">
                {summary.passed}
              </div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <div className="text-2xl font-semibold text-destructive tabular-nums">
                {summary.failed}
              </div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-semibold text-muted-foreground tabular-nums">
                {summary.skipped}
              </div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 text-center">
              <div className="text-2xl font-semibold text-warning tabular-nums">
                {summary.pending}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as QACategory | 'all')}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All ({QA_CHECKLIST_ITEMS.length})
          </TabsTrigger>
          {(Object.entries(QA_CATEGORIES) as [QACategory, typeof QA_CATEGORIES[QACategory]][]).map(([key, cat]) => {
            const count = QA_CHECKLIST_ITEMS.filter(i => i.category === key).length;
            const Icon = CATEGORY_ICONS[key];
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="size-4 mr-1.5" />
                {cat.label.split(' ')[0]} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Checklist Items */}
        <TabsContent value={activeCategory} className="mt-4">
          <div className="space-y-6">
            {(Object.entries(groupedItems) as [QACategory, QAChecklistItem[]][]).map(([category, items]) => {
              if (items.length === 0) return null;
              const catInfo = QA_CATEGORIES[category];
              const Icon = CATEGORY_ICONS[category];

              return (
                <Card key={category}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="size-4" />
                      {catInfo.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {catInfo.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {items.map(item => {
                        const state = checkStates[item.id] || { status: 'pending', notes: '' };
                        const isExpanded = expandedItems.includes(item.id);

                        return (
                          <Collapsible
                            key={item.id}
                            open={isExpanded}
                            onOpenChange={() => toggleExpand(item.id)}
                          >
                            <div className={cn(
                              "border rounded-lg transition-colors",
                              state.status === 'pass' && "border-success/30 bg-success/5",
                              state.status === 'fail' && "border-destructive/30 bg-destructive/5",
                            )}>
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors">
                                  {getStatusIcon(state.status)}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {item.description}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {getPriorityBadge(item.priority)}
                                    {item.route && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(item.route, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="size-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 pt-1 border-t space-y-3">
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={state.status === 'pass' ? 'default' : 'outline'}
                                      className={cn(
                                        "gap-1.5",
                                        state.status === 'pass' && "bg-success hover:bg-success/90"
                                      )}
                                      onClick={() => updateItemStatus(item.id, 'pass')}
                                    >
                                      <CheckCircle2 className="size-4" />
                                      Pass
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={state.status === 'fail' ? 'default' : 'outline'}
                                      className={cn(
                                        "gap-1.5",
                                        state.status === 'fail' && "bg-destructive hover:bg-destructive/90"
                                      )}
                                      onClick={() => updateItemStatus(item.id, 'fail')}
                                    >
                                      <XCircle className="size-4" />
                                      Fail
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={state.status === 'skip' ? 'secondary' : 'ghost'}
                                      className="gap-1.5"
                                      onClick={() => updateItemStatus(item.id, 'skip')}
                                    >
                                      <MinusCircle className="size-4" />
                                      Skip
                                    </Button>
                                  </div>
                                  {/* Notes */}
                                  <Textarea
                                    placeholder="Add notes (optional)..."
                                    value={state.notes}
                                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                    className="min-h-[60px] text-sm"
                                  />
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
