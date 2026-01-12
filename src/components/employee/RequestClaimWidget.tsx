import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Send, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Housing',
  'Schooling',
  'Health Insurance',
  'Transport',
  'Wellbeing',
  'Learning & Development',
  'Leave',
  'Financial',
  'Other',
];

const requestTypes = [
  { value: 'claim', label: 'Submit a Claim', description: 'Request reimbursement for expenses' },
  { value: 'request', label: 'Make a Request', description: 'Request approval for something' },
  { value: 'question', label: 'Ask a Question', description: 'Get help with benefits' },
];

interface Request {
  id: string;
  type: 'claim' | 'request' | 'question';
  category: string;
  subject: string;
  description: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewerNotes?: string;
}

const mockRequests: Request[] = [
  {
    id: '1',
    type: 'claim',
    category: 'Health Insurance',
    subject: 'Dental Checkup Reimbursement',
    description: 'Annual dental checkup at Dr. Smile Clinic',
    amount: 350,
    status: 'approved',
    submittedAt: '2024-01-05T10:30:00',
    reviewerNotes: 'Approved - within dental allowance',
  },
  {
    id: '2',
    type: 'request',
    category: 'Learning & Development',
    subject: 'Online Course Approval',
    description: 'Requesting approval for Python certification course',
    amount: 1500,
    status: 'pending',
    submittedAt: '2024-01-08T14:15:00',
  },
];

export function RequestClaimWidget() {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    subject: '',
    description: '',
    amount: '',
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.type || !formData.category || !formData.subject) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newRequest: Request = {
      id: Date.now().toString(),
      type: formData.type as 'claim' | 'request' | 'question',
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setRequests([newRequest, ...requests]);
    setFormData({ type: '', category: '', subject: '', description: '', amount: '' });
    setOpen(false);

    toast({
      title: 'Request Submitted',
      description: 'Your request has been submitted for review.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
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
    <Card className="card-elevated">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Requests & Claims
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a Request</DialogTitle>
              <DialogDescription>
                Submit a claim, request, or ask a question about your benefits.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <p>{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Subject *</Label>
                <Input
                  placeholder="Brief subject..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Provide details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {formData.type === 'claim' && (
                <div>
                  <Label>Amount (AED)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-1" />
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No requests yet</p>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((request) => (
              <div key={request.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getTypeBadge(request.type)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="font-medium text-sm truncate">{request.subject}</p>
                    <p className="text-xs text-muted-foreground">{request.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {request.amount && (
                      <p className="font-medium text-sm">AED {request.amount.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {request.reviewerNotes && request.status !== 'pending' && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    {request.reviewerNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
