import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Award, Clock, CheckCircle, Plus, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function LearningPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-accent" />
            Learning & Development
          </h1>
          <p className="text-muted-foreground mt-1">
            Courses, certifications, and professional development
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Learning Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course/Certification Name</Label>
                <Input placeholder="e.g., AWS Cloud Practitioner" />
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input placeholder="e.g., Coursera, Udemy, AWS" />
              </div>
              <div className="space-y-2">
                <Label>Estimated Cost (AED)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Justification</Label>
                <Textarea placeholder="How will this help your role?" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <BookOpen className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Annual L&D budget per employee" dataSource="HR Policy" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(ANNUAL_BUDGET)}</p>
          <p className="stat-label">Annual Budget</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Award className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Approved and paid learning costs" dataSource="L&D System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(UTILIZED)}</p>
          <p className="stat-label">Utilized</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <BookOpen className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Budget - Utilized" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(remaining)}</p>
          <p className="stat-label">Remaining</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <BookOpen className="w-5 h-5 text-accent" />
            <InfoTooltip formula="(Utilized / Budget) × 100" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{utilizationPercent}%</p>
          <p className="stat-label">Utilization</p>
          <Progress value={utilizationPercent} className="h-2 mt-2" />
        </Card>
      </div>

      {/* Your Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Your Learning Activity</CardTitle>
        </CardHeader>
        <CardContent>
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

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Policy Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              AED 12,000 annual learning budget
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Pre-approval required for courses over AED 2,000
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Covers courses, certifications, conferences
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Must be job-related or career-advancing
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Reimbursement within 30 days of completion
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Study leave: up to 5 days for certifications
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full L&D Policy</Button>
      </div>
    </div>
  );
}
