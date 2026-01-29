/**
 * Employer Data Quality Rules Page
 * 
 * Manage and run data quality validation rules with issue resolution.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageLayout, MetricCard, MetricGrid, SSOTTooltip, MetricLabelWithTooltip } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Search,
  Play,
  Pause,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ExternalLink,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useDataQualityRules, type DataQualityRule, type RuleSeverity } from '@/hooks/useDataQualityRules';
import { useDataConfidenceIssues } from '@/hooks/useDataConfidenceIssues';

const SEVERITY_CONFIG: Record<RuleSeverity, { label: string; color: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  high: { label: 'High', color: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'bg-primary/10 text-primary border-primary/30', icon: Clock },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground border-border', icon: CheckCircle },
};

export default function EmployerDataQualityRules() {
  const [searchParams] = useSearchParams();
  const resolveIssueId = searchParams.get('resolve_issue');
  
  const {
    rules,
    stats,
    runningRuleId,
    highlightedRuleId,
    getViolationsForRule,
    runRuleAndResolve,
    toggleRuleStatus,
    highlightRule,
    getRuleByIssueId,
  } = useDataQualityRules();
  
  const { resolveIssue, getIssueById } = useDataConfidenceIssues();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<DataQualityRule | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Handle deep link from Data Confidence
  useEffect(() => {
    if (resolveIssueId) {
      const linkedRule = getRuleByIssueId(resolveIssueId);
      if (linkedRule) {
        highlightRule(linkedRule.id);
        // Scroll to the rule after a brief delay
        setTimeout(() => {
          document.getElementById(`rule-${linkedRule.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [resolveIssueId, getRuleByIssueId, highlightRule]);

  const linkedIssue = resolveIssueId ? getIssueById(resolveIssueId) : null;

  // Filter rules
  const filteredRules = rules.filter(rule => {
    if (searchTerm && !rule.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (severityFilter !== 'all' && rule.severity !== severityFilter) {
      return false;
    }
    if (sourceFilter !== 'all' && rule.dataSource !== sourceFilter) {
      return false;
    }
    return true;
  });

  const handleRunRule = async (rule: DataQualityRule) => {
    toast.info(`Running "${rule.name}"...`);
    
    const result = await runRuleAndResolve(rule.id, (issueId, type, note) => {
      resolveIssue(issueId, type as any, note);
    });
    
    if (result.issueResolved) {
      toast.success(`Rule passed! Related issue has been resolved.`);
    } else {
      toast.success(`Rule executed. Check violations for details.`);
    }
  };

  const handleViewRule = (rule: DataQualityRule) => {
    setSelectedRule(rule);
    setDetailSheetOpen(true);
  };

  const dataSources = [...new Set(rules.map(r => r.dataSource))];

  return (
    <PageLayout
      title="Data Quality Rules"
      description="Define and run validation rules to ensure data accuracy"
      actions={
        <Button variant="outline" asChild className="gap-2">
          <Link to="/employer/integrations">
            <ArrowLeft className="w-4 h-4" />
            Back to Data Confidence
          </Link>
        </Button>
      }
    >
      {/* Linked Issue Banner */}
      {linkedIssue && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Resolving: {linkedIssue.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Run the highlighted rule below to clear violations and resolve this issue.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {linkedIssue.confidence} confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <MetricGrid columns={4}>
        <MetricCard title="Active Rules" value={stats.active} icon={ShieldCheck} />
        <MetricCard title="Total Violations" value={stats.totalViolations} icon={AlertTriangle} />
        <MetricCard title="Critical Issues" value={stats.criticalViolations} icon={XCircle} />
        <MetricCard 
          title="Data Quality Compliance"
          value={`${stats.complianceRate}%`} 
          icon={CheckCircle}
          tooltip={{
            formula: '(Passed Checks ÷ Total Checks) × 100',
            dataSource: 'data_quality_rules + integration_runs tables',
            notes: 'Covers completeness, accuracy, timeliness, and consistency checks.'
          }}
        />
      </MetricGrid>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Data Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {dataSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Validation Rules
          </CardTitle>
          <CardDescription>
            {filteredRules.length} rules configured
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Data Source</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => {
                const severityConfig = SEVERITY_CONFIG[rule.severity];
                const isRunning = runningRuleId === rule.id;
                const isHighlighted = highlightedRuleId === rule.id;
                
                return (
                  <TableRow
                    key={rule.id}
                    id={`rule-${rule.id}`}
                    className={cn(
                      'group',
                      isHighlighted && 'bg-primary/10 animate-pulse'
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                          {rule.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.dataSource}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={severityConfig.color}>
                        <severityConfig.icon className="w-3 h-3 mr-1" />
                        {severityConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.status === 'active'}
                          onCheckedChange={() => toggleRuleStatus(rule.id)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {rule.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.lastRun ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(rule.lastRun, { addSuffix: true })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {rule.violations > 0 ? (
                        <Badge variant="destructive">{rule.violations}</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          0
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewRule(rule)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRunRule(rule)}
                          disabled={isRunning || rule.status === 'paused'}
                          title="Run Rule"
                        >
                          {isRunning ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rule Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedRule && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {selectedRule.name}
                </SheetTitle>
                <SheetDescription>{selectedRule.description}</SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Rule Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Data Source</p>
                    <Badge variant="secondary">{selectedRule.dataSource}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Severity</p>
                    <Badge variant="outline" className={SEVERITY_CONFIG[selectedRule.severity].color}>
                      {SEVERITY_CONFIG[selectedRule.severity].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Run</p>
                    <p className="text-sm font-medium">
                      {selectedRule.lastRun 
                        ? format(selectedRule.lastRun, 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Violations</p>
                    <p className="text-sm font-medium">{selectedRule.violations}</p>
                  </div>
                </div>

                {/* Rule Logic */}
                <div>
                  <p className="text-sm font-medium mb-2">Rule Logic</p>
                  <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                    {selectedRule.logic}
                  </pre>
                </div>

                {/* Recommended Fix */}
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <p className="text-sm font-medium text-amber-700 mb-1">Recommended Fix</p>
                  <p className="text-sm text-muted-foreground">{selectedRule.recommendedFix}</p>
                </div>

                {/* Sample Violations */}
                {selectedRule.violations > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Sample Violations</p>
                    <div className="space-y-2">
                      {getViolationsForRule(selectedRule.id).slice(0, 3).map((v) => (
                        <div key={v.id} className="p-2 rounded-lg border bg-muted/30 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{v.employee || v.record}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(v.detectedAt, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {v.field}: {v.issue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleRunRule(selectedRule);
                      setDetailSheetOpen(false);
                    }}
                    disabled={runningRuleId === selectedRule.id}
                  >
                    {runningRuleId === selectedRule.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Run Rule
                  </Button>
                  {selectedRule.relatedIssueId && (
                    <Button variant="outline" asChild>
                      <Link to="/employer/integrations">
                        View Issue
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
