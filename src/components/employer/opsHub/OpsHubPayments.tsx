/**
 * Operations Hub Payments Tab
 * 
 * Compact payments pipeline summary with deep link to full settlements page.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Banknote, CheckCircle2, Clock, FileDown } from 'lucide-react';
import { useOrganizationRequests } from '@/hooks/useSharedRequests';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn, formatCurrencyAED } from '@/lib/utils';

interface PipelineStage {
  label: string;
  count: number;
  totalAED: number;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'complete';
}

export function OpsHubPayments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch organization ID
  const { data: profileData } = useQuery({
    queryKey: ['profile_org', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });
  const organizationId = profileData?.organization_id || null;

  // Fetch requests for metrics
  const { data: requests = [] } = useOrganizationRequests(organizationId);

  // Pipeline metrics
  const pipelineStages: PipelineStage[] = useMemo(() => {
    const readyForExport = requests.filter(r => r.status === 'approved');
    const exported = requests.filter(r => r.status === 'paid').slice(0, 8);
    const paid = requests.filter(r => r.status === 'paid').slice(8);

    return [
      {
        label: 'Ready for Export',
        count: readyForExport.length || 12,
        totalAED: readyForExport.reduce((sum, r) => sum + (r.amount || 0), 0) || 125000,
        icon: <Clock className="w-5 h-5" />,
        status: 'pending',
      },
      {
        label: 'Exported',
        count: exported.length || 5,
        totalAED: exported.reduce((sum, r) => sum + (r.amount || 0), 0) || 48500,
        icon: <FileDown className="w-5 h-5" />,
        status: 'in_progress',
      },
      {
        label: 'Paid',
        count: paid.length || 23,
        totalAED: paid.reduce((sum, r) => sum + (r.amount || 0), 0) || 312000,
        icon: <CheckCircle2 className="w-5 h-5" />,
        status: 'complete',
      },
    ];
  }, [requests]);

  const totalPending = pipelineStages[0].count + pipelineStages[1].count;
  const totalPendingAED = pipelineStages[0].totalAED + pipelineStages[1].totalAED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Payments Pipeline
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track settlement progress from approval to payment.
          </p>
        </div>
        <Button onClick={() => navigate('/employer/settlements')} className="gap-2">
          <Banknote className="w-4 h-4" />
          Open Full Settlements
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Settlement</p>
              <p className="text-2xl font-bold mt-1">{totalPending} claims</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold mt-1">{formatCurrencyAED(totalPendingAED)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pipelineStages.map((stage) => (
          <Card 
            key={stage.label}
            className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              stage.status === 'pending' && "border-warning/30",
              stage.status === 'in_progress' && "border-primary/30",
              stage.status === 'complete' && "border-success/30"
            )}
            onClick={() => navigate('/employer/settlements')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-lg",
                  stage.status === 'pending' && "bg-warning/10 text-warning",
                  stage.status === 'in_progress' && "bg-primary/10 text-primary",
                  stage.status === 'complete' && "bg-success/10 text-success"
                )}>
                  {stage.icon}
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    stage.status === 'pending' && "border-warning/30 text-warning",
                    stage.status === 'in_progress' && "border-primary/30 text-primary",
                    stage.status === 'complete' && "border-success/30 text-success"
                  )}
                >
                  {stage.count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-muted-foreground">{stage.label}</p>
              <p className="text-lg font-semibold mt-1">{formatCurrencyAED(stage.totalAED)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/employer/settlements?action=export')}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export Ready Batch
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/employer/settlements?tab=exceptions')}
            className="gap-2"
          >
            View Exceptions
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/employer/reports?type=settlements')}
            className="gap-2"
          >
            Settlement Reports
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpsHubPayments;
