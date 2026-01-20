import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, MessageSquare, Users, AlertTriangle, Lightbulb } from 'lucide-react';
import { EmployerGlobalFiltersBar, DataConfidenceBadge, PageConfidenceGate, useDataCoverageMetrics } from '@/components/employer';

const policyInsights = [
  { policy: 'Housing Allowance Policy', clarity: 85, complaints: 3, suggestions: ['Clarify top-up eligibility', 'Add area-specific guidance'], status: 'good' },
  { policy: 'Health Insurance Policy', clarity: 72, complaints: 8, suggestions: ['Simplify pre-approval process', 'Add dental coverage FAQ'], status: 'warning' },
  { policy: 'Learning & Development Policy', clarity: 58, complaints: 12, suggestions: ['Define eligible courses', 'Add budget calculator'], status: 'critical' },
  { policy: 'Leave Policy', clarity: 90, complaints: 1, suggestions: ['Add carry-forward clarity'], status: 'good' },
  { policy: 'Wellbeing Program Policy', clarity: 65, complaints: 6, suggestions: ['List eligible activities', 'Simplify redemption'], status: 'warning' },
];

const commonQuestions = [
  { question: 'How do I claim dental expenses?', count: 45, category: 'Health' },
  { question: 'Can I top up my housing allowance?', count: 38, category: 'Housing' },
  { question: 'What courses are eligible for L&D budget?', count: 32, category: 'Learning' },
  { question: 'How does maternity leave work?', count: 28, category: 'Leave' },
];

const policyMetrics = [
  { label: 'Avg Policy Clarity', value: 74, target: 85 },
  { label: 'Questions Resolved', value: 89, target: 95 },
  { label: 'Employee Satisfaction', value: 78, target: 85 },
  { label: 'Policy Compliance', value: 96, target: 98 },
];

export default function PolicyInsightsPage() {
  const { isExecutive } = useEmployerViewMode();
  const coverageMetrics = useDataCoverageMetrics();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Good</Badge>;
      case 'warning': return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Attention</Badge>;
      case 'critical': return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      default: return null;
    }
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Policy Insights</h1>
            <p className="text-muted-foreground">
              {isExecutive 
                ? 'Strategic view of policy effectiveness and employee understanding'
                : 'Analyze policy clarity and employee understanding (read-only)'}
            </p>
          </div>
          <DataConfidenceBadge metrics={coverageMetrics} />
        </div>

        <EmployerGlobalFiltersBar />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {policyMetrics.map((metric, index) => (
            <Card key={index} className="card-elevated">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <span className="text-xs text-muted-foreground">Target: {metric.target}%</span>
                </div>
                <p className={`text-2xl font-bold ${metric.value >= metric.target ? 'text-green-600' : metric.value >= metric.target * 0.9 ? 'text-amber-600' : 'text-red-500'}`}>
                  {metric.value}%
                </p>
                <Progress value={metric.value} className="h-2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="clarity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clarity">Policy Clarity</TabsTrigger>
            <TabsTrigger value="questions">Common Questions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="clarity" className="space-y-4">
            {policyInsights.map((policy, index) => (
              <Card key={index} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{policy.policy}</h3>
                        {getStatusBadge(policy.status)}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Clarity Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={policy.clarity} className="w-16 h-2" />
                            <span className={`font-medium ${policy.clarity >= 80 ? 'text-green-600' : policy.clarity >= 65 ? 'text-amber-600' : 'text-red-500'}`}>
                              {policy.clarity}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Questions</p>
                          <p className="font-medium">{policy.complaints} this month</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Improvements</p>
                          <p className="font-medium">{policy.suggestions.length} suggested</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {policy.suggestions.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Most common employee queries about policies</CardDescription>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>Suggestions to improve policy clarity based on employee feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400">
                          Learning & Development Policy needs urgent attention
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          12 employee questions this month. Consider adding a clear list of eligible courses and providers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Add real-world examples to Health Insurance Policy</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Policies with examples see 23% fewer clarification requests on average.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Consider grade-specific policy summaries</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Different employee grades have different eligibility. Personalized summaries reduce confusion.
                        </p>
                      </div>
                    </div>
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
