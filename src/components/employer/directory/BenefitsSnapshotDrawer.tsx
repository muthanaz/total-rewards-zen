import { useState } from 'react';
import { 
  Heart, GraduationCap, Car, Home, Sparkles, Calendar,
  Clock, FileWarning, AlertTriangle, CheckCircle2, XCircle,
  ExternalLink, Mail, FileText, Eye, EyeOff, ShieldAlert
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  EmployeeBenefitsSnapshot, 
  EmployeeEntitlement, 
  EmployeeRequest, 
  EmployeeMissingDoc,
  STATUS_CONFIG,
  SensitiveDataPermission 
} from './types';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface BenefitsSnapshotDrawerProps {
  snapshot: EmployeeBenefitsSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryIcons = {
  health: Heart,
  education: GraduationCap,
  transport: Car,
  housing: Home,
  lifestyle: Sparkles,
  leave: Calendar,
};

const slaStatusConfig = {
  on_track: { label: 'On Track', className: 'bg-emerald-500/10 text-emerald-600' },
  at_risk: { label: 'At Risk', className: 'bg-amber-500/10 text-amber-600' },
  breached: { label: 'Breached', className: 'bg-destructive/10 text-destructive' },
};

const requestStatusConfig = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600' },
  in_review: { label: 'In Review', className: 'bg-blue-500/10 text-blue-600' },
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-600' },
};

export function BenefitsSnapshotDrawer({ 
  snapshot, 
  open, 
  onOpenChange 
}: BenefitsSnapshotDrawerProps) {
  const navigate = useNavigate();
  // Privacy: salary access requires explicit permission and is logged
  const [salaryPermission] = useState<SensitiveDataPermission>({
    canViewSalary: false, // Default: no salary access
    reason: 'Salary data requires explicit permission',
    auditRequired: true,
  });
  const [salaryAccessRequested, setSalaryAccessRequested] = useState(false);

  if (!snapshot) return null;

  const { employee, entitlements, openRequests, missingDocs } = snapshot;
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();

  const handleRequestSalaryAccess = () => {
    // In production, this would trigger an audit-logged request
    toast.info('Salary access requested', {
      description: 'This request has been logged for audit. Access requires manager approval.',
    });
    setSalaryAccessRequested(true);
  };

  const handleGoToRequest = (requestId: string) => {
    navigate(`/employer/ops?request=${requestId}`);
    onOpenChange(false);
  };

  const handleSendDocReminder = () => {
    toast.success('Document reminder sent', {
      description: `Email sent to ${employee.email} requesting missing documents.`,
    });
  };

  const handleViewFullProfile = () => {
    navigate(`/employer/directory/${employee.id}`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          {/* Employee Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-lg">{fullName}</SheetTitle>
                <Badge variant="secondary" className="font-mono text-xs">{employee.grade}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{employee.department}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', STATUS_CONFIG[employee.status].className)}
                >
                  {STATUS_CONFIG[employee.status].label}
                </Badge>
                <span className="text-xs text-muted-foreground">{employee.location}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Benefits Summary */}
        <div className="space-y-4">
          {/* Overall Utilization */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Utilization</span>
                <span className="text-lg font-bold tabular-nums">
                  {snapshot.overallUtilizationPercent}%
                </span>
              </div>
              <Progress 
                value={snapshot.overallUtilizationPercent} 
                className={cn(
                  "h-2",
                  snapshot.overallUtilizationPercent >= 75 && "[&>div]:bg-emerald-500",
                  snapshot.overallUtilizationPercent >= 50 && snapshot.overallUtilizationPercent < 75 && "[&>div]:bg-primary",
                  snapshot.overallUtilizationPercent < 50 && "[&>div]:bg-amber-500"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Utilized: {formatCurrencyAED(snapshot.totalUtilized)}</span>
                <span>Annual: {formatCurrencyAED(snapshot.totalAnnualValue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Notice for Salary */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Salary Data Protected
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Salary information requires explicit permission and all access is audit-logged.
                  </p>
                  {!salaryAccessRequested ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5 text-xs h-7 border-amber-500/30"
                      onClick={handleRequestSalaryAccess}
                    >
                      <Eye className="w-3 h-3" />
                      Request Access
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-amber-500/10">
                      <Clock className="w-3 h-3 mr-1" />
                      Access Pending Approval
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Entitlements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Key Entitlements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entitlements.map((ent) => {
                const Icon = categoryIcons[ent.category] || Sparkles;
                const isExpiringSoon = ent.expiresAt && differenceInDays(ent.expiresAt, new Date()) <= 30;
                
                return (
                  <div key={ent.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{ent.benefitName}</span>
                      </div>
                      {isExpiringSoon && (
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                          Expires in {differenceInDays(ent.expiresAt!, new Date())}d
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={ent.utilizationPercent} 
                        className="h-1.5 flex-1"
                      />
                      <span className="text-xs text-muted-foreground w-16 text-right tabular-nums">
                        {formatCurrencyAED(ent.remainingBalance)} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Open Requests */}
          {openRequests.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Open Requests ({openRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openRequests.map((req) => (
                  <div 
                    key={req.id} 
                    className="p-3 rounded-lg border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {req.type === 'claim' ? 'Claim' : 'Request'}
                        </Badge>
                        <span className="text-sm font-medium">{req.benefitCategory}</span>
                      </div>
                      <span className="font-semibold text-sm tabular-nums">
                        {formatCurrencyAED(req.amountAED)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', requestStatusConfig[req.status].className)}
                        >
                          {requestStatusConfig[req.status].label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', slaStatusConfig[req.slaStatus].className)}
                        >
                          {slaStatusConfig[req.slaStatus].label}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 gap-1 text-xs"
                        onClick={() => handleGoToRequest(req.id)}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                    {req.missingDocs.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <FileWarning className="w-3 h-3" />
                        Missing: {req.missingDocs.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Missing Documents */}
          {missingDocs.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-destructive" />
                  Missing Documents ({missingDocs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {missingDocs.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-destructive/5"
                  >
                    <div>
                      <p className="text-sm font-medium">{doc.documentType}</p>
                      <p className="text-xs text-muted-foreground">
                        Required for: {doc.requiredFor}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        doc.status === 'expired' && 'bg-destructive/10 text-destructive',
                        doc.status === 'expiring_soon' && 'bg-amber-500/10 text-amber-600',
                        doc.status === 'not_uploaded' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {doc.status === 'expired' ? 'Expired' : 
                       doc.status === 'expiring_soon' ? 'Expiring Soon' : 'Not Uploaded'}
                    </Badge>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 mt-2"
                  onClick={handleSendDocReminder}
                >
                  <Mail className="w-4 h-4" />
                  Send Document Reminder
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t space-y-2">
          <Button className="w-full gap-2" onClick={handleViewFullProfile}>
            <FileText className="w-4 h-4" />
            View Full Profile
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
