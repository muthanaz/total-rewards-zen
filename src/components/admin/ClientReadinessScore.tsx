/**
 * Client Readiness Score - Calculates production readiness for organizations
 * 
 * Checklist items:
 * - Users & Roles: Has admin users configured
 * - Policies: Active policies defined
 * - Benefit Mapping: Benefits configured with entitlements
 * - Data Sources: At least one integration connected
 * - Data Freshness: Last sync within 7 days
 * - Demo Mode Off: Not using mock/demo data
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  FileText, 
  Link2, 
  Clock,
  ToggleLeft,
  Boxes,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface ReadinessCheckItem {
  id: string;
  label: string;
  labelAr: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  weight: number;
  icon: React.ElementType;
}

export interface ClientReadinessResult {
  organizationId: string;
  organizationName: string;
  score: number; // 0-100
  status: 'production_ready' | 'needs_attention' | 'not_ready';
  checks: ReadinessCheckItem[];
  lastUpdated: string;
}

// Hook to fetch readiness data for a single org
export function useClientReadiness(organizationId: string | null) {
  return useQuery({
    queryKey: ['client-readiness', organizationId],
    queryFn: async (): Promise<ClientReadinessResult | null> => {
      if (!organizationId) return null;
      
      // Fetch organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', organizationId)
        .single();
      
      if (!org) return null;
      
      // Check 1: Users & Roles - has employer users
      const { count: employerCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .or('role.eq.employer,role.eq.admin');
      
      // Check 2: Policies - has active policy versions
      const { count: policyCount } = await supabase
        .from('benefit_policy_versions')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .is('effective_until', null); // Currently active
      
      // Check 3: Benefit Mapping - has entitlements
      const { count: entitlementCount } = await supabase
        .from('benefit_entitlements')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);
      
      // Check 4: Data Sources - has integration runs
      const { data: integrations } = await supabase
        .from('integration_runs')
        .select('id, last_sync_at, status')
        .eq('organization_id', organizationId)
        .order('last_sync_at', { ascending: false })
        .limit(5);
      
      const hasIntegrations = (integrations?.length || 0) > 0;
      const successfulIntegrations = integrations?.filter(i => i.status === 'success') || [];
      
      // Check 5: Data Freshness - last sync within 7 days
      const lastSync = integrations?.[0]?.last_sync_at;
      const daysSinceSync = lastSync 
        ? Math.floor((Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const isFresh = daysSinceSync !== null && daysSinceSync <= 7;
      
      // Check 6: Demo Mode Off - check if org has demo-related visibility settings
      // Since ui_visibility_settings doesn't have use_mock_data, we check for demo page visibility
      const { data: demoSettings } = await supabase
        .from('ui_visibility_settings')
        .select('is_visible')
        .eq('organization_id', organizationId)
        .eq('element_key', 'demo_mode')
        .single();
      
      // If no demo_mode setting exists or is_visible is false, assume production mode
      const demoModeOff = !demoSettings?.is_visible;
      
      // Build check items
      const checks: ReadinessCheckItem[] = [
        {
          id: 'users_roles',
          label: 'Users & Roles',
          labelAr: 'المستخدمون والأدوار',
          status: (employerCount || 0) >= 1 ? 'passed' : 'failed',
          message: (employerCount || 0) >= 1 
            ? `${employerCount} admin users configured`
            : 'No admin users configured',
          weight: 20,
          icon: Users,
        },
        {
          id: 'policies',
          label: 'Active Policies',
          labelAr: 'السياسات النشطة',
          status: (policyCount || 0) >= 1 ? 'passed' : (policyCount || 0) === 0 ? 'failed' : 'warning',
          message: (policyCount || 0) >= 1 
            ? `${policyCount} active policies`
            : 'No policies defined',
          weight: 20,
          icon: FileText,
        },
        {
          id: 'benefit_mapping',
          label: 'Benefit Mapping',
          labelAr: 'تعيين المزايا',
          status: (entitlementCount || 0) >= 1 ? 'passed' : 'warning',
          message: (entitlementCount || 0) >= 1 
            ? `${entitlementCount} entitlements configured`
            : 'No entitlements mapped',
          weight: 15,
          icon: Boxes,
        },
        {
          id: 'data_sources',
          label: 'Data Sources',
          labelAr: 'مصادر البيانات',
          status: hasIntegrations 
            ? successfulIntegrations.length > 0 ? 'passed' : 'warning'
            : 'failed',
          message: hasIntegrations 
            ? `${successfulIntegrations.length}/${integrations?.length} syncs successful`
            : 'No data sources connected',
          weight: 20,
          icon: Link2,
        },
        {
          id: 'data_freshness',
          label: 'Data Freshness',
          labelAr: 'حداثة البيانات',
          status: isFresh ? 'passed' : daysSinceSync !== null ? 'warning' : 'failed',
          message: daysSinceSync !== null 
            ? isFresh 
              ? `Last sync ${daysSinceSync}d ago`
              : `Stale data: ${daysSinceSync}d since last sync`
            : 'No sync history',
          weight: 10,
          icon: Clock,
        },
        {
          id: 'demo_mode',
          label: 'Production Mode',
          labelAr: 'وضع الإنتاج',
          status: demoModeOff ? 'passed' : 'warning',
          message: demoModeOff 
            ? 'Using live data'
            : 'Demo/mock mode enabled',
          weight: 15,
          icon: ToggleLeft,
        },
      ];
      
      // Calculate score
      const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
      const earnedWeight = checks.reduce((sum, c) => {
        if (c.status === 'passed') return sum + c.weight;
        if (c.status === 'warning') return sum + (c.weight * 0.5);
        return sum;
      }, 0);
      const score = Math.round((earnedWeight / totalWeight) * 100);
      
      // Determine overall status
      const failedCritical = checks.filter(c => c.status === 'failed' && c.weight >= 20).length;
      const status: ClientReadinessResult['status'] = 
        score >= 80 && failedCritical === 0 ? 'production_ready' 
        : score >= 50 ? 'needs_attention' 
        : 'not_ready';
      
      return {
        organizationId,
        organizationName: org.name,
        score,
        status,
        checks,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch readiness for all orgs (for admin overview)
export function useAllClientReadiness() {
  return useQuery({
    queryKey: ['all-client-readiness'],
    queryFn: async (): Promise<ClientReadinessResult[]> => {
      // Fetch all organizations
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      
      if (!orgs || orgs.length === 0) return [];
      
      // For each org, calculate a simplified readiness score
      const results: ClientReadinessResult[] = [];
      
      for (const org of orgs) {
        // Simplified batch query approach
        const [
          { count: employerCount },
          { count: policyCount },
          { count: entitlementCount },
          { data: integrations },
          { data: visibilitySettings },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id).or('role.eq.employer,role.eq.admin'),
          supabase.from('benefit_policy_versions').select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id).is('effective_until', null),
          supabase.from('benefit_entitlements').select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id),
          supabase.from('integration_runs').select('id, last_sync_at, status')
            .eq('organization_id', org.id).order('last_sync_at', { ascending: false }).limit(1),
          supabase.from('ui_visibility_settings').select('is_visible')
            .eq('organization_id', org.id).eq('element_key', 'demo_mode').maybeSingle(),
        ]);
        
        const hasIntegrations = (integrations?.length || 0) > 0;
        const lastSync = integrations?.[0]?.last_sync_at;
        const daysSinceSync = lastSync 
          ? Math.floor((Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        const isFresh = daysSinceSync !== null && daysSinceSync <= 7;
        const demoModeOff = !visibilitySettings?.is_visible;
        
        const checks: ReadinessCheckItem[] = [
          { id: 'users_roles', label: 'Users & Roles', labelAr: '', status: (employerCount || 0) >= 1 ? 'passed' : 'failed', message: '', weight: 20, icon: Users },
          { id: 'policies', label: 'Policies', labelAr: '', status: (policyCount || 0) >= 1 ? 'passed' : 'failed', message: '', weight: 20, icon: FileText },
          { id: 'benefit_mapping', label: 'Benefits', labelAr: '', status: (entitlementCount || 0) >= 1 ? 'passed' : 'warning', message: '', weight: 15, icon: Boxes },
          { id: 'data_sources', label: 'Data', labelAr: '', status: hasIntegrations ? 'passed' : 'failed', message: '', weight: 20, icon: Link2 },
          { id: 'data_freshness', label: 'Freshness', labelAr: '', status: isFresh ? 'passed' : 'warning', message: '', weight: 10, icon: Clock },
          { id: 'demo_mode', label: 'Live Mode', labelAr: '', status: demoModeOff ? 'passed' : 'warning', message: '', weight: 15, icon: ToggleLeft },
        ];
        
        const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
        const earnedWeight = checks.reduce((sum, c) => {
          if (c.status === 'passed') return sum + c.weight;
          if (c.status === 'warning') return sum + (c.weight * 0.5);
          return sum;
        }, 0);
        const score = Math.round((earnedWeight / totalWeight) * 100);
        
        const failedCritical = checks.filter(c => c.status === 'failed' && c.weight >= 20).length;
        const status: ClientReadinessResult['status'] = 
          score >= 80 && failedCritical === 0 ? 'production_ready' 
          : score >= 50 ? 'needs_attention' 
          : 'not_ready';
        
        results.push({
          organizationId: org.id,
          organizationName: org.name,
          score,
          status,
          checks,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      return results.sort((a, b) => b.score - a.score);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Status badge component
export function ReadinessStatusBadge({ status }: { status: ClientReadinessResult['status'] }) {
  const config = {
    production_ready: { label: 'Production Ready', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
    needs_attention: { label: 'Needs Attention', class: 'bg-warning/10 text-warning border-warning/30', icon: AlertTriangle },
    not_ready: { label: 'Not Ready', class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
  };
  const c = config[status];
  const Icon = c.icon;
  
  return (
    <Badge variant="outline" className={cn('gap-1', c.class)}>
      <Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

// Score badge with color coding
export function ReadinessScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
  const bgColor = score >= 80 ? 'bg-success/10' : score >= 50 ? 'bg-warning/10' : 'bg-destructive/10';
  
  return (
    <div className={cn('px-2 py-1 rounded font-mono font-bold text-sm', bgColor, color)}>
      {score}%
    </div>
  );
}

// Compact readiness card for org list
interface ReadinessCompactCardProps {
  result: ClientReadinessResult;
  onClick?: () => void;
}

export function ReadinessCompactCard({ result, onClick }: ReadinessCompactCardProps) {
  return (
    <div 
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
        result.status === 'production_ready' && 'border-success/30',
        result.status === 'needs_attention' && 'border-warning/30',
        result.status === 'not_ready' && 'border-destructive/30'
      )}
      onClick={onClick}
    >
      <ReadinessScoreBadge score={result.score} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{result.organizationName}</p>
        <div className="flex items-center gap-2 mt-1">
          {result.checks.slice(0, 4).map(check => {
            const Icon = check.icon;
            return (
              <Tooltip key={check.id}>
                <TooltipTrigger>
                  <Icon className={cn(
                    'w-4 h-4',
                    check.status === 'passed' && 'text-success',
                    check.status === 'warning' && 'text-warning',
                    check.status === 'failed' && 'text-destructive'
                  )} />
                </TooltipTrigger>
                <TooltipContent>{check.label}: {check.message}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <ReadinessStatusBadge status={result.status} />
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

// Full readiness card with details
interface ReadinessDetailCardProps {
  result: ClientReadinessResult;
}

export function ReadinessDetailCard({ result }: ReadinessDetailCardProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Client Readiness Score
              <ReadinessScoreBadge score={result.score} />
            </CardTitle>
          </div>
          <ReadinessStatusBadge status={result.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={result.score} 
          className={cn(
            'h-2',
            result.score >= 80 && '[&>div]:bg-success',
            result.score >= 50 && result.score < 80 && '[&>div]:bg-warning',
            result.score < 50 && '[&>div]:bg-destructive'
          )}
        />
        
        <div className="space-y-2">
          {result.checks.map(check => {
            const Icon = check.icon;
            return (
              <div key={check.id} className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <div className={cn(
                  'p-1.5 rounded',
                  check.status === 'passed' && 'bg-success/10',
                  check.status === 'warning' && 'bg-warning/10',
                  check.status === 'failed' && 'bg-destructive/10'
                )}>
                  <Icon className={cn(
                    'w-4 h-4',
                    check.status === 'passed' && 'text-success',
                    check.status === 'warning' && 'text-warning',
                    check.status === 'failed' && 'text-destructive'
                  )} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.message}</p>
                </div>
                {check.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-warning" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            );
          })}
        </div>
        
        {result.status !== 'production_ready' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate(`/admin/organizations/${result.organizationId}/settings`)}
          >
            Configure Organization
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ReadinessDetailCard;
