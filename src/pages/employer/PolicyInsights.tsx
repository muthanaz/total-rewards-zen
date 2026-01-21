import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  AlertTriangle, 
  Lightbulb,
  Plus,
  Target,
  Zap,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Info,
  FileDown
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  PolicyHotspotDrawer,
  PolicyQuestionRow,
  PolicyFixCard,
  ConfidenceDetailsDrawer
} from '@/components/employer';
import type { ConfusingArea, PolicyQuestion, PolicyFix } from '@/components/employer';
import { ConfidenceBadge } from '@/components/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmployerActions } from '@/hooks/useEmployerActions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Enhanced mock data
const clarityData = {
  overallScore: 68,
  target: 85,
  lastRefreshed: new Date(Date.now() - 1000 * 60 * 30),
  confidence: 'estimated' as 'measured' | 'estimated' | 'proxy',
  dataCompleteness: 79,
  drivers: [
    { 
      label: 'Question Volume', 
      value: 42, 
      target: 20, 
      trend: 'up' as const, 
      trendValue: 15, 
      unit: '/month', 
      impactNote: '↑ questions correlates with 12% higher rejection risk', 
      isGoodUp: false 
    },
    { 
      label: 'Resolution Time', 
      value: 2.3, 
      target: 1.0, 
      trend: 'down' as const, 
      trendValue: 8, 
      unit: ' days', 
      impactNote: 'Longer resolution = lower satisfaction', 
      isGoodUp: false 
    },
    { 
      label: 'Rejection Rate', 
      value: 12, 
      target: 5, 
      trend: 'up' as const, 
      trendValue: 3, 
      unit: '%', 
      impactNote: 'Policy confusion drives 60% of rejections', 
      isGoodUp: false 
    },
    { 
      label: 'Missing Docs', 
      value: 28, 
      target: 10, 
      trend: 'stable' as const, 
      trendValue: 0, 
      unit: '%', 
      impactNote: 'Unclear requirements cause 28% incomplete claims', 
      isGoodUp: false 
    },
  ],
};

const confusingAreas: ConfusingArea[] = [
  {
    id: '1',
    policyName: 'Learning & Development Policy',
    policyId: 'ld-policy-001',
    policyVersion: 2,
    clause: 'Section 3.2: Eligible Course Providers',
    clarityScore: 45,
    questionCount: 32,
    dropOffRate: 67,
    whatUsersAsk: ['Is Coursera/Udemy covered?', 'Can I use L&D budget for conferences?', 'What about professional certifications?'],
    whereTheyDropOff: 'Policy page → Claim form → Provider selection (67% abandon)',
    recommendedFix: 'Add explicit approved provider list with examples',
    severity: 'critical',
    confidence: 'estimated',
    dataSources: ['HR Tickets', 'Claim Analytics', 'Survey Data'],
    rootCauses: [
      { cause: 'Ambiguous provider list', evidence: '32 questions about Coursera/Udemy eligibility', impact: 'Employees avoid claiming, reducing utilization by ~20%' },
      { cause: 'Missing examples', evidence: 'No sample scenarios in policy', impact: 'Uncertainty leads to 67% claim abandonment' },
    ],
    suggestedFixes: [
      { fix: 'Add Coursera/Udemy to approved provider list', effort: 'low', timeToImplement: '1 hour', expectedImpact: { questionsReduction: 40, rejectionsReduction: 15 } },
      { fix: 'Create decision tree for non-listed providers', effort: 'medium', timeToImplement: '2 days', expectedImpact: { questionsReduction: 25, utilizationUplift: 10 } },
    ],
    impactEstimates: { questionsPerMonth: 32, estimatedRejections: 8, estimatedCost: 45000, confidence: 'estimated' },
  },
  {
    id: '2',
    policyName: 'Health Insurance Policy',
    policyId: 'health-policy-001',
    policyVersion: 3,
    clause: 'Section 5.1: Pre-Authorization Requirements',
    clarityScore: 58,
    questionCount: 18,
    dropOffRate: 45,
    whatUsersAsk: ['Which treatments need pre-approval?', 'How long does pre-approval take?', 'What if I skip pre-approval?'],
    whereTheyDropOff: 'Pre-auth check → Form submission (45% submit without pre-auth)',
    recommendedFix: 'Add pre-auth checker widget',
    severity: 'high',
    confidence: 'measured',
    dataSources: ['Claims Portal', 'Insurance API', 'HR Tickets'],
    rootCauses: [
      { cause: 'No treatment list', evidence: '18 questions about which procedures need pre-auth', impact: '45% submit claims without pre-auth, causing rejections' },
    ],
    suggestedFixes: [
      { fix: 'Add pre-auth flowchart to policy page', effort: 'low', timeToImplement: '2 hours', expectedImpact: { questionsReduction: 50, rejectionsReduction: 30 } },
      { fix: 'Build pre-auth checker widget', effort: 'high', timeToImplement: '2 weeks', expectedImpact: { questionsReduction: 70, rejectionsReduction: 50, cycleTimeReduction: 20 } },
    ],
    impactEstimates: { questionsPerMonth: 18, estimatedRejections: 12, estimatedCost: 35000, confidence: 'measured' },
  },
  {
    id: '3',
    policyName: 'Transport Allowance Policy',
    policyId: 'transport-policy-001',
    policyVersion: 1,
    clause: 'Section 2.3: Eligible Expenses',
    clarityScore: 72,
    questionCount: 8,
    dropOffRate: 22,
    whatUsersAsk: ['Is ride-sharing covered?', 'Can I claim parking fees?', 'What about fuel receipts?'],
    whereTheyDropOff: 'Expense category selection (22% select wrong category)',
    recommendedFix: 'Improve expense category picker',
    severity: 'medium',
    confidence: 'estimated',
    dataSources: ['Expense Portal', 'HR Tickets'],
    rootCauses: [
      { cause: 'Unclear categories', evidence: '22% of claims use wrong expense type', impact: 'Manual reclassification adds 2 days to processing' },
    ],
    suggestedFixes: [
      { fix: 'Add expense type examples with icons', effort: 'low', timeToImplement: '4 hours', expectedImpact: { questionsReduction: 30, cycleTimeReduction: 15 } },
    ],
    impactEstimates: { questionsPerMonth: 8, estimatedRejections: 3, estimatedCost: 12000, confidence: 'estimated' },
  },
];

const policyQuestions: PolicyQuestion[] = [
  { id: 'q1', question: 'Is Coursera eligible for L&D reimbursement?', count: 45, category: 'Learning', policyId: 'ld-policy-001', policyName: 'L&D Policy', clause: 'Section 3.2', suggestedAnswer: 'Yes, Coursera Professional Certificates and Coursera for Business courses are eligible. Individual courses require manager pre-approval if over AED 500.', policyCitation: 'Per L&D Policy v2, Section 3.2: "Online learning platforms including Coursera, LinkedIn Learning, and Udemy are approved providers..."', status: 'answered', confidence: 'measured', department: 'Engineering', createdAt: new Date() },
  { id: 'q2', question: 'How do I get pre-authorization for a dental procedure?', count: 38, category: 'Health', policyId: 'health-policy-001', policyName: 'Health Policy', clause: 'Section 5.1', suggestedAnswer: 'Submit pre-auth request through the insurance portal 48 hours before the procedure.', policyCitation: 'Per Health Policy v3, Section 5.1: "Pre-authorization is required for procedures exceeding AED 1,000..."', status: 'needs_review', confidence: 'estimated', slaHours: 24, createdAt: new Date() },
  { id: 'q3', question: 'Can I use my housing allowance for hotel stays while apartment hunting?', count: 28, category: 'Housing', policyId: 'housing-policy-001', policyName: 'Housing Policy', clause: 'Section 1.4', suggestedAnswer: 'Temporary accommodation is covered for up to 30 days during the initial relocation period.', policyCitation: 'Per Housing Policy v4, Section 1.4: "Temporary accommodation allowance of up to AED 10,000..."', status: 'unanswered', confidence: 'proxy', slaHours: 8, createdAt: new Date() },
  { id: 'q4', question: 'What documents are needed for gym membership reimbursement?', count: 22, category: 'Wellbeing', policyId: 'wellbeing-policy-001', policyName: 'Wellbeing Policy', clause: 'Section 4.2', suggestedAnswer: 'Submit gym membership invoice, payment receipt, and signed membership agreement.', policyCitation: 'Per Wellbeing Policy v2, Section 4.2: "Required documents include..."', status: 'answered', confidence: 'measured', department: 'HR', createdAt: new Date() },
];

const quickWinFixes: PolicyFix[] = [
  { id: 'f1', policy: 'L&D Policy', policyId: 'ld-001', fix: 'Add Coursera/Udemy to approved provider list', effort: 'low', timeToImplement: '1 hour', ownerRole: 'HR Ops', expectedImpact: { questionsReduction: 40, costAvoidance: 15000 }, confidence: 'measured', type: 'quick_win', isLinkedToAction: false },
  { id: 'f2', policy: 'Health Policy', policyId: 'health-001', fix: 'Add pre-auth flowchart to policy page', effort: 'low', timeToImplement: '2 hours', ownerRole: 'HR Ops', expectedImpact: { questionsReduction: 50, rejectionsReduction: 30 }, confidence: 'estimated', type: 'quick_win', isLinkedToAction: false },
  { id: 'f3', policy: 'All Policies', policyId: 'all', fix: 'Add "Common Questions" section to each policy', effort: 'low', timeToImplement: '1 day', ownerRole: 'Policy Owner', expectedImpact: { questionsReduction: 15 }, confidence: 'proxy', type: 'quick_win', isLinkedToAction: true, linkedActionId: 'act-001' },
];

const strategicFixes: PolicyFix[] = [
  { id: 'f4', policy: 'Wellbeing Policy', policyId: 'wellbeing-001', fix: 'Redesign expense category picker with visual icons', effort: 'medium', timeToImplement: '1 week', ownerRole: 'IT + Policy', dependencies: ['Design approval'], expectedImpact: { questionsReduction: 58, utilizationUplift: 15, costAvoidance: 45000 }, confidence: 'estimated', type: 'strategic', isLinkedToAction: false },
  { id: 'f5', policy: 'Housing Policy', policyId: 'housing-001', fix: 'Build interactive top-up calculator', effort: 'high', timeToImplement: '2 weeks', ownerRole: 'IT', expectedImpact: { rejectionsReduction: 25, costAvoidance: 30000 }, confidence: 'estimated', type: 'strategic', isLinkedToAction: false },
  { id: 'f6', policy: 'All Policies', policyId: 'all', fix: 'Implement AI-powered policy Q&A chatbot', effort: 'high', timeToImplement: '1 month', ownerRole: 'IT + HR', dependencies: ['AI platform selection', 'Policy content audit'], expectedImpact: { questionsReduction: 40, cycleTimeReduction: 50, costAvoidance: 120000 }, confidence: 'proxy', type: 'strategic', isLinkedToAction: false },
];

export default function PolicyInsightsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isExecutive } = useEmployerViewMode();
  const coverageMetrics = useDataCoverageMetrics();
  const { createAction } = useEmployerActions();
  
  // State from URL params
  const [selectedHotspot, setSelectedHotspot] = useState<ConfusingArea | null>(null);
  const [confidenceDrawerOpen, setConfidenceDrawerOpen] = useState(false);
  
  // Filters with URL persistence
  const [questionFilter, setQuestionFilter] = useState<'all' | 'answered' | 'needs_review' | 'unanswered'>(
    (searchParams.get('questionStatus') as any) || 'all'
  );
  const [questionSearch, setQuestionSearch] = useState(searchParams.get('search') || '');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>(
    (searchParams.get('confidence') as any) || 'all'
  );
  const [latestOnly, setLatestOnly] = useState(searchParams.get('latestOnly') !== 'false');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'hotspots');

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (questionFilter !== 'all') params.set('questionStatus', questionFilter);
    if (questionSearch) params.set('search', questionSearch);
    if (confidenceFilter !== 'all') params.set('confidence', confidenceFilter);
    if (!latestOnly) params.set('latestOnly', 'false');
    if (activeTab !== 'hotspots') params.set('tab', activeTab);
    setSearchParams(params, { replace: true });
  }, [questionFilter, questionSearch, confidenceFilter, latestOnly, activeTab, setSearchParams]);

  // Filter hotspots by confidence
  const filteredHotspots = confusingAreas.filter(area => {
    if (confidenceFilter === 'all') return true;
    if (confidenceFilter === 'high') return area.confidence === 'measured';
    if (confidenceFilter === 'medium') return area.confidence === 'estimated';
    if (confidenceFilter === 'low') return area.confidence === 'proxy';
    return true;
  });

  const filteredQuestions = policyQuestions.filter(q => {
    if (questionFilter !== 'all' && q.status !== questionFilter) return false;
    if (questionSearch && !q.question.toLowerCase().includes(questionSearch.toLowerCase())) return false;
    return true;
  });

  const handleCreateActionFromHotspot = (hotspot: ConfusingArea, fix: ConfusingArea['suggestedFixes'][0]) => {
    const dueDate = new Date();
    if (fix.timeToImplement.includes('hour')) dueDate.setDate(dueDate.getDate() + 1);
    else if (fix.timeToImplement.includes('day')) dueDate.setDate(dueDate.getDate() + 3);
    else if (fix.timeToImplement.includes('week')) dueDate.setDate(dueDate.getDate() + 14);
    else dueDate.setDate(dueDate.getDate() + 30);

    createAction({
      title: fix.fix,
      description: `Fix policy confusion in ${hotspot.policyName} - ${hotspot.clause}. Root cause: ${hotspot.rootCauses[0]?.cause || 'Policy clarity issue'}`,
      type: 'policy',
      priority: hotspot.severity === 'critical' ? 'P0' : hotspot.severity === 'high' ? 'P1' : 'P2',
      sourceType: 'policies',
      sourceRefId: hotspot.id,
      linkedCategories: [hotspot.policyName.replace(' Policy', '')],
      expectedImpact: { 
        costAvoidance: hotspot.impactEstimates.estimatedCost,
      },
      confidence: hotspot.confidence === 'measured' ? 'high' : hotspot.confidence === 'estimated' ? 'medium' : 'low',
      dueDate,
    });
    toast.success('Action created in Benefits Action Plan', {
      action: { label: 'View', onClick: () => navigate('/employer/recommendations') }
    });
    setSelectedHotspot(null);
  };

  const handleCreateActionFromFix = (fix: PolicyFix) => {
    const dueDate = new Date();
    if (fix.timeToImplement.includes('hour')) dueDate.setDate(dueDate.getDate() + 1);
    else if (fix.timeToImplement.includes('day')) dueDate.setDate(dueDate.getDate() + 3);
    else if (fix.timeToImplement.includes('week')) dueDate.setDate(dueDate.getDate() + 14);
    else dueDate.setDate(dueDate.getDate() + 30);

    createAction({
      title: fix.fix,
      description: `Policy improvement for ${fix.policy}. Owner: ${fix.ownerRole}`,
      type: 'policy',
      priority: fix.effort === 'low' ? 'P1' : 'P2',
      sourceType: 'policies',
      sourceRefId: fix.id,
      linkedCategories: [fix.policy.replace(' Policy', '')],
      expectedImpact: { costAvoidance: fix.expectedImpact.costAvoidance },
      confidence: fix.confidence === 'measured' ? 'high' : fix.confidence === 'estimated' ? 'medium' : 'low',
      dueDate,
    });
    toast.success('Added to Action Plan', {
      action: { label: 'View', onClick: () => navigate('/employer/recommendations') }
    });
  };

  const handleExport = () => {
    // Generate CSV export
    const csvData = [
      ['Policy', 'Section', 'Severity', 'Clarity Score', 'Questions/Month', 'Drop-off Rate', 'Confidence'],
      ...filteredHotspots.map(h => [
        h.policyName,
        h.clause,
        h.severity,
        `${h.clarityScore}%`,
        h.questionCount.toString(),
        `${h.dropOffRate}%`,
        h.confidence,
      ]),
    ];
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-insights-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export downloaded');
  };

  const clarityScoreColor = clarityData.overallScore >= 80 ? 'text-green-600' : clarityData.overallScore >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Policy Insights</h1>
            <p className="text-muted-foreground">Policy effectiveness, employee friction, and fix prioritization</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Clickable Data Confidence Badge */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1.5 h-8"
              onClick={() => setConfidenceDrawerOpen(true)}
            >
              <Badge 
                variant="outline" 
                className="bg-amber-500/10 text-amber-600 border-amber-500/30 cursor-pointer hover:bg-amber-500/20"
              >
                {clarityData.dataCompleteness}% Estimated
              </Badge>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/employer/recommendations?create=true&source=policies')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Action
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={confidenceFilter} onValueChange={(v) => setConfidenceFilter(v as any)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <Filter className="h-3 w-3 mr-1.5" />
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High Only (Measured)</SelectItem>
              <SelectItem value="medium">Medium (Estimated)</SelectItem>
              <SelectItem value="low">Low (Proxy)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="latest-only" 
              checked={latestOnly} 
              onCheckedChange={setLatestOnly}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="latest-only" className="text-xs cursor-pointer">Latest versions only</Label>
          </div>

          {(confidenceFilter !== 'all' || !latestOnly) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => {
                setConfidenceFilter('all');
                setLatestOnly(true);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Executive Summary */}
        <Card className="card-elevated overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Policy Clarity Score */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-r border-border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Policy Clarity Score</h2>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs font-medium mb-1">Score Formula:</p>
                    <ul className="text-xs space-y-0.5">
                      <li>• Question Volume (30% weight)</li>
                      <li>• Resolution Time (20% weight)</li>
                      <li>• Rejection Rate (30% weight)</li>
                      <li>• Missing Docs Rate (20% weight)</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-end gap-3 mb-3">
                <span className={`text-5xl font-bold ${clarityScoreColor}`}>{clarityData.overallScore}</span>
                <span className="text-2xl text-muted-foreground mb-1">/ 100</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ConfidenceBadge level={clarityData.confidence} size="sm" />
                {clarityData.confidence !== 'measured' && (
                  <span className="text-[10px] text-muted-foreground">Data completeness: {clarityData.dataCompleteness}%</span>
                )}
              </div>
              <Progress value={clarityData.overallScore} className="h-3 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  Target: {clarityData.target}
                </span>
                <span className="text-red-500 font-medium">{clarityData.target - clarityData.overallScore} pts to target</span>
              </div>
            </div>
            
            {/* What's Driving the Score */}
            <div className="md:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">What's Driving the Score</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Updated 30m ago
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {clarityData.drivers.map((driver, i) => {
                  const isAboveTarget = driver.value > driver.target;
                  return (
                    <div key={i} className="p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{driver.label}</span>
                        <div className="flex items-center gap-1">
                          {driver.trend === 'up' && (
                            <TrendingUp className={`w-3.5 h-3.5 ${driver.isGoodUp ? 'text-green-500' : 'text-red-500'}`} />
                          )}
                          {driver.trend === 'down' && (
                            <TrendingDown className={`w-3.5 h-3.5 ${driver.isGoodUp ? 'text-red-500' : 'text-green-500'}`} />
                          )}
                          {driver.trendValue !== 0 && (
                            <span className={`text-xs ${isAboveTarget ? 'text-red-500' : 'text-green-500'}`}>
                              {driver.trendValue > 0 ? '+' : ''}{driver.trendValue}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg font-bold ${isAboveTarget ? 'text-red-500' : 'text-green-600'}`}>
                          {driver.value}{driver.unit}
                        </span>
                        <span className="text-xs text-muted-foreground">vs {driver.target} target</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{driver.impactNote}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="hotspots" className="gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Confusion Hotspots
                {filteredHotspots.filter(h => h.severity === 'critical').length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                  {filteredHotspots.filter(h => h.severity === 'critical').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Employee Questions
              {policyQuestions.filter(q => q.status === 'unanswered').length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {policyQuestions.filter(q => q.status === 'unanswered').length} new
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="fixes" className="gap-1.5">
              <Zap className="w-4 h-4" />
              Quick Fixes
            </TabsTrigger>
          </TabsList>

          {/* Hotspots Tab */}
          <TabsContent value="hotspots" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Top Confusing Policy Areas
                </CardTitle>
                <CardDescription>Ranked by question volume × drop-off rate. Click to view evidence and create actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredHotspots.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No hotspots match your filters</p>
                    <Button variant="link" size="sm" onClick={() => setConfidenceFilter('all')}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  filteredHotspots.map((area, index) => (
                    <div 
                      key={area.id} 
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors",
                        area.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' : 
                        area.severity === 'high' ? 'bg-orange-500/5 border-orange-500/30' : 
                        'bg-amber-500/5 border-amber-500/30'
                      )} 
                      onClick={() => setSelectedHotspot(area)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                            area.severity === 'critical' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h3 className="font-semibold">{area.policyName}</h3>
                              <Badge variant="outline" className="text-[10px]">v{area.policyVersion}</Badge>
                              <Badge className={cn(
                                "text-[10px]",
                                area.severity === 'critical' ? 'bg-red-500/10 text-red-600 border-red-500/30' : 
                                area.severity === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-500/30' :
                                'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              )}>
                                {area.severity === 'critical' ? 'Critical' : area.severity === 'high' ? 'High' : 'Medium'}
                              </Badge>
                              <ConfidenceBadge level={area.confidence} size="sm" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{area.clause}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-muted-foreground">Clarity:</span>{' '}
                                <span className={area.clarityScore < 50 ? 'text-red-500 font-medium' : 'text-amber-600'}>{area.clarityScore}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Questions:</span>{' '}
                                <span className="text-primary font-medium">{area.questionCount}/mo</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Drop-off:</span>{' '}
                                <span className="text-red-500 font-medium">{area.dropOffRate}%</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {area.whatUsersAsk.slice(0, 3).map((q, i) => (
                                <Badge key={i} variant="secondary" className="text-[10px] max-w-[180px] truncate">
                                  "{q}"
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); setSelectedHotspot(area); }}
                          >
                            View evidence
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={(e) => { e.stopPropagation(); handleCreateActionFromHotspot(area, area.suggestedFixes[0]); }}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Create Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Employee Questions
                    </CardTitle>
                    <CardDescription>Triage and respond to policy questions. Approved answers publish to Knowledge Center.</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search questions..." 
                      className="pl-8 h-9" 
                      value={questionSearch} 
                      onChange={(e) => setQuestionSearch(e.target.value)} 
                    />
                  </div>
                  <Select value={questionFilter} onValueChange={(v) => setQuestionFilter(v as any)}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unanswered">Unanswered</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">No questions match your filters</p>
                    <Button variant="link" size="sm" onClick={() => { setQuestionFilter('all'); setQuestionSearch(''); }}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  filteredQuestions.map((q, i) => (
                    <PolicyQuestionRow
                      key={q.id}
                      question={q}
                      index={i}
                      onApproveAnswer={(id, answer) => toast.success('Answer approved and published to Knowledge Center')}
                      onEditAnswer={(id, answer) => toast.success('Answer saved')}
                      onCreateArticle={(q) => toast.success('Knowledge article draft created')}
                      onCreateAction={(q) => {
                        createAction({ 
                          title: `Answer: ${q.question.substring(0, 50)}...`, 
                          description: `Create standardized answer for frequently asked question`, 
                          type: 'comms', 
                          priority: 'P2', 
                          sourceType: 'policies', 
                          linkedCategories: [q.category] 
                        });
                        toast.success('Action created');
                      }}
                      onViewPolicy={(id, clause) => navigate(`/employer/policies?policy=${id}`)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fixes Tab */}
          <TabsContent value="fixes" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="card-elevated border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    <Zap className="w-5 h-5" />
                    Quick Wins
                  </CardTitle>
                  <CardDescription>Fixes that can be implemented within a week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickWinFixes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No quick wins identified</p>
                    </div>
                  ) : (
                    quickWinFixes.map(fix => (
                      <PolicyFixCard 
                        key={fix.id} 
                        fix={fix} 
                        variant="quick_win" 
                        onAddToActionPlan={handleCreateActionFromFix} 
                        onViewAction={(id) => navigate(`/employer/recommendations?action=${id}`)} 
                      />
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="card-elevated border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                    <Target className="w-5 h-5" />
                    Strategic Improvements
                  </CardTitle>
                  <CardDescription>Larger initiatives with significant impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategicFixes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No strategic improvements identified</p>
                    </div>
                  ) : (
                    strategicFixes.map(fix => (
                      <PolicyFixCard 
                        key={fix.id} 
                        fix={fix} 
                        variant="strategic" 
                        onAddToActionPlan={handleCreateActionFromFix} 
                        onViewAction={(id) => navigate(`/employer/recommendations?action=${id}`)} 
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hotspot Evidence Drawer */}
        <PolicyHotspotDrawer
          open={!!selectedHotspot}
          onOpenChange={(open) => !open && setSelectedHotspot(null)}
          hotspot={selectedHotspot}
          onCreateAction={handleCreateActionFromHotspot}
          onViewPolicy={(id, clause) => navigate(`/employer/policies?policy=${id}`)}
        />

        {/* Data Confidence Drawer */}
        <ConfidenceDetailsDrawer
          open={confidenceDrawerOpen}
          onOpenChange={setConfidenceDrawerOpen}
          metrics={coverageMetrics}
        />
      </div>
    </PageConfidenceGate>
  );
}
