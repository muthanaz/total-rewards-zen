import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ShieldAlert, Clock, User, FileText, Filter, Download, Eye } from 'lucide-react';
import { cn, formatInteger } from '@/lib/utils';
import { DemoModeBadge } from '@/components/shared/DemoDataGate';
import { format, subDays, subHours } from 'date-fns';

// Demo audit log data
const DEMO_AUDIT_LOGS = [
  { id: '1', timestamp: subHours(new Date(), 1), actor: 'Sarah Ahmed', action: 'claim_approved', resource: 'Claim #CLM-2024-0892', resourceType: 'claim', outcome: 'success', details: 'Medical claim approved for AED 2,500' },
  { id: '2', timestamp: subHours(new Date(), 3), actor: 'Mohammed Al-Rashid', action: 'policy_updated', resource: 'Education Allowance Policy', resourceType: 'policy', outcome: 'success', details: 'Updated eligibility criteria for Grade 4+' },
  { id: '3', timestamp: subHours(new Date(), 5), actor: 'System', action: 'sync_completed', resource: 'HRIS Integration', resourceType: 'integration', outcome: 'success', details: 'Synced 245 employee records' },
  { id: '4', timestamp: subDays(new Date(), 1), actor: 'Fatima Khan', action: 'claim_rejected', resource: 'Claim #CLM-2024-0890', resourceType: 'claim', outcome: 'success', details: 'Rejected: Missing documentation' },
  { id: '5', timestamp: subDays(new Date(), 1), actor: 'Ali Hassan', action: 'login_attempt', resource: 'Portal Access', resourceType: 'auth', outcome: 'failure', details: 'Failed login attempt from new device' },
  { id: '6', timestamp: subDays(new Date(), 2), actor: 'Layla Omar', action: 'employee_added', resource: 'Ahmed Khalil', resourceType: 'employee', outcome: 'success', details: 'New employee onboarded to Engineering' },
  { id: '7', timestamp: subDays(new Date(), 2), actor: 'System', action: 'report_generated', resource: 'Monthly Spend Report', resourceType: 'report', outcome: 'success', details: 'Q4 2024 spend analysis exported' },
  { id: '8', timestamp: subDays(new Date(), 3), actor: 'Khalid Ibrahim', action: 'workflow_triggered', resource: 'Action #ACT-2024-0045', resourceType: 'workflow', outcome: 'success', details: 'Approval workflow initiated for budget reallocation' },
];

const ACTION_TYPES = ['All', 'claim_approved', 'claim_rejected', 'policy_updated', 'sync_completed', 'login_attempt', 'employee_added', 'report_generated', 'workflow_triggered'];
const RESOURCE_TYPES = ['All', 'claim', 'policy', 'integration', 'auth', 'employee', 'report', 'workflow'];
const OUTCOMES = ['All', 'success', 'failure'];

export default function AuditLogs() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [resourceFilter, setResourceFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');

  const filteredLogs = DEMO_AUDIT_LOGS.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'All' || log.resourceType === resourceFilter;
    const matchesOutcome = outcomeFilter === 'All' || log.outcome === outcomeFilter;
    return matchesSearch && matchesAction && matchesResource && matchesOutcome;
  });

  const stats = {
    total: DEMO_AUDIT_LOGS.length,
    success: DEMO_AUDIT_LOGS.filter(l => l.outcome === 'success').length,
    failure: DEMO_AUDIT_LOGS.filter(l => l.outcome === 'failure').length,
    todayCount: DEMO_AUDIT_LOGS.filter(l => l.timestamp > subDays(new Date(), 1)).length,
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      claim_approved: 'bg-success/10 text-success border-success/20',
      claim_rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      policy_updated: 'bg-primary/10 text-primary border-primary/20',
      sync_completed: 'bg-accent/10 text-accent-foreground border-accent/20',
      login_attempt: 'bg-warning/10 text-warning border-warning/20',
      employee_added: 'bg-success/10 text-success border-success/20',
      report_generated: 'bg-muted text-muted-foreground border-muted-foreground/20',
      workflow_triggered: 'bg-primary/10 text-primary border-primary/20',
    };
    return (
      <Badge variant="outline" className={cn('capitalize', actionColors[action] || '')}>
        {action.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    if (outcome === 'success') {
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Success</Badge>;
    }
    return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Failed</Badge>;
  };

  const getResourceIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      claim: <FileText className="w-4 h-4" />,
      policy: <ShieldAlert className="w-4 h-4" />,
      integration: <Clock className="w-4 h-4" />,
      auth: <User className="w-4 h-4" />,
      employee: <User className="w-4 h-4" />,
      report: <FileText className="w-4 h-4" />,
      workflow: <Clock className="w-4 h-4" />,
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {language === 'ar' ? 'سجلات التدقيق' : 'Audit Logs'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ar' ? 'تتبع جميع الإجراءات والتغييرات في النظام' : 'Track all system actions and changes'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DemoModeBadge />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldAlert className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.total)}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <ShieldAlert className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.success)}</p>
                  <p className="text-xs text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.failure)}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatInteger(stats.todayCount)}</p>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
              <div className="relative flex-1">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={language === 'ar' ? 'بحث في السجلات...' : 'Search logs...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('h-9', isRTL ? 'pr-10' : 'pl-10')}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(a => (
                    <SelectItem key={a} value={a}>{a === 'All' ? 'All Actions' : a.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(r => (
                    <SelectItem key={r} value={r}>{r === 'All' ? 'All Resources' : r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map(o => (
                    <SelectItem key={o} value={o}>{o === 'All' ? 'All Outcomes' : o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {language === 'ar' ? 'سجل الأحداث' : 'Event Log'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredLogs.length} of {DEMO_AUDIT_LOGS.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-muted-foreground text-sm">
                      {format(log.timestamp, 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">{log.actor}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{getResourceIcon(log.resourceType)}</span>
                        <span className="truncate max-w-[200px]">{log.resource}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getOutcomeBadge(log.outcome)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm truncate max-w-[250px]">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
