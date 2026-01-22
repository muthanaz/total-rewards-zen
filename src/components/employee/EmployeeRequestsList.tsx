/**
 * Employee Requests List
 * 
 * Displays the employee's requests with filtering, search, and status tabs.
 * Integrates with Supabase via useEmployeeRequests hook.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  AlertCircle,
  XCircle,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { useEmployeeRequests, useEmployeeRequestCounts, getEmployeeStatusLabel } from '@/hooks/useEmployeeRequests';
import { EmployeeRequestDetailSheet } from './EmployeeRequestDetailSheet';
import { getStatusBadgeStyle, formatRelativeTime } from '@/lib/crossPortalContract';
import { cn, formatCurrencyAED } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'in_review' | 'need_info' | 'approved' | 'rejected';

export function EmployeeRequestsList() {
  const { data: requests = [], isLoading, error } = useEmployeeRequests();
  const counts = useEmployeeRequestCounts();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const filteredRequests = useMemo(() => {
    let filtered = requests;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => {
        switch (statusFilter) {
          case 'pending':
            return r.status === 'pending' || r.status === 'submitted';
          case 'in_review':
            return r.status === 'in_review';
          case 'need_info':
            return r.hasMissingDocs;
          case 'approved':
            return r.status === 'approved' || r.status === 'paid';
          case 'rejected':
            return r.status === 'rejected';
          default:
            return true;
        }
      });
    }
    
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.subject.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [requests, statusFilter, searchQuery]);
  
  const handleOpenDetail = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDetailOpen(true);
  };
  
  const getStatusIcon = (status: string | null, hasMissingDocs: boolean) => {
    if (hasMissingDocs) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getSLABadge = (request: typeof requests[0]) => {
    if (!request.slaStatus) return null;
    
    const { isOverdue, isUrgent, hoursRemaining } = request.slaStatus;
    
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="text-[10px] px-1.5">
          Overdue
        </Badge>
      );
    }
    
    if (isUrgent) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] px-1.5">
          {hoursRemaining}h left
        </Badge>
      );
    }
    
    return null;
  };
  
  const formatMoney = (amount: number | null) => {
    if (!amount) return null;
    return formatCurrencyAED(amount, { abbreviate: false });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
          <CardDescription>Loading your requests...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load requests. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>My Requests</CardTitle>
              <CardDescription>Track your claims, requests, and questions</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="text-xs">
                All ({counts.total})
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="in_review" className="text-xs">
                In Review ({counts.inReview})
              </TabsTrigger>
              <TabsTrigger value="need_info" className="text-xs relative">
                Missing Docs
                {counts.needInfo > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full">
                    {counts.needInfo}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs">
                Approved ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs">
                Rejected ({counts.rejected})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={statusFilter} className="mt-0">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No requests found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search' : 'Submit a new request to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={cn(
                        "p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer",
                        request.hasMissingDocs && "border-amber-500/30 bg-amber-500/5"
                      )}
                      onClick={() => handleOpenDetail(request.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium truncate">{request.subject}</span>
                            {getSLABadge(request)}
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-2">
                            <span className="font-mono text-xs">{request.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{request.category}</span>
                            <span>•</span>
                            <span className="capitalize">{request.request_type}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-xs", getStatusBadgeStyle(request.status).className)}>
                              {getStatusIcon(request.status, request.hasMissingDocs)}
                              <span className="ml-1">
                                {request.hasMissingDocs ? 'Action Required' : getEmployeeStatusLabel(request.status)}
                              </span>
                            </Badge>
                            
                            {request.hasMissingDocs && (
                              <Badge variant="outline" className="text-xs text-amber-600">
                                {request.missingDocsCount} doc(s) missing
                              </Badge>
                            )}
                            
                            <Badge variant="outline" className="text-xs capitalize">
                              {request.priority || 'Standard'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {request.amount && (
                            <span className="font-semibold text-sm">{formatMoney(request.amount)}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(request.submitted_at || request.created_at || '')}
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      </div>
                      
                      {/* Next Action */}
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Next: <span className="font-medium text-foreground">{request.nextAction}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <EmployeeRequestDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        requestId={selectedRequestId}
      />
    </>
  );
}
