/**
 * Policy Insights Tab Content
 * 
 * Embedded version of PolicyInsights for use within the Policies page tabs.
 * Contains hotspots, clarity scoring, and fix prioritization.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  PolicyHotspotDrawer,
  PolicyQuestionRow,
  PolicyFixCard,
  ConfidenceDetailsDrawer,
  UnifiedActionModal,
} from '@/components/employer';
import type { ConfusingArea, PolicyQuestion, PolicyFix, PolicyInsightPrefill } from '@/components/employer';
import { ConfidenceBadge, MetricEvidenceTrigger, createMetricEvidenceData } from '@/components/shared';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmployerActions } from '@/hooks/useEmployerActions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data (same as PolicyInsights page)
const clarityData = {
  overallScore: 68,
  target: 85,
  lastRefreshed: new Date(Date.now() - 1000 * 60 * 30),
  confidence: 'estimated' as const,
  dataCompleteness: 79,
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
    ],
    impactEstimates: { questionsPerMonth: 18, estimatedRejections: 12, estimatedCost: 35000, confidence: 'measured' },
  },
];

const policyQuestions: PolicyQuestion[] = [
  { id: 'q1', question: 'Is Coursera eligible for L&D reimbursement?', count: 45, category: 'Learning', policyId: 'ld-policy-001', policyName: 'L&D Policy', clause: 'Section 3.2', suggestedAnswer: 'Yes, Coursera Professional Certificates are eligible.', policyCitation: 'Per L&D Policy v2, Section 3.2', status: 'answered', confidence: 'measured', department: 'Engineering', createdAt: new Date() },
  { id: 'q2', question: 'How do I get pre-authorization for dental?', count: 38, category: 'Health', policyId: 'health-policy-001', policyName: 'Health Policy', clause: 'Section 5.1', suggestedAnswer: 'Submit pre-auth request 48 hours before procedure.', policyCitation: 'Per Health Policy v3, Section 5.1', status: 'needs_review', confidence: 'estimated', slaHours: 24, createdAt: new Date() },
];

const quickWinFixes: PolicyFix[] = [
  { id: 'f1', policy: 'L&D Policy', policyId: 'ld-001', fix: 'Add Coursera/Udemy to approved provider list', effort: 'low', timeToImplement: '1 hour', ownerRole: 'HR Ops', expectedImpact: { questionsReduction: 40, costAvoidance: 15000 }, confidence: 'measured', type: 'quick_win', isLinkedToAction: false },
  { id: 'f2', policy: 'Health Policy', policyId: 'health-001', fix: 'Add pre-auth flowchart to policy page', effort: 'low', timeToImplement: '2 hours', ownerRole: 'HR Ops', expectedImpact: { questionsReduction: 50, rejectionsReduction: 30 }, confidence: 'estimated', type: 'quick_win', isLinkedToAction: false },
];

export function PolicyInsightsTabContent() {
  const navigate = useNavigate();
  const { createAction, owners } = useEmployerActions();
  
  const [selectedHotspot, setSelectedHotspot] = useState<ConfusingArea | null>(null);
  const [confidenceDrawerOpen, setConfidenceDrawerOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionPrefill, setActionPrefill] = useState<PolicyInsightPrefill | undefined>();
  const [confidenceFilter, setConfidenceFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [activeTab, setActiveTab] = useState('hotspots');

  const filteredHotspots = confusingAreas.filter(area => {
    if (confidenceFilter === 'all') return true;
    if (confidenceFilter === 'high') return area.confidence === 'measured';
    if (confidenceFilter === 'medium') return area.confidence === 'estimated';
    if (confidenceFilter === 'low') return area.confidence === 'proxy';
    return true;
  });

  const handleCreateActionFromFix = (fix: PolicyFix) => {
    setActionPrefill({
      type: 'policy_insight',
      policyName: fix.policy,
      policyRef: fix.id,
      recommendedFix: fix.fix,
      confidenceLevel: fix.confidence === 'measured' ? 'high' : fix.confidence === 'estimated' ? 'medium' : 'low',
    });
    setActionModalOpen(true);
  };

  const handleActionCreate = (action: any) => {
    createAction(action);
    toast.success('Action created in Benefits Action Plan', {
      action: { label: 'View', onClick: () => navigate('/employer/actions') }
    });
  };

  const clarityScoreColor = clarityData.overallScore >= 80 ? 'text-green-600' : clarityData.overallScore >= 60 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="space-y-6">
      {/* Clarity Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Policy Clarity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-2">
              <span className={cn("text-4xl font-bold tabular-nums", clarityScoreColor)}>
                {clarityData.overallScore}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Target: {clarityData.target}%
              </p>
              <Progress value={clarityData.overallScore} className="mt-3" />
            </div>
          </CardContent>
        </Card>

        {clarityData.drivers.slice(0, 3).map((driver, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{driver.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{driver.value}</span>
                <span className="text-sm text-muted-foreground">{driver.unit}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs">
                {driver.trend === 'up' ? (
                  <TrendingUp className={cn("h-3 w-3", driver.isGoodUp ? "text-success" : "text-destructive")} />
                ) : driver.trend === 'down' ? (
                  <TrendingDown className={cn("h-3 w-3", !driver.isGoodUp ? "text-success" : "text-destructive")} />
                ) : null}
                <span className="text-muted-foreground">{driver.impactNote}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="hotspots" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Confusion Hotspots
            </TabsTrigger>
            <TabsTrigger value="fixes" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Wins
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Employee Questions
            </TabsTrigger>
          </TabsList>

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
        </div>

        <TabsContent value="hotspots" className="mt-4 space-y-4">
          {filteredHotspots.map((area) => (
            <Card 
              key={area.id} 
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setSelectedHotspot(area)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={area.severity === 'critical' ? 'destructive' : area.severity === 'high' ? 'default' : 'secondary'}>
                        {area.severity}
                      </Badge>
                      <span className="font-medium">{area.policyName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{area.clause}</p>
                    <p className="text-sm mt-2">{area.recommendedFix}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold tabular-nums">{area.clarityScore}%</p>
                    <p className="text-xs text-muted-foreground">Clarity</p>
                    <p className="text-xs text-warning mt-1">{area.questionCount} questions/mo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="fixes" className="mt-4 space-y-4">
          {quickWinFixes.map((fix) => (
            <Card key={fix.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        Quick Win
                      </Badge>
                      <span className="text-sm text-muted-foreground">{fix.policy}</span>
                    </div>
                    <p className="font-medium">{fix.fix}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>⏱️ {fix.timeToImplement}</span>
                      <span>👤 {fix.ownerRole}</span>
                      {fix.expectedImpact.questionsReduction && (
                        <span className="text-success">↓{fix.expectedImpact.questionsReduction}% questions</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleCreateActionFromFix(fix)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="questions" className="mt-4 space-y-4">
          {policyQuestions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={q.status === 'answered' ? 'outline' : q.status === 'needs_review' ? 'default' : 'secondary'}>
                        {q.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{q.category}</span>
                    </div>
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">{q.suggestedAnswer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold tabular-nums">{q.count}</p>
                    <p className="text-xs text-muted-foreground">asks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Hotspot Drawer */}
      {selectedHotspot && (
        <PolicyHotspotDrawer
          open={!!selectedHotspot}
          onOpenChange={(open) => !open && setSelectedHotspot(null)}
          hotspot={selectedHotspot}
          onCreateAction={(hotspot, fix) => {
            setActionPrefill({
              type: 'policy_insight',
              policyName: hotspot.policyName,
              policyRef: hotspot.id,
              section: hotspot.clause,
              recommendedFix: fix.fix,
              confidenceLevel: hotspot.confidence === 'measured' ? 'high' : 'medium',
            });
            setActionModalOpen(true);
            setSelectedHotspot(null);
          }}
          onViewPolicy={(policyId, clause) => {
            navigate(`/employer/policies?policy=${policyId}&clause=${encodeURIComponent(clause)}`);
          }}
        />
      )}

      {/* Action Modal */}
      <UnifiedActionModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        prefill={actionPrefill}
        onCreate={handleActionCreate}
        owners={owners}
      />
    </div>
  );
}
