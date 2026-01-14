import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { BenefitGuide } from '@/components/employee/BenefitGuide';
import { NoData } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Award, Clock, CheckCircle, Plus, ExternalLink, Wallet, TrendingUp, Calculator, GraduationCap, Play, Star, Users } from 'lucide-react';
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

const learningPlatforms = [
  {
    name: 'LinkedIn Learning',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/LinkedIn_Logo.svg/200px-LinkedIn_Logo.svg.png',
    url: 'https://www.linkedin.com/learning/',
    description: 'Business, tech & creative courses',
    courses: '16,000+',
    color: 'bg-[#0A66C2]',
  },
  {
    name: 'Coursera',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/200px-Coursera-Logo_600x600.svg.png',
    url: 'https://www.coursera.org/',
    description: 'University degrees & certifications',
    courses: '7,000+',
    color: 'bg-[#0056D2]',
  },
  {
    name: 'Udemy',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Udemy_logo.svg/200px-Udemy_logo.svg.png',
    url: 'https://www.udemy.com/',
    description: 'Practical skills & development',
    courses: '200,000+',
    color: 'bg-[#A435F0]',
  },
  {
    name: 'edX',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/EdX.svg/200px-EdX.svg.png',
    url: 'https://www.edx.org/',
    description: 'Harvard, MIT & top universities',
    courses: '3,000+',
    color: 'bg-[#02262B]',
  },
  {
    name: 'Pluralsight',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Pluralsight_logo_no_background.svg/200px-Pluralsight_logo_no_background.svg.png',
    url: 'https://www.pluralsight.com/',
    description: 'Tech & IT skills platform',
    courses: '7,500+',
    color: 'bg-[#F15B2A]',
  },
  {
    name: 'Skillshare',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Skillshare_Symbol.svg/200px-Skillshare_Symbol.svg.png',
    url: 'https://www.skillshare.com/',
    description: 'Creative & business classes',
    courses: '30,000+',
    color: 'bg-[#00FF84]',
  },
];

const featuredCourses = [
  {
    title: 'Google Project Management Certificate',
    platform: 'Coursera',
    url: 'https://www.coursera.org/professional-certificates/google-project-management',
    rating: 4.8,
    students: '1.2M',
    duration: '6 months',
    level: 'Beginner',
  },
  {
    title: 'AWS Certified Solutions Architect',
    platform: 'Udemy',
    url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/',
    rating: 4.7,
    students: '900K',
    duration: '27 hours',
    level: 'Intermediate',
  },
  {
    title: 'Excel Skills for Business',
    platform: 'Coursera',
    url: 'https://www.coursera.org/specializations/excel',
    rating: 4.9,
    students: '500K',
    duration: '6 months',
    level: 'All Levels',
  },
  {
    title: 'Leadership & Management',
    platform: 'LinkedIn Learning',
    url: 'https://www.linkedin.com/learning/paths/become-a-manager',
    rating: 4.6,
    students: '350K',
    duration: '15 hours',
    level: 'Intermediate',
  },
  {
    title: 'Python for Data Science',
    platform: 'edX',
    url: 'https://www.edx.org/learn/python',
    rating: 4.7,
    students: '800K',
    duration: '10 weeks',
    level: 'Beginner',
  },
  {
    title: 'UX Design Professional Certificate',
    platform: 'Coursera',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
    rating: 4.8,
    students: '600K',
    duration: '6 months',
    level: 'Beginner',
  },
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

  const guideSteps = [
    {
      title: 'Request Approval',
      description: 'Submit a course request with justification — most under AED 2,000 auto-approved',
      highlight: 'AED 2,000',
    },
    {
      title: 'Complete & Submit',
      description: 'Finish your course and submit receipts plus completion certificate',
    },
    {
      title: 'Get Reimbursed',
      description: 'Receive reimbursement within 30 days of submission',
      highlight: '30 days',
    },
  ];

  const policyPoints = [
    'AED 12,000 annual learning budget',
    'Pre-approval required for courses over AED 2,000',
    'Covers courses, certifications, conferences',
    'Must be job-related or career-advancing',
    'Reimbursement within 30 days of completion',
    'Study leave: up to 5 days for certifications',
  ];

  const courseRequestButton = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
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
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-accent" />
          Learning & Development
        </h1>
        <p className="text-muted-foreground mt-1">
          Courses, certifications, and professional development
        </p>
      </div>

      {/* Summary Cards */}
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

      {/* Comprehensive Benefit Guide */}
      <BenefitGuide
        icon={BookOpen}
        title="Learning & Development Guide"
        steps={guideSteps}
        policyPoints={policyPoints}
        policyButtonText="View L&D Policy"
        claimCategory="Learning & Development"
        claimButtonText="Submit Claim"
        customAction={courseRequestButton}
      />

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

      {/* Learning Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent" />
            Learning Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Access courses from our trusted partner platforms. All eligible for reimbursement.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {learningPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-4 rounded-xl border border-border/50 hover:border-accent/50 hover:shadow-md transition-all bg-card hover:bg-muted/30"
              >
                <div className={`w-12 h-12 rounded-lg ${platform.color} flex items-center justify-center mb-3`}>
                  <Play className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-medium text-sm text-center group-hover:text-accent transition-colors">
                  {platform.name}
                </h4>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {platform.courses} courses
                </p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Courses & Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Featured Courses & Certifications
          </CardTitle>
          <Badge variant="outline" className="text-xs">Recommended</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCourses.map((course, i) => (
              <a
                key={i}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 rounded-xl border border-border/50 hover:border-accent/50 hover:shadow-md transition-all bg-card"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.platform}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {course.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  View Course
                </Button>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Personalized Suggestions</CardTitle>
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
