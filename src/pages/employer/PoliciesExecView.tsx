import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { 
  EmployerGlobalFiltersBar, 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics 
} from '@/components/employer';
import { PolicyInsightKPIGrid } from '@/components/employer/PolicyInsightKPIGrid';
import { PolicyAreaCard, PolicyAreaData } from '@/components/employer/PolicyAreaCard';
import { PolicyEvidenceDrawer, PolicyEvidence } from '@/components/employer/PolicyEvidenceDrawer';
import { CostOfConfusionCard } from '@/components/employer/CostOfConfusionCard';
import { toast } from 'sonner';

// Mock data for policy areas
const policyAreas: PolicyAreaData[] = [
  { 
    id: 'pol-1',
    policyName: 'Housing Allowance Policy', 
    clarityScore: 85, 
    targetScore: 90,
    questionsThisMonth: 3, 
    rejectionsThisMonth: 2,
    missingDocsCount: 5,
    unrealizedValue: 45000,
    status: 'good',
    topIssue: 'Top-up eligibility unclear',
    suggestedFixes: ['Clarify top-up eligibility', 'Add area-specific guidance']
  },
  { 
    id: 'pol-2',
    policyName: 'Health Insurance Policy', 
    clarityScore: 72, 
    targetScore: 85,
    questionsThisMonth: 8, 
    rejectionsThisMonth: 12,
    missingDocsCount: 18,
    unrealizedValue: 85000,
    status: 'warning',
    topIssue: 'Pre-approval process confusion',
    suggestedFixes: ['Simplify pre-approval process', 'Add dental coverage FAQ']
  },
  { 
    id: 'pol-3',
    policyName: 'Learning & Development Policy', 
    clarityScore: 58, 
    targetScore: 85,
    questionsThisMonth: 12, 
    rejectionsThisMonth: 15,
    missingDocsCount: 22,
    unrealizedValue: 130000,
    status: 'critical',
    topIssue: 'Eligible courses undefined',
    suggestedFixes: ['Define eligible courses', 'Add budget calculator']
  },
  { 
    id: 'pol-4',
    policyName: 'Leave Policy', 
    clarityScore: 90, 
    targetScore: 90,
    questionsThisMonth: 1, 
    rejectionsThisMonth: 0,
    missingDocsCount: 2,
    unrealizedValue: 0,
    status: 'good',
    topIssue: 'Carry-forward rules',
    suggestedFixes: ['Add carry-forward clarity']
  },
  { 
    id: 'pol-5',
    policyName: 'Wellbeing Program Policy', 
    clarityScore: 65, 
    targetScore: 80,
    questionsThisMonth: 6, 
    rejectionsThisMonth: 8,
    missingDocsCount: 12,
    unrealizedValue: 55000,
    status: 'warning',
    topIssue: 'Eligible activities unclear',
    suggestedFixes: ['List eligible activities', 'Simplify redemption']
  },
];

// Mock data for common questions
const commonQuestions = [
  { question: 'How do I claim dental expenses?', count: 45, category: 'Health' },
  { question: 'Can I top up my housing allowance?', count: 38, category: 'Housing' },
  { question: 'What courses are eligible for L&D budget?', count: 32, category: 'Learning' },
  { question: 'How does maternity leave work?', count: 28, category: 'Leave' },
];

// Generate evidence data for a policy
const generateEvidenceForPolicy = (policy: PolicyAreaData): PolicyEvidence => ({
  policyId: policy.id,
  policyName: policy.policyName,
  clarityScore: policy.clarityScore,
  targetScore: policy.targetScore,
  employeeQuestions: [
    { question: `What exactly counts as ${policy.policyName.split(' ')[0].toLowerCase()} expenses?`, count: 23, category: policy.policyName.split(' ')[0] },
    { question: `How long does ${policy.policyName.split(' ')[0].toLowerCase()} approval take?`, count: 18, category: policy.policyName.split(' ')[0] },
    { question: `Can I claim for family members under ${policy.policyName.split(' ')[0].toLowerCase()}?`, count: 14, category: policy.policyName.split(' ')[0] },
  ],
  rejectionReasons: [
    { reason: 'Missing supporting documents', count: Math.floor(policy.rejectionsThisMonth * 0.4), percentOfRejections: 40 },
    { reason: 'Exceeded policy limits', count: Math.floor(policy.rejectionsThisMonth * 0.35), percentOfRejections: 35 },
    { reason: 'Not eligible per policy terms', count: Math.floor(policy.rejectionsThisMonth * 0.25), percentOfRejections: 25 },
  ],
  missingDocs: [
    { docType: 'Original receipts', count: Math.floor(policy.missingDocsCount * 0.5), percentOfClaims: 15 },
    { docType: 'Pre-approval form', count: Math.floor(policy.missingDocsCount * 0.3), percentOfClaims: 9 },
    { docType: 'Provider certification', count: Math.floor(policy.missingDocsCount * 0.2), percentOfClaims: 6 },
  ],
  suggestedFixes: {
    policyText: {
      title: `Clarify ${policy.policyName} eligibility criteria`,
      description: `Update policy document to include clear examples, eligibility matrix, and FAQ section addressing top ${policy.questionsThisMonth} employee questions.`,
      expectedImpact: 35,
    },
    processDoc: {
      title: `Streamline ${policy.policyName} documentation process`,
      description: `Create pre-filled templates, auto-validation checklist, and clear doc requirements to reduce rejection rate.`,
      expectedImpact: 45,
    },
  },
  unrealizedValue: policy.unrealizedValue,
  affectedEmployees: Math.floor(policy.unrealizedValue / 5000),
});

export function PoliciesExecView() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyAreaData | null>(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceData, setEvidenceData] = useState<PolicyEvidence | null>(null);

  const handleViewEvidence = (policy: PolicyAreaData) => {
    const evidence = generateEvidenceForPolicy(policy);
    setEvidenceData(evidence);
    setSelectedPolicy(policy);
    setEvidenceDrawerOpen(true);
  };

  const handleQuickFix = (policy: PolicyAreaData) => {
    // Navigate to recommendations with prefilled action
    const prefillParams = new URLSearchParams({
      prefill: 'policy_insight',
      policyName: policy.policyName,
      policyId: policy.id,
      clarityScore: String(policy.clarityScore),
      unrealizedValue: String(policy.unrealizedValue),
    });
    navigate(`/employer/recommendations?${prefillParams.toString()}`);
    toast.success(`Creating action for ${policy.policyName}`);
  };

  const handleCreateActionFromEvidence = (fixType: 'policy_text' | 'process_doc', evidence: PolicyEvidence) => {
    const prefillParams = new URLSearchParams({
      prefill: 'policy_insight',
      policyName: evidence.policyName,
      policyId: evidence.policyId,
      clarityScore: String(evidence.clarityScore),
      unrealizedValue: String(evidence.unrealizedValue),
      fixType,
    });
    navigate(`/employer/recommendations?${prefillParams.toString()}`);
    setEvidenceDrawerOpen(false);
    toast.success(`Creating ${fixType === 'policy_text' ? 'policy text' : 'process/docs'} action`);
  };

  // Sort policies by status priority (critical first)
  const sortedPolicies = [...policyAreas].sort((a, b) => {
    const priority = { critical: 0, warning: 1, good: 2 };
    return priority[a.status] - priority[b.status];
  });

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Policy Risk & Clarity</h1>
            <p className="text-muted-foreground">Executive view of policy understanding gaps and fix opportunities</p>
          </div>
          <DataConfidenceBadge metrics={coverageMetrics} />
        </div>

        <EmployerGlobalFiltersBar />

        {/* Cost of Confusion - Executive-level financial impact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PolicyInsightKPIGrid />
          </div>
          <CostOfConfusionCard
            totalCost={315000}
            breakdown={[
              { 
                category: 'Unrealized Benefits', 
                amount: 185000, 
                percentOfTotal: 59, 
                description: 'Value left on table due to policy confusion' 
              },
              { 
                category: 'HR Time Spent', 
                amount: 78000, 
                percentOfTotal: 25, 
                description: 'Staff hours answering policy questions' 
              },
              { 
                category: 'Rejected Claims', 
                amount: 52000, 
                percentOfTotal: 16, 
                description: 'Claims rejected due to misunderstanding' 
              },
            ]}
            monthlyChange={-8.2}
          />
        </div>

        {/* Tabs for Policy Areas and Common Questions */}
        <Tabs defaultValue="areas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="areas">Top Confusing Policy Areas</TabsTrigger>
            <TabsTrigger value="questions">Common Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedPolicies.map((policy) => (
                <PolicyAreaCard
                  key={policy.id}
                  policy={policy}
                  onViewEvidence={handleViewEvidence}
                  onQuickFix={handleQuickFix}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commonQuestions.map((q, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{q.question}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{q.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{q.count} times</p>
                        <p className="text-xs text-muted-foreground">this month</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Action */}
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => {
                      const prefillParams = new URLSearchParams({
                        prefill: 'policy_insight',
                        policyName: 'FAQ Response',
                        type: 'comms',
                      });
                      navigate(`/employer/recommendations?${prefillParams.toString()}`);
                    }}
                  >
                    <Zap className="h-4 w-4" />
                    Create FAQ Response Action
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Evidence Drawer */}
        <PolicyEvidenceDrawer
          open={evidenceDrawerOpen}
          onOpenChange={setEvidenceDrawerOpen}
          evidence={evidenceData}
          onCreateAction={handleCreateActionFromEvidence}
        />
      </div>
    </PageConfidenceGate>
  );
}
