import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Baby, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  Car, 
  TrendingUp,
  TrendingDown,
  Plus,
  Layers,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Save,
  Target,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  Filter,
  Zap,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';
import { formatCurrencyAED, formatPercent, formatInteger } from '@/lib/utils';
import { calculateUtilization } from '@/lib/crossPortalContract';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// TYPES
// ============================================================================

interface SegmentRule {
  field: 'grade' | 'department' | 'dependents' | 'location' | 'tenure';
  operator: 'equals' | 'in' | 'greaterThan' | 'lessThan';
  value: string | string[] | number | boolean;
}

interface SegmentDefinition {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  isActive: boolean;
  createdAt: string;
  // Cross-portal flags (future use)
  enableNudges: boolean;
  enableMarketplaceTargeting: boolean;
}

interface FrictionReason {
  reason: string;
  severity: 'high' | 'medium' | 'low';
  affectedCount: number;
  evidenceSignal: string;
}

interface RecommendedAction {
  title: string;
  type: 'Policy' | 'Process' | 'Comms' | 'Vendor';
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
}

interface EnhancedSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  icon: any;
  color: string;
  topBenefits: string[];
  utilizationRate: number;
  avgSpend: number;
  insights: string;
  // New fields
  underusedBenefits: { name: string; utilization: number; potential: number }[];
  frictionReasons: FrictionReason[];
  recommendedActions: RecommendedAction[];
}

// ============================================================================
// DATA
// ============================================================================

const COLORS = {
  emerald: 'hsl(160 84% 39%)',
  blue: 'hsl(217 91% 60%)',
  violet: 'hsl(271 81% 56%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(330 81% 60%)',
};

const GRADE_OPTIONS = ['Junior', 'Mid-Level', 'Senior', 'Manager', 'Director', 'Executive'];
const DEPARTMENT_OPTIONS = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance', 'Legal'];
const LOCATION_OPTIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Remote'];
const TENURE_BANDS = ['< 1 year', '1-3 years', '3-5 years', '5+ years'];

const enhancedSegments: EnhancedSegment[] = [
  {
    id: 'parents-school',
    name: 'Parents with School-age Children',
    count: 42,
    percentage: 32.3,
    icon: Baby,
    color: COLORS.emerald,
    topBenefits: ['Schooling Allowance', 'Health Insurance', 'Annual Leave'],
    utilizationRate: 89,
    avgSpend: 85000,
    insights: 'High utilization of family benefits. Consider adding childcare support.',
    underusedBenefits: [
      { name: 'Wellbeing Program', utilization: 34, potential: 28000 },
      { name: 'Learning & Development', utilization: 45, potential: 18000 },
      { name: 'Transport Allowance', utilization: 52, potential: 12000 },
    ],
    frictionReasons: [
      { reason: 'Awareness', severity: 'high', affectedCount: 18, evidenceSignal: 'High FAQ views on L&D eligibility' },
      { reason: 'Documentation Friction', severity: 'medium', affectedCount: 12, evidenceSignal: '35% missing docs rate on wellbeing claims' },
      { reason: 'Timing Cycle', severity: 'low', affectedCount: 8, evidenceSignal: 'Claims spike in Q4, missed deadlines in Q1-Q3' },
    ],
    recommendedActions: [
      { title: 'Launch L&D awareness campaign for parents', type: 'Comms', expectedImpact: '+15% L&D utilization', effort: 'Low' },
      { title: 'Simplify wellbeing claim documentation', type: 'Process', expectedImpact: '-20% rejection rate', effort: 'Medium' },
      { title: 'Add quarterly reminder nudges', type: 'Comms', expectedImpact: '+8% overall utilization', effort: 'Low' },
    ],
  },
  {
    id: 'young-professionals',
    name: 'Young Professionals (<30)',
    count: 35,
    percentage: 26.9,
    icon: GraduationCap,
    color: COLORS.blue,
    topBenefits: ['Learning & Development', 'Wellbeing Program', 'Transport'],
    utilizationRate: 68,
    avgSpend: 42000,
    insights: 'Lower housing utilization. Prioritize L&D and gym memberships.',
    underusedBenefits: [
      { name: 'Housing Allowance', utilization: 28, potential: 85000 },
      { name: 'Health Insurance (Dependents)', utilization: 15, potential: 22000 },
      { name: 'Annual Leave Encashment', utilization: 42, potential: 15000 },
    ],
    frictionReasons: [
      { reason: 'Eligibility Confusion', severity: 'high', affectedCount: 22, evidenceSignal: 'High rejection rate on housing claims' },
      { reason: 'Awareness', severity: 'high', affectedCount: 18, evidenceSignal: 'Low page views on housing policy' },
      { reason: 'Vendor Availability', severity: 'medium', affectedCount: 10, evidenceSignal: 'Limited approved housing providers' },
    ],
    recommendedActions: [
      { title: 'Clarify housing eligibility criteria in policy', type: 'Policy', expectedImpact: '-40% confusion', effort: 'Low' },
      { title: 'Onboarding: housing benefit walkthrough', type: 'Comms', expectedImpact: '+25% awareness', effort: 'Medium' },
      { title: 'Expand approved housing vendor list', type: 'Vendor', expectedImpact: '+30% accessibility', effort: 'High' },
    ],
  },
  {
    id: 'senior-managers',
    name: 'Senior Managers',
    count: 25,
    percentage: 19.2,
    icon: Briefcase,
    color: COLORS.violet,
    topBenefits: ['Housing Allowance', 'Car Allowance', 'Executive Health'],
    utilizationRate: 92,
    avgSpend: 120000,
    insights: 'Highest utilization. Consider equity-based incentives.',
    underusedBenefits: [
      { name: 'Learning & Development', utilization: 55, potential: 12000 },
      { name: 'Wellbeing Program', utilization: 48, potential: 8000 },
      { name: 'Family Travel', utilization: 62, potential: 6000 },
    ],
    frictionReasons: [
      { reason: 'Timing Cycle', severity: 'medium', affectedCount: 8, evidenceSignal: 'L&D claims concentrated in Q4' },
      { reason: 'Approval Delay', severity: 'low', affectedCount: 5, evidenceSignal: 'Executive claims avg 5-day SLA vs 2-day target' },
      { reason: 'Documentation Friction', severity: 'low', affectedCount: 4, evidenceSignal: 'Complex receipts for international travel' },
    ],
    recommendedActions: [
      { title: 'Quarterly L&D budget reminders', type: 'Comms', expectedImpact: '+20% L&D utilization', effort: 'Low' },
      { title: 'Fast-track approval for executive claims', type: 'Process', expectedImpact: '-50% SLA time', effort: 'Medium' },
      { title: 'Introduce equity vesting dashboard', type: 'Process', expectedImpact: '+15% retention', effort: 'High' },
    ],
  },
  {
    id: 'remote-hybrid',
    name: 'Remote/Hybrid Workers',
    count: 18,
    percentage: 13.8,
    icon: Heart,
    color: COLORS.amber,
    topBenefits: ['Wellbeing Program', 'Learning & Development', 'Internet Allowance'],
    utilizationRate: 72,
    avgSpend: 38000,
    insights: 'Low transport utilization. Consider home office equipment budget.',
    underusedBenefits: [
      { name: 'Transport Allowance', utilization: 12, potential: 18000 },
      { name: 'Parking', utilization: 8, potential: 6000 },
      { name: 'Office Meals', utilization: 5, potential: 4000 },
    ],
    frictionReasons: [
      { reason: 'Eligibility Confusion', severity: 'high', affectedCount: 14, evidenceSignal: 'Transport policy unclear for hybrid workers' },
      { reason: 'Awareness', severity: 'medium', affectedCount: 10, evidenceSignal: 'Low awareness of home office conversion option' },
      { reason: 'Documentation Friction', severity: 'low', affectedCount: 5, evidenceSignal: 'Internet bill submission confusion' },
    ],
    recommendedActions: [
      { title: 'Convert transport to home office equipment budget', type: 'Policy', expectedImpact: '+60% utilization', effort: 'Medium' },
      { title: 'Update policy for hybrid work scenarios', type: 'Policy', expectedImpact: '-80% confusion', effort: 'Low' },
      { title: 'Simplify internet allowance claims', type: 'Process', expectedImpact: '+25% claims', effort: 'Low' },
    ],
  },
  {
    id: 'long-tenure',
    name: 'Long-tenure (5+ years)',
    count: 10,
    percentage: 7.7,
    icon: Car,
    color: COLORS.rose,
    topBenefits: ['Equity Options', 'Extended Leave', 'Health Insurance'],
    utilizationRate: 85,
    avgSpend: 95000,
    insights: 'High loyalty. Focus on retention through equity vesting.',
    underusedBenefits: [
      { name: 'Sabbatical Leave', utilization: 20, potential: 45000 },
      { name: 'Executive Coaching', utilization: 35, potential: 15000 },
      { name: 'Family Travel', utilization: 58, potential: 8000 },
    ],
    frictionReasons: [
      { reason: 'Awareness', severity: 'high', affectedCount: 6, evidenceSignal: 'Sabbatical policy not promoted' },
      { reason: 'Approval Delay', severity: 'medium', affectedCount: 4, evidenceSignal: 'Multi-level approval for sabbatical' },
      { reason: 'Timing Cycle', severity: 'low', affectedCount: 3, evidenceSignal: 'Coaching budget expires with fiscal year' },
    ],
    recommendedActions: [
      { title: 'Proactive sabbatical eligibility notification', type: 'Comms', expectedImpact: '+40% awareness', effort: 'Low' },
      { title: 'Streamline sabbatical approval workflow', type: 'Process', expectedImpact: '-60% approval time', effort: 'Medium' },
      { title: 'Rollover unused coaching budget', type: 'Policy', expectedImpact: '+25% utilization', effort: 'Medium' },
    ],
  },
];

const savedSegments: SegmentDefinition[] = [
  {
    id: 'custom-1',
    name: 'High-Value Engineering Talent',
    description: 'Senior engineers with 3+ years tenure',
    rules: [
      { field: 'department', operator: 'equals', value: 'Engineering' },
      { field: 'grade', operator: 'in', value: ['Senior', 'Manager'] },
      { field: 'tenure', operator: 'greaterThan', value: 3 },
    ],
    isActive: true,
    createdAt: '2024-01-15',
    enableNudges: true,
    enableMarketplaceTargeting: false,
  },
  {
    id: 'custom-2',
    name: 'New Parents in Dubai',
    description: 'Employees with dependents in Dubai office',
    rules: [
      { field: 'dependents', operator: 'equals', value: true },
      { field: 'location', operator: 'equals', value: 'Dubai' },
      { field: 'tenure', operator: 'lessThan', value: 2 },
    ],
    isActive: true,
    createdAt: '2024-02-20',
    enableNudges: true,
    enableMarketplaceTargeting: true,
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function SegmentCard({ 
  segment, 
  onCreateAction,
  isExpanded,
  onToggle 
}: { 
  segment: EnhancedSegment;
  onCreateAction: (segment: EnhancedSegment) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const utilization = calculateUtilization({
    allocated: segment.avgSpend / (segment.utilizationRate / 100),
    utilized: segment.avgSpend,
  });

  return (
    <Card className="card-elevated overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl shrink-0"
              style={{ backgroundColor: `${segment.color}15` }}
            >
              <segment.icon className="h-6 w-6" style={{ color: segment.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{segment.name}</h3>
                <Badge 
                  variant="outline" 
                  className="border-0"
                  style={{ backgroundColor: `${segment.color}15`, color: segment.color }}
                >
                  {formatInteger(segment.count)} employees
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{segment.insights}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: segment.color }}>
                {formatPercent(segment.utilizationRate)}
              </p>
              <p className="text-xs text-muted-foreground">Utilization</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-4 space-y-6 bg-muted/20">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Segment Size</p>
              <p className="text-lg font-bold">{formatInteger(segment.count)}</p>
              <p className="text-xs text-muted-foreground">{formatPercent(segment.percentage)} of workforce</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Avg Spend</p>
              <p className="text-lg font-bold">{formatCurrencyAED(segment.avgSpend)}</p>
              <p className="text-xs text-muted-foreground">per employee/year</p>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className="text-lg font-bold" style={{ color: segment.color }}>{formatPercent(segment.utilizationRate)}</p>
              <Progress value={segment.utilizationRate} className="h-1 mt-1" />
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Potential Recovery</p>
              <p className="text-lg font-bold text-amber-600">
                {formatCurrencyAED(segment.underusedBenefits.reduce((sum, b) => sum + b.potential, 0))}
              </p>
              <p className="text-xs text-muted-foreground">from underused benefits</p>
            </div>
          </div>

          {/* Three columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 3 Underused Benefits */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                Top 3 Underused Benefits
              </h4>
              <div className="space-y-2">
                {segment.underusedBenefits.map((benefit, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-card border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{benefit.name}</span>
                      <span className="text-xs text-amber-600">{formatPercent(benefit.utilization)}</span>
                    </div>
                    <Progress value={benefit.utilization} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Potential: {formatCurrencyAED(benefit.potential)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Friction Reasons */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Top 3 Friction Reasons
              </h4>
              <div className="space-y-2">
                {segment.frictionReasons.map((friction, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-card border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{friction.reason}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          friction.severity === 'high' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          friction.severity === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          'bg-slate-500/10 text-slate-600 border-slate-500/20'
                        }
                      >
                        {friction.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{friction.evidenceSignal}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatInteger(friction.affectedCount)} affected
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Recommended Actions */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-emerald-500" />
                Top 3 Recommended Actions
              </h4>
              <div className="space-y-2">
                {segment.recommendedActions.map((action, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-card border">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {action.type}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={
                          action.effort === 'Low' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          action.effort === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          'bg-red-500/10 text-red-600 border-red-500/20'
                        }
                      >
                        {action.effort} effort
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-emerald-600 mt-1">{action.expectedImpact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={() => onCreateAction(segment)} className="gap-2">
              <Target className="h-4 w-4" />
              Create Action Plan
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

interface SegmentBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: Partial<SegmentDefinition>) => void;
  crossPortalEnabled: boolean;
}

function SegmentBuilder({ isOpen, onClose, onSave, crossPortalEnabled }: SegmentBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<SegmentRule[]>([]);
  const [enableNudges, setEnableNudges] = useState(false);
  const [enableMarketplaceTargeting, setEnableMarketplaceTargeting] = useState(false);

  // Rule state
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [hasDependents, setHasDependents] = useState<boolean | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [tenureMin, setTenureMin] = useState<string>('');
  const [tenureMax, setTenureMax] = useState<string>('');

  const handleSave = () => {
    const newRules: SegmentRule[] = [];

    if (selectedGrades.length > 0) {
      newRules.push({ field: 'grade', operator: 'in', value: selectedGrades });
    }
    if (selectedDepartments.length > 0) {
      newRules.push({ field: 'department', operator: 'in', value: selectedDepartments });
    }
    if (hasDependents !== null) {
      newRules.push({ field: 'dependents', operator: 'equals', value: hasDependents });
    }
    if (selectedLocations.length > 0) {
      newRules.push({ field: 'location', operator: 'in', value: selectedLocations });
    }
    if (tenureMin) {
      newRules.push({ field: 'tenure', operator: 'greaterThan', value: parseInt(tenureMin) });
    }
    if (tenureMax) {
      newRules.push({ field: 'tenure', operator: 'lessThan', value: parseInt(tenureMax) });
    }

    onSave({
      id: `custom-${Date.now()}`,
      name,
      description,
      rules: newRules,
      isActive: true,
      createdAt: new Date().toISOString(),
      enableNudges,
      enableMarketplaceTargeting,
    });

    // Reset form
    setName('');
    setDescription('');
    setSelectedGrades([]);
    setSelectedDepartments([]);
    setHasDependents(null);
    setSelectedLocations([]);
    setTenureMin('');
    setTenureMax('');
    setEnableNudges(false);
    setEnableMarketplaceTargeting(false);
    onClose();
  };

  const estimatedSize = 15 + Math.floor(Math.random() * 30); // Mock calculation

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Segment Builder
          </SheetTitle>
          <SheetDescription>
            Define rules to create a custom employee segment
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input 
                id="segment-name"
                placeholder="e.g., High-Value Engineering Talent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="segment-desc">Description</Label>
              <Input 
                id="segment-desc"
                placeholder="Brief description of this segment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Segment Rules
            </h4>

            {/* Grade */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4" />
                Grade
              </Label>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map((grade) => (
                  <Badge
                    key={grade}
                    variant={selectedGrades.includes(grade) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedGrades(prev => 
                        prev.includes(grade) 
                          ? prev.filter(g => g !== grade)
                          : [...prev, grade]
                      );
                    }}
                  >
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4" />
                Department
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <Badge
                    key={dept}
                    variant={selectedDepartments.includes(dept) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedDepartments(prev => 
                        prev.includes(dept) 
                          ? prev.filter(d => d !== dept)
                          : [...prev, dept]
                      );
                    }}
                  >
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dependents */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                Dependents
              </Label>
              <div className="flex gap-2">
                <Badge
                  variant={hasDependents === true ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setHasDependents(hasDependents === true ? null : true)}
                >
                  Has Dependents
                </Badge>
                <Badge
                  variant={hasDependents === false ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setHasDependents(hasDependents === false ? null : false)}
                >
                  No Dependents
                </Badge>
              </div>
            </div>

            {/* Location */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((loc) => (
                  <Badge
                    key={loc}
                    variant={selectedLocations.includes(loc) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLocations(prev => 
                        prev.includes(loc) 
                          ? prev.filter(l => l !== loc)
                          : [...prev, loc]
                      );
                    }}
                  >
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tenure */}
            <div className="p-4 rounded-lg border bg-muted/30">
              <Label className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" />
                Tenure (years)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={tenureMin}
                    onChange={(e) => setTenureMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input 
                    type="number" 
                    placeholder="10+"
                    value={tenureMax}
                    onChange={(e) => setTenureMax(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Estimated Size */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Estimated Segment Size</p>
                <p className="text-2xl font-bold text-primary">{estimatedSize} employees</p>
              </div>
              <Users className="h-8 w-8 text-primary/30" />
            </div>
          </div>

          {/* Cross-Portal Features (Feature-Flagged) */}
          {crossPortalEnabled && (
            <div className="space-y-4 p-4 rounded-lg border-2 border-dashed">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Cross-Portal Features
                <Badge variant="secondary" className="text-xs">Beta</Badge>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Employee Nudges</Label>
                    <p className="text-xs text-muted-foreground">
                      Send targeted reminders to this segment
                    </p>
                  </div>
                  <Switch 
                    checked={enableNudges}
                    onCheckedChange={setEnableNudges}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketplace Targeting</Label>
                    <p className="text-xs text-muted-foreground">
                      Show relevant vendor offers to this segment
                    </p>
                  </div>
                  <Switch 
                    checked={enableMarketplaceTargeting}
                    onCheckedChange={setEnableMarketplaceTargeting}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name} className="gap-2">
            <Save className="h-4 w-4" />
            Save Segment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SavedSegmentCard({ segment }: { segment: SegmentDefinition }) {
  return (
    <div className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{segment.name}</h4>
            {segment.isActive ? (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">Active</Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
          <div className="flex flex-wrap gap-1">
            {segment.rules.map((rule, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {rule.field}: {Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value)}
              </Badge>
            ))}
          </div>
          {(segment.enableNudges || segment.enableMarketplaceTargeting) && (
            <div className="flex gap-2 mt-2">
              {segment.enableNudges && (
                <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Nudges
                </Badge>
              )}
              {segment.enableMarketplaceTargeting && (
                <Badge variant="secondary" className="text-xs bg-violet-500/10 text-violet-600">
                  <Target className="h-3 w-3 mr-1" />
                  Targeting
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SegmentsPage() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  const { flags } = useFeatureFlags();
  const crossPortalEnabled = flags.marketplaceEnabled ?? false;

  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [customSegments, setCustomSegments] = useState<SegmentDefinition[]>(savedSegments);

  const handleCreateActionPlan = (segment: EnhancedSegment) => {
    // In production, this would create action items linked to the segment
    toast.success(`Creating action plan for "${segment.name}"`, {
      description: `${segment.recommendedActions.length} actions will be added to Recommendations`,
      action: {
        label: 'View',
        onClick: () => navigate('/employer/recommendations'),
      },
    });
  };

  const handleSaveSegment = (segment: Partial<SegmentDefinition>) => {
    setCustomSegments(prev => [...prev, segment as SegmentDefinition]);
    toast.success('Segment saved successfully', {
      description: crossPortalEnabled 
        ? 'Cross-portal features are now active for this segment'
        : 'You can now track this segment\'s performance',
    });
  };

  const segmentDistribution = enhancedSegments.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    value: s.count,
    color: s.color,
  }));

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Segmentation Workbench</h1>
          <p className="text-muted-foreground">Analyze segments, identify friction, and create targeted action plans</p>
        </div>
        <div className="flex items-center gap-3">
          <DataConfidenceBadge metrics={coverageMetrics} />
          <Button onClick={() => setIsBuilderOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Segment
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar showEmploymentType />

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">Segment Analysis</TabsTrigger>
          <TabsTrigger value="saved">Saved Segments ({customSegments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatInteger(130)}</p>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatPercent(78.4)}</p>
                    <p className="text-sm text-muted-foreground">Avg Utilization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrencyAED(245000)}</p>
                    <p className="text-sm text-muted-foreground">Total Recovery Potential</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10">
                    <Lightbulb className="h-6 w-6 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{enhancedSegments.reduce((sum, s) => sum + s.recommendedActions.length, 0)}</p>
                    <p className="text-sm text-muted-foreground">Recommended Actions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Chart */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Segment Distribution
                <InfoTooltip formula="Employee count by segment category" dataSource="profiles + benefit_entitlements" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {segmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Segment Cards */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Segment Deep Dive</h3>
            {enhancedSegments.map((segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                onCreateAction={handleCreateActionPlan}
                isExpanded={expandedSegment === segment.id}
                onToggle={() => setExpandedSegment(
                  expandedSegment === segment.id ? null : segment.id
                )}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {customSegments.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No Custom Segments</h3>
                <p className="text-muted-foreground mb-4">
                  Create custom segments to track specific employee groups
                </p>
                <Button onClick={() => setIsBuilderOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Segment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Custom Segments</h3>
                <Button variant="outline" size="sm" onClick={() => setIsBuilderOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customSegments.map((segment) => (
                  <SavedSegmentCard key={segment.id} segment={segment} />
                ))}
              </div>

              {crossPortalEnabled && (
                <Card className="border-2 border-dashed border-violet-500/30 bg-violet-500/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-violet-500/10">
                        <Sparkles className="h-6 w-6 text-violet-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Cross-Portal Ready</h4>
                        <p className="text-sm text-muted-foreground">
                          Segments with nudges or targeting enabled will automatically sync to Employee and Marketplace portals
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Segment Builder Sheet */}
      <SegmentBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onSave={handleSaveSegment}
        crossPortalEnabled={crossPortalEnabled}
      />
    </div>
    </PageConfidenceGate>
  );
}
