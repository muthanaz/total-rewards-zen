import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, AlertTriangle, CheckCircle, TrendingUp, Eye, MessageSquare, Edit } from 'lucide-react';
import { EmployerGlobalFiltersBar } from '@/components/employer';

const policyInsights = [
  {
    policy: 'Housing Allowance Policy',
    clarity: 85,
    complaints: 3,
    suggestions: ['Clarify top-up eligibility', 'Add area-specific guidance'],
    lastUpdated: '2023-09-15',
    status: 'good',
  },
  {
    policy: 'Health Insurance Policy',
    clarity: 72,
    complaints: 8,
    suggestions: ['Simplify pre-approval process', 'Add dental coverage FAQ', 'Clarify maternity benefits'],
    lastUpdated: '2023-06-20',
    status: 'warning',
  },
  {
    policy: 'Learning & Development Policy',
    clarity: 58,
    complaints: 12,
    suggestions: ['Define eligible courses clearly', 'Simplify reimbursement process', 'Add budget calculator'],
    lastUpdated: '2022-11-10',
    status: 'critical',
  },
  {
    policy: 'Leave Policy',
    clarity: 90,
    complaints: 1,
    suggestions: ['Add carry-forward rules clarity'],
    lastUpdated: '2024-01-01',
    status: 'good',
  },
  {
    policy: 'Wellbeing Program Policy',
    clarity: 65,
    complaints: 6,
    suggestions: ['List all eligible activities', 'Simplify redemption', 'Add partner directory'],
    lastUpdated: '2023-03-15',
    status: 'warning',
  },
];

const commonQuestions = [
  { question: 'How do I claim dental expenses?', count: 45, category: 'Health' },
  { question: 'Can I top up my housing allowance?', count: 38, category: 'Housing' },
  { question: 'What courses are eligible for L&D budget?', count: 32, category: 'Learning' },
  { question: 'How does maternity leave work?', count: 28, category: 'Leave' },
  { question: 'Can I use wellbeing budget for home gym?', count: 25, category: 'Wellbeing' },
  { question: 'When do my unused days expire?', count: 22, category: 'Leave' },
];

const policyMetrics = [
  { label: 'Avg Policy Clarity', value: 74, target: 85 },
  { label: 'Questions Resolved', value: 89, target: 95 },
  { label: 'Employee Satisfaction', value: 78, target: 85 },
  { label: 'Policy Compliance', value: 96, target: 98 },
];

export default function PoliciesPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Good</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Policy Insights</h1>
        <p className="text-muted-foreground">Analyze policy clarity and employee understanding</p>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar />

      {/* Metrics */}
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
        </TabsList>

        <TabsContent value="clarity" className="space-y-4">
          {/* Policy Cards */}
          <div className="space-y-4">
            {policyInsights.map((policy, index) => (
              <Card key={index} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{policy.policy}</h3>
                        {getStatusBadge(policy.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Clarity Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={policy.clarity} className="w-20 h-2" />
                            <span className={`font-medium ${policy.clarity >= 80 ? 'text-green-600' : policy.clarity >= 65 ? 'text-amber-600' : 'text-red-500'}`}>
                              {policy.clarity}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Employee Questions</p>
                          <p className="font-medium">{policy.complaints} this month</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Updated</p>
                          <p className="font-medium">{new Date(policy.lastUpdated).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Improvements Needed</p>
                          <p className="font-medium">{policy.suggestions.length}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Suggested Improvements:</p>
                        <div className="flex flex-wrap gap-2">
                          {policy.suggestions.map((suggestion, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <CardDescription>
                Questions employees commonly ask about policies
              </CardDescription>
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

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Policy Gaps Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">L&D Policy Needs Major Update</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        58% clarity score is below threshold. 12 employee questions this month.
                        Consider adding: eligible course list, budget calculator, step-by-step guide.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Health Insurance Pre-approval Process Confusion</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        8 questions about pre-approval this month. Add flowchart and timeline to policy document.
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
  );
}
