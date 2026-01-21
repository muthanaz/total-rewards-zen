/**
 * Policy Reference Badge
 * 
 * Clickable badge that displays a policy reference.
 * Opens a drawer/modal with the full policy details when clicked.
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  BookOpen,
  Users,
  DollarSign,
  Paperclip,
  XCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolicyByRef, type Policy, type RequiredDoc } from '@/hooks/usePolicies';
import { format } from 'date-fns';

interface PolicyRefBadgeProps {
  policyRef: string | null | undefined;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
}

export function PolicyRefBadge({
  policyRef,
  className,
  showIcon = true,
  variant = 'outline',
}: PolicyRefBadgeProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: policy, isLoading, error } = usePolicyByRef(sheetOpen ? policyRef || null : null);
  
  if (!policyRef) {
    return null;
  }
  
  return (
    <>
      <Badge
        variant={variant}
        className={cn(
          'cursor-pointer hover:bg-primary/10 transition-colors gap-1',
          className
        )}
        onClick={() => setSheetOpen(true)}
      >
        {showIcon && <FileText className="h-3 w-3" />}
        {policyRef}
        <ExternalLink className="h-2.5 w-2.5 opacity-60" />
      </Badge>
      
      <PolicyDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        policy={policy}
        policyRef={policyRef}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}

interface PolicyDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: Policy | null | undefined;
  policyRef: string;
  isLoading: boolean;
  error: Error | null;
}

export function PolicyDetailSheet({
  open,
  onOpenChange,
  policy,
  policyRef,
  isLoading,
  error,
}: PolicyDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {policy?.title || policyRef}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {policyRef}
                </Badge>
                {policy && (
                  <>
                    <Badge variant="secondary">{policy.category}</Badge>
                    <Badge 
                      className={cn(
                        policy.status === 'active' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                        policy.status === 'draft' && 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                        policy.status === 'archived' && 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                      )}
                    >
                      {policy.status}
                    </Badge>
                  </>
                )}
              </SheetDescription>
            </SheetHeader>
            
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load policy details. Please try again.
                </AlertDescription>
              </Alert>
            )}
            
            {!isLoading && !policy && (
              <Alert className="border-amber-500/20 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <p className="font-medium">Policy not found</p>
                  <p className="text-sm mt-1">
                    The policy reference "{policyRef}" could not be found. This has been logged for data quality review.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            {policy && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                  <TabsTrigger value="coverage">Coverage</TabsTrigger>
                  <TabsTrigger value="docs">Documents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 pt-4">
                  {/* Summary */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {policy.summary || 'No summary available.'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  {/* Effective Dates */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Effective Period
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">From: </span>
                          <span className="font-medium">
                            {format(new Date(policy.effective_from), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {policy.effective_to && (
                          <div>
                            <span className="text-muted-foreground">To: </span>
                            <span className="font-medium">
                              {format(new Date(policy.effective_to), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        {!policy.effective_to && (
                          <Badge variant="outline" className="text-emerald-600">
                            Currently Active
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Version Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <span>Version: {policy.version}</span>
                    <span>Last updated: {format(new Date(policy.updated_at), 'MMM d, yyyy')}</span>
                  </div>
                </TabsContent>
                
                <TabsContent value="eligibility" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Who is Eligible
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {policy.eligibility_rules ? (
                        <div className="space-y-3">
                          {policy.eligibility_rules.grades && (
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium">Eligible Grades: </span>
                                <span className="text-sm text-muted-foreground">
                                  {policy.eligibility_rules.grades.join(', ') || 'All'}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {policy.eligibility_rules.minTenure !== undefined && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium">Minimum Tenure: </span>
                                <span className="text-sm text-muted-foreground">
                                  {policy.eligibility_rules.minTenure === 0 
                                    ? 'From day 1' 
                                    : `${policy.eligibility_rules.minTenure} months`}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {policy.eligibility_rules.dependents && (
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                              <div>
                                <span className="text-sm font-medium">Dependents: </span>
                                <span className="text-sm text-muted-foreground">
                                  Covered (max {policy.eligibility_rules.maxDependents || 'unlimited'})
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {policy.eligibility_rules.managerApproval && (
                            <div className="flex items-start gap-2">
                              <Shield className="h-4 w-4 text-amber-500 mt-0.5" />
                              <div className="text-sm text-amber-700">
                                Manager approval required
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No specific eligibility rules defined.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="coverage" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Coverage & Limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {policy.coverage_rules ? (
                        <div className="space-y-3">
                          {policy.coverage_rules.annualLimit && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Annual Limit</span>
                              <span className="font-medium font-mono">
                                AED {policy.coverage_rules.annualLimit.toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {policy.coverage_rules.annualBudget && typeof policy.coverage_rules.annualBudget === 'number' && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Annual Budget</span>
                              <span className="font-medium font-mono">
                                AED {policy.coverage_rules.annualBudget.toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {policy.coverage_rules.reimbursementPercent && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Reimbursement</span>
                              <span className="font-medium">
                                {policy.coverage_rules.reimbursementPercent}%
                              </span>
                            </div>
                          )}
                          
                          {policy.coverage_rules.monthlyAllowance && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium mb-2">Monthly Allowance by Grade</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(policy.coverage_rules.monthlyAllowance).map(([grade, amount]) => (
                                  <div key={grade} className="flex justify-between bg-muted/50 p-2 rounded">
                                    <span>{grade}</span>
                                    <span className="font-mono">AED {amount.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {policy.coverage_rules.excludes && policy.coverage_rules.excludes.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium mb-2 text-red-600">Exclusions</p>
                              <ul className="space-y-1">
                                {policy.coverage_rules.excludes.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No coverage rules defined.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="docs" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary" />
                        Required Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {policy.required_docs && policy.required_docs.length > 0 ? (
                        <div className="space-y-2">
                          {policy.required_docs.map((doc, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                              {doc.required !== false ? (
                                <Badge variant="outline" className="text-xs">Required</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-muted-foreground">Optional</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No documents required for this policy.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* SLA Info */}
                  {policy.sla_rules && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Processing Times
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {policy.sla_rules.claim && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Claims</span>
                              <span>{policy.sla_rules.claim.standard || 72} hours (standard)</span>
                            </div>
                          )}
                          {policy.sla_rules.request && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Requests</span>
                              <span>{policy.sla_rules.request.standard || 96} hours (standard)</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
