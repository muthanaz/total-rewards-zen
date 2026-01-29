/**
 * Employee Claims & Requests Page
 * 
 * Main page for employees to view and create claims, requests, and questions.
 * Integrates with Supabase for data persistence.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Receipt,
  FileText,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  Send,
} from "lucide-react";
import { StandardPageHeader } from '@/components/shared';
import PerDiemWidget from "@/components/employee/PerDiemWidget";
import { EmployeeRequestsList } from "@/components/employee/EmployeeRequestsList";
import { EmployeeCreateRequestSheet } from "@/components/employee/EmployeeCreateRequestSheet";
import { useEmployeeRequestCounts } from "@/hooks/useEmployeeRequests";

type RequestType = 'claim' | 'request' | 'question';

interface BenefitShortcut {
  key: string;
  label: string;
  category: string;
  suggestedType: RequestType;
  suggestedTitle: string;
  suggestedDescription: string;
}

const benefitShortcuts: BenefitShortcut[] = [
  {
    key: "housing-advance",
    label: "Housing — Salary advance for annual rent",
    category: "Housing",
    suggestedType: "request",
    suggestedTitle: "Housing advance request",
    suggestedDescription: "Requesting salary advance to cover annual rent; repay over X months. Please confirm eligibility, limits, and required documents.",
  },
  {
    key: "schooling-claim",
    label: "Schooling — Tuition reimbursement",
    category: "Education Allowance",
    suggestedType: "claim",
    suggestedTitle: "School tuition reimbursement",
    suggestedDescription: "Claiming reimbursement for eligible tuition fees as per schooling policy. Please see invoice and proof of payment attached.",
  },
  {
    key: "health-claim",
    label: "Health Insurance — Out-of-network reimbursement",
    category: "Health Insurance",
    suggestedType: "claim",
    suggestedTitle: "Medical reimbursement (out-of-network)",
    suggestedDescription: "Claiming reimbursement for an out-of-network medical expense. Please confirm coverage and required documents.",
  },
  {
    key: "transport-claim",
    label: "Transport — Fuel/transport reimbursement",
    category: "Transport",
    suggestedType: "claim",
    suggestedTitle: "Transport reimbursement",
    suggestedDescription: "Claiming transport/fuel reimbursement as per policy. Receipts attached.",
  },
  {
    key: "learning-claim",
    label: "Learning — Course/certification reimbursement",
    category: "Learning & Development",
    suggestedType: "claim",
    suggestedTitle: "Learning reimbursement",
    suggestedDescription: "Claiming reimbursement for approved learning expense (course/certification). Please see approval and invoice attached.",
  },
  {
    key: "policy-question",
    label: "Any Benefit — Ask eligibility/policy question",
    category: "Other",
    suggestedType: "question",
    suggestedTitle: "Policy/eligibility clarification",
    suggestedDescription: "Please clarify eligibility/coverage for my case. I included details and the relevant context.",
  },
];

// Grouped request type labels (Reimbursement / Pre-Approval / Support)
const requestTypeCopy: Record<RequestType, { title: string; desc: string; icon: any; group: string }> = {
  claim: { title: "Reimbursement", desc: "Get reimbursed for eligible expenses", icon: Receipt, group: "Reimbursement" },
  request: { title: "Pre-Approval", desc: "Request approval before incurring expense", icon: FileText, group: "Pre-Approval" },
  question: { title: "Support", desc: "Get help with policy or eligibility questions", icon: HelpCircle, group: "Support" },
};

export default function Requests() {
  const counts = useEmployeeRequestCounts();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<RequestType>('claim');
  const [createCategory, setCreateCategory] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  
  const openCreate = (type: RequestType) => {
    setCreateType(type);
    setCreateCategory('');
    setCreateTitle('');
    setCreateDescription('');
    setCreateOpen(true);
  };
  
  const applyShortcut = (shortcut: BenefitShortcut) => {
    setCreateType(shortcut.suggestedType);
    setCreateCategory(shortcut.category);
    setCreateTitle(shortcut.suggestedTitle);
    setCreateDescription(shortcut.suggestedDescription);
    setCreateOpen(true);
  };
  
  const QuickCard = ({ type }: { type: RequestType }) => {
    const Icon = requestTypeCopy[type].icon;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">{requestTypeCopy[type].title}</CardTitle>
                <p className="text-sm text-muted-foreground">{requestTypeCopy[type].desc}</p>
              </div>
            </div>
            <Button onClick={() => openCreate(type)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {type === 'claim' ? counts.pending + counts.inReview : 
               type === 'request' ? counts.pending : 
               counts.total - counts.approved - counts.rejected}
            </span>
            <span>active items</span>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Standard Page Header - Employee variant */}
      <StandardPageHeader
        variant="employee"
        title="Claims & Requests"
        helperText="Submit reimbursements, pre-approvals, and support requests."
        icon={FileText}
        iconClassName="from-accent to-accent/80 shadow-accent/25"
        primaryCTA={{
          label: 'New Claim',
          icon: Plus,
          onClick: () => openCreate('claim'),
        }}
      />

      {/* Quick Action Cards - Grouped by type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickCard type="claim" />
        <QuickCard type="request" />
        <QuickCard type="question" />
      </div>

      {/* Benefit Shortcuts (collapsed by default - expand on click) */}
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-muted/30 rounded-lg border border-dashed border-border/50 hover:border-accent/30 transition-colors">
          <div>
            <h3 className="font-medium text-sm">Start from a benefit scenario</h3>
            <p className="text-xs text-muted-foreground">Pre-filled templates for common requests</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {benefitShortcuts.map((s) => (
            <Button key={s.key} variant="outline" className="justify-between h-auto py-3" onClick={() => applyShortcut(s)}>
              <span className="text-left">
                <span className="block font-medium">{s.label}</span>
                <span className="block text-xs text-muted-foreground">
                  Creates a {requestTypeCopy[s.suggestedType].group} • {s.category}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </details>

      {/* Requests List */}
      <EmployeeRequestsList />

      {/* Create Request Sheet */}
      <EmployeeCreateRequestSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialType={createType}
        initialCategory={createCategory}
        initialTitle={createTitle}
        initialDescription={createDescription}
      />
    </div>
  );
}
