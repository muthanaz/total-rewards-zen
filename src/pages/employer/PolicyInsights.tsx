import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  HelpCircle,
  ExternalLink,
  Plus,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
  Download,
  Filter,
  Search,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics,
  PolicyHotspotDrawer,
  PolicyQuestionRow,
  PolicyFixCard
} from '@/components/employer';
import type { ConfusingArea, PolicyQuestion, PolicyFix } from '@/components/employer';
import { ConfidenceBadge } from '@/components/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmployerActions } from '@/hooks/useEmployerActions';
import { toast } from 'sonner';

// Enhanced mock data
const clarityData = {
  overallScore: 68,
  target: 85,
  lastRefreshed: new Date(Date.now() - 1000 * 60 * 30),
  confidence: 'estimated' as const,
  drivers: [
    { label: 'Question Volume', value: 42, target: 20, trend: 'up' as const, trendValue: 15, unit: '/month', impactNote: '↑ questions correlates with 12% higher rejection risk', isGoodUp: false },
    { label: 'Resolution Time', value: 2.3, target: 1.0, trend: 'down' as const, trendValue: 8, unit: ' days', impactNote: 'Longer resolution = lower satisfaction', isGoodUp: false },
    { label: 'Rejection Rate', value: 12, target: 5, trend: 'up' as const, trendValue: 3, unit: '%', impactNote: 'Policy confusion drives 60% of rejections', isGoodUp: false },
    { label: 'Missing Docs', value: 28, target: 10, trend: 'stable' as const, trendValue: 0, unit: '%', impactNote: 'Unclear requirements cause 28% incomplete claims', isGoodUp: false },
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
];

const policyQuestions: PolicyQuestion[] = [
  { id: 'q1', question: 'Is Coursera eligible for L&D reimbursement?', count: 45, category: 'Learning', policyId: 'ld-policy-001', policyName: 'L&D Policy', clause: 'Section 3.2', suggestedAnswer: 'Yes, Coursera Professional Certificates and Coursera for Business courses are eligible. Individual courses require manager pre-approval if over AED 500.', policyCitation: 'Per L&D Policy v2, Section 3.2: "Online learning platforms including Coursera, LinkedIn Learning, and Udemy are approved providers..."', status: 'answered', confidence: 'measured', department: 'Engineering', createdAt: new Date() },
  { id: 'q2', question: 'How do I get pre-authorization for a dental procedure?', count: 38, category: 'Health', policyId: 'health-policy-001', policyName: 'Health Policy', clause: 'Section 5.1', suggestedAnswer: 'Submit pre-auth request through the insurance portal 48 hours before the procedure.', policyCitation: 'Per Health Policy v3, Section 5.1: "Pre-authorization is required for procedures exceeding AED 1,000..."', status: 'needs_review', confidence: 'estimated', slaHours: 24, createdAt: new Date() },
  { id: 'q3', question: 'Can I use my housing allowance for hotel stays while apartment hunting?', count: 28, category: 'Housing', policyId: 'housing-policy-001', policyName: 'Housing Policy', clause: 'Section 1.4', suggestedAnswer: 'Temporary accommodation is covered for up to 30 days during the initial relocation period.', policyCitation: 'Per Housing Policy v4, Section 1.4: "Temporary accommodation allowance of up to AED 10,000..."', status: 'unanswered', confidence: 'proxy', slaHours: 8, createdAt: new Date() },
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
  const { isExecutive } = useEmployerViewMode();
  const coverageMetrics = useDataCoverageMetrics();
  const { createAction } = useEmployerActions();
  
  const [selectedHotspot, setSelectedHotspot] = useState<ConfusingArea | null>(null);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'answered' | 'needs_review' | 'unanswered'>('all');
  const [questionSearch, setQuestionSearch] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high'>('all');

  const filteredQuestions = policyQuestions.filter(q => {
    if (questionFilter !== 'all' && q.status !== questionFilter) return false;
    if (questionSearch && !q.question.toLowerCase().includes(questionSearch.toLowerCase())) return false;
    return true;
  });

  const handleCreateActionFromHotspot = (hotspot: ConfusingArea, fix: ConfusingArea['suggestedFixes'][0]) => {
    createAction({
      title: fix.fix,
      description: `Fix policy confusion in ${hotspot.policyName} - ${hotspot.clause}. Root cause: ${hotspot.rootCauses[0]?.cause || 'Policy clarity issue'}`,
      type: 'policy',
      priority: hotspot.severity === 'critical' ? 'P0' : 'P1',
      sourceType: 'policies',
      sourceRefId: hotspot.id,
      linkedCategories: [hotspot.policyName.replace(' Policy', '')],
      expectedImpact: { costAvoidance: hotspot.impactEstimates.estimatedCost },
      confidence: hotspot.confidence === 'measured' ? 'high' : hotspot.confidence === 'estimated' ? 'medium' : 'low',
    });
    toast.success('Action created in Benefits Action Plan', {
      action: { label: 'View', onClick: () => navigate('/employer/recommendations') }
    });
  };

  const handleCreateActionFromFix = (fix: PolicyFix) => {
    createAction({
      title: fix.fix,
      description: `Policy improvement for ${fix.policy}`,
      type: 'policy',
      priority: fix.effort === 'low' ? 'P1' : 'P2',
      sourceType: 'policies',
      sourceRefId: fix.id,
      linkedCategories: [fix.policy.replace(' Policy', '')],
      expectedImpact: { costAvoidance: fix.expectedImpact.costAvoidance },
      confidence: fix.confidence === 'measured' ? 'high' : fix.confidence === 'estimated' ? 'medium' : 'low',
    });
    toast.success('Added to Action Plan');
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
            <DataConfidenceBadge metrics={coverageMetrics} />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/employer/recommendations?create=true&source=policies')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Action
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <EmployerGlobalFiltersBar />
        <div className="flex flex-wrap gap-2">
          <Select value={confidenceFilter} onValueChange={(v) => setConfidenceFilter(v as any)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High Confidence Only</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="latest">
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Policy Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              <SelectItem value="latest">Latest Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Executive Summary */}
        <Card className="card-elevated overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-r border-border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Policy Clarity Score</h2>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Weighted average: Question volume (30%), Resolution time (20%), Rejection rate (30%), Missing docs (20%)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-end gap-3 mb-3">
                <span className={`text-5xl font-bold ${clarityScoreColor}`}>{clarityData.overallScore}</span>
                <span className="text-2xl text-muted-foreground mb-1">/ 100</span>
                <ConfidenceBadge level={clarityData.confidence} size="sm" />
              </div>
              <Progress value={clarityData.overallScore} className="h-3 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target: {clarityData.target}</span>
                <span className="text-red-500">{clarityData.target - clarityData.overallScore} pts to target</span>
              </div>
            </div>
            <div className="md:col-span-2 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">What's Driving the Score</h3>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Updated 30m ago
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {clarityData.drivers.map((driver, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{driver.label}</span>
                      <div className="flex items-center gap-1">
                        {driver.trend === 'up' && <TrendingUp className={`w-3.5 h-3.5 ${driver.isGoodUp ? 'text-green-500' : 'text-red-500'}`} />}
                        {driver.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-green-500" />}
                        {driver.trendValue !== 0 && <span className={`text-xs ${driver.value > driver.target ? 'text-red-500' : 'text-green-500'}`}>{driver.trendValue > 0 ? '+' : ''}{driver.trendValue}%</span>}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-bold ${driver.value > driver.target ? 'text-red-500' : 'text-green-600'}`}>{driver.value}{driver.unit}</span>
                      <span className="text-xs text-muted-foreground">vs {driver.target} target</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{driver.impactNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="hotspots" className="space-y-4">
          <TabsList>
            <TabsTrigger value="hotspots" className="gap-1.5"><AlertTriangle className="w-4 h-4" />Confusion Hotspots</TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5"><MessageSquare className="w-4 h-4" />Employee Questions</TabsTrigger>
            <TabsTrigger value="fixes" className="gap-1.5"><Zap className="w-4 h-4" />Quick Fixes</TabsTrigger>
          </TabsList>

          {/* Hotspots Tab */}
          <TabsContent value="hotspots" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Top Confusing Policy Areas</CardTitle>
                <CardDescription>Ranked by question volume × drop-off rate. Click to view evidence and create actions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {confusingAreas.map((area, index) => (
                  <div key={area.id} className={`p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors ${area.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' : area.severity === 'high' ? 'bg-orange-500/5 border-orange-500/30' : 'bg-amber-500/5 border-amber-500/30'}`} onClick={() => setSelectedHotspot(area)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${area.severity === 'critical' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'}`}>{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 className="font-semibold">{area.policyName}</h3>
                            <Badge variant="outline" className="text-xs">v{area.policyVersion}</Badge>
                            <Badge className={`${area.severity === 'critical' ? 'bg-red-500/10 text-red-600 border-red-500/30' : 'bg-amber-500/10 text-amber-600 border-amber-500/30'}`}>{area.severity === 'critical' ? 'Critical' : 'High'}</Badge>
                            <ConfidenceBadge level={area.confidence} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{area.clause}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-muted-foreground">Clarity:</span> <span className={area.clarityScore < 50 ? 'text-red-500' : 'text-amber-600'}>{area.clarityScore}%</span></div>
                            <div><span className="text-muted-foreground">Questions:</span> <span className="text-primary">{area.questionCount}/mo</span></div>
                            <div><span className="text-muted-foreground">Drop-off:</span> <span className="text-red-500">{area.dropOffRate}%</span></div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {area.whatUsersAsk.slice(0, 3).map((q, i) => <Badge key={i} variant="secondary" className="text-xs">"{q}"</Badge>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedHotspot(area); }}>View evidence</Button>
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleCreateActionFromHotspot(area, area.suggestedFixes[0]); }}><Plus className="w-3.5 h-3.5 mr-1" />Create Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" />Employee Questions</CardTitle>
                    <CardDescription>Triage and respond to policy questions. Approved answers publish to Knowledge Center.</CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search questions..." className="pl-8 h-9" value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} />
                  </div>
                  <Select value={questionFilter} onValueChange={(v) => setQuestionFilter(v as any)}>
                    <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
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
                  <div className="text-center py-8 text-muted-foreground">No questions match your filters</div>
                ) : (
                  filteredQuestions.map((q, i) => (
                    <PolicyQuestionRow
                      key={q.id}
                      question={q}
                      index={i}
                      onApproveAnswer={(id, answer) => toast.success('Answer approved')}
                      onEditAnswer={(id, answer) => toast.success('Answer saved')}
                      onCreateArticle={(q) => toast.success('Article draft created')}
                      onCreateAction={(q) => {
                        createAction({ title: `Answer: ${q.question.substring(0, 50)}...`, description: `Create standardized answer for frequently asked question`, type: 'comms', priority: 'P2', sourceType: 'policies', linkedCategories: [q.category] });
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
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600"><Zap className="w-5 h-5" />Quick Wins</CardTitle>
                  <CardDescription>Fixes that can be implemented within a week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickWinFixes.map(fix => <PolicyFixCard key={fix.id} fix={fix} variant="quick_win" onAddToActionPlan={handleCreateActionFromFix} onViewAction={(id) => navigate(`/employer/recommendations?action=${id}`)} />)}
                </CardContent>
              </Card>
              <Card className="card-elevated border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600"><Target className="w-5 h-5" />Strategic Improvements</CardTitle>
                  <CardDescription>Larger initiatives with significant impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {strategicFixes.map(fix => <PolicyFixCard key={fix.id} fix={fix} variant="strategic" onAddToActionPlan={handleCreateActionFromFix} onViewAction={(id) => navigate(`/employer/recommendations?action=${id}`)} />)}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hotspot Drawer */}
        <PolicyHotspotDrawer
          open={!!selectedHotspot}
          onOpenChange={(open) => !open && setSelectedHotspot(null)}
          hotspot={selectedHotspot}
          onCreateAction={handleCreateActionFromHotspot}
          onViewPolicy={(id, clause) => navigate(`/employer/policies?policy=${id}`)}
        />
      </div>
    </PageConfidenceGate>
  );
}
