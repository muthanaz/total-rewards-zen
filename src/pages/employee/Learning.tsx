import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NoData } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Award, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrencyAED } from '@/lib/utils';
import { BenefitDetailTemplate } from '@/components/employee/BenefitDetailTemplate';

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

const HOW_IT_WORKS = [
  'Submit a course request with justification — most under AED 2,000 auto-approved',
  'Finish your course and submit receipts plus completion certificate',
  'Receive reimbursement within 30 days of submission',
  'Study leave: up to 5 days for certifications',
];

export default function LearningPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatCurrency = (value: number) => formatCurrencyAED(value, { abbreviate: false });

  const handleSubmitRequest = () => {
    toast({
      title: "Request Submitted",
      description: "Your learning request has been submitted for approval.",
    });
    setDialogOpen(false);
  };

  return (
    <BenefitDetailTemplate
      category="learning"
      name="Learning & Development"
      description="Courses, certifications, and professional development"
      icon={BookOpen}
      iconClassName="from-chart-3 to-chart-3/80 shadow-chart-3/25"
      howItWorksBullets={HOW_IT_WORKS}
      showMarketplaceLink={true}
    >
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

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Learning Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course Name</Label>
              <Input id="course" placeholder="Enter course name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input id="provider" placeholder="e.g., Coursera, Udemy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (AED)</Label>
              <Input id="cost" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="justification">Justification</Label>
              <Textarea id="justification" placeholder="How will this benefit your role?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BenefitDetailTemplate>
  );
}
