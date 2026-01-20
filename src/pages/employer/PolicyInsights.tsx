import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown,
  MessageSquare, 
  AlertTriangle, 
  Lightbulb,
  Clock,
  FileX,
  HelpCircle,
  ExternalLink,
  Plus,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';
import { toast } from 'sonner';

// Types for policy insights
interface ClarityDriver {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  description: string;
}

interface ConfusingArea {
  id: string;
  policyName: string;
  policyId: string;
  policyVersion: number;
  clause: string;
  clarityScore: number;
  questionCount: number;
  dropOffRate: number;
  whatUsersAsk: string[];
  whereTheyDropOff: string;
  recommendedFix: string;
  severity: 'critical' | 'warning' | 'info';
}

interface EmployeeQuestion {
  id: string;
  question: string;
  count: number;
  category: string;
  policyId: string;
  policyName: string;
  clause: string;
  suggestedAnswer: string;
  policyCitation: string;
  isAnswered: boolean;
}

interface PolicyClarityData {
  overallScore: number;
  target: number;
  drivers: ClarityDriver[];
  confusingAreas: ConfusingArea[];
  topQuestions: EmployeeQuestion[];
}

// Mock data with rich, actionable insights
const clarityData: PolicyClarityData = {
  overallScore: 68,
  target: 85,
  drivers: [
    { 
      label: 'Question Volume', 
      value: 42, 
      target: 20, 
      trend: 'up', 
      trendValue: 15,
      description: 'Monthly employee questions about policies'
    },
    { 
      label: 'Time to Resolution', 
      value: 2.3, 
      target: 1.0, 
      trend: 'down', 
      trendValue: 8,
      description: 'Average days to resolve policy questions'
    },
    { 
      label: 'Claim Rejection Rate', 
      value: 12, 
      target: 5, 
      trend: 'up', 
      trendValue: 3,
      description: 'Claims rejected due to policy misunderstanding'
    },
    { 
      label: 'Missing Docs Rate', 
      value: 28, 
      target: 10, 
      trend: 'stable', 
      trendValue: 0,
      description: 'Claims submitted with incomplete documentation'
    },
  ],
  confusingAreas: [
    {
      id: '1',
      policyName: 'Learning & Development Policy',
      policyId: 'ld-policy-001',
      policyVersion: 2,
      clause: 'Section 3.2: Eligible Course Providers',
      clarityScore: 45,
      questionCount: 32,
      dropOffRate: 67,
      whatUsersAsk: [
        'Is Coursera/Udemy covered?',
        'Can I use L&D budget for conferences?',
        'What about professional certifications?'
      ],
      whereTheyDropOff: 'Policy page → Claim form → Provider selection (67% abandon)',
      recommendedFix: 'Add explicit approved provider list with examples. Create decision tree for non-listed providers.',
      severity: 'critical'
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
      whatUsersAsk: [
        'Which treatments need pre-approval?',
        'How long does pre-approval take?',
        'What happens if I skip pre-approval?'
      ],
      whereTheyDropOff: 'Pre-auth check → Form submission (45% submit without pre-auth)',
      recommendedFix: 'Add pre-auth checker widget. Show real-time approval status. Auto-flag treatments requiring approval.',
      severity: 'warning'
    },
    {
      id: '3',
      policyName: 'Housing Allowance Policy',
      policyId: 'housing-policy-001',
      policyVersion: 4,
      clause: 'Section 2.3: Top-Up Eligibility',
      clarityScore: 72,
      questionCount: 12,
      dropOffRate: 25,
      whatUsersAsk: [
        'Can I top up if rent exceeds allowance?',
        'What percentage can I request?',
        'How often can I request top-up?'
      ],
      whereTheyDropOff: 'Top-up request page → Amount calculation (25% request wrong amounts)',
      recommendedFix: 'Add top-up calculator. Show example scenarios. Clarify annual vs one-time limits.',
      severity: 'info'
    },
    {
      id: '4',
      policyName: 'Wellbeing Program Policy',
      policyId: 'wellbeing-policy-001',
      policyVersion: 2,
      clause: 'Section 4.0: Reimbursement Process',
      clarityScore: 52,
      questionCount: 22,
      dropOffRate: 58,
      whatUsersAsk: [
        'What counts as a wellness expense?',
        'Can I claim gym memberships?',
        'How do I prove attendance?'
      ],
      whereTheyDropOff: 'Expense selection → Receipt upload (58% use wrong category)',
      recommendedFix: 'Add visual expense category picker. Pre-populate common wellness vendors. Accept digital receipts.',
      severity: 'warning'
    }
  ],
  topQuestions: [
    {
      id: 'q1',
      question: 'Is Coursera eligible for L&D reimbursement?',
      count: 45,
      category: 'Learning',
      policyId: 'ld-policy-001',
      policyName: 'Learning & Development Policy',
      clause: 'Section 3.2',
      suggestedAnswer: 'Yes, Coursera Professional Certificates and Coursera for Business courses are eligible. Individual courses require manager pre-approval if over AED 500.',
      policyCitation: 'Per L&D Policy v2, Section 3.2: "Online learning platforms including Coursera, LinkedIn Learning, and Udemy are approved providers..."',
      isAnswered: true
    },
    {
      id: 'q2',
      question: 'How do I get pre-authorization for a dental procedure?',
      count: 38,
      category: 'Health',
      policyId: 'health-policy-001',
      policyName: 'Health Insurance Policy',
      clause: 'Section 5.1',
      suggestedAnswer: 'Submit pre-auth request through the insurance portal 48 hours before the procedure. For emergencies, notify within 24 hours post-treatment.',
      policyCitation: 'Per Health Policy v3, Section 5.1: "Pre-authorization is required for procedures exceeding AED 1,000..."',
      isAnswered: true
    },
    {
      id: 'q3',
      question: 'Can I use my housing allowance for hotel stays while apartment hunting?',
      count: 28,
      category: 'Housing',
      policyId: 'housing-policy-001',
      policyName: 'Housing Allowance Policy',
      clause: 'Section 1.4',
      suggestedAnswer: 'Temporary accommodation is covered for up to 30 days during the initial relocation period. Submit hotel receipts with your onboarding request.',
      policyCitation: 'Per Housing Policy v4, Section 1.4: "Temporary accommodation allowance of up to AED 10,000 is provided during the initial 30-day settling period..."',
      isAnswered: false
    },
    {
      id: 'q4',
      question: 'What gym memberships are covered under Wellbeing?',
      count: 24,
      category: 'Wellbeing',
      policyId: 'wellbeing-policy-001',
      policyName: 'Wellbeing Program Policy',
      clause: 'Section 2.1',
      suggestedAnswer: 'Any gym membership is eligible up to AED 500/month. Premium memberships require itemized receipts. Personal training is covered up to 8 sessions/year.',
      policyCitation: 'Per Wellbeing Policy v2, Section 2.1: "Physical fitness expenses including gym memberships, fitness classes, and personal training..."',
      isAnswered: true
    },
    {
      id: 'q5',
      question: 'How do I claim for dependent school fees?',
      count: 22,
      category: 'Schooling',
      policyId: 'education-policy-001',
      policyName: 'Education Assistance Policy',
      clause: 'Section 2.2',
      suggestedAnswer: 'Submit the school invoice, registration confirmation, and dependent birth certificate. Claims are processed within 5 business days.',
      policyCitation: 'Per Education Policy v3, Section 2.2: "School fee reimbursement requires official invoice from accredited institution..."',
      isAnswered: false
    }
  ]
};

export default function PolicyInsightsPage() {
  const navigate = useNavigate();
  const { isExecutive } = useEmployerViewMode();
  const coverageMetrics = useDataCoverageMetrics();
  const [selectedArea, setSelectedArea] = useState<ConfusingArea | null>(null);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-600', icon: AlertTriangle };
      case 'warning':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', icon: AlertTriangle };
      case 'info':
        return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-600', icon: HelpCircle };
      default:
        return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', icon: HelpCircle };
    }
  };

  const handleCreateRecommendation = (area: ConfusingArea) => {
    // In a real app, this would create a recommendation in the database
    toast.success('Recommendation created', {
      description: `Added "${area.recommendedFix.substring(0, 50)}..." to Recommendations`,
      action: {
        label: 'View',
        onClick: () => navigate('/employer/recommendations')
      }
    });
  };

  const handleCreateQuestionRecommendation = (question: EmployeeQuestion) => {
    toast.success('FAQ recommendation created', {
      description: `Added standardized answer for "${question.question.substring(0, 40)}..."`,
      action: {
        label: 'View',
        onClick: () => navigate('/employer/recommendations')
      }
    });
  };

  const clarityScoreColor = clarityData.overallScore >= 80 
    ? 'text-green-600' 
    : clarityData.overallScore >= 60 
    ? 'text-amber-600' 
    : 'text-red-500';

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Policy Insights</h1>
            <p className="text-muted-foreground">
              {isExecutive 
                ? 'Strategic view of policy effectiveness and employee friction points'
                : 'Identify and fix policy confusion points to reduce HR tickets'}
            </p>
          </div>
          <DataConfidenceBadge metrics={coverageMetrics} />
        </div>

        <EmployerGlobalFiltersBar />

        {/* Policy Clarity Score - Hero Card */}
        <Card className="card-elevated overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Main Score */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-r border-border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Policy Clarity Score</h2>
                <Badge variant="outline" className="text-xs">Composite</Badge>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <span className={`text-5xl font-bold ${clarityScoreColor}`}>
                  {clarityData.overallScore}
                </span>
                <span className="text-2xl text-muted-foreground mb-1">/ 100</span>
              </div>
              <Progress value={clarityData.overallScore} className="h-3 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target: {clarityData.target}</span>
                <span className={clarityData.overallScore >= clarityData.target ? 'text-green-600' : 'text-red-500'}>
                  {clarityData.overallScore >= clarityData.target ? 'On Track' : `${clarityData.target - clarityData.overallScore} pts to target`}
                </span>
              </div>
            </div>

            {/* Clarity Drivers */}
            <div className="md:col-span-2 p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">What's Driving the Score</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {clarityData.drivers.map((driver, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{driver.label}</span>
                      <div className="flex items-center gap-1">
                        {driver.trend === 'up' && driver.value > driver.target && (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        )}
                        {driver.trend === 'up' && driver.value <= driver.target && (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                        {driver.trend === 'down' && (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        {driver.trendValue !== 0 && (
                          <span className={`text-xs ${driver.value > driver.target ? 'text-red-500' : 'text-green-500'}`}>
                            {driver.trendValue > 0 ? '+' : ''}{driver.trendValue}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-bold ${driver.value > driver.target ? 'text-red-500' : 'text-green-600'}`}>
                        {driver.value}{driver.label.includes('Rate') || driver.label.includes('Volume') ? '' : ' days'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {driver.target} target
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{driver.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="confusion" className="space-y-4">
          <TabsList>
            <TabsTrigger value="confusion" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Confusion Hotspots
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Employee Questions
            </TabsTrigger>
            <TabsTrigger value="fixes" className="gap-2">
              <Zap className="w-4 h-4" />
              Quick Fixes
            </TabsTrigger>
          </TabsList>

          {/* Confusion Hotspots Tab */}
          <TabsContent value="confusion" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Top Confusing Policy Areas
                </CardTitle>
                <CardDescription>
                  Ranked by question volume × drop-off rate. Each links to specific policy clause.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clarityData.confusingAreas.map((area, index) => {
                  const styles = getSeverityStyles(area.severity);
                  const IconComponent = styles.icon;
                  
                  return (
                    <div 
                      key={area.id} 
                      className={`p-4 rounded-lg border ${styles.border} ${styles.bg}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${styles.text} bg-background`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h3 className="font-semibold">{area.policyName}</h3>
                              <Badge variant="outline" className="text-xs">
                                v{area.policyVersion}
                              </Badge>
                              <Badge className={`${styles.bg} ${styles.text} border ${styles.border}`}>
                                {area.severity === 'critical' ? 'Critical' : area.severity === 'warning' ? 'Needs Attention' : 'Monitor'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <FileText className="w-4 h-4" />
                              <span>{area.clause}</span>
                              <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                                View in policy <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </div>

                            {/* Metrics Row */}
                            <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-background/50">
                              <div>
                                <p className="text-xs text-muted-foreground">Clarity Score</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={area.clarityScore} className="w-12 h-2" />
                                  <span className={`font-medium ${area.clarityScore < 50 ? 'text-red-500' : area.clarityScore < 70 ? 'text-amber-600' : 'text-green-600'}`}>
                                    {area.clarityScore}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Questions/Month</p>
                                <p className="font-medium text-primary">{area.questionCount}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Drop-off Rate</p>
                                <p className={`font-medium ${area.dropOffRate > 50 ? 'text-red-500' : 'text-amber-600'}`}>
                                  {area.dropOffRate}%
                                </p>
                              </div>
                            </div>

                            {/* Insight Details */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">What Users Ask</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {area.whatUsersAsk.map((q, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                                      "{q}"
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Where They Drop Off</p>
                                <p className="text-sm">{area.whereTheyDropOff}</p>
                              </div>
                              
                              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                                  <Lightbulb className="w-3 h-3" />
                                  Recommended Fix
                                </p>
                                <p className="text-sm">{area.recommendedFix}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateRecommendation(area)}
                          className="shrink-0"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Action
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee Questions Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Top Employee Questions
                </CardTitle>
                <CardDescription>
                  Question clusters from Knowledge Hub and HR tickets, with suggested policy-cited answers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {clarityData.topQuestions.map((q, index) => (
                  <div key={q.id} className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h4 className="font-medium">{q.question}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">{q.category}</Badge>
                              <span>•</span>
                              <span className="font-medium text-primary">{q.count} times</span>
                              <span>this month</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {q.isAnswered ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Answered
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Policy Link */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <FileText className="w-4 h-4" />
                          <span>{q.policyName}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>{q.clause}</span>
                          <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                            View <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>

                        {/* Suggested Answer */}
                        <div className="p-3 rounded-lg bg-muted/30 mb-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Standardized Answer</p>
                          <p className="text-sm">{q.suggestedAnswer}</p>
                        </div>

                        {/* Policy Citation */}
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs font-medium text-primary mb-1">Policy Citation</p>
                          <p className="text-sm italic text-muted-foreground">{q.policyCitation}</p>
                        </div>

                        {!q.isAnswered && (
                          <div className="flex justify-end mt-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCreateQuestionRecommendation(q)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add to FAQ & Create Recommendation
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Fixes Tab */}
          <TabsContent value="fixes" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Quick Win Fixes */}
              <Card className="card-elevated border-green-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    <Zap className="w-5 h-5" />
                    Quick Wins (Low Effort)
                  </CardTitle>
                  <CardDescription>Fixes that can be implemented within a week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { policy: 'L&D Policy', fix: 'Add Coursera/Udemy to approved provider list', impact: 'Reduce 45 questions/month', effort: '1 hour' },
                    { policy: 'Health Policy', fix: 'Add pre-auth flowchart to policy page', impact: 'Reduce 18 questions/month', effort: '2 hours' },
                    { policy: 'All Policies', fix: 'Add "Common Questions" section to each policy', impact: 'Improve clarity by ~15%', effort: '1 day' },
                  ].map((fix, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-green-500/5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{fix.policy}</Badge>
                          <p className="text-sm font-medium">{fix.fix}</p>
                          <p className="text-xs text-green-600 mt-1">{fix.impact}</p>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                          {fix.effort}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline" onClick={() => navigate('/employer/recommendations')}>
                    Create All as Recommendations
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Strategic Fixes */}
              <Card className="card-elevated border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                    <Target className="w-5 h-5" />
                    Strategic Improvements
                  </CardTitle>
                  <CardDescription>Larger initiatives with significant impact</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { policy: 'Wellbeing Policy', fix: 'Redesign expense category picker with visual icons', impact: 'Reduce 58% drop-off', effort: '1 week' },
                    { policy: 'Housing Policy', fix: 'Build interactive top-up calculator', impact: 'Reduce wrong submissions by 25%', effort: '2 weeks' },
                    { policy: 'All Policies', fix: 'Implement AI-powered policy Q&A chatbot', impact: 'Reduce HR tickets by 40%', effort: '1 month' },
                  ].map((fix, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-amber-500/5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{fix.policy}</Badge>
                          <p className="text-sm font-medium">{fix.fix}</p>
                          <p className="text-xs text-amber-600 mt-1">{fix.impact}</p>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                          {fix.effort}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline" onClick={() => navigate('/employer/recommendations')}>
                    Add to Strategic Roadmap
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation Generator */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Fix Recommendation Generator
                </CardTitle>
                <CardDescription>
                  Create trackable recommendations linked to specific policies and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/30 border-dashed border-2 text-center">
                  <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Select any insight above to create a trackable recommendation, or generate a comprehensive improvement plan.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/employer/policies')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Edit Policies
                    </Button>
                    <Button onClick={() => {
                      toast.success('Improvement plan created', {
                        description: 'Generated 6 recommendations based on current insights'
                      });
                      navigate('/employer/recommendations');
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Full Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageConfidenceGate>
  );
}
