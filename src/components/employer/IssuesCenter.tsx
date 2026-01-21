/**
 * Issues Center Component
 * 
 * Main table/list for viewing and managing data confidence issues.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  BellOff,
  ListTodo,
  Eye,
  X,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type {
  DataConfidenceIssue,
  IssueFilters,
  IssueDomain,
  IssueConfidence,
  IssueStatus,
  IssueOwner,
} from '@/hooks/useDataConfidenceIssues';

interface IssuesCenterProps {
  issues: DataConfidenceIssue[];
  filters: IssueFilters;
  setFilters: (filters: IssueFilters | ((prev: IssueFilters) => IssueFilters)) => void;
  issueCounts: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    lowConfidence: number;
    claimsRelated: number;
    needsIntegration: number;
  };
  dataSources: string[];
  onResolve: (issue: DataConfidenceIssue) => void;
  onAssign: (issueId: string, owner: IssueOwner) => void;
  applyQuickFilter: (preset: 'lowConfidence' | 'open' | 'needsIntegration' | 'claimsRelated' | 'clear') => void;
  highlightedIssueId?: string | null;
}

const DOMAINS: IssueDomain[] = ['Employees', 'Entitlements', 'Policies', 'Claims'];
const CONFIDENCES: IssueConfidence[] = ['Low', 'Medium', 'High'];
const STATUSES: IssueStatus[] = ['Open', 'In Progress', 'Resolved'];
const OWNERS: IssueOwner[] = ['HR Ops', 'Comp & Ben', 'IT', 'Finance'];

export function IssuesCenter({
  issues,
  filters,
  setFilters,
  issueCounts,
  dataSources,
  onResolve,
  onAssign,
  applyQuickFilter,
  highlightedIssueId,
}: IssuesCenterProps) {
  const hasActiveFilters = 
    filters.domain !== 'all' || 
    filters.confidence !== 'all' || 
    filters.status !== 'all' || 
    filters.dataSource !== 'all' || 
    filters.owner !== 'all' ||
    filters.search !== '';

  const getConfidenceBadge = (confidence: IssueConfidence) => {
    const styles = {
      Low: 'bg-destructive/10 text-destructive border-destructive/20',
      Medium: 'bg-warning/10 text-warning border-warning/20',
      High: 'bg-success/10 text-success border-success/20',
    };
    return (
      <Badge variant="outline" className={cn('text-xs', styles[confidence])}>
        {confidence}
      </Badge>
    );
  };

  const getStatusBadge = (status: IssueStatus) => {
    const config = {
      Open: { icon: AlertTriangle, class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
      'In Progress': { icon: Clock, class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      Resolved: { icon: CheckCircle, class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    };
    const { icon: Icon, class: className } = config[status];
    return (
      <Badge variant="outline" className={cn('text-xs gap-1', className)}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <Card className="card-elevated">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Issues Center
            </CardTitle>
            <CardDescription>
              {issueCounts.open} open issues affecting data confidence
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={filters.confidence === 'Low' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => applyQuickFilter(filters.confidence === 'Low' ? 'clear' : 'lowConfidence')}
          >
            Low confidence ({issueCounts.lowConfidence})
          </Badge>
          <Badge
            variant={filters.status === 'Open' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => applyQuickFilter(filters.status === 'Open' ? 'clear' : 'open')}
          >
            Open ({issueCounts.open})
          </Badge>
          <Badge
            variant={filters.search === 'connect' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => applyQuickFilter(filters.search === 'connect' ? 'clear' : 'needsIntegration')}
          >
            Needs integration ({issueCounts.needsIntegration})
          </Badge>
          <Badge
            variant={filters.domain === 'Claims' ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => applyQuickFilter(filters.domain === 'Claims' ? 'clear' : 'claimsRelated')}
          >
            Claims-related ({issueCounts.claimsRelated})
          </Badge>
          {hasActiveFilters && (
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-destructive/10 text-destructive border-destructive/30"
              onClick={() => applyQuickFilter('clear')}
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Badge>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.domain}
            onValueChange={(v) => setFilters(prev => ({ ...prev, domain: v as IssueDomain | 'all' }))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {DOMAINS.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(v) => setFilters(prev => ({ ...prev, status: v as IssueStatus | 'all' }))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.owner}
            onValueChange={(v) => setFilters(prev => ({ ...prev, owner: v as IssueOwner | 'all' }))}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {OWNERS.map(o => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Issues Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[280px]">Issue</TableHead>
                <TableHead className="w-[100px]">Domain</TableHead>
                <TableHead className="w-[90px]">Confidence</TableHead>
                <TableHead className="hidden lg:table-cell">Impacted Insights</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[90px]">Owner</TableHead>
                <TableHead className="w-[100px] hidden md:table-cell">Updated</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50 text-success" />
                      <p>No issues found</p>
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => applyQuickFilter('clear')}
                          className="mt-2"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow
                    key={issue.id}
                    className={cn(
                      'group',
                      highlightedIssueId === issue.id && 'bg-primary/5 animate-pulse',
                      issue.status === 'Resolved' && 'opacity-60'
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {issue.rootCause}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {issue.domain}
                      </Badge>
                    </TableCell>
                    <TableCell>{getConfidenceBadge(issue.confidence)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {issue.impactedInsights.slice(0, 2).map((insight, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {insight}
                          </Badge>
                        ))}
                        {issue.impactedInsights.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{issue.impactedInsights.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(issue.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs">{issue.owner}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(issue.updatedAt, { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {issue.status !== 'Resolved' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onResolve(issue)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-success" />
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onAssign(issue.id, 'HR Ops')}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign to HR Ops
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAssign(issue.id, 'IT')}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign to IT
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAssign(issue.id, 'Comp & Ben')}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign to Comp & Ben
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>
                              <BellOff className="h-4 w-4 mr-2" />
                              Snooze
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <ListTodo className="h-4 w-4 mr-2" />
                              Create Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
