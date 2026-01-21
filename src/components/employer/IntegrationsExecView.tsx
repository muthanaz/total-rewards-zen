/**
 * Data Confidence Executive View
 * 
 * Shows overall data confidence scores, issues center, and insight limitations.
 * Allows filtering and resolving issues with dynamic score updates.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Database,
  Users,
  FileText,
  TrendingUp,
  Info,
  ArrowRight,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useDataCoverageMetrics } from '@/components/employer';
import { useDataConfidenceIssues, type DataConfidenceIssue, type IssueOwner } from '@/hooks/useDataConfidenceIssues';
import { IssuesCenter } from './IssuesCenter';
import { IssueResolveModal } from './IssueResolveModal';

const dataSources = [
  { name: 'HRIS (SAP)', status: 'connected', lastSync: '2 hours ago', coverage: 95 },
  { name: 'Payroll System', status: 'connected', lastSync: '1 day ago', coverage: 88 },
  { name: 'Benefits Platform', status: 'connected', lastSync: '30 mins ago', coverage: 92 },
  { name: 'Claims System', status: 'partial', lastSync: '3 days ago', coverage: 65 },
];

export function IntegrationsExecView() {
  const coverageMetrics = useDataCoverageMetrics();
  const {
    issues,
    allIssues,
    filters,
    setFilters,
    domainScores,
    issueCounts,
    dataSources: issueDataSources,
    resolveIssue,
    assignIssue,
    getIssueById,
    applyQuickFilter,
    lastScoreChange,
  } = useDataConfidenceIssues();

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<DataConfidenceIssue | null>(null);
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(null);

  // Open issues by domain for the insight limitations cards
  const openIssuesByDomain = useMemo(() => {
    return allIssues.filter(i => i.status !== 'Resolved');
  }, [allIssues]);

  const handleResolveClick = (issue: DataConfidenceIssue) => {
    setSelectedIssue(issue);
    setResolveModalOpen(true);
  };

  const handleResolve = (issueId: string, resolutionType: any, note: string) => {
    resolveIssue(issueId, resolutionType, note);
  };

  const handleAssign = (issueId: string, owner: IssueOwner) => {
    assignIssue(issueId, owner);
  };

  // Click on insight limitation card to highlight issue in table
  const handleInsightClick = (issueId: string) => {
    setHighlightedIssueId(issueId);
    // Scroll to issues center
    document.getElementById('issues-center')?.scrollIntoView({ behavior: 'smooth' });
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedIssueId(null), 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Data Confidence</h1>
          <p className="text-muted-foreground">Understand the reliability of your analytics insights</p>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/employer/integrations?view=ops">
            <Database className="w-4 h-4" />
            Manage Integrations
          </Link>
        </Button>
      </div>

      {/* Overall Confidence with Dynamic Scores */}
      <Card className="card-elevated border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className={cn("text-2xl font-bold", getScoreColor(domainScores.overall))}>
                      {domainScores.overall}%
                    </p>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </div>
                <Shield className="absolute -top-1 -right-1 w-6 h-6 text-primary" />
                {lastScoreChange && (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-0.5 bg-success/20 text-success text-xs font-medium px-1.5 py-0.5 rounded-full animate-in fade-in zoom-in">
                    <ArrowUp className="h-3 w-3" />
                    +{lastScoreChange.change}%
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Employees</span>
                </div>
                <p className={cn("text-xl font-bold", getScoreColor(domainScores.employees))}>
                  {domainScores.employees}%
                </p>
                <Progress value={domainScores.employees} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Entitlements</span>
                </div>
                <p className={cn("text-xl font-bold", getScoreColor(domainScores.entitlements))}>
                  {domainScores.entitlements}%
                </p>
                <Progress value={domainScores.entitlements} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Policies</span>
                </div>
                <p className={cn("text-xl font-bold", getScoreColor(domainScores.policies))}>
                  {domainScores.policies}%
                </p>
                <Progress value={domainScores.policies} className="h-1.5 mt-1" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Claims</span>
                </div>
                <p className={cn("text-xl font-bold", getScoreColor(domainScores.claims))}>
                  {domainScores.claims}%
                </p>
                <Progress value={domainScores.claims} className="h-1.5 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Center */}
      <div id="issues-center">
        <IssuesCenter
          issues={issues}
          filters={filters}
          setFilters={setFilters}
          issueCounts={issueCounts}
          dataSources={issueDataSources}
          onResolve={handleResolveClick}
          onAssign={handleAssign}
          applyQuickFilter={applyQuickFilter}
          highlightedIssueId={highlightedIssueId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Sources Health */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
            <CardDescription>Connection status and data freshness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {source.status === 'connected' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {source.lastSync}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${source.coverage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {source.coverage}%
                    </p>
                    <p className="text-xs text-muted-foreground">coverage</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Insights May Be Incomplete - Now Clickable */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-amber-500" />
              Why Some Insights May Be Incomplete
            </CardTitle>
            <CardDescription>Click to view and resolve in Issues Center</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {openIssuesByDomain.slice(0, 4).map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors group"
                  onClick={() => handleInsightClick(issue.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {issue.impactedInsights[0]}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs border-0',
                        issue.confidence === 'Low' && 'bg-destructive/10 text-destructive',
                        issue.confidence === 'Medium' && 'bg-amber-500/10 text-amber-600',
                        issue.confidence === 'High' && 'bg-success/10 text-success',
                      )}
                    >
                      {issue.confidence.toLowerCase()} confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{issue.rootCause}</p>
                  {/* Context-aware resolve CTA */}
                  {(() => {
                    const rootCauseLower = issue.rootCause.toLowerCase();
                    const isIntegrationIssue = rootCauseLower.includes('not connected') || rootCauseLower.includes('not integrated');
                    const isSyncIssue = rootCauseLower.includes('stale') || rootCauseLower.includes('sync') || rootCauseLower.includes('intermittent');
                    const isQualityIssue = rootCauseLower.includes('below') || rootCauseLower.includes('rate') || rootCauseLower.includes('sources');
                    
                    if (isIntegrationIssue) {
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent"
                          asChild
                        >
                          <Link to={`/employer/integrations?view=ops&resolve_issue=${issue.id}`}>
                            → Connect integration
                          </Link>
                        </Button>
                      );
                    } else if (isSyncIssue) {
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent"
                          asChild
                        >
                          <Link to={`/employer/data-quality/sync?resolve_issue=${issue.id}`}>
                            → Run sync
                          </Link>
                        </Button>
                      );
                    } else if (isQualityIssue) {
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent"
                          asChild
                        >
                          <Link to={`/employer/data-quality/rules?resolve_issue=${issue.id}`}>
                            → Fix data quality
                          </Link>
                        </Button>
                      );
                    } else {
                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary font-medium hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveClick(issue);
                          }}
                        >
                          → Resolve this issue
                        </Button>
                      );
                    }
                  })()}
                </div>
              ))}

              {openIssuesByDomain.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium text-success">All issues resolved!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your data confidence is at its best.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="card-elevated bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Improve Your Data Confidence</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {issueCounts.open > 0
                  ? `Resolving ${issueCounts.open} open issue${issueCounts.open > 1 ? 's' : ''} could increase your overall confidence to ${Math.min(98, domainScores.overall + 15)}%+`
                  : 'Adding more data sources could further improve your analytics quality'}
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link to="/employer/integrations?tab=import">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resolve Modal */}
      <IssueResolveModal
        open={resolveModalOpen}
        onOpenChange={setResolveModalOpen}
        issue={selectedIssue}
        onResolve={handleResolve}
      />
    </div>
  );
}
