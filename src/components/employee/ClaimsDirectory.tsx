import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubmitClaimButton } from '@/components/employee/SubmitClaimButton';
import { Receipt, Clock, CheckCircle, XCircle, Search, Filter, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Claim {
  id: string;
  type: 'claim' | 'request' | 'question';
  category: string;
  subject: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

const mockClaims: Claim[] = [
  {
    id: 'CLM-001',
    type: 'claim',
    category: 'Health Insurance',
    subject: 'Dental Checkup Reimbursement',
    amount: 350,
    status: 'approved',
    submittedAt: '2026-01-05T10:30:00',
    reviewedAt: '2026-01-06T14:20:00',
    reviewerNotes: 'Approved - within dental allowance',
  },
  {
    id: 'CLM-002',
    type: 'claim',
    category: 'Learning & Development',
    subject: 'Python Certification Course',
    amount: 1500,
    status: 'pending',
    submittedAt: '2026-01-08T14:15:00',
  },
  {
    id: 'CLM-003',
    type: 'claim',
    category: 'Transport',
    subject: 'Fuel Expense December',
    amount: 800,
    status: 'approved',
    submittedAt: '2025-12-28T09:00:00',
    reviewedAt: '2025-12-29T11:30:00',
  },
  {
    id: 'REQ-001',
    type: 'request',
    category: 'Housing',
    subject: 'Furniture Allowance Request',
    amount: 5000,
    status: 'rejected',
    submittedAt: '2025-12-15T16:45:00',
    reviewedAt: '2025-12-18T10:00:00',
    reviewerNotes: 'Furniture allowance already claimed this year',
  },
  {
    id: 'QST-001',
    type: 'question',
    category: 'Wellbeing',
    subject: 'Gym membership options',
    status: 'approved',
    submittedAt: '2025-12-10T11:20:00',
    reviewedAt: '2025-12-10T15:00:00',
    reviewerNotes: 'Response sent via email',
  },
];

interface ClaimsDirectoryProps {
  isRTL?: boolean;
}

export function ClaimsDirectory({ isRTL = false }: ClaimsDirectoryProps) {
  const [claims] = useState<Claim[]>(mockClaims);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch = claim.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesType = typeFilter === 'all' || claim.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" />
            {isRTL ? 'قيد الانتظار' : 'Pending'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            {isRTL ? 'موافق عليه' : 'Approved'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            {isRTL ? 'مرفوض' : 'Rejected'}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'claim':
        return <Badge variant="outline">{isRTL ? 'مطالبة' : 'Claim'}</Badge>;
      case 'request':
        return <Badge variant="outline" className="border-primary/50 text-primary">{isRTL ? 'طلب' : 'Request'}</Badge>;
      case 'question':
        return <Badge variant="outline" className="border-accent/50 text-accent">{isRTL ? 'سؤال' : 'Question'}</Badge>;
      default:
        return null;
    }
  };

  const totalAmount = filteredClaims
    .filter(c => c.type === 'claim' && c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL && "md:flex-row-reverse")}>
          <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Receipt className="w-5 h-5 text-accent" />
            {isRTL ? 'سجل المطالبات والطلبات' : 'Claims & Requests Directory'}
          </CardTitle>
          <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
            <SubmitClaimButton 
              category="General" 
              buttonText={isRTL ? 'مطالبة جديدة' : 'New Claim'}
              buttonSize="sm"
              showIcon={true}
            />
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-48 h-9 text-sm", isRTL ? "pr-9 text-right" : "pl-9")}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All Status'}</SelectItem>
                <SelectItem value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</SelectItem>
                <SelectItem value="approved">{isRTL ? 'موافق عليه' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All Types'}</SelectItem>
                <SelectItem value="claim">{isRTL ? 'مطالبة' : 'Claim'}</SelectItem>
                <SelectItem value="request">{isRTL ? 'طلب' : 'Request'}</SelectItem>
                <SelectItem value="question">{isRTL ? 'سؤال' : 'Question'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-2xl font-bold">{filteredClaims.length}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الطلبات' : 'Total Requests'}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredClaims.filter(c => c.status === 'approved').length}
            </p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'موافق عليها' : 'Approved'}</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/10 text-center">
            <p className="text-2xl font-bold text-accent">AED {totalAmount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي المبالغ' : 'Total Claimed'}</p>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredClaims.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isRTL ? 'لا توجد نتائج' : 'No results found'}
            </p>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className={cn(
                  "p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors",
                  isRTL && "text-right"
                )}
              >
                <div className={cn("flex items-start justify-between gap-3", isRTL && "flex-row-reverse")}>
                  <div className="flex-1 min-w-0">
                    <div className={cn("flex items-center gap-2 mb-1 flex-wrap", isRTL && "flex-row-reverse")}>
                      <span className="text-xs font-mono text-muted-foreground">{claim.id}</span>
                      {getTypeBadge(claim.type)}
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="font-medium text-sm truncate">{claim.subject}</p>
                    <p className="text-xs text-muted-foreground">{claim.category}</p>
                  </div>
                  <div className={cn("text-right shrink-0", isRTL && "text-left")}>
                    {claim.amount && (
                      <p className="font-semibold text-sm">AED {claim.amount.toLocaleString()}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(claim.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {claim.reviewerNotes && claim.status !== 'pending' && (
                  <p className={cn("text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30", isRTL && "text-right")}>
                    💬 {claim.reviewerNotes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
