import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Ghost, AlertTriangle, TrendingDown, Lightbulb, DollarSign, Users, Target, 
  Play, FileText, Settings, Megaphone, BookOpen, Clock, ShieldCheck, Store,
  CheckCircle2, AlertCircle, Eye, MessageSquare, FileWarning, Hourglass,
  Calendar, UserCheck, BarChart3, ArrowRight, Zap, Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { DrillDownModal } from '@/components/dashboard';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics, NarrativeInsights, NarrativeInsight } from '@/components/employer';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';

// ============= TYPE DEFINITIONS =============

type BenefitType = 'cash_allowance' | 'reimbursement' | 'insurance' | 'time_off';
type ZombieReason = 'awareness' | 'eligibility_confusion' | 'documentation_friction' | 'approval_delay' | 'vendor_availability' | 'timing_cycle';
type PlaybookType = 'awareness_campaign' | 'process_simplification' | 'policy_simplification' | 'ops_improvement' | 'vendor_enablement';

interface EvidenceSignal {
  type: 'faq_views' | 'missing_docs' | 'long_sla' | 'rejection_rate' | 'drop_off' | 'low_claims';
  value: number;
  threshold: number;
  description: string;
}

interface RecoveryPlaybook {
  id: PlaybookType;
  title: string;
  description: string;
  icon: React.ElementType;
  effort: 'low' | 'medium' | 'high';
  expectedImpact: number; // percentage recovery
  steps: string[];
  templates?: string[];
  featureFlag?: string;
}

interface ZombieBenefit {
  id: string;
  benefit: string;
  benefitType: BenefitType;
  allocated: number;
  utilized: number;
  zombie: number;
  utilizationRate: number;
  affectedEmployees: number;
  primaryReason: ZombieReason;
  secondaryReasons: ZombieReason[];
  evidenceSignals: EvidenceSignal[];
  recommendedPlaybooks: PlaybookType[];
  policyId?: string;
  clauseRef?: string;
}

// ============= ZOMBIE DEFINITIONS BY BENEFIT TYPE =============

const zombieDefinitions: Record<BenefitType, { title: string; description: string; calculation: string }> = {
  cash_allowance: {
    title: 'Cash Allowance',
    description: 'Fixed monetary allocations that expire if unclaimed within the fiscal year.',
    calculation: 'Allocated Amount - Claimed Amount = Zombie Spend',
  },
  reimbursement: {
    title: 'Reimbursement',
    description: 'Expense-based benefits where employees pay first and claim back. Zombie occurs when eligible expenses go unreimbursed.',
    calculation: 'Budget Ceiling - Submitted Claims = Unrealized Value',
  },
  insurance: {
    title: 'Insurance Coverage',
    description: 'Premium-paid coverage where zombie represents unused coverage capacity (e.g., unclaimed sub-limits, unused add-ons).',
    calculation: 'Sub-limit Total - Claims Filed = Untapped Coverage',
  },
  time_off: {
    title: 'Time Off & Flex',
    description: 'Leave days or flexible work benefits that expire or cannot be carried over.',
    calculation: 'Accrued Days - Used Days = Forfeited Time Value',
  },
};

const reasonLabels: Record<ZombieReason, { label: string; icon: React.ElementType; color: string }> = {
  awareness: { label: 'Low Awareness', icon: Eye, color: 'text-blue-500' },
  eligibility_confusion: { label: 'Eligibility Confusion', icon: AlertCircle, color: 'text-purple-500' },
  documentation_friction: { label: 'Documentation Friction', icon: FileWarning, color: 'text-amber-500' },
  approval_delay: { label: 'Approval Delay', icon: Hourglass, color: 'text-red-500' },
  vendor_availability: { label: 'Vendor Availability', icon: Store, color: 'text-orange-500' },
  timing_cycle: { label: 'Timing/Cycle Issues', icon: Clock, color: 'text-teal-500' },
};

// ============= RECOVERY PLAYBOOKS =============

const recoveryPlaybooks: RecoveryPlaybook[] = [
  {
    id: 'awareness_campaign',
    title: 'Awareness Campaign',
    description: 'Launch targeted communications to increase benefit visibility and understanding.',
    icon: Megaphone,
    effort: 'low',
    expectedImpact: 25,
    steps: [
      'Identify target employee segments',
      'Create benefit explainer content',
      'Schedule email/Slack campaign',
      'Add dashboard banners',
      'Track open rates and claims uplift',
    ],
    templates: [
      'Email: "Did you know?" benefit spotlight',
      'Slack: Weekly benefit tip series',
      'Dashboard: Interactive benefit calculator',
    ],
  },
  {
    id: 'process_simplification',
    title: 'Process Simplification',
    description: 'Reduce steps and documentation requirements to lower friction.',
    icon: Settings,
    effort: 'medium',
    expectedImpact: 35,
    steps: [
      'Map current claim journey',
      'Identify drop-off points',
      'Remove unnecessary steps/docs',
      'Implement auto-approval rules',
      'A/B test new flow',
    ],
  },
  {
    id: 'policy_simplification',
    title: 'Policy Simplification',
    description: 'Rewrite policy bullets and examples for clarity; reduce ambiguity.',
    icon: BookOpen,
    effort: 'medium',
    expectedImpact: 20,
    steps: [
      'Audit current policy language',
      'Identify confusing clauses',
      'Rewrite in plain language',
      'Add real-world examples',
      'Publish updated version',
    ],
  },
  {
    id: 'ops_improvement',
    title: 'Ops Improvement',
    description: 'Improve SLA, assignment, and approval workflows to reduce delays.',
    icon: Zap,
    effort: 'medium',
    expectedImpact: 30,
    steps: [
      'Analyze current SLA metrics',
      'Identify bottleneck reviewers',
      'Redistribute workload',
      'Set up auto-escalation rules',
      'Monitor improvement',
    ],
  },
  {
    id: 'vendor_enablement',
    title: 'Vendor Enablement',
    description: 'Expand vendor network or improve vendor integration for better access.',
    icon: Store,
    effort: 'high',
    expectedImpact: 40,
    steps: [
      'Survey employee location needs',
      'Identify vendor gaps',
      'Negotiate new partnerships',
      'Integrate booking/claiming',
      'Announce expanded network',
    ],
    featureFlag: 'vendorEnablement',
  },
];

// ============= SAMPLE DATA =============

const zombieBenefits: ZombieBenefit[] = [
  {
    id: 'ld-001',
    benefit: 'Learning & Development',
    benefitType: 'reimbursement',
    allocated: 300000,
    utilized: 150000,
    zombie: 150000,
    utilizationRate: 50,
    affectedEmployees: 45,
    primaryReason: 'awareness',
    secondaryReasons: ['documentation_friction', 'timing_cycle'],
    evidenceSignals: [
      { type: 'faq_views', value: 156, threshold: 50, description: 'High FAQ views on L&D policy' },
      { type: 'drop_off', value: 42, threshold: 20, description: '42% drop-off at course selection' },
      { type: 'low_claims', value: 2.1, threshold: 4, description: 'Only 2.1 claims/employee vs 4 expected' },
    ],
    recommendedPlaybooks: ['awareness_campaign', 'process_simplification'],
    policyId: 'pol-ld-v2',
    clauseRef: 'Section 3.2 - Eligible Courses',
  },
  {
    id: 'well-001',
    benefit: 'Wellbeing Program',
    benefitType: 'reimbursement',
    allocated: 150000,
    utilized: 80000,
    zombie: 70000,
    utilizationRate: 53.3,
    affectedEmployees: 60,
    primaryReason: 'documentation_friction',
    secondaryReasons: ['eligibility_confusion'],
    evidenceSignals: [
      { type: 'missing_docs', value: 38, threshold: 15, description: '38% claims rejected for missing docs' },
      { type: 'drop_off', value: 55, threshold: 20, description: '55% drop-off at receipt upload' },
      { type: 'rejection_rate', value: 22, threshold: 10, description: '22% overall rejection rate' },
    ],
    recommendedPlaybooks: ['process_simplification', 'policy_simplification'],
    policyId: 'pol-well-v1',
    clauseRef: 'Section 2.1 - Required Documentation',
  },
  {
    id: 'flight-001',
    benefit: 'Annual Flight Tickets',
    benefitType: 'cash_allowance',
    allocated: 200000,
    utilized: 140000,
    zombie: 60000,
    utilizationRate: 70,
    affectedEmployees: 15,
    primaryReason: 'timing_cycle',
    secondaryReasons: ['eligibility_confusion'],
    evidenceSignals: [
      { type: 'low_claims', value: 0.8, threshold: 1, description: 'Only 0.8 claims per eligible employee' },
      { type: 'faq_views', value: 45, threshold: 50, description: 'Moderate FAQ engagement' },
    ],
    recommendedPlaybooks: ['awareness_campaign', 'policy_simplification'],
    policyId: 'pol-flight-v3',
    clauseRef: 'Section 4.1 - Booking Window',
  },
  {
    id: 'gym-001',
    benefit: 'Gym Membership',
    benefitType: 'insurance',
    allocated: 80000,
    utilized: 48000,
    zombie: 32000,
    utilizationRate: 60,
    affectedEmployees: 32,
    primaryReason: 'vendor_availability',
    secondaryReasons: ['awareness'],
    evidenceSignals: [
      { type: 'faq_views', value: 89, threshold: 50, description: 'High queries about gym locations' },
      { type: 'low_claims', value: 0.5, threshold: 1, description: 'Low monthly check-in rate' },
    ],
    recommendedPlaybooks: ['vendor_enablement', 'awareness_campaign'],
    policyId: 'pol-gym-v1',
    clauseRef: 'Appendix A - Partner Network',
  },
  {
    id: 'leave-001',
    benefit: 'Annual Leave Balance',
    benefitType: 'time_off',
    allocated: 120000,
    utilized: 95000,
    zombie: 25000,
    utilizationRate: 79.2,
    affectedEmployees: 28,
    primaryReason: 'approval_delay',
    secondaryReasons: ['timing_cycle'],
    evidenceSignals: [
      { type: 'long_sla', value: 4.2, threshold: 2, description: '4.2 days avg approval time' },
      { type: 'rejection_rate', value: 15, threshold: 10, description: '15% leave requests rejected' },
    ],
    recommendedPlaybooks: ['ops_improvement', 'awareness_campaign'],
    policyId: 'pol-leave-v2',
    clauseRef: 'Section 5.3 - Approval Workflow',
  },
];

// Chart data
const chartData = zombieBenefits.map(b => ({
  name: b.benefit,
  shortName: b.benefit.split(' ').slice(0, 2).join(' '),
  zombie: b.zombie,
  utilized: b.utilized,
  total: b.allocated,
}));

// Custom legend component
const CustomLegend = () => (
  <div className="flex justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-accent" />
      <span className="text-xs text-muted-foreground font-medium">Utilized</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-amber-500" />
      <span className="text-xs text-muted-foreground font-medium">Zombie Spend</span>
    </div>
  </div>
);

// ============= RECOVERY SHEET COMPONENT =============

interface RecoverySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benefit: ZombieBenefit | null;
  playbook: RecoveryPlaybook | null;
  onStartRecovery: (data: RecoveryFormData) => void;
}

interface RecoveryFormData {
  benefitId: string;
  playbookId: PlaybookType;
  owner: string;
  dueDate: string;
  expectedImpact: number;
  confidence: 'low' | 'medium' | 'high';
  linkedKpi: string;
  notes: string;
}

function RecoverySheet({ open, onOpenChange, benefit, playbook, onStartRecovery }: RecoverySheetProps) {
  const [formData, setFormData] = useState<Partial<RecoveryFormData>>({
    confidence: 'medium',
  });

  if (!benefit || !playbook) return null;

  const expectedRecovery = benefit.zombie * (playbook.expectedImpact / 100);

  const handleSubmit = () => {
    if (!formData.owner || !formData.dueDate) {
      toast.error('Please fill in required fields');
      return;
    }

    onStartRecovery({
      benefitId: benefit.id,
      playbookId: playbook.id,
      owner: formData.owner || '',
      dueDate: formData.dueDate || '',
      expectedImpact: expectedRecovery,
      confidence: formData.confidence || 'medium',
      linkedKpi: formData.linkedKpi || `${benefit.benefit} Utilization Rate`,
      notes: formData.notes || '',
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <playbook.icon className="h-5 w-5 text-accent" />
            Start Recovery: {playbook.title}
          </SheetTitle>
          <SheetDescription>
            Create a trackable action item for {benefit.benefit}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Impact Preview */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Zombie</p>
                  <p className="text-lg font-semibold text-amber-500">{formatCurrencyAED(benefit.zombie)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected Recovery</p>
                  <p className="text-lg font-semibold text-green-500">{formatCurrencyAED(expectedRecovery)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Impact Rate</p>
                  <p className="font-medium">{playbook.expectedImpact}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effort Level</p>
                  <Badge variant="outline" className="capitalize">{playbook.effort}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Playbook Steps */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Playbook Steps</Label>
            <div className="space-y-2 p-3 rounded-lg bg-muted/30 text-sm">
              {playbook.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Templates (if available) */}
          {playbook.templates && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Available Templates</Label>
              <div className="space-y-2">
                {playbook.templates.map((template, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{template}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Owner *</Label>
                <Select onValueChange={(v) => setFormData(prev => ({ ...prev, owner: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr-lead">HR Lead</SelectItem>
                    <SelectItem value="benefits-manager">Benefits Manager</SelectItem>
                    <SelectItem value="comms-team">Comms Team</SelectItem>
                    <SelectItem value="ops-manager">Ops Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence</Label>
                <Select 
                  defaultValue="medium"
                  onValueChange={(v) => setFormData(prev => ({ ...prev, confidence: v as 'low' | 'medium' | 'high' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedKpi">Linked KPI</Label>
                <Input
                  id="linkedKpi"
                  defaultValue={`${benefit.benefit} Utilization Rate`}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedKpi: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional context or instructions..."
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Play className="h-4 w-4" />
            Start Recovery
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============= MAIN COMPONENT =============

export default function ZombieSpendPage() {
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [recoverySheetOpen, setRecoverySheetOpen] = useState(false);
  const [selectedBenefit, setSelectedBenefit] = useState<ZombieBenefit | null>(null);
  const [selectedPlaybook, setSelectedPlaybook] = useState<RecoveryPlaybook | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const coverageMetrics = useDataCoverageMetrics();
  const { flags } = useFeatureFlags();

  // Helper to check if a feature is enabled
  const isFeatureEnabled = (featureKey: string): boolean => {
    if (featureKey === 'vendorEnablement') {
      return flags.marketplaceEnabled; // Vendor enablement tied to marketplace flag
    }
    return false;
  };

  const totalZombie = zombieBenefits.reduce((sum, b) => sum + b.zombie, 0);
  const totalAllocated = zombieBenefits.reduce((sum, b) => sum + b.allocated, 0);
  const totalAffected = zombieBenefits.reduce((sum, b) => sum + b.affectedEmployees, 0);
  const avgRecoveryRate = 28; // Weighted average of playbook impacts

  const handleBarClick = (data: any) => {
    if (data && data.activePayload) {
      const clickedData = data.activePayload[0]?.payload;
      if (clickedData) {
        const benefit = zombieBenefits.find(b => b.benefit === clickedData.name);
        if (benefit) {
          setSelectedData({
            title: benefit.benefit,
            category: 'Zombie Analysis',
            totalValue: benefit.allocated,
            utilized: benefit.utilized,
            trend: benefit.utilizationRate < 60 ? 'down' : 'neutral',
            trendValue: Math.round(100 - benefit.utilizationRate),
            description: `Primary cause: ${reasonLabels[benefit.primaryReason].label}`,
            breakdown: [
              { name: 'Utilized', value: benefit.utilized },
              { name: 'Zombie', value: benefit.zombie },
            ],
          });
          setDrillDownOpen(true);
        }
      }
    }
  };

  const handleOpenPlaybook = (benefit: ZombieBenefit, playbookId: PlaybookType) => {
    const playbook = recoveryPlaybooks.find(p => p.id === playbookId);
    if (playbook) {
      // Check feature flag for vendor enablement
      if (playbook.featureFlag && !isFeatureEnabled(playbook.featureFlag)) {
        toast.info('Vendor Enablement is a Phase 2 feature', {
          description: 'This playbook will be available in an upcoming release.',
        });
        return;
      }
      setSelectedBenefit(benefit);
      setSelectedPlaybook(playbook);
      setRecoverySheetOpen(true);
    }
  };

  const handleStartRecovery = (data: RecoveryFormData) => {
    // In production, this would POST to employer_actions table
    toast.success('Recovery action created!', {
      description: `Added to Recommendations with ${formatCurrencyAED(data.expectedImpact)} expected impact.`,
      action: {
        label: 'View',
        onClick: () => window.location.href = '/employer/recommendations',
      },
    });
    setRecoverySheetOpen(false);
  };

  const getEvidenceIcon = (type: EvidenceSignal['type']) => {
    switch (type) {
      case 'faq_views': return Eye;
      case 'missing_docs': return FileWarning;
      case 'long_sla': return Clock;
      case 'rejection_rate': return AlertCircle;
      case 'drop_off': return TrendingDown;
      case 'low_claims': return BarChart3;
      default: return Info;
    }
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Ghost className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Unrealized Benefits Value</h1>
              <p className="text-muted-foreground">Identify why benefits go unused and start recovery workflows</p>
            </div>
          </div>
          <DataConfidenceBadge metrics={coverageMetrics} />
        </div>

        <EmployerGlobalFiltersBar />

        {/* Narrative Insights */}
        <NarrativeInsights
          insights={[
            {
              id: 'zombie-top-category',
              change: 'Housing Allowance has the highest unrealized value',
              metricValue: formatCurrencyAED(zombieBenefits[0]?.zombie || 0),
              impact: `${zombieBenefits[0]?.affectedEmployees || 0} employees haven't claimed their full entitlement. Primary cause: ${reasonLabels[zombieBenefits[0]?.primaryReason || 'awareness'].label}.`,
              action: 'Launch an awareness campaign with step-by-step claim guide',
              actionPath: '/employer/recommendations?create=true&source=zombie-housing',
              trend: 'down',
              trendIsPositive: false,
              confidence: 'high',
            },
            {
              id: 'zombie-recovery-potential',
              change: 'Recovery playbooks show strong ROI potential',
              metricValue: formatCurrencyAED(totalZombie * (avgRecoveryRate / 100)),
              impact: `Historical data suggests ${avgRecoveryRate}% of zombie spend can be recovered through targeted interventions.`,
              action: 'Prioritize playbooks for top 2 underutilized benefits',
              trend: 'up',
              trendIsPositive: true,
              confidence: 'medium',
            },
            {
              id: 'zombie-documentation',
              change: 'Documentation friction identified in 3 benefits',
              impact: 'Employees are dropping off during the claim process due to complex documentation requirements.',
              action: 'Simplify documentation or enable direct vendor billing',
              actionPath: '/employer/policies',
              trend: 'down',
              trendIsPositive: false,
              confidence: 'high',
            },
          ]}
          coverageMetrics={coverageMetrics}
          title="Recovery Insights"
          subtitle="AI-identified opportunities to recapture benefit value"
          onCreateRecommendation={(insight) => {
            window.location.href = `/employer/recommendations?create=true&source=${insight.id}`;
          }}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStatsCard
            variant="info"
            label="Total Zombie Spend"
            value={formatCurrencyAED(totalZombie)}
            icon={Ghost}
            formula="Sum of allocated but unused benefits"
            dataSource="Benefits Analytics"
            index={0}
          />
          <SummaryStatsCard
            variant="utilized"
            label="Affected Employees"
            value={formatInteger(totalAffected)}
            icon={Users}
            formula="Unique employees with underutilized benefits"
            dataSource="HR System"
            index={1}
          />
          <SummaryStatsCard
            variant="remaining"
            label="Recovery Potential"
            value={formatCurrencyAED(totalZombie * (avgRecoveryRate / 100))}
            icon={Target}
            formula={`Based on ${avgRecoveryRate}% avg playbook success rate`}
            dataSource="Recovery Analytics"
            index={2}
          />
          <SummaryStatsCard
            variant="utilization"
            label="Zombie Rate"
            value={formatPercent((totalZombie / totalAllocated) * 100)}
            icon={TrendingDown}
            formula="(Zombie / Total Allocated) × 100"
            dataSource="Benefits Analytics"
            progress={100 - (totalZombie / totalAllocated) * 100}
            index={3}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Root Cause Analysis</TabsTrigger>
            <TabsTrigger value="playbooks">Recovery Playbooks</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Zombie Definitions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Understanding Zombie Spend by Benefit Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(zombieDefinitions).map(([key, def]) => (
                    <div key={key} className="p-4 rounded-xl border border-border bg-card/50">
                      <h4 className="font-semibold text-sm mb-1">{def.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{def.description}</p>
                      <div className="text-xs p-2 rounded bg-muted/50 font-mono">
                        {def.calculation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  Zombie Spend by Benefit
                  <InfoTooltip formula="Stacked comparison of utilized vs zombie" dataSource="Benefits Analytics" />
                </CardTitle>
                <CardDescription>Click any bar to drill down</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      onClick={handleBarClick}
                      style={{ cursor: 'pointer' }}
                    >
                      <defs>
                        <linearGradient id="utilizedGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="zombieGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        type="number"
                        tickFormatter={(v) => formatCurrencyAED(v, { showCurrency: false })}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={110}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatCurrencyAED(value, { abbreviate: false }),
                          name === 'utilized' ? 'Utilized' : 'Zombie Spend',
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '10px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                        }}
                        cursor={{ fill: 'hsl(var(--accent)/0.05)' }}
                      />
                      <Bar dataKey="utilized" stackId="a" fill="url(#utilizedGradient)" radius={[0, 0, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="zombie" stackId="a" fill="url(#zombieGradient)" radius={[0, 6, 6, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <CustomLegend />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Root Cause Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4 mt-6">
            {zombieBenefits.map((benefit) => {
              const PrimaryIcon = reasonLabels[benefit.primaryReason].icon;
              const typeInfo = zombieDefinitions[benefit.benefitType];

              return (
                <Card key={benefit.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">{benefit.benefit}</CardTitle>
                          <Badge variant="outline" className="text-xs">{typeInfo.title}</Badge>
                          <Badge 
                            className={
                              benefit.utilizationRate < 60 
                                ? 'bg-red-500/10 text-red-500 border-0' 
                                : 'bg-amber-500/10 text-amber-500 border-0'
                            }
                          >
                            {formatPercent(benefit.utilizationRate)} utilized
                          </Badge>
                        </div>
                        {benefit.clauseRef && (
                          <p className="text-xs text-muted-foreground">Policy: {benefit.clauseRef}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-500">{formatCurrencyAED(benefit.zombie)}</p>
                        <p className="text-xs text-muted-foreground">{benefit.affectedEmployees} employees</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Primary Reason */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <PrimaryIcon className={`h-5 w-5 ${reasonLabels[benefit.primaryReason].color}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Primary Cause: {reasonLabels[benefit.primaryReason].label}</p>
                        <p className="text-xs text-muted-foreground">
                          Secondary: {benefit.secondaryReasons.map(r => reasonLabels[r].label).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* Evidence Signals */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">EVIDENCE SIGNALS</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {benefit.evidenceSignals.map((signal, idx) => {
                          const EvidenceIcon = getEvidenceIcon(signal.type);
                          const isAboveThreshold = signal.value > signal.threshold;
                          return (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                                isAboveThreshold ? 'bg-red-500/5 border border-red-500/20' : 'bg-muted/30'
                              }`}
                            >
                              <EvidenceIcon className={`h-4 w-4 mt-0.5 ${isAboveThreshold ? 'text-red-500' : 'text-muted-foreground'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate">{signal.description}</p>
                                <p className={`text-xs font-medium ${isAboveThreshold ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  {signal.value} {isAboveThreshold ? `(threshold: ${signal.threshold})` : ''}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommended Playbooks */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Recommended:</span>
                      {benefit.recommendedPlaybooks.map((pbId) => {
                        const pb = recoveryPlaybooks.find(p => p.id === pbId);
                        if (!pb) return null;
                        const isDisabled = pb.featureFlag && !isFeatureEnabled(pb.featureFlag);
                        return (
                          <Button
                            key={pbId}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            disabled={isDisabled}
                            onClick={() => handleOpenPlaybook(benefit, pbId)}
                          >
                            <pb.icon className="h-3 w-3" />
                            {pb.title}
                            {isDisabled && <Badge variant="secondary" className="ml-1 text-[10px]">Phase 2</Badge>}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Recovery Playbooks Tab */}
          <TabsContent value="playbooks" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recoveryPlaybooks.map((playbook) => {
                const isDisabled = playbook.featureFlag && !isFeatureEnabled(playbook.featureFlag);
                return (
                  <Card key={playbook.id} className={isDisabled ? 'opacity-60' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <playbook.icon className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{playbook.title}</CardTitle>
                            {isDisabled && <Badge variant="secondary" className="text-[10px]">Phase 2</Badge>}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            playbook.effort === 'low' ? 'border-green-500/50 text-green-600' :
                            playbook.effort === 'medium' ? 'border-amber-500/50 text-amber-600' :
                            'border-red-500/50 text-red-500'
                          }
                        >
                          {playbook.effort} effort
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{playbook.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Expected Impact</p>
                          <p className="font-semibold text-green-600">+{playbook.expectedImpact}% recovery</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Steps</p>
                          <p className="font-medium">{playbook.steps.length} steps</p>
                        </div>
                      </div>

                      {playbook.templates && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {playbook.templates.length} templates available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recovery Sheet */}
        <RecoverySheet
          open={recoverySheetOpen}
          onOpenChange={setRecoverySheetOpen}
          benefit={selectedBenefit}
          playbook={selectedPlaybook}
          onStartRecovery={handleStartRecovery}
        />

        {/* Drill-down Modal */}
        <DrillDownModal
          open={drillDownOpen}
          onOpenChange={setDrillDownOpen}
          data={selectedData}
          formatValue={(v) => formatCurrencyAED(v, { abbreviate: false })}
        />
      </div>
    </PageConfidenceGate>
  );
}
