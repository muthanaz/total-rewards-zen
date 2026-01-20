import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle,
  Timer,
  UserCheck,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';

interface Request {
  id: string;
  employeeName: string;
  employeeId: string;
  type: 'claim' | 'request' | 'question';
  category: string;
  subject: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  slaDeadline: string;
  riskLevel: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

const mockRequests: Request[] = [
  {
    id: '1',
    employeeName: 'Ahmed Al-Rashid',
    employeeId: 'EMP001',
    type: 'claim',
    category: 'Health Insurance',
    subject: 'Dental Claim Reimbursement',
    description: 'Dental cleaning and checkup at Dr. Smile Clinic on Jan 5, 2024. Receipt attached.',
    amount: 450,
    status: 'pending',
    submittedAt: '2024-01-08T10:30:00',
    slaDeadline: '2024-01-11T10:30:00',
    riskLevel: 'low',
  },
  {
    id: '2',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP015',
    type: 'request',
    category: 'Learning & Development',
    subject: 'Course Approval - AWS Certification',
    description: 'Requesting approval for AWS Solutions Architect certification course at AED 2,500.',
    amount: 2500,
    status: 'pending',
    submittedAt: '2024-01-07T14:15:00',
    slaDeadline: '2024-01-10T14:15:00',
    riskLevel: 'medium',
    assignedTo: 'L&D Manager',
  },
  {
    id: '3',
    employeeName: 'Mohammed Hassan',
    employeeId: 'EMP023',
    type: 'claim',
    category: 'Transport',
    subject: 'Fuel Reimbursement - December',
    description: 'Monthly fuel expenses for December 2023. Total: AED 800.',
    amount: 800,
    status: 'approved',
    submittedAt: '2024-01-02T09:00:00',
    slaDeadline: '2024-01-05T09:00:00',
    riskLevel: 'low',
    reviewedAt: '2024-01-03T11:30:00',
    reviewerNotes: 'Approved. Within monthly fuel allowance.',
  },
  {
    id: '4',
    employeeName: 'Lisa Chen',
    employeeId: 'EMP042',
    type: 'question',
    category: 'Housing',
    subject: 'Housing Allowance Top-up Query',
    description: 'Can I use savings from other benefits to top up housing allowance? My rent exceeds the allowance by AED 2,000/month.',
    status: 'pending',
    submittedAt: '2024-01-06T16:45:00',
    slaDeadline: '2024-01-09T16:45:00',
    riskLevel: 'high',
  },
  {
    id: '5',
    employeeName: 'Omar Khalil',
    employeeId: 'EMP008',
    type: 'claim',
    category: 'Wellbeing',
    subject: 'Gym Membership Reimbursement',
    description: 'Annual gym membership at Fitness First - Dubai Marina. Receipt attached.',
    amount: 3600,
    status: 'rejected',
    submittedAt: '2024-01-04T12:00:00',
    slaDeadline: '2024-01-07T12:00:00',
    riskLevel: 'medium',
    reviewedAt: '2024-01-05T10:00:00',
    reviewerNotes: 'Rejected - Exceeds annual wellbeing allowance limit. Please resubmit with partial amount.',
  },
];

export function ClaimsOpsView() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();
  const { hasPermission } = useEmployerPermissions();
  const canProcessClaims = hasPermission('can_process_claims');

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const lowRiskPending = requests.filter(r => r.status === 'pending' && r.riskLevel === 'low');
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const slaBreach = requests.filter(r => r.status === 'pending' && new Date(r.slaDeadline) < new Date()).length;

  const handleAction = (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest.id 
        ? { 
            ...req, 
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewerNotes: reviewNotes
          } 
        : req
    ));
    
    toast({
      title: action === 'approve' ? 'Request Approved' : 'Request Rejected',
      description: `${selectedRequest.subject} has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
    
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const handleBulkApprove = () => {
    setRequests(prev => prev.map(req => 
      selectedForBulk.includes(req.id)
        ? { ...req, status: 'approved', reviewedAt: new Date().toISOString(), reviewerNotes: 'Bulk approved - low risk' }
        : req
    ));
    toast({
      title: 'Bulk Approval Complete',
      description: `${selectedForBulk.length} low-risk claims approved.`,
    });
    setSelectedForBulk([]);
  };

  const toggleBulkSelect = (id: string) => {
    setSelectedForBulk(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSlaStatus = (deadline: string, status: string) => {
    if (status !== 'pending') return null;
    const now = new Date();
    const sla = new Date(deadline);
    const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursRemaining < 0) {
      return <Badge className="bg-red-500/10 text-red-600 border-0"><Timer className="w-3 h-3 mr-1" />Overdue</Badge>;
    } else if (hoursRemaining < 24) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-0"><Timer className="w-3 h-3 mr-1" />{Math.round(hoursRemaining)}h left</Badge>;
    }
    return <Badge variant="outline" className="text-xs"><Timer className="w-3 h-3 mr-1" />{Math.round(hoursRemaining / 24)}d left</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-xs">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/10 text-amber-600 border-0 text-xs">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-500/10 text-red-600 border-0 text-xs">High Risk</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'claim':
        return <Badge variant="outline">Claim</Badge>;
      case 'request':
        return <Badge variant="outline" className="border-primary/50 text-primary">Request</Badge>;
      case 'question':
        return <Badge variant="outline" className="border-accent/50 text-accent">Question</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Claims & Approvals</h1>
        <p className="text-muted-foreground">Review and manage employee requests and claims</p>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`card-elevated ${slaBreach > 0 ? 'border-red-500/30' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-8 w-8 ${slaBreach > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-2xl font-bold ${slaBreach > 0 ? 'text-red-600' : ''}`}>{slaBreach}</p>
                <p className="text-sm text-muted-foreground">SLA Breach</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {lowRiskPending.length > 0 && statusFilter === 'pending' && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">
                    {lowRiskPending.length} Low-Risk Claims Ready for Bulk Approval
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These claims match auto-approval criteria
                  </p>
                </div>
              </div>
              <PermissionGate 
                permission="can_process_claims"
                fallback={
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Lock className="w-3 h-3" /> View Only
                  </Badge>
                }
              >
                <Button 
                  onClick={() => {
                    setSelectedForBulk(lowRiskPending.map(r => r.id));
                    handleBulkApprove();
                  }}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve All Low-Risk
                </Button>
              </PermissionGate>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, subject, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="claim">Claims</SelectItem>
                <SelectItem value="request">Requests</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="text-lg">
            {statusFilter === 'pending' ? 'Pending Queue' : 'All Requests'}
            {selectedForBulk.length > 0 && (
              <Badge className="ml-2">{selectedForBulk.length} selected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {statusFilter === 'pending' && (
                    <th className="text-left py-3 px-2 w-10">
                      <Checkbox 
                        checked={selectedForBulk.length === filteredRequests.filter(r => r.riskLevel === 'low').length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedForBulk(filteredRequests.filter(r => r.riskLevel === 'low').map(r => r.id));
                          } else {
                            setSelectedForBulk([]);
                          }
                        }}
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Subject</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Risk</th>
                  <th className="text-left py-3 px-4 font-medium">SLA</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30">
                    {statusFilter === 'pending' && (
                      <td className="py-3 px-2">
                        {request.riskLevel === 'low' && (
                          <Checkbox 
                            checked={selectedForBulk.includes(request.id)}
                            onCheckedChange={() => toggleBulkSelect(request.id)}
                          />
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{request.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{request.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(request.type)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm max-w-xs truncate">{request.subject}</p>
                        <p className="text-xs text-muted-foreground">{request.category}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      {request.amount ? `AED ${request.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">{getRiskBadge(request.riskLevel)}</td>
                    <td className="py-3 px-4">{getSlaStatus(request.slaDeadline, request.status)}</td>
                    <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No requests found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected for Bulk Actions */}
      {selectedForBulk.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="shadow-lg">
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <span className="text-sm font-medium">{selectedForBulk.length} selected</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedForBulk([])}>
                Clear
              </Button>
              <Button size="sm" onClick={handleBulkApprove} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Approve Selected
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.subject}</DialogTitle>
            <DialogDescription>
              Submitted by {selectedRequest?.employeeName} ({selectedRequest?.employeeId})
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {getTypeBadge(selectedRequest.type)}
                {getStatusBadge(selectedRequest.status)}
                {getRiskBadge(selectedRequest.riskLevel)}
                {getSlaStatus(selectedRequest.slaDeadline, selectedRequest.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedRequest.category}</p>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">AED {selectedRequest.amount.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                </div>
                {selectedRequest.assignedTo && (
                  <div>
                    <p className="text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{selectedRequest.assignedTo}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedRequest.description}</p>
              </div>

              {selectedRequest.reviewerNotes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reviewer Notes</p>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg">{selectedRequest.reviewerNotes}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Add Review Notes</p>
                  <Textarea
                    placeholder="Add notes for the employee..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedRequest?.status === 'pending' ? (
              <PermissionGate 
                permission="can_process_claims"
                fallback={
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">You don't have permission to process claims</span>
                  </div>
                }
              >
                <>
                  <Button variant="outline" onClick={() => handleAction('reject')}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleAction('approve')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              </PermissionGate>
            ) : (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
