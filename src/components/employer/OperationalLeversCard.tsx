import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  FileText, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OperationalLever {
  id: string;
  title: string;
  description: string;
  type: 'communication' | 'process' | 'documentation' | 'training';
  status: 'pending' | 'in_progress' | 'completed';
  impact: string;
  linkedQueue?: string;
  linkedQueueCount?: number;
}

interface OperationalLeversCardProps {
  levers: OperationalLever[];
  title?: string;
  description?: string;
}

const getTypeIcon = (type: OperationalLever['type']) => {
  switch (type) {
    case 'communication':
      return <Megaphone className="w-4 h-4" />;
    case 'process':
      return <Clock className="w-4 h-4" />;
    case 'documentation':
      return <FileText className="w-4 h-4" />;
    case 'training':
      return <Users className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: OperationalLever['status']) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Completed</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-500/10 text-blue-600 border-0">In Progress</Badge>;
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>;
  }
};

export function OperationalLeversCard({ levers, title, description }: OperationalLeversCardProps) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          {title || 'Operational Actions Required'}
        </CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {levers.map((lever) => (
            <div 
              key={lever.id} 
              className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getTypeIcon(lever.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{lever.title}</span>
                      {getStatusBadge(lever.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{lever.description}</p>
                    <p className="text-xs text-primary font-medium">
                      Impact: {lever.impact}
                    </p>
                  </div>
                </div>
                {lever.linkedQueue && (
                  <Button variant="outline" size="sm" asChild className="gap-1 shrink-0">
                    <Link to={lever.linkedQueue}>
                      {lever.linkedQueueCount && (
                        <Badge variant="secondary" className="mr-1">{lever.linkedQueueCount}</Badge>
                      )}
                      View Queue
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-defined lever sets for different pages
export const spendOperationalLevers: OperationalLever[] = [
  {
    id: '1',
    title: 'Process Missing Budget Allocations',
    description: '12 employees missing housing allowance setup',
    type: 'documentation',
    status: 'pending',
    impact: 'Complete budget visibility',
    linkedQueue: '/employer/claims?filter=housing',
    linkedQueueCount: 12,
  },
  {
    id: '2',
    title: 'Send L&D Budget Reminder',
    description: 'Q1 deadline approaching, 45% unused',
    type: 'communication',
    status: 'pending',
    impact: '+AED 75K utilization potential',
  },
  {
    id: '3',
    title: 'Update Wellbeing Redemption Process',
    description: 'Simplify 5-step process causing drop-offs',
    type: 'process',
    status: 'in_progress',
    impact: 'Reduce processing time by 60%',
  },
];

export const zombieOperationalLevers: OperationalLever[] = [
  {
    id: '1',
    title: 'Launch L&D Awareness Campaign',
    description: 'Target 45 employees with unused learning budget',
    type: 'communication',
    status: 'pending',
    impact: 'Recover AED 75K zombie spend',
  },
  {
    id: '2',
    title: 'Collect Missing Gym Preference Data',
    description: '32 employees haven\'t specified gym preferences',
    type: 'documentation',
    status: 'pending',
    impact: 'Enable personalized gym recommendations',
    linkedQueue: '/employer/claims',
    linkedQueueCount: 32,
  },
  {
    id: '3',
    title: 'Review Flight Ticket Policy',
    description: 'Consider conversion options for single employees',
    type: 'process',
    status: 'pending',
    impact: 'Improve perceived value by 80%',
  },
];

export const segmentsOperationalLevers: OperationalLever[] = [
  {
    id: '1',
    title: 'Young Professionals Onboarding',
    description: 'Schedule benefits orientation for 8 new hires',
    type: 'training',
    status: 'pending',
    impact: 'Increase segment utilization by 15%',
  },
  {
    id: '2',
    title: 'Parents Segment Survey',
    description: 'Collect childcare needs assessment',
    type: 'documentation',
    status: 'in_progress',
    impact: 'Inform 2026 benefits planning',
  },
  {
    id: '3',
    title: 'Remote Worker Equipment Check',
    description: 'Verify home office setup compliance',
    type: 'process',
    status: 'pending',
    impact: 'Ensure equity across work locations',
    linkedQueue: '/employer/claims?filter=remote',
    linkedQueueCount: 18,
  },
];

export const recommendationsOperationalLevers: OperationalLever[] = [
  {
    id: '1',
    title: 'Execute L&D Campaign',
    description: 'Send curated course recommendations',
    type: 'communication',
    status: 'pending',
    impact: 'Target AED 75K recovery',
  },
  {
    id: '2',
    title: 'Process Wellbeing App Integration',
    description: 'Connect one-click redemption system',
    type: 'process',
    status: 'in_progress',
    impact: 'Reduce friction by 80%',
  },
  {
    id: '3',
    title: 'Create Benefits Champion Program',
    description: 'Recruit parent segment advocates',
    type: 'training',
    status: 'pending',
    impact: 'Peer-driven 25% utilization lift',
  },
];
