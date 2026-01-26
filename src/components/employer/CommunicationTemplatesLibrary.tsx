/**
 * Communication Templates Library
 * 
 * Comprehensive templates for HR Ops communication:
 * - Missing docs requests
 * - Clarification questions
 * - Rejection reasons (policy-based)
 * - Approval confirmations
 * 
 * Each template supports variable substitution.
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileQuestion, 
  XCircle, 
  CheckCircle, 
  HelpCircle,
  Copy,
  Check,
  Edit3,
  Send,
  Calendar,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

// ============================================================================
// TYPES
// ============================================================================

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue?: string;
}

export interface CommunicationTemplate {
  id: string;
  category: 'missing_docs' | 'clarification' | 'rejection' | 'approval';
  name: string;
  subject: string;
  body: string;
  variables: TemplateVariable[];
  policyBased?: boolean;
  icon: React.ElementType;
}

export interface TemplateContext {
  employeeName?: string;
  policyName?: string;
  benefitCategory?: string;
  amount?: number;
  dueDate?: Date;
  requiredDocs?: string[];
  rejectionReason?: string;
  claimId?: string;
}

// ============================================================================
// DEFAULT TEMPLATES
// ============================================================================

const TEMPLATES: CommunicationTemplate[] = [
  // Missing Documents Templates
  {
    id: 'missing_docs_standard',
    category: 'missing_docs',
    name: 'Standard Document Request',
    subject: 'Action Required: Documents Needed for Your {{benefitCategory}} Claim',
    body: `Dear {{employeeName}},

We are processing your {{benefitCategory}} claim (Ref: {{claimId}}) and require the following documents to proceed:

{{requiredDocsList}}

Please upload these documents by {{dueDate}} to avoid delays in processing.

If you have any questions, please contact HR Support.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'requiredDocsList', label: 'Required Documents' },
      { key: 'dueDate', label: 'Due Date' },
    ],
    icon: FileQuestion,
  },
  {
    id: 'missing_docs_urgent',
    category: 'missing_docs',
    name: 'Urgent Document Request',
    subject: 'URGENT: Documents Required - {{benefitCategory}} Claim',
    body: `Dear {{employeeName}},

Your {{benefitCategory}} claim (Ref: {{claimId}}) is pending due to missing documents.

⚠️ We need the following by {{dueDate}}:

{{requiredDocsList}}

Without these documents, we cannot process your claim and it may be rejected.

Please upload immediately or contact HR if you need assistance.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'requiredDocsList', label: 'Required Documents' },
      { key: 'dueDate', label: 'Due Date' },
    ],
    icon: AlertTriangle,
  },

  // Clarification Templates
  {
    id: 'clarify_amount',
    category: 'clarification',
    name: 'Amount Clarification',
    subject: 'Clarification Needed: {{benefitCategory}} Claim Amount',
    body: `Dear {{employeeName}},

We are reviewing your {{benefitCategory}} claim (Ref: {{claimId}}) and noticed a discrepancy in the claimed amount.

The amount submitted (AED {{amount}}) does not match the supporting documentation provided.

Please clarify:
1. The correct amount
2. Provide updated receipt/invoice if applicable

We look forward to your response.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'amount', label: 'Claimed Amount' },
    ],
    icon: HelpCircle,
  },
  {
    id: 'clarify_dates',
    category: 'clarification',
    name: 'Date Clarification',
    subject: 'Clarification Needed: Service Dates for Your Claim',
    body: `Dear {{employeeName}},

We are reviewing your {{benefitCategory}} claim (Ref: {{claimId}}) and need clarification regarding the dates of service.

The dates provided do not align with our records or the supporting documentation.

Please confirm:
- The exact date(s) of the service/expense
- Updated documentation if dates were incorrect

Thank you for your prompt response.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
    ],
    icon: Calendar,
  },

  // Rejection Templates
  {
    id: 'reject_ineligible',
    category: 'rejection',
    name: 'Not Eligible (Policy-Based)',
    subject: 'Claim Decision: {{benefitCategory}} Claim Not Approved',
    body: `Dear {{employeeName}},

We have reviewed your {{benefitCategory}} claim (Ref: {{claimId}}) and regret to inform you that it cannot be approved.

Reason: {{rejectionReason}}

Policy Reference: {{policyName}}

If you believe this decision is in error or would like to discuss further, please contact HR within 14 days.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'rejectionReason', label: 'Rejection Reason' },
      { key: 'policyName', label: 'Policy Name' },
    ],
    policyBased: true,
    icon: XCircle,
  },
  {
    id: 'reject_limit_exceeded',
    category: 'rejection',
    name: 'Limit Exceeded',
    subject: 'Claim Decision: Entitlement Limit Reached',
    body: `Dear {{employeeName}},

We have reviewed your {{benefitCategory}} claim (Ref: {{claimId}}).

Unfortunately, this claim cannot be approved as it exceeds your annual entitlement limit for this benefit category.

Your current utilization: {{currentUtilization}}
Annual limit: {{annualLimit}}
Requested amount: AED {{amount}}

Please note that claims exceeding the limit cannot be processed under the current policy.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'amount', label: 'Claimed Amount' },
      { key: 'currentUtilization', label: 'Current Utilization' },
      { key: 'annualLimit', label: 'Annual Limit' },
    ],
    policyBased: true,
    icon: XCircle,
  },
  {
    id: 'reject_duplicate',
    category: 'rejection',
    name: 'Duplicate Claim',
    subject: 'Claim Decision: Duplicate Submission',
    body: `Dear {{employeeName}},

We have reviewed your {{benefitCategory}} claim (Ref: {{claimId}}).

This claim appears to be a duplicate of a previously submitted and processed claim.

Original Claim Reference: {{originalClaimId}}
Original Claim Date: {{originalClaimDate}}

If this is not a duplicate and you have additional information, please contact HR.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'originalClaimId', label: 'Original Claim ID' },
      { key: 'originalClaimDate', label: 'Original Claim Date' },
    ],
    icon: XCircle,
  },

  // Approval Templates
  {
    id: 'approval_standard',
    category: 'approval',
    name: 'Standard Approval',
    subject: 'Claim Approved: {{benefitCategory}}',
    body: `Dear {{employeeName}},

Great news! Your {{benefitCategory}} claim (Ref: {{claimId}}) has been approved.

Approved Amount: AED {{amount}}

The reimbursement will be processed in your next payroll cycle.

If you have any questions, please contact HR.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'amount', label: 'Approved Amount' },
    ],
    icon: CheckCircle,
  },
  {
    id: 'approval_partial',
    category: 'approval',
    name: 'Partial Approval',
    subject: 'Claim Partially Approved: {{benefitCategory}}',
    body: `Dear {{employeeName}},

Your {{benefitCategory}} claim (Ref: {{claimId}}) has been reviewed and partially approved.

Requested Amount: AED {{requestedAmount}}
Approved Amount: AED {{approvedAmount}}

Reason for partial approval: {{partialReason}}

The approved amount will be processed in your next payroll cycle.

If you have questions about this decision, please contact HR.

Best regards,
HR Team`,
    variables: [
      { key: 'employeeName', label: 'Employee Name' },
      { key: 'benefitCategory', label: 'Benefit Category' },
      { key: 'claimId', label: 'Claim Reference' },
      { key: 'requestedAmount', label: 'Requested Amount' },
      { key: 'approvedAmount', label: 'Approved Amount' },
      { key: 'partialReason', label: 'Reason for Partial Approval' },
    ],
    icon: CheckCircle,
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Substitute variables in template with actual values
 */
export function renderTemplate(
  template: CommunicationTemplate,
  context: TemplateContext
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Substitute known variables
  const substitutions: Record<string, string> = {
    employeeName: context.employeeName || '[Employee Name]',
    policyName: context.policyName || '[Policy Name]',
    benefitCategory: context.benefitCategory || '[Benefit Category]',
    amount: context.amount?.toLocaleString() || '[Amount]',
    dueDate: context.dueDate 
      ? format(context.dueDate, 'MMMM d, yyyy') 
      : format(addDays(new Date(), 5), 'MMMM d, yyyy'),
    claimId: context.claimId || '[Claim ID]',
    rejectionReason: context.rejectionReason || '[Rejection Reason]',
    requiredDocsList: context.requiredDocs?.map(d => `• ${d}`).join('\n') || '• [Document 1]\n• [Document 2]',
  };

  Object.entries(substitutions).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  return { subject, body };
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface CommunicationTemplatesLibraryProps {
  context?: TemplateContext;
  onSelectTemplate?: (template: { subject: string; body: string; templateId: string }) => void;
  selectedCategory?: CommunicationTemplate['category'];
  className?: string;
}

export function CommunicationTemplatesLibrary({
  context = {},
  onSelectTemplate,
  selectedCategory,
  className,
}: CommunicationTemplatesLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<CommunicationTemplate['category']>(
    selectedCategory || 'missing_docs'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const selectedTemplate = useMemo(() => {
    return TEMPLATES.find(t => t.id === selectedTemplateId);
  }, [selectedTemplateId]);

  const renderedTemplate = useMemo(() => {
    if (!selectedTemplate) return null;
    return renderTemplate(selectedTemplate, context);
  }, [selectedTemplate, context]);

  const handleSelectTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplateId(template.id);
    const rendered = renderTemplate(template, context);
    setEditedBody(rendered.body);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate || !renderedTemplate) return;
    onSelectTemplate?.({
      subject: renderedTemplate.subject,
      body: editedBody || renderedTemplate.body,
      templateId: selectedTemplate.id,
    });
  };

  const handleCopy = async () => {
    if (!editedBody) return;
    await navigator.clipboard.writeText(editedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryConfig = {
    missing_docs: { label: 'Missing Docs', icon: FileQuestion, color: 'text-warning' },
    clarification: { label: 'Clarification', icon: HelpCircle, color: 'text-info' },
    rejection: { label: 'Rejection', icon: XCircle, color: 'text-destructive' },
    approval: { label: 'Approval', icon: CheckCircle, color: 'text-success' },
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Message Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as typeof activeCategory)}>
          <TabsList className="w-full grid grid-cols-4 h-auto">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex flex-col gap-1 py-2 px-1 text-xs">
                  <Icon className={cn('w-4 h-4', config.color)} />
                  <span className="truncate">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-3">
            <div className="grid grid-cols-1 gap-2">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border/40 hover:border-accent/30 hover:bg-accent/5'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', categoryConfig[activeCategory].color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      {template.policyBased && (
                        <Badge variant="outline" className="text-[10px] mt-1">Policy-Based</Badge>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Template Preview & Edit */}
        {selectedTemplate && renderedTemplate && (
          <div className="space-y-3 pt-3 border-t border-border/40">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input value={renderedTemplate.subject} readOnly className="text-sm bg-muted/20" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Message Body</Label>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-xs gap-1">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                className="min-h-[200px] text-sm"
              />
            </div>

            {/* Variable hints */}
            <div className="flex flex-wrap gap-1">
              {selectedTemplate.variables.map((v) => (
                <Badge key={v.key} variant="secondary" className="text-[10px]">
                  {`{{${v.key}}}`}
                </Badge>
              ))}
            </div>

            {onSelectTemplate && (
              <Button onClick={handleUseTemplate} className="w-full gap-2">
                <Send className="w-4 h-4" />
                Use This Template
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { TEMPLATES as COMMUNICATION_TEMPLATES };
