/**
 * Employee Claim Detail Page
 * 
 * Clean detail view with:
 * - Top summary (status, payable, SLA, last update)
 * - Minimal timeline
 * - Documents section
 * 
 * Route: /employee/requests/:id
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Upload,
  XCircle,
  Pause,
  ExternalLink,
} from 'lucide-react';
import { Currency } from '@/components/ui/Currency';
import { useEmployeeRequest, getEmployeeStatusLabel } from '@/hooks/useEmployeeRequests';
import { useRequestDocuments } from '@/hooks/useRequestDocuments';
import { useRequestTimeline } from '@/hooks/useSharedRequests';
import { getStatusBadgeStyle, formatRelativeTime } from '@/lib/crossPortalContract';
import { cn } from '@/lib/utils';

// ============================================================================
// TIMELINE STEP COMPONENT
// ============================================================================

interface TimelineStep {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

function ClaimTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                step.status === 'completed' && 'bg-success text-success-foreground',
                step.status === 'current' && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                step.status === 'upcoming' && 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                idx + 1
              )}
            </div>
            <span className={cn(
              'text-[10px] whitespace-nowrap',
              step.status === 'current' ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              'w-8 h-0.5 -mt-5',
              step.status === 'completed' ? 'bg-success' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justSubmitted = searchParams.get('submitted') === 'true';
  
  const { data: request, isLoading } = useEmployeeRequest(id || null);
  const { data: docs = [] } = useRequestDocuments(id || null);
  const { data: timeline = [] } = useRequestTimeline(id || null, false);
  
  // Build simplified timeline steps
  const timelineSteps: TimelineStep[] = [
    { 
      key: 'submitted', 
      label: 'Submitted', 
      status: request?.status ? 'completed' : 'upcoming' 
    },
    { 
      key: 'in_review', 
      label: 'In Review', 
      status: request?.status === 'in_review' ? 'current' : 
              ['approved', 'rejected', 'paid', 'closed', 'ready_for_payment'].includes(request?.status || '') ? 'completed' : 'upcoming'
    },
    { 
      key: 'info_requested', 
      label: 'Info Requested', 
      status: request?.status === 'info_requested' || request?.status === 'pending_employee' ? 'current' : 'upcoming'
    },
    { 
      key: 'approved', 
      label: 'Approved', 
      status: ['approved', 'ready_for_payment', 'paid', 'closed'].includes(request?.status || '') ? 'completed' :
              request?.status === 'rejected' ? 'upcoming' : 'upcoming'
    },
    { 
      key: 'paid', 
      label: 'Paid', 
      status: ['paid', 'closed'].includes(request?.status || '') ? 'completed' : 'upcoming'
    },
  ];
  
  // Filter out info_requested if not relevant
  const relevantSteps = timelineSteps.filter(s => 
    s.key !== 'info_requested' || s.status === 'current'
  );
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
      case 'paid':
      case 'closed':
      case 'ready_for_payment':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'in_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'info_requested':
      case 'pending_employee':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  // Loading
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/employee/requests')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Claims
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Claim Not Found</h2>
            <p className="text-muted-foreground">This claim may have been deleted or you don't have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employee/requests')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{request.subject}</h1>
            <p className="text-sm text-muted-foreground">
              {request.category} • Claim #{request.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <Badge className={cn('shrink-0', getStatusBadgeStyle(request.status).className)}>
          {getStatusIcon(request.status)}
          <span className="ml-1">{getEmployeeStatusLabel(request.status)}</span>
        </Badge>
      </div>
      
      {/* Just submitted confirmation */}
      {justSubmitted && (
        <Alert className="border-success/50 bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription>
            <strong>Claim submitted successfully!</strong>
            {request.hasMissingDocs ? (
              <span className="block mt-1">
                Upload the remaining documents to continue processing.
              </span>
            ) : (
              <span className="block mt-1">
                Await HR review. You'll be notified when there's an update.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Action required banner */}
      {request.hasMissingDocs && !justSubmitted && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <strong>Action Required:</strong> Upload {request.missingDocsCount} missing document(s) to continue processing.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-xs text-muted-foreground">Status</span>
              <p className="font-medium">{getEmployeeStatusLabel(request.status)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Payable</span>
              <p className="font-semibold">
                {request.amount ? <Currency amount={request.amount} /> : '—'}
              </p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">SLA</span>
              <div className="flex items-center gap-1">
                {request.slaStatus?.isPaused ? (
                  <Badge variant="outline" className="text-xs gap-1 text-purple-600">
                    <Pause className="h-3 w-3" />
                    Paused
                  </Badge>
                ) : request.slaStatus?.isOverdue ? (
                  <Badge variant="destructive" className="text-xs">Overdue</Badge>
                ) : request.slaStatus?.isUrgent ? (
                  <span className="text-amber-600 font-medium">{request.slaStatus.hoursRemaining}h left</span>
                ) : (
                  <span className="text-muted-foreground">On track</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Last Update</span>
              <p className="text-sm">{formatRelativeTime(request.reviewed_at || request.submitted_at || '')}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Timeline */}
          <div className="flex justify-center overflow-x-auto py-2">
            <ClaimTimeline steps={relevantSteps} />
          </div>
        </CardContent>
      </Card>
      
      {/* Documents Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription>Required documents for this claim.</CardDescription>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents required for this claim.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'p-3 rounded-lg border flex items-center justify-between gap-3',
                    doc.status === 'missing' && 'bg-amber-500/5 border-amber-500/20',
                    doc.status === 'provided' && 'bg-muted/50',
                    doc.status === 'verified' && 'bg-success/5 border-success/20',
                    doc.status === 'rejected' && 'bg-destructive/5 border-destructive/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={cn(
                      'h-5 w-5',
                      doc.status === 'missing' && 'text-amber-500',
                      doc.status === 'provided' && 'text-muted-foreground',
                      doc.status === 'verified' && 'text-success',
                      doc.status === 'rejected' && 'text-destructive'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{doc.doc_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {doc.status === 'verified' ? 'Verified ✓' : doc.status}
                      </p>
                    </div>
                  </div>
                  
                  {doc.status === 'missing' && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </Button>
                  )}
                  
                  {doc.status === 'verified' && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  
                  {doc.status === 'rejected' && doc.reviewer_notes && (
                    <span className="text-xs text-destructive max-w-[150px] truncate">
                      {doc.reviewer_notes}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Activity/History - minimal */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeline.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-border mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium capitalize">
                      {(event.action || event.to_status || 'Updated').replace(/_/g, ' ')}
                    </span>
                    {event.notes_employee_visible && (
                      <p className="text-muted-foreground">{event.notes_employee_visible}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(event.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
