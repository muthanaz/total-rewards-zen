import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck, Clock, CheckCircle, XCircle, Search, Filter, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployerGlobalFiltersBar } from '@/components/employer';

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
    reviewedAt: '2024-01-05T10:00:00',
    reviewerNotes: 'Rejected - Exceeds annual wellbeing allowance limit. Please resubmit with partial amount.',
  },
  {
    id: '6',
    employeeName: 'Fatima Al-Sayed',
    employeeId: 'EMP031',
    type: 'request',
    category: 'Leave',
    subject: 'Annual Leave - February',
    description: 'Requesting 5 days annual leave from Feb 15-21 for family vacation.',
    status: 'approved',
    submittedAt: '2024-01-05T08:30:00',
    reviewedAt: '2024-01-05T14:00:00',
    reviewerNotes: 'Approved. Enjoy your vacation!',
  },
];

export default function ClaimsPage() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

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
        <Card className="card-elevated">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle className="text-lg">All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Subject</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{request.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{request.employeeId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getTypeBadge(request.type)}</td>
                    <td className="py-3 px-4 text-sm">{request.category}</td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate">{request.subject}</td>
                    <td className="py-3 px-4 text-right text-sm">
                      {request.amount ? `AED ${request.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </td>
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
              <div className="flex gap-2">
                {getTypeBadge(selectedRequest.type)}
                {getStatusBadge(selectedRequest.status)}
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
                {selectedRequest.reviewedAt && (
                  <div>
                    <p className="text-muted-foreground">Reviewed</p>
                    <p className="font-medium">{new Date(selectedRequest.reviewedAt).toLocaleString()}</p>
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
            ) : (
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
