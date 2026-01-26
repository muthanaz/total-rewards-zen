/**
 * Action Approvals Tab
 * Shows pending, overdue approvals and allows approvers to take action
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  User,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { formatCurrencyAED } from '@/lib/utils';
import { useActionApprovals, ActionApproval } from '@/hooks/useActionApprovals';

export function ActionApprovalsTab() {
  const { 
    pendingApprovals, 
    overdueApprovals, 
    metrics, 
    isLoading,
    decideStep,
  } = useActionApprovals();
  
  const [selectedApproval, setSelectedApproval] = useState<ActionApproval | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedApproval) return;
    
    const currentStep = selectedApproval.steps?.find(
      s => s.step_order === selectedApproval.current_step_order && s.status === 'pending'
    );
    
    if (!currentStep) return;
    
    setIsDeciding(true);
    try {
      await decideStep.mutateAsync({
        stepId: currentStep.id,
        decision,
        note: decisionNote || undefined,
      });
      setSelectedApproval(null);
      setDecisionNote('');
    } finally {
      setIsDeciding(false);
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    const config: Record<string, { variant: 'destructive' | 'default' | 'secondary'; label: string }> = {
      P0: { variant: 'destructive', label: 'P0 - Critical' },
      P1: { variant: 'default', label: 'P1 - High' },
      P2: { variant: 'secondary', label: 'P2 - Medium' },
    };
    const c = config[priority || 'P2'] || config.P2;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12">Loading approvals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={metrics.overdue > 0 ? 'border-destructive/50 bg-destructive/5' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${metrics.overdue > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-2xl font-bold ${metrics.overdue > 0 ? 'text-destructive' : ''}`}>
                  {metrics.overdue}
                </p>
                <p className="text-xs text-muted-foreground">Overdue Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{metrics.avgApprovalTime.toFixed(1)}d</p>
                <p className="text-xs text-muted-foreground">Avg Approval Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((approval) => {
                  const currentStep = approval.steps?.find(
                    s => s.step_order === approval.current_step_order
                  );
                  const isOverdue = currentStep?.sla_due_at && isPast(new Date(currentStep.sla_due_at));
                  
                  return (
                    <TableRow key={approval.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {approval.action?.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{approval.action?.action_type || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(approval.action?.priority || null)}
                      </TableCell>
                      <TableCell>
                        {approval.action?.expected_impact_min_aed ? (
                          <span className="text-success">
                            {formatCurrencyAED(approval.action.expected_impact_min_aed, { abbreviate: true })}
                            {approval.action.expected_impact_max_aed && (
                              <>–{formatCurrencyAED(approval.action.expected_impact_max_aed, { abbreviate: true })}</>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Step {approval.current_step_order}
                          </Badge>
                          {currentStep?.approver_group?.name && (
                            <span className="text-xs text-muted-foreground">
                              {currentStep.approver_group.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(approval.submitted_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {currentStep?.sla_due_at ? (
                          <Badge variant={isOverdue ? 'destructive' : 'outline'} className="text-xs">
                            {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(currentStep.sla_due_at), { addSuffix: true })}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => setSelectedApproval(approval)}>
                          Review
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Approval</DialogTitle>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedApproval.action?.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{selectedApproval.action?.action_type}</Badge>
                  {getPriorityBadge(selectedApproval.action?.priority || null)}
                </div>
              </div>
              
              {selectedApproval.action?.expected_impact_min_aed && (
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expected Impact</p>
                  <p className="text-lg font-semibold text-success">
                    {formatCurrencyAED(selectedApproval.action.expected_impact_min_aed, { abbreviate: true })}
                    {selectedApproval.action.expected_impact_max_aed && (
                      <> – {formatCurrencyAED(selectedApproval.action.expected_impact_max_aed, { abbreviate: true })}</>
                    )}
                  </p>
                </div>
              )}
              
              {/* Steps Progress */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Approval Progress</p>
                <div className="flex gap-2">
                  {selectedApproval.steps?.sort((a, b) => a.step_order - b.step_order).map((step) => (
                    <div 
                      key={step.id} 
                      className={`flex-1 p-2 rounded-lg border text-center text-xs ${
                        step.status === 'approved' ? 'bg-success/10 border-success/30 text-success' :
                        step.status === 'rejected' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                        step.status === 'pending' && step.step_order === selectedApproval.current_step_order ? 'bg-primary/10 border-primary/30 text-primary' :
                        'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      <div className="font-medium">Step {step.step_order}</div>
                      <div className="capitalize">{step.status}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Decision Note (optional)</label>
                <Textarea
                  placeholder="Add a note explaining your decision..."
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => handleDecision('rejected')}
              disabled={isDeciding}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleDecision('approved')}
              disabled={isDeciding}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
