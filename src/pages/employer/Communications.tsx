import { Megaphone, Send, Users, Calendar, Bell, Mail, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const campaigns = [
  {
    id: '1',
    title: 'Open Enrollment Reminder',
    status: 'scheduled',
    audience: '312 Employees',
    sendDate: '2026-02-01',
    type: 'email',
  },
  {
    id: '2',
    title: 'Wellness Program Launch',
    status: 'sent',
    audience: '280 Employees',
    sendDate: '2026-01-15',
    type: 'push',
  },
  {
    id: '3',
    title: 'Policy Update: Mental Health Coverage',
    status: 'draft',
    audience: 'All Employees',
    sendDate: null,
    type: 'email',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Sent</Badge>;
    case 'scheduled':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Scheduled</Badge>;
    case 'draft':
      return <Badge variant="secondary">Draft</Badge>;
    default:
      return null;
  }
};

export default function CommunicationsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn('space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
            Communications
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage bulk notifications, reminders, and awareness campaigns
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Sent This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-muted-foreground">Avg. Action Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Bell className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">312</p>
                <p className="text-xs text-muted-foreground">Total Recipients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Recent Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {campaign.type === 'email' ? (
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.audience}
                      {campaign.sendDate && ` • ${campaign.sendDate}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(campaign.status)}
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
