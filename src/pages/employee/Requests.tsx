import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
    desc: "Reimbursement for eligible expenses (attach receipts).",
    icon: Receipt,
  },
  request: {
    title: "Make a Request",
    desc: "Ask for approval or a change (e.g., allowance advance, benefit change).",
    icon: FileText,
  },
  question: {
    title: "Ask a Question",
    desc: "Clarify a policy or your eligibility with a clear answer trail.",
    icon: HelpCircle,
  },
};

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
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "Approved" || status === "Paid") return <CheckCircle2 className="w-4 h-4" />;
  if (status === "In Review" || status === "Submitted" || status === "Needs Info") return <Clock className="w-4 h-4" />;
  return <Clock className="w-4 h-4" />;
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

  const [createOpen, setCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<RequestType>("claim");
  const [form, setForm] = useState<{
    category: Category;
    title: string;
    description: string;
    amount?: string;
    priority: Priority;
    attachmentsCount: number;
  }>({
    category: "Other",
    title: "",
    description: "",
    amount: "",
    priority: "Normal",
    attachmentsCount: 0,
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
          i.category.toLowerCase().includes(q)
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
    setCreateType(type);
    setForm({ category: "Other", title: "", description: "", amount: "", priority: "Normal", attachmentsCount: 0 });
    setCreateOpen(true);
  };

  const submitCreate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const date = `${yyyy}-${mm}-${dd}`;

    const nextIdNum = 1000 + items.length + Math.floor(Math.random() * 50);
    const id = `REQ-${nextIdNum}`;

    const amountNum =
      createType === "question" ? undefined : form.amount?.trim() ? Number(form.amount) : undefined;

    const newItem: RequestItem = {
      id,
      type: createType,
      category: form.category,
      title: form.title.trim() || requestTypeCopy[createType].title,
      description: form.description.trim() || "—",
      amount: amountNum,
      currency: amountNum !== undefined ? "AED" : undefined,
      status: "Submitted",
      priority: form.priority,
      createdAt: date,
      updatedAt: date,
      attachmentsCount: form.attachmentsCount,
      nextAction: "Awaiting HR review",
    };

    setItems((prev) => [newItem, ...prev]);
    setCreateOpen(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Requests & Claims</h1>
        <p className="text-muted-foreground">
          One place to submit benefit claims, request approvals, and ask policy questions — with clear status tracking.
        </p>
      </div>

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
                  placeholder="Search by ID, title, category…"
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
                      [
                        "Draft",
                        "Submitted",
                        "In Review",
                        "Needs Info",
                        "Approved",
                        "Rejected",
                        "Paid",
                      ] as Status[]
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
                <div className="text-sm text-muted-foreground py-10 text-center">
                  No items match your filters.
                </div>
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
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${statusTone(i.status)}`}
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <StatusIcon status={i.status} />
                                      {i.status}
                                    </span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {i.description}
                                </p>
                              </div>

                              <div className="text-right">
                                <div className="text-sm font-semibold">
                                  {formatMoney(i.amount, "AED")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Priority: {i.priority}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>Created: {i.createdAt}</span>
                              <span>•</span>
                              <span>Updated: {i.updatedAt}</span>
                              <span>•</span>
                              <span>Type: {i.type}</span>
                              <span>•</span>
                              <span>Attachments: {i.attachmentsCount ?? 0}</span>
                            </div>

                            {i.nextAction && (
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Next action: </span>
                                <span className="font-medium">{i.nextAction}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex lg:flex-col gap-2 lg:w-44">
                            <Button variant="outline" className="w-full gap-2">
                              <FileText className="w-4 h-4" />
                              View details
                            </Button>
                            <Button variant="secondary" className="w-full gap-2">
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
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{requestTypeCopy[createType].title}</DialogTitle>
            <DialogDescription>{requestTypeCopy[createType].desc}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v as Category }))}
              >
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
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Priority }))}
              >
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
                placeholder="Add key details so HR can process quickly (dates, vendor, policy context, etc.)"
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
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitCreate} className="gap-2">
              <Send className="w-4 h-4" />
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tiny helper strip */}
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Tip: Keep requests “benefits-first” — add policy context and attach receipts/contracts to reduce back-and-forth.
      </div>
    </div>
  );
}
