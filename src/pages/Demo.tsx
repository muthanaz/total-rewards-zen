/**
 * Demo Script Page - 7-10 Minute Guided Walkthrough
 * 
 * Guides a presenter through Employee → Employer → Admin portals.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Clock, ChevronRight, Users, Building2, Shield, 
  CheckCircle2, Eye, Sparkles, BarChart3, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/shared';
import { DEMO_ORGS, getOrgTypeLabel } from '@/lib/clientDemoData';

const DEMO_STEPS = [
  // Employee Portal (2 min)
  { portal: 'employee', step: 1, title: 'Employee Dashboard', path: '/employee/dashboard', duration: '45s', highlights: ['Total compensation summary', 'Benefits utilization at a glance', 'Quick actions strip'] },
  { portal: 'employee', step: 2, title: 'My Benefits Summary', path: '/employee/benefits', duration: '45s', highlights: ['Category breakdown', 'Next best actions', 'Policy highlights'] },
  { portal: 'employee', step: 3, title: 'Submit a Claim', path: '/employee/requests', duration: '30s', highlights: ['Guided submission flow', 'Real-time eligibility check', 'Document upload'] },
  
  // Employer Portal (4 min)
  { portal: 'employer', step: 4, title: 'Executive Dashboard', path: '/employer', duration: '60s', highlights: ['AED 24.6M investment overview', '68% utilization rate', 'SLA compliance alert'] },
  { portal: 'employer', step: 5, title: 'Optimization Analysis', path: '/employer/optimization', duration: '45s', highlights: ['AED 2.95M recovery opportunity', 'L&D at 36% utilization', 'Action recommendations'] },
  { portal: 'employer', step: 6, title: 'Operations Hub', path: '/employer/ops', duration: '45s', highlights: ['8 urgent claims', 'SLA countdown timers', 'One-click approval'] },
  { portal: 'employer', step: 7, title: 'Policy Management', path: '/employer/policies', duration: '30s', highlights: ['Version comparison', 'Publish workflow', 'Audit trail'] },
  
  // Admin Portal (2 min)
  { portal: 'admin', step: 8, title: 'Platform Command Center', path: '/admin/dashboard', duration: '45s', highlights: ['47 organizations', '12,847 employees', 'System health'] },
  { portal: 'admin', step: 9, title: 'Onboarding Status', path: '/admin/onboarding', duration: '30s', highlights: ['3 demo orgs', 'Policy coverage', 'Setup checklist'] },
  { portal: 'admin', step: 10, title: 'Audit & Compliance', path: '/admin/audit', duration: '30s', highlights: ['Full audit trail', 'Policy changes', 'User actions'] },
];

const portalColors = {
  employee: 'bg-success/10 text-success border-success/20',
  employer: 'bg-primary/10 text-primary border-primary/20',
  admin: 'bg-warning/10 text-warning border-warning/20',
};

const portalIcons = { employee: Users, employer: Building2, admin: Shield };

export default function DemoScriptPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const progress = Math.round((completedSteps.length / DEMO_STEPS.length) * 100);
  const totalDuration = '7-10 min';

  const handleNavigate = (path: string, stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
    setCurrentStep(stepIndex);
    navigate(path);
  };

  return (
    <PageLayout
      title="Client Demo Script"
      description="7-10 minute guided walkthrough across all portals"
      icon={Play}
      iconClassName="from-accent to-accent/80"
      badge={{ label: totalDuration, variant: 'accent', icon: Clock }}
    >
      {/* Progress */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Demo Progress</span>
            <span className="text-sm text-muted-foreground">{completedSteps.length}/{DEMO_STEPS.length} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Demo Organizations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4" />
            Demo Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_ORGS.map((org) => (
              <div key={org.id} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: org.branding.primaryColor + '20', color: org.branding.primaryColor }}>
                    {org.branding.logoInitials}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{getOrgTypeLabel(org.type)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{org.employeeCount} employees • {org.city}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Steps by Portal */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Steps</TabsTrigger>
          <TabsTrigger value="employee">Employee</TabsTrigger>
          <TabsTrigger value="employer">Employer</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {['all', 'employee', 'employer', 'admin'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3">
            {DEMO_STEPS
              .filter(s => tab === 'all' || s.portal === tab)
              .map((step, idx) => {
                const PortalIcon = portalIcons[step.portal as keyof typeof portalIcons];
                const isCompleted = completedSteps.includes(step.step - 1);
                const isCurrent = currentStep === step.step - 1;
                
                return (
                  <Card 
                    key={step.step} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isCurrent && "ring-2 ring-accent",
                      isCompleted && "opacity-75"
                    )}
                    onClick={() => handleNavigate(step.path, step.step - 1)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", portalColors[step.portal as keyof typeof portalColors])}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <PortalIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{step.portal}</Badge>
                            <span className="text-xs text-muted-foreground">{step.duration}</span>
                          </div>
                          <p className="font-medium">{step.title}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.highlights.map((h, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px]">{h}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 me-1" />
                          View
                          <ChevronRight className="w-4 h-4 ms-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Tips */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-accent" />
            Demo Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Enable Demo Mode</strong> in settings for consistent sample data</p>
          <p>• <strong>Start with Employee</strong> to show "What value do I get?"</p>
          <p>• <strong>Highlight the SLA alert</strong> in Employer dashboard → drill into Claims</p>
          <p>• <strong>Show policy versioning</strong> to demonstrate governance</p>
          <p>• <strong>Vendor portal</strong> is available but marked "Coming Later" for this demo</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
