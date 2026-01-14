import { useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  FileText,
  MessageSquare,
  Edit,
  Eye,
  History,
  Bell,
  Download,
  Send,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Policy Insights Data with versioning and acknowledgement tracking
const policyInsights = [
  {
    policy: 'Housing Allowance Policy',
    clarity: 85,
    complaints: 3,
    suggestions: ['Clarify top-up eligibility', 'Add area-specific guidance'],
    lastUpdated: '2023-09-15',
    status: 'good',
    version: '2.1',
    acknowledgementRate: 94,
    pendingAcknowledgements: 12,
  },
  {
    policy: 'Health Insurance Policy',
    clarity: 72,
    complaints: 8,
    suggestions: ['Simplify pre-approval process', 'Add dental coverage FAQ', 'Clarify maternity benefits'],
    lastUpdated: '2023-06-20',
    status: 'warning',
    version: '3.0',
    acknowledgementRate: 88,
    pendingAcknowledgements: 24,
  },
  {
    policy: 'Learning & Development Policy',
    clarity: 58,
    complaints: 12,
    suggestions: ['Define eligible courses clearly', 'Simplify reimbursement process', 'Add budget calculator'],
    lastUpdated: '2022-11-10',
    status: 'critical',
    version: '1.5',
    acknowledgementRate: 65,
    pendingAcknowledgements: 70,
  },
  {
    policy: 'Leave Policy',
    clarity: 90,
    complaints: 1,
    suggestions: ['Add carry-forward rules clarity'],
    lastUpdated: '2024-01-01',
    status: 'good',
    version: '4.0',
    acknowledgementRate: 98,
    pendingAcknowledgements: 4,
  },
  {
    policy: 'Wellbeing Program Policy',
    clarity: 65,
    complaints: 6,
    suggestions: ['List all eligible activities', 'Simplify redemption', 'Add partner directory'],
    lastUpdated: '2023-03-15',
    status: 'warning',
    version: '2.0',
    acknowledgementRate: 76,
    pendingAcknowledgements: 48,
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

// Knowledge Center Data
const glossaryTerms = [
  { term: 'Utilization Rate', definition: 'The percentage of allocated benefits actually used by employees. Formula: (Benefits Used / Benefits Allocated) × 100. Target: 70-85%', category: 'Metrics' },
  { term: 'Zombie Spend', definition: 'Benefits budget allocated but not utilized by employees. Represents wasted investment and opportunity for reallocation.', category: 'Cost' },
  { term: 'Total Rewards', definition: 'The complete package of compensation, benefits, recognition, and development opportunities provided to employees.', category: 'Strategy' },
  { term: 'Employee Value Proposition (EVP)', definition: 'The unique set of offerings and values that make your organization attractive to current and potential employees.', category: 'Strategy' },
  { term: 'Cost Per Employee (CPE)', definition: 'Total benefits spend divided by number of employees. Used for budgeting and benchmarking.', category: 'Cost' },
  { term: 'Claims Ratio', definition: 'The ratio of claims paid to premiums collected. High ratio (>85%) may result in premium increases at renewal.', category: 'Insurance' },
];

const benchmarks = [
  { metric: 'Benefits Utilization Rate', industryAvg: '62%', topPerformers: '78%', insight: 'Top performers achieve higher utilization through better communication.' },
  { metric: 'Cost Per Employee (Annual)', industryAvg: 'AED 45,000', topPerformers: 'AED 52,000', insight: 'Higher spend correlates with better retention when paired with personalization.' },
  { metric: 'Zombie Spend Rate', industryAvg: '18%', topPerformers: '8%', insight: 'Leading companies actively monitor and reallocate underutilized budgets.' },
  { metric: 'Employee Satisfaction Score', industryAvg: '3.6/5', topPerformers: '4.3/5', insight: 'Choice and flexibility drive satisfaction more than total spend.' },
];

const bestPractices = [
  {
    category: 'Utilization Optimization',
    icon: TrendingUp,
    practices: [
      { title: 'Quarterly Utilization Reviews', description: 'Conduct quarterly analyses of benefit utilization by segment to identify underperforming areas early.' },
      { title: 'Personalized Nudges', description: 'Implement targeted communications to employees with low utilization, highlighting relevant unused benefits.' },
      { title: 'Manager Training', description: 'Train managers to discuss benefits during 1:1s and help team members maximize their allocations.' },
    ]
  },
  {
    category: 'Cost Management',
    icon: DollarSign,
    practices: [
      { title: 'Tiered Benefits Structure', description: 'Offer tiered options allowing employees to choose coverage levels that match their needs.' },
      { title: 'Vendor Consolidation', description: 'Consolidate vendors to negotiate better rates and simplify administration.' },
      { title: 'Preventive Care Incentives', description: 'Incentivize preventive care to reduce costly emergency claims.' },
    ]
  },
  {
    category: 'Employee Engagement',
    icon: Users,
    practices: [
      { title: 'Multi-Channel Communication', description: 'Use email, mobile, manager cascades, and physical materials for benefits communication.' },
      { title: 'Life Event Targeting', description: 'Trigger relevant benefit communications based on life events like marriage or childbirth.' },
      { title: 'Benefits Champions Program', description: 'Designate peer benefits ambassadors in each department to answer questions.' },
    ]
  },
];

export default function PolicyHubPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Good</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Needs Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Critical</Badge>;
      default:
        return null;
    }
  };

  const filteredGlossary = glossaryTerms.filter(term => 
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(isRTL && "text-right")}>
        <h1 className="text-2xl font-display font-bold text-foreground">Policy Hub</h1>
        <p className="text-muted-foreground">Policy insights, knowledge base, and best practices</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className={cn(
          "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
          isRTL ? "right-3" : "left-3"
        )} />
        <Input
          placeholder="Search policies, terms, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(isRTL ? "pr-10" : "pl-10")}
        />
      </div>

      {/* Policy Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {policyMetrics.map((metric, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="pt-4 pb-4">
              <div className={cn("flex justify-between items-start mb-2", isRTL && "flex-row-reverse")}>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <span className="text-[10px] text-muted-foreground">Target: {metric.target}%</span>
              </div>
              <p className={cn(
                "text-xl font-bold",
                metric.value >= metric.target ? 'text-emerald-600' : metric.value >= metric.target * 0.9 ? 'text-amber-600' : 'text-red-500'
              )}>
                {metric.value}%
              </p>
              <Progress value={metric.value} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="policies" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          {policyInsights.map((policy, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="pt-6">
                <div className={cn("flex flex-col lg:flex-row lg:items-start justify-between gap-4", isRTL && "lg:flex-row-reverse")}>
                  <div className="flex-1">
                    <div className={cn("flex items-center gap-3 mb-3", isRTL && "flex-row-reverse")}>
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{policy.policy}</h3>
                      {getStatusBadge(policy.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className={cn(isRTL && "text-right")}>
                        <p className="text-xs text-muted-foreground">Clarity Score</p>
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Progress value={policy.clarity} className="w-16 h-2" />
                          <span className={cn(
                            "font-medium text-sm",
                            policy.clarity >= 80 ? 'text-emerald-600' : policy.clarity >= 65 ? 'text-amber-600' : 'text-red-500'
                          )}>
                            {policy.clarity}%
                          </span>
                        </div>
                      </div>
                      <div className={cn(isRTL && "text-right")}>
                        <p className="text-xs text-muted-foreground">Questions</p>
                        <p className="font-medium text-sm">{policy.complaints} this month</p>
                      </div>
                      <div className={cn(isRTL && "text-right")}>
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                        <p className="font-medium text-sm">{new Date(policy.lastUpdated).toLocaleDateString()}</p>
                      </div>
                      <div className={cn(isRTL && "text-right")}>
                        <p className="text-xs text-muted-foreground">Improvements</p>
                        <p className="font-medium text-sm">{policy.suggestions.length} suggested</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {policy.suggestions.map((suggestion, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
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

          {/* Common Questions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <MessageSquare className="h-5 w-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Questions employees commonly ask about policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commonQuestions.map((q, index) => (
                  <div key={index} className={cn(
                    "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                    isRTL && "flex-row-reverse"
                  )}>
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className={cn(isRTL && "text-right")}>
                        <p className="text-sm font-medium">{q.question}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">{q.category}</Badge>
                      </div>
                    </div>
                    <div className={cn("text-right", isRTL && "text-left")}>
                      <p className="font-medium text-sm">{q.count}×</p>
                      <p className="text-[10px] text-muted-foreground">this month</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BookOpen className="h-5 w-5 text-primary" />
                HR & Benefits Terminology
              </CardTitle>
              <CardDescription>Key terms and metrics for benefits management</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredGlossary.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className={cn("text-sm", isRTL && "flex-row-reverse text-right")}>
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <span className="font-medium">{item.term}</span>
                        <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={cn("text-sm text-muted-foreground", isRTL && "text-right")}>
                      {item.definition}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <BarChart3 className="h-5 w-5 text-primary" />
                Industry Benchmarks
              </CardTitle>
              <CardDescription>How top organizations measure success</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {benchmarks.map((item, index) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                  <p className={cn("font-semibold mb-3", isRTL && "text-right")}>{item.metric}</p>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className={cn("p-3 rounded-lg bg-card border border-border/50", isRTL && "text-right")}>
                      <p className="text-xs text-muted-foreground mb-1">Industry Average</p>
                      <p className="text-lg font-bold">{item.industryAvg}</p>
                    </div>
                    <div className={cn("p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20", isRTL && "text-right")}>
                      <p className="text-xs text-muted-foreground mb-1">Top Performers</p>
                      <p className="text-lg font-bold text-emerald-600">{item.topPerformers}</p>
                    </div>
                  </div>
                  <div className={cn("flex items-start gap-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse text-right")}>
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item.insight}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices Tab */}
        <TabsContent value="practices" className="space-y-4">
          {bestPractices.map((category, index) => (
            <Card key={index} className="border-border/50">
              <CardHeader>
                <CardTitle className={cn("text-lg flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.practices.map((practice, pIndex) => (
                  <div 
                    key={pIndex} 
                    className={cn(
                      "p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors",
                      isRTL && "text-right"
                    )}
                  >
                    <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{practice.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{practice.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
