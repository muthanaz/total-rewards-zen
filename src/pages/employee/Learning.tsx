import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { NoData } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Award, Clock, CheckCircle, Plus, ExternalLink, Wallet, TrendingUp, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BenefitCrossLinks } from '@/components/employee/BenefitCrossLinks';
import { formatCurrencyAED, formatPercent } from '@/lib/utils';

const ANNUAL_BUDGET = 12000;
const UTILIZED = 4500;

const reimbursements = [
  { 
    id: 1,
    name: 'AWS Solutions Architect',
    provider: 'AWS',
    cost: 2500,
    status: 'completed',
    date: 'Oct 2025',
    type: 'Certification',
  },
  { 
    id: 2,
    name: 'Leadership Essentials',
    provider: 'LinkedIn Learning',
    cost: 500,
    status: 'completed',
    date: 'Sep 2025',
    type: 'Course',
  },
  { 
    id: 3,
    name: 'Product Management Bootcamp',
    provider: 'General Assembly',
    cost: 1500,
    status: 'in_progress',
    date: 'Nov 2025',
    type: 'Bootcamp',
  },
];

const suggestedCourses = [
  { name: 'Data Analytics with Python', provider: 'Coursera', cost: 1200, duration: '6 weeks' },
  { name: 'Project Management Professional', provider: 'PMI', cost: 3000, duration: '3 months' },
  { name: 'Design Thinking', provider: 'IDEO', cost: 800, duration: '4 weeks' },
];

const learningPolicies = [
  'AED 12,000 annual learning budget',
  'Pre-approval required for courses over AED 2,000',
  'Covers courses, certifications, conferences',
  'Must be job-related or career-advancing',
  'Reimbursement within 30 days of completion',
  'Study leave: up to 5 days for certifications',
];

export default function LearningPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });
  const remaining = ANNUAL_BUDGET - UTILIZED;
  const utilizationPercent = Math.round((UTILIZED / ANNUAL_BUDGET) * 100);

  const handleSubmitRequest = () => {
    toast({
      title: "Request Submitted",
      description: "Your learning request has been submitted for approval.",
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Using PageHeader pattern */}
      <PageHeader
        title="Learning & Development"
        description="Courses, certifications, and professional development"
        icon={BookOpen}
        iconClassName="from-chart-3 to-chart-3/80 shadow-chart-3/25"
        partnerOffersCategory="Learning & Development"
      />

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStatsCard
          variant="primary"
          label="Annual Budget"
          value={formatCurrency(ANNUAL_BUDGET)}
          icon={Wallet}
          formula="Annual L&D budget per employee"
          dataSource="HR Policy"
          index={0}
        />
        <SummaryStatsCard
          variant="utilized"
          label="Utilized"
          value={formatCurrency(UTILIZED)}
          icon={Award}
          formula="Approved and paid learning costs"
          dataSource="L&D System"
          index={1}
        />
        <SummaryStatsCard
          variant="remaining"
          label="Remaining"
          value={formatCurrency(remaining)}
          icon={Calculator}
          formula="Budget - Utilized"
          dataSource="System"
          index={2}
        />
        <SummaryStatsCard
          variant="utilization"
          label="Utilization"
          value={`${utilizationPercent}%`}
          icon={TrendingUp}
          formula="(Utilized / Budget) × 100"
          dataSource="System"
          progress={utilizationPercent}
          index={3}
        />
      </div>

      {/* 2. Policy Highlights - Tips integrated */}
      <PolicyHighlightsCard
        title="L&D Policy Highlights"
        policies={[
          ...learningPolicies,
          '💡 Courses under AED 2,000 are usually auto-approved',
          '📋 Submit: Payment receipt + completion certificate',
        ]}
        category="Learning & Development"
        actionLabel="Submit Claim"
        policyLabel="View Full Policy"
      />

      {/* 3. How It Works */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            How Your L&D Budget Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">Request Approval</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Submit a course request with justification — most under <span className="font-semibold text-accent">AED 2,000</span> auto-approved
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Complete & Submit</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Finish your course and submit receipts plus completion certificate
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Get Reimbursed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive reimbursement within 30 days of submission
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-links - only show claim link */}
      <BenefitCrossLinks benefitCategory="Learning & Development" showClaimLink={true} />

      {/* Your Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Your Learning Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {reimbursements.length > 0 ? (
            <div className="space-y-4">
              {reimbursements.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      item.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.provider} • {item.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.cost)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={
                        item.status === 'completed' 
                          ? 'bg-success/10 text-success border-0'
                          : 'bg-warning/10 text-warning border-0'
                      }>
                        {item.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoData 
              title="No learning activity yet"
              description="Start your learning journey by requesting a course"
              action={{ label: 'Request Course', onClick: () => setDialogOpen(true) }}
            />
          )}
        </CardContent>
      </Card>

      {/* Suggested Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Suggested for You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {suggestedCourses.map((course, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                <h4 className="font-medium mb-1">{course.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{course.provider}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="font-medium">{formatCurrency(course.cost)}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Learn More
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
