/**
 * Employee Claims Page (Clean List View)
 * 
 * Clean 2-part layout:
 * - Top: New Claim button + helper text
 * - Below: Claims table with minimal columns
 * 
 * Route: /employee/requests
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  FileText,
  Eye,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { StandardPageHeader } from '@/components/shared';
import { Currency } from '@/components/ui/Currency';
import { useEmployeeRequests, useEmployeeRequestCounts, getEmployeeStatusLabel } from '@/hooks/useEmployeeRequests';
import { getStatusBadgeStyle, formatRelativeTime } from '@/lib/crossPortalContract';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'in_review' | 'need_info' | 'approved' | 'rejected';

export default function ClaimsListPage() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading, error } = useEmployeeRequests();
  const counts = useEmployeeRequestCounts();
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
            return r.hasMissingDocs || r.status === 'info_requested' || r.status === 'pending_employee';
          case 'approved':
            return r.status === 'approved' || r.status === 'paid' || r.status === 'ready_for_payment';
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Claims</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-destructive" />
            <p className="font-medium">Failed to load claims</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Standard Page Header - Employee variant */}
      <StandardPageHeader
        variant="employee"
        title="My Claims"
        helperText="Most claims take less than 2 minutes if documents are ready."
        icon={Receipt}
        iconClassName="from-success to-success/80 shadow-success/25"
        primaryCTA={{
          label: 'New Claim',
          icon: Plus,
          onClick: () => navigate('/employee/requests/new'),
        }}
      />
      
      {/* Claims Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Claims History</CardTitle>
              <CardDescription>View and track your submitted claims.</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-56"
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
                Action Needed
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
                  <p className="font-medium">No claims found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search' : 'Submit your first claim to get started'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/employee/requests/new')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Claim
                    </Button>
                  )}
                </div>
              ) : (
                /* Clean table-like list */
                <div className="border rounded-lg overflow-hidden">
                  {/* Header row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                    <div className="col-span-2">Claim ID</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Submitted</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Payable</div>
                    <div className="col-span-1">Next Step</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {/* Data rows */}
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={cn(
                        'grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer',
                        request.hasMissingDocs && 'bg-amber-500/5'
                      )}
                      onClick={() => navigate(`/employee/requests/${request.id}`)}
                    >
                      {/* Claim ID */}
                      <div className="md:col-span-2 flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{request.id.slice(0, 8)}
                        </span>
                        <span className="md:hidden text-sm font-medium truncate">
                          {request.subject}
                        </span>
                      </div>
                      
                      {/* Category */}
                      <div className="md:col-span-2 text-sm">
                        {request.category}
                      </div>
                      
                      {/* Submitted Date */}
                      <div className="md:col-span-2 text-sm text-muted-foreground">
                        {formatRelativeTime(request.submitted_at || request.created_at || '')}
                      </div>
                      
                      {/* Status */}
                      <div className="md:col-span-2">
                        <Badge className={cn('text-xs', getStatusBadgeStyle(request.status).className)}>
                          {request.hasMissingDocs ? 'Action Required' : getEmployeeStatusLabel(request.status)}
                        </Badge>
                      </div>
                      
                      {/* Payable */}
                      <div className="md:col-span-2 font-medium tabular-nums">
                        {request.amount ? (
                          <Currency amount={request.amount} size="sm" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      
                      {/* Next Step */}
                      <div className="md:col-span-1 text-xs text-muted-foreground truncate" title={request.nextAction}>
                        {request.nextAction.replace('Action required: ', '').slice(0, 20)}
                        {request.nextAction.length > 20 ? '...' : ''}
                      </div>
                      
                      {/* View */}
                      <div className="md:col-span-1 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employee/requests/${request.id}`);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
