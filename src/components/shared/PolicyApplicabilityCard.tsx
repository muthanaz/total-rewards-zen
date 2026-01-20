/**
 * PolicyApplicabilityCard - Shows why a policy applies to an employee
 * 
 * Displays the current policy version with eligibility explanation,
 * linking to the employer-published policy consistently.
 */

import { useState } from 'react';
import { 
  FileText, CheckCircle, Info, ChevronRight, Shield, 
  Calendar, User, Building2, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PolicyChip } from './EntityChip';
import { formatRelativeTime } from '@/lib/crossPortalContract';

// ============================================================================
// TYPES
// ============================================================================

interface PolicyVersion {
  id: string;
  version: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  policyText?: string | null;
  attachmentUrl?: string | null;
}

interface EligibilityRule {
  type: 'grade' | 'department' | 'tenure' | 'location' | 'family_status';
  label: string;
  value: string;
  isMet: boolean;
  explanation?: string;
}

interface PolicyApplicabilityCardProps {
  benefitId: string;
  benefitName: string;
  benefitCategory?: string;
  currentPolicy?: PolicyVersion | null;
  policyBullets?: string[];
  eligibilityRules?: EligibilityRule[];
  requiredDocuments?: Array<{
    name: string;
    description?: string;
    isRequired: boolean;
  }>;
  onViewFullPolicy?: () => void;
  onSubmitClaim?: () => void;
  isRTL?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PolicyApplicabilityCard({
  benefitId,
  benefitName,
  benefitCategory,
  currentPolicy,
  policyBullets = [],
  eligibilityRules = [],
  requiredDocuments = [],
  onViewFullPolicy,
  onSubmitClaim,
  isRTL = false,
  className,
}: PolicyApplicabilityCardProps) {
  const [policySheetOpen, setPolicySheetOpen] = useState(false);
  
  const allRulesMet = eligibilityRules.length === 0 || 
    eligibilityRules.every(rule => rule.isMet);

  return (
    <>
      <Card className={cn("relative overflow-hidden", className)}>
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/80 to-accent/60" />
        
        <CardHeader className="pb-3">
          <div className={cn(
            "flex items-start justify-between gap-4",
            isRTL && "flex-row-reverse"
          )}>
            <div className={cn(
              "flex items-center gap-2",
              isRTL && "flex-row-reverse"
            )}>
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base font-display">
                  Policy & Eligibility
                </CardTitle>
                {currentPolicy && (
                  <div className="flex items-center gap-2 mt-1">
                    <PolicyChip
                      id={currentPolicy.id}
                      benefitName={benefitName}
                      version={currentPolicy.version}
                      effectiveFrom={currentPolicy.effectiveFrom}
                      isActive={!currentPolicy.effectiveUntil}
                      size="sm"
                      onClick={() => setPolicySheetOpen(true)}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className={cn(
              "flex items-center gap-2 shrink-0",
              isRTL && "flex-row-reverse"
            )}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setPolicySheetOpen(true)}
              >
                View Full Policy
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Eligibility Status */}
          {eligibilityRules.length > 0 && (
            <div className="space-y-2">
              <h4 className={cn(
                "text-sm font-medium flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <Shield className="w-4 h-4 text-muted-foreground" />
                Why This Applies to You
              </h4>
              
              <div className="grid gap-2">
                {eligibilityRules.map((rule, index) => (
                  <EligibilityRuleItem key={index} rule={rule} isRTL={isRTL} />
                ))}
              </div>
              
              {allRulesMet ? (
                <div className={cn(
                  "flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 rounded-lg px-3 py-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>You meet all eligibility requirements</span>
                </div>
              ) : (
                <div className={cn(
                  "flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2",
                  isRTL && "flex-row-reverse"
                )}>
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Some eligibility requirements are not met</span>
                </div>
              )}
            </div>
          )}
          
          {/* Policy Highlights */}
          {policyBullets.length > 0 && (
            <div className="space-y-2">
              <h4 className={cn(
                "text-sm font-medium",
                isRTL && "text-right"
              )}>
                Key Policy Points
              </h4>
              <ul className={cn(
                "grid md:grid-cols-2 gap-2 text-sm text-muted-foreground",
                isRTL && "text-right"
              )}>
                {policyBullets.slice(0, 6).map((bullet, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "flex items-start gap-2",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Required Documents Preview */}
          {requiredDocuments.length > 0 && (
            <div className="space-y-2">
              <h4 className={cn(
                "text-sm font-medium flex items-center gap-2",
                isRTL && "flex-row-reverse"
              )}>
                <FileText className="w-4 h-4 text-muted-foreground" />
                Required Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {requiredDocuments.slice(0, 4).map((doc, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={cn(
                      "text-xs",
                      doc.isRequired 
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                        : "border-border"
                    )}
                  >
                    {doc.name}
                    {doc.isRequired && <span className="ml-1 text-amber-500">*</span>}
                  </Badge>
                ))}
                {requiredDocuments.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{requiredDocuments.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Full Policy Sheet */}
      <PolicyDetailSheet
        open={policySheetOpen}
        onOpenChange={setPolicySheetOpen}
        benefitName={benefitName}
        benefitCategory={benefitCategory}
        policy={currentPolicy}
        policyBullets={policyBullets}
        requiredDocuments={requiredDocuments}
        eligibilityRules={eligibilityRules}
        isRTL={isRTL}
      />
    </>
  );
}

// ============================================================================
// ELIGIBILITY RULE ITEM
// ============================================================================

interface EligibilityRuleItemProps {
  rule: EligibilityRule;
  isRTL: boolean;
}

function EligibilityRuleItem({ rule, isRTL }: EligibilityRuleItemProps) {
  const iconMap = {
    grade: Shield,
    department: Building2,
    tenure: Calendar,
    location: Building2,
    family_status: User,
  };
  
  const Icon = iconMap[rule.type] || Info;
  
  return (
    <div className={cn(
      "flex items-center gap-3 text-sm",
      isRTL && "flex-row-reverse"
    )}>
      <div className={cn(
        "p-1.5 rounded-md",
        rule.isMet ? "bg-emerald-500/10" : "bg-slate-500/10"
      )}>
        <Icon className={cn(
          "w-3.5 h-3.5",
          rule.isMet ? "text-emerald-600" : "text-slate-500"
        )} />
      </div>
      <div className="flex-1">
        <div className={cn(
          "flex items-center gap-2",
          isRTL && "flex-row-reverse"
        )}>
          <span className="text-muted-foreground">{rule.label}:</span>
          <span className="font-medium">{rule.value}</span>
          {rule.isMet ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Info className="w-3.5 h-3.5 text-amber-500" />
          )}
        </div>
        {rule.explanation && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {rule.explanation}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// POLICY DETAIL SHEET
// ============================================================================

interface PolicyDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefitName: string;
  benefitCategory?: string;
  policy?: PolicyVersion | null;
  policyBullets: string[];
  requiredDocuments: Array<{ name: string; description?: string; isRequired: boolean }>;
  eligibilityRules: EligibilityRule[];
  isRTL: boolean;
}

function PolicyDetailSheet({
  open,
  onOpenChange,
  benefitName,
  benefitCategory,
  policy,
  policyBullets,
  requiredDocuments,
  eligibilityRules,
  isRTL,
}: PolicyDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[550px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle>{benefitName} Policy</SheetTitle>
              <SheetDescription>
                {benefitCategory && <span>{benefitCategory} • </span>}
                Version {policy?.version || 1}
                {policy?.effectiveFrom && (
                  <span> • Effective from {new Date(policy.effectiveFrom).toLocaleDateString()}</span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Your Eligibility */}
          {eligibilityRules.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                Your Eligibility
              </h3>
              <div className="space-y-2">
                {eligibilityRules.map((rule, index) => (
                  <EligibilityRuleItem key={index} rule={rule} isRTL={isRTL} />
                ))}
              </div>
            </section>
          )}
          
          <Separator />
          
          {/* Policy Text / Bullets */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              Policy Details
            </h3>
            
            {policy?.policyText ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {policy.policyText}
                </p>
              </div>
            ) : policyBullets.length > 0 ? (
              <ul className="space-y-2">
                {policyBullets.map((bullet, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No detailed policy text available. Contact HR for more information.
              </p>
            )}
          </section>
          
          <Separator />
          
          {/* Required Documents */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              Required Documents for Claims
            </h3>
            
            {requiredDocuments.length > 0 ? (
              <div className="space-y-2">
                {requiredDocuments.map((doc, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      doc.isRequired 
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border bg-muted/30"
                    )}
                  >
                    <FileText className={cn(
                      "w-4 h-4 mt-0.5 shrink-0",
                      doc.isRequired ? "text-amber-600" : "text-muted-foreground"
                    )} />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {doc.name}
                        {doc.isRequired && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                            Required
                          </Badge>
                        )}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific documents required for this benefit.
              </p>
            )}
          </section>
          
          {/* Attachment */}
          {policy?.attachmentUrl && (
            <>
              <Separator />
              <section>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => window.open(policy.attachmentUrl!, '_blank')}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Download Full Policy Document
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
