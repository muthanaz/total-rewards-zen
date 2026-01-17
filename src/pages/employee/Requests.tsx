import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Plus,
  Receipt,
  Send,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Paperclip,
} from "lucide-react";

type RequestType = "claim" | "request" | "question";
type Status = "Draft" | "Submitted" | "In Review" | "Needs Info" | "Approved" | "Rejected" | "Paid";

type Category =
  | "Housing"
  | "Schooling"
  | "Health Insurance"
  | "Transport"
  | "Wellbeing"
  | "Learning & Development"
  | "Leave"
  | "Financial"
  | "Other";

type Priority = "Low" | "Normal" | "High";

type RequestItem = {
  id: string;
  type: RequestType;
  category: Category;
  title: string;
  description: string;
  amount?: number;
  currency?: "AED";
  status: Status;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  reference?: string;
  attachmentsCount?: number;
  nextAction?: string;

  // Added realism fields (demo-only)
  benefitHint?: string; // which benefit policy/allowance this relates to
  slaDays?: number;
  lastMessage?: { by: "You" | "HR"; text: string; at: string };
};

const categories: Category[] = [
  "Housing",
  "Schooling",
  "Health Insurance",
  "Transport",
  "Wellbeing",
  "Learning & Development",
  "Leave",
  "Financial",
  "Other",
];

const requestTypeCopy: Record<RequestType, { title: string; desc: string; icon: any }> = {
  claim: {
    title: "Submit a Claim",
    desc: "Reimbursement for eligible expenses (attach receipts/invoices).",
    icon: Receipt,
  },
  request: {
    title: "Make a Request",
    desc: "Approvals/changes (e.g., allowance advance, benefit change, exceptions).",
    icon: FileText,
  },
  question: {
    title: "Ask a Question",
    desc: "Clarify policy/eligibility with a tracked answer trail.",
    icon: HelpCircle,
  },
};

type BenefitShortcut = {
  key: string;
  label: string;
  category: Category;
  suggestedType: RequestType;
  suggestedTitle: string;
  suggestedDescription: string;
  whatYouNeed: string[];
};

const benefitShortcuts: BenefitShortcut[] = [
  {
    key: "housing-advance",
    label: "Housing — Salary advance for annual rent",
    category: "Housing",
    suggestedType: "request",
    suggestedTitle: "Housing advance request",
    suggestedDescription:
      "Requesting salary advance to cover annual rent; repay over X months. Please confirm eligibility, limits, and required documents.",
    whatYouNeed: ["Tenancy contract / Ejari", "Repayment consent", "Bank IBAN / payroll details", "Landlord invoice (if available)"],
  },
  {
    key: "schooling-claim",
    label: "Schooling — Tuition reimbursement",
    category: "Schooling",
    suggestedType: "claim",
    suggestedTitle: "School tuition reimbursement",
    suggestedDescription:
      "Claiming reimbursement for eligible tuition fees as per schooling policy. Please see invoice and proof of payment attached.",
    whatYouNeed: ["School invoice", "Proof of payment", "Child dependency proof (if required)", "Academic year/term details"],
  },
  {
    key: "health-claim",
    label: "Health Insurance — Out-of-network reimbursement",
    category: "Health Insurance",
    suggestedType: "claim",
    suggestedTitle: "Medical reimbursement (out-of-network)",
    suggestedDescription:
      "Claiming reimbursement for an out-of-network medical expense. Please confirm coverage and required documents.",
    whatYouNeed: ["Medical invoice", "Medical report (if required)", "Prescription (if applicable)", "Proof of payment"],
  },
  {
    key: "transport-claim",
    label: "Transport — Fuel/transport reimbursement",
    category: "Transport",
    suggestedType: "claim",
    suggestedTitle: "Transport reimbursement",
    suggestedDescription:
      "Claiming transport/fuel reimbursement as per policy. Receipts attached.",
    whatYouNeed: ["Receipts (fuel/taxi)", "Date range", "Policy reference (if known)"],
  },
  {
    key: "learning-claim",
    label: "Learning — Course/certification reimbursement",
    category: "Learning & Development",
    suggestedType: "claim",
    suggestedTitle: "Learning reimbursement",
    suggestedDescription:
      "Claiming reimbursement for approved learning expense (course/certification). Please see approval and invoice attached.",
    whatYouNeed: ["Course invoice", "Approval email (if required)", "Completion proof", "Payment proof"],
  },
  {
    key: "policy-question",
    label: "Any Benefit — Ask eligibility/policy question",
    category: "Other",
    suggestedType: "question",
    suggestedTitle: "Policy/eligibility clarification",
    suggestedDescription:
      "Please clarify eligibility/coverage for my case. I included details and the relevant context.",
    whatYouNeed: ["Key context (dates, dependents, grade)", "Policy section reference (if known)", "Supporting docs (optional)"],
  },
];

function formatMoney(amount?: number, currency: "AED" = "AED") {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return "—";
  const n = Math.round(amount * 100) / 100;
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function statusTone(status: Status) {
  switch (status) {
    case "Approved":
    case "Paid":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "Needs Info":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "Rejected":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "In Review":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
    case "Submitted":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    case "Draft":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "Approved" || status === "Paid") return <CheckCircle2 className="w-4 h-4" />;
  if (status === "Needs Info") return <AlertTriangle className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
}

function statusProgress(status: Status) {
  // Simple progress mapping to make status feel “trackable”
  switch (status) {
    case "Draft":
      return 15;
    case "Submitted":
      return 35;
    case "In Review":
      return 55;
    case "Needs Info":
      return 55;
    case "Approved":
      return 80;
    case "Paid":
      return 100;
    case "Rejected":
      return 100;
    default:
      return 35;
  }
}

function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Requests() {
  // Demo data (later: replace with Supabase)
  const [items, setItems] = useState<RequestItem[]>([
    {
      id: "REQ-1042",
      type: "claim",
      category: "Transport",
      title: "Fuel reimbursement (Dec)",
      description: "Monthly fuel reimbursement as per policy. Receipts attached.",
      amount: 420,
      currency: "AED",
      status: "In Review",
      priority: "Normal",
      createdAt: "2026-01-05",
      updatedAt: "2026-01-08",
      attachmentsCount: 3,
      nextAction: "HR reviewing receipts",
      benefitHint: "Transport Allowance — Reimbursement",
      slaDays: 5,
      lastMessage: { by: "HR", text: "Received. Reviewing receipts and date range.", at: "2026-01-08" },
    },
    {
      id: "REQ-1038",
      type: "request",
      category: "Housing",
      title: "Housing advance request",
      description: "Requesting salary advance to cover annual rent; repay over 10 months.",
      amount: 85000,
      currency: "AED",
      status: "Needs Info",
      priority: "High",
      createdAt: "2026-01-02",
      updatedAt: "2026-01-06",
      attachmentsCount: 1,
      nextAction: "Upload tenancy contract & repayment consent",
      benefitHint: "Housing Support — Advance / Deduction plan",
      slaDays: 7,
      lastMessage: { by: "HR", text: "Please upload tenancy contract and repayment consent form.", at: "2026-01-06" },
    },
    {
      id: "REQ-1031",
      type: "question",
      category: "Schooling",
      title: "Eligibility: nursery fees",
      description: "Does the schooling benefit cover nursery fees for age 3?",
      status: "Submitted",
      priority: "Normal",
      createdAt: "2025-12-18",
      updatedAt: "2025-12-18",
      attachmentsCount: 0,
      nextAction: "Awaiting HR response",
      benefitHint: "Schooling Benefit — Eligibility",
      slaDays: 3,
      lastMessage: { by: "You", text: "Sharing child's DOB and nursery invoice example if needed.", at: "2025-12-18" },
    },
    {
      id: "REQ-1019",
      type: "claim",
      category: "Wellbeing",
      title: "Gym membership reimbursement",
      description: "Monthly gym reimbursement under wellbeing program.",
      amount: 250,
      currency: "AED",
      status: "Paid",
      priority: "Low",
      createdAt: "2025-12-01",
      updatedAt: "2025-12-10",
      attachmentsCount: 2,
      nextAction: "Completed",
      benefitHint: "Wellbeing — Gym reimbursement",
      slaDays: 5,
      lastMessage: { by: "HR", text: "Approved and sent to payroll for payout.", at: "2025-12-09" },
    },
  ]);

  const [tab, setTab] = useState<RequestType | "all">("all");

  const [filters, setFilters] = useState<{
    q: string;
    category: Category | "all";
    status: Status | "all";
    sort: "newest" | "oldest" | "amount_desc" | "amount_asc";
  }>({
    q: "",
    category: "all",
    status: "all",
    sort: "newest",
  });

  // Create / detail
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<RequestItem | null>(null);

  // “Start from a benefit” chooser
  const [benefitStart, setBenefitStart] = useState<string>("");

  const [createType, setCreateType] = useState<RequestType>("claim");
  const [form, setForm] = useState<{
    category: Category;
    title: string;
    description: string;
    amount?: string;
    priority: Priority;
    attachmentsCount: number;

    // realism fields
    benefitHint: string;
    dateFrom: string;
    dateTo: string;
    vendorName: string;
    employeeNote: string;

    // request-specific (e.g., advances)
    repaymentMonths: string;
    requestedPayrollDeduction: "yes" | "no";
  }>({
    category: "Other",
    title: "",
    description: "",
    amount: "",
    priority: "Normal",
    attachmentsCount: 0,
    benefitHint: "",
    dateFrom: "",
    dateTo: "",
    vendorName: "",
    employeeNote: "",
    repaymentMonths: "10",
    requestedPayrollDeduction: "yes",
  });

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = items.slice();

    if (tab !== "all") list = list.filter((i) => i.type === tab);
    if (filters.category !== "all") list = list.filter((i) => i.category === filters.category);
    if (filters.status !== "all") list = list.filter((i) => i.status === filters.status);

    if (q) {
      list = list.filter((i) => {
        return (
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.benefitHint ?? "").toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      const aa = a.amount ?? -1;
      const bb = b.amount ?? -1;

      switch (filters.sort) {
        case "oldest":
          return da - db;
        case "amount_desc":
          return bb - aa;
        case "amount_asc":
          return aa - bb;
        case "newest":
        default:
          return db - da;
      }
    });

    return list;
  }, [items, tab, filters]);

  const counts = useMemo(() => {
    const byType = { claim: 0, request: 0, question: 0 };
    const byStatus: Partial<Record<Status, number>> = {};
    for (const i of items) {
      byType[i.type] += 1;
      byStatus[i.status] = (byStatus[i.status] ?? 0) + 1;
    }
    return { byType, byStatus };
  }, [items]);

  const openCreate = (type: RequestType) => {
    setBenefitStart("");
    setCreateType(type);
    setForm({
      category: "Other",
      title: "",
      description: "",
      amount: "",
      priority: "Normal",
      attachmentsCount: 0,
      benefitHint: "",
      dateFrom: "",
      dateTo: "",
      vendorName: "",
      employeeNote: "",
      repaymentMonths: "10",
      requestedPayrollDeduction: "yes",
    });
    setCreateOpen(true);
  };

  const applyBenefitShortcut = (key: string) => {
    const s = benefitShortcuts.find((x) => x.key === key);
    if (!s) return;

    setBenefitStart(key);
    setCreateType(s.suggestedType);
    setForm((p) => ({
      ...p,
      category: s.category,
      title: s.suggestedTitle,
      description: s.suggestedDescription,
      priority: s.suggestedType === "request" ? "High" : "Normal",
      benefitHint: s.label,
    }));
    setCreateOpen(true);
  };

  const submitCreate = (asDraft: boolean) => {
    const date = todayISO();
    const nextIdNum = 1000 + items.length + Math.floor(Math.random() * 50);
    const id = `REQ-${nextIdNum}`;

    const amountNum = createType === "question" ? undefined : form.amount?.trim() ? Number(form.amount) : undefined;

    const baseDesc = form.description.trim() || "—";
    const contextBits: string[] = [];
    if (form.vendorName.trim()) contextBits.push(`Vendor: ${form.vendorName.trim()}`);
    if (form.dateFrom.trim() || form.dateTo.trim()) contextBits.push(`Dates: ${form.dateFrom || "—"} → ${form.dateTo || "—"}`);
    if (createType === "request" && form.category === "Housing") {
      contextBits.push(`Repayment: ${form.repaymentMonths || "—"} months`);
      contextBits.push(`Payroll deduction: ${form.requestedPayrollDeduction === "yes" ? "Yes" : "No"}`);
    }
    if (form.employeeNote.trim()) contextBits.push(`Note: ${form.employeeNote.trim()}`);

    const stitchedDesc = contextBits.length ? `${baseDesc}\n\n${contextBits.join("\n")}` : baseDesc;

    const newItem: RequestItem = {
      id,
      type: createType,
      category: form.category,
      title: form.title.trim() || requestTypeCopy[createType].title,
      description: stitchedDesc,
      amount: amountNum,
      currency: amountNum !== undefined ? "AED" : undefined,
      status: asDraft ? "Draft" : "Submitted",
      priority: form.priority,
      createdAt: date,
      updatedAt: date,
      attachmentsCount: form.attachmentsCount,
      nextAction: asDraft ? "Complete details & submit" : "Awaiting HR review",
      benefitHint: form.benefitHint || undefined,
      slaDays: createType === "question" ? 3 : createType === "claim" ? 5 : 7,
      lastMessage: asDraft
        ? { by: "You", text: "Draft saved. Add missing info and submit.", at: date }
        : { by: "You", text: "Submitted. Waiting for HR review.", at: date },
    };

    setItems((prev) => [newItem, ...prev]);
    setCreateOpen(false);
  };

  const openDetails = (it: RequestItem) => {
    setActiveItem(it);
    setDetailOpen(true);
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
            <span className="font-medium text-foreground">{counts.byType[type]}</span>
            <span>active items</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const WhatYouNeed = ({ type, category }: { type: RequestType; category: Category }) => {
    // lightweight heuristics to guide better submissions
    const base: string[] =
      type === "question"
        ? ["Context (dates, grade, dependents if relevant)", "What exactly you want confirmed", "Policy reference (optional)"]
        : type === "claim"
        ? ["Invoice / receipt", "Proof of payment", "Date range", "Any approvals (if required)"]
        : ["Clear request outcome", "Supporting document(s)", "Repayment/terms if it’s an advance", "Policy reference (optional)"];

    const add: string[] = [];
    if (category === "Housing" && type === "request") add.push("Tenancy contract / Ejari", "Repayment consent form");
    if (category === "Schooling" && type === "claim") add.push("Child dependency proof (if required)", "Academic year/term");
    if (category === "Health Insurance" && type === "claim") add.push("Medical report (if required)", "Prescription (if applicable)");
    if (category === "Learning & Development" && type !== "question") add.push("Course approval (if required)", "Completion proof");
    if (category === "Leave") add.push("Leave dates", "Reason / supporting note (if required)");

    const list = [...base, ...add];

    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          What you’ll need (to avoid back-and-forth)
        </div>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
          {list.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Claims & Requests Center</h1>
        <p className="text-muted-foreground">
          Submit benefit claims, request approvals (e.g., advances), or ask policy questions — with clear tracking and next steps.
        </p>
      </div>

      {/* “Start from a benefit” (reduces wrong category / poor submissions) */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Start from a benefit (recommended)</CardTitle>
          <CardDescription>
            Pick the closest scenario — we’ll pre-fill the request with the right category and wording.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {benefitShortcuts.map((s) => (
            <Button
              key={s.key}
              variant="outline"
              className="justify-between h-auto py-3"
              onClick={() => applyBenefitShortcut(s.key)}
            >
              <span className="text-left">
                <span className="block font-medium">{s.label}</span>
                <span className="block text-xs text-muted-foreground">
                  Creates a {s.suggestedType} • {s.category}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <QuickCard type="claim" />
        <QuickCard type="request" />
        <QuickCard type="question" />
      </div>

      {/* Filters + tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My items</CardTitle>
          <CardDescription>Filter by type, category, status — and track what HR needs next.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full justify-start flex-wrap gap-2 h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="claim">Claims</TabsTrigger>
              <TabsTrigger value="request">Requests</TabsTrigger>
              <TabsTrigger value="question">Questions</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
              <div className="lg:col-span-4">
                <Label>Search</Label>
                <Input
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  placeholder="Search by ID, title, benefit, category…"
                />
              </div>

              <div className="lg:col-span-3">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(v) => setFilters((p) => ({ ...p, category: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => setFilters((p) => ({ ...p, status: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {(
                      ["Draft", "Submitted", "In Review", "Needs Info", "Approved", "Rejected", "Paid"] as Status[]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Label>Sort</Label>
                <Select
                  value={filters.sort}
                  onValueChange={(v) => setFilters((p) => ({ ...p, sort: v as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="amount_desc">Amount (high → low)</SelectItem>
                    <SelectItem value="amount_asc">Amount (low → high)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={tab} className="mt-4">
              {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground py-10 text-center">No items match your filters.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((i) => (
                    <Card key={i.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold">{i.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {i.id}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {i.category}
                                  </Badge>
                                  <Badge variant="outline" className={`text-xs ${statusTone(i.status)}`}>
                                    <span className="inline-flex items-center gap-1">
                                      <StatusIcon status={i.status} />
                                      {i.status}
                                    </span>
                                  </Badge>
                                  {i.priority === "High" && (
                                    <Badge variant="outline" className="text-xs bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300">
                                      High priority
                                    </Badge>
                                  )}
                                </div>

                                {i.benefitHint && (
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Benefit context: <span className="font-medium text-foreground">{i.benefitHint}</span>
                                  </div>
                                )}

                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line">{i.description}</p>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-semibold">{formatMoney(i.amount, "AED")}</div>
                                <div className="text-xs text-muted-foreground">Type: {i.type}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>
                                  SLA: <span className="font-medium text-foreground">{i.slaDays ?? 5} business days</span>
                                </span>
                              </div>
                              <Progress value={statusProgress(i.status)} className="mt-2" />
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Created: {i.createdAt}</span>
                              <span>•</span>
                              <span>Updated: {i.updatedAt}</span>
                              <span>•</span>
                              <span>Attachments: {i.attachmentsCount ?? 0}</span>
                            </div>

                            {i.nextAction && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Next action: </span>
                                <span className="font-medium">{i.nextAction}</span>
                              </div>
                            )}

                            {i.lastMessage && (
                              <div className="mt-2 text-sm rounded-lg border bg-muted/30 p-3">
                                <div className="text-xs text-muted-foreground">
                                  Latest message • <span className="font-medium">{i.lastMessage.by}</span> • {i.lastMessage.at}
                                </div>
                                <div className="mt-1">{i.lastMessage.text}</div>
                              </div>
                            )}
                          </div>

                          <div className="flex lg:flex-col gap-2 lg:w-48">
                            <Button variant="outline" className="w-full gap-2" onClick={() => openDetails(i)}>
                              <FileText className="w-4 h-4" />
                              View details
                            </Button>
                            <Button
                              variant="secondary"
                              className="w-full gap-2"
                              onClick={() => {
                                setActiveItem(i);
                                setDetailOpen(true);
                              }}
                            >
                              <Send className="w-4 h-4" />
                              Add update
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>{requestTypeCopy[createType].title}</DialogTitle>
            <DialogDescription>{requestTypeCopy[createType].desc}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Benefit context (optional but recommended)</Label>
              <Input
                value={form.benefitHint}
                onChange={(e) => setForm((p) => ({ ...p, benefitHint: e.target.value }))}
                placeholder="e.g., Housing allowance (advance & deduction), Schooling policy (tuition reimbursement)"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as Category }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Priority }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(["Low", "Normal", "High"] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Short clear title (e.g., School tuition reimbursement)"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Add key details so HR can process quickly (what happened, policy context, what outcome you need)."
                rows={4}
              />
            </div>

            {createType !== "question" && (
              <div>
                <Label>Amount (AED)</Label>
                <Input
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g., 1250"
                />
              </div>
            )}

            <div>
              <Label>Attachments (count)</Label>
              <Input
                inputMode="numeric"
                value={String(form.attachmentsCount)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    attachmentsCount: Math.max(0, Number(e.target.value || 0)),
                  }))
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label>Date from (optional)</Label>
              <Input value={form.dateFrom} onChange={(e) => setForm((p) => ({ ...p, dateFrom: e.target.value }))} placeholder="YYYY-MM-DD" />
            </div>

            <div>
              <Label>Date to (optional)</Label>
              <Input value={form.dateTo} onChange={(e) => setForm((p) => ({ ...p, dateTo: e.target.value }))} placeholder="YYYY-MM-DD" />
            </div>

            <div className="md:col-span-2">
              <Label>Vendor / Provider (optional)</Label>
              <Input
                value={form.vendorName}
                onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))}
                placeholder="e.g., School name, clinic, training provider, landlord, etc."
              />
            </div>

            {createType === "request" && form.category === "Housing" && (
              <>
                <div>
                  <Label>Repayment months</Label>
                  <Input
                    inputMode="numeric"
                    value={form.repaymentMonths}
                    onChange={(e) => setForm((p) => ({ ...p, repaymentMonths: e.target.value }))}
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <Label>Payroll deduction</Label>
                  <Select
                    value={form.requestedPayrollDeduction}
                    onValueChange={(v) => setForm((p) => ({ ...p, requestedPayrollDeduction: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Label>Extra note (optional)</Label>
              <Textarea
                value={form.employeeNote}
                onChange={(e) => setForm((p) => ({ ...p, employeeNote: e.target.value }))}
                placeholder="Anything HR should know (exceptions, constraints, urgency, etc.)"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <WhatYouNeed type={createType} category={form.category} />
            </div>
          </div>

          <Separator className="my-2" />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => submitCreate(true)} className="gap-2">
              <FileText className="w-4 h-4" />
              Save draft
            </Button>
            <Button onClick={() => submitCreate(false)} className="gap-2">
              <Send className="w-4 h-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Request details</DialogTitle>
            <DialogDescription>Clear status, context, and next steps.</DialogDescription>
          </DialogHeader>

          {!activeItem ? (
            <div className="text-sm text-muted-foreground">No item selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{activeItem.title}</span>
                    <Badge variant="outline" className="text-xs">{activeItem.id}</Badge>
                    <Badge variant="outline" className="text-xs">{activeItem.category}</Badge>
                    <Badge variant="outline" className={`text-xs ${statusTone(activeItem.status)}`}>
                      <span className="inline-flex items-center gap-1">
                        <StatusIcon status={activeItem.status} />
                        {activeItem.status}
                      </span>
                    </Badge>
                  </div>
                  {activeItem.benefitHint && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Benefit context: <span className="font-medium text-foreground">{activeItem.benefitHint}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">{formatMoney(activeItem.amount, "AED")}</div>
                  <div className="text-xs text-muted-foreground">Priority: {activeItem.priority}</div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {activeItem.description}
              </div>

              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">SLA: {activeItem.slaDays ?? 5} business days</span>
                </div>
                <Progress value={statusProgress(activeItem.status)} className="mt-2" />
                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-2">
                  <span>Created: {activeItem.createdAt}</span>
                  <span>•</span>
                  <span>Updated: {activeItem.updatedAt}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" /> Attachments: {activeItem.attachmentsCount ?? 0}
                  </span>
                </div>
              </div>

              {activeItem.nextAction && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Next action: </span>
                  <span className="font-medium">{activeItem.nextAction}</span>
                </div>
              )}

              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-sm font-medium">Add an update</div>
                <div className="text-xs text-muted-foreground mt-1">
                  In a real implementation, this becomes a message thread + attachments upload + HR responses.
                </div>
                <div className="mt-3">
                  <Label>Message</Label>
                  <Textarea placeholder="Add clarifications, upload missing documents, or confirm details…" rows={3} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attach files
                  </Button>
                  <Button className="gap-2">
                    <Send className="w-4 h-4" />
                    Send update
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tiny helper strip */}
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Tip: The fastest approvals happen when you include a benefit context + amount + dates + proof of payment (if a claim).
      </div>
    </div>
  );
}
