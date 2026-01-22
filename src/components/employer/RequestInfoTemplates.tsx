/**
 * Request Info Templates
 * 
 * Predefined templates for requesting information from employees.
 * Reduces typing and standardizes language across HR team.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Receipt, 
  Calendar, 
  User, 
  CheckCircle,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface RequestInfoTemplate {
  id: string;
  label: string;
  category: 'documents' | 'clarification' | 'verification' | 'general';
  template: string;
  icon: React.ElementType;
}

const defaultTemplates: RequestInfoTemplate[] = [
  {
    id: 'missing_receipt',
    label: 'Missing Receipt',
    category: 'documents',
    icon: Receipt,
    template: 'Please provide the original receipt or invoice for this expense. The document should clearly show the vendor name, date, and amount paid.',
  },
  {
    id: 'missing_medical_report',
    label: 'Medical Documentation',
    category: 'documents',
    icon: FileText,
    template: 'Please provide the medical report or prescription from your healthcare provider. This is required to process your health-related claim.',
  },
  {
    id: 'date_clarification',
    label: 'Date Clarification',
    category: 'clarification',
    icon: Calendar,
    template: 'Please clarify the dates of service/expense. The dates provided do not match the supporting documentation.',
  },
  {
    id: 'dependent_verification',
    label: 'Dependent Verification',
    category: 'verification',
    icon: User,
    template: 'Please provide documentation verifying the relationship with the dependent listed in this claim (e.g., birth certificate, marriage certificate).',
  },
  {
    id: 'amount_discrepancy',
    label: 'Amount Discrepancy',
    category: 'clarification',
    icon: Receipt,
    template: 'The claimed amount does not match the receipt provided. Please clarify or provide additional documentation showing the correct amount.',
  },
  {
    id: 'proof_of_payment',
    label: 'Proof of Payment',
    category: 'documents',
    icon: CheckCircle,
    template: 'Please provide proof of payment (bank statement, credit card statement, or payment confirmation) showing that this expense was paid.',
  },
];

interface RequestInfoTemplatesProps {
  onSelectTemplate: (template: string) => void;
  currentMessage?: string;
  className?: string;
}

export function RequestInfoTemplates({ 
  onSelectTemplate, 
  currentMessage = '',
  className,
}: RequestInfoTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSelectTemplate = (template: RequestInfoTemplate) => {
    const newMessage = currentMessage 
      ? `${currentMessage}\n\n${template.template}`
      : template.template;
    onSelectTemplate(newMessage);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const categoryLabels: Record<string, string> = {
    documents: 'Documents',
    clarification: 'Clarification',
    verification: 'Verification',
    general: 'General',
  };

  const groupedTemplates = defaultTemplates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, RequestInfoTemplate[]>);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-between h-8 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Use Template
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-muted/20">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <div key={category}>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                {categoryLabels[category]}
              </p>
              <div className="space-y-1.5">
                {templates.map((template) => {
                  const Icon = template.icon;
                  const isCopied = copiedId === template.id;
                  
                  return (
                    <button
                      key={template.id}
                      className={cn(
                        "w-full flex items-center gap-2 p-2 rounded-md text-left",
                        "hover:bg-accent/10 transition-colors",
                        isCopied && "bg-success/10"
                      )}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <Icon className={cn(
                        "w-4 h-4 shrink-0",
                        isCopied ? "text-success" : "text-muted-foreground"
                      )} />
                      <span className="flex-1 text-sm">{template.label}</span>
                      {isCopied ? (
                        <CheckCircle className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
