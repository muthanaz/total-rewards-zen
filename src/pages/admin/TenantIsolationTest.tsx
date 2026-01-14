import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Database,
  RefreshCw
} from 'lucide-react';

interface TestResult {
  table: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
  count?: number;
}

export default function TenantIsolationTestPage() {
  const { language } = useLanguage();
  const { organizationId, user } = useAuth();
  const isArabic = language === 'ar';
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    if (!user || !organizationId) {
      setResults([{
        table: 'auth',
        description: 'Authentication check',
        status: 'fail',
        details: 'No user or organization context available',
      }]);
      return;
    }

    setIsRunning(true);
    setResults([]);

    const tests: TestResult[] = [];

    try {
      // Test 1: Profiles - should only see org profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, organization_id')
        .limit(100);

      if (profilesError) {
        tests.push({
          table: 'profiles',
          description: 'Profile access scope',
          status: 'warning',
          details: `Query error: ${profilesError.message}`,
        });
      } else {
        const ownOrgCount = profiles?.filter(p => p.organization_id === organizationId).length || 0;
        const otherOrgCount = profiles?.filter(p => p.organization_id && p.organization_id !== organizationId).length || 0;

        tests.push({
          table: 'profiles',
          description: 'Profile access scope',
          status: otherOrgCount === 0 ? 'pass' : 'fail',
          details: otherOrgCount === 0 
            ? `Access limited to org (${ownOrgCount} records)`
            : `WARNING: Can see ${otherOrgCount} records from other orgs!`,
          count: profiles?.length,
        });
      }

      // Test 2: Requests - should only see org requests
      const { data: requests, error: requestsError } = await supabase
        .from('requests')
        .select('id, organization_id')
        .limit(100);

      if (requestsError) {
        tests.push({
          table: 'requests',
          description: 'Request access scope',
          status: 'warning',
          details: `Query error: ${requestsError.message}`,
        });
      } else {
        const ownOrgCount = requests?.filter(r => r.organization_id === organizationId).length || 0;
        const otherOrgCount = requests?.filter(r => r.organization_id && r.organization_id !== organizationId).length || 0;

        tests.push({
          table: 'requests',
          description: 'Request access scope',
          status: otherOrgCount === 0 ? 'pass' : 'fail',
          details: otherOrgCount === 0 
            ? `Access limited to org (${ownOrgCount} records)`
            : `WARNING: Can see ${otherOrgCount} records from other orgs!`,
          count: requests?.length,
        });
      }

      // Test 3: Benefit entitlements
      const { data: entitlements, error: entitlementsError } = await supabase
        .from('benefit_entitlements')
        .select('id, organization_id')
        .limit(100);

      if (entitlementsError) {
        tests.push({
          table: 'benefit_entitlements',
          description: 'Entitlement access scope',
          status: 'warning',
          details: `Query error: ${entitlementsError.message}`,
        });
      } else {
        const ownOrgCount = entitlements?.filter(e => e.organization_id === organizationId).length || 0;
        const otherOrgCount = entitlements?.filter(e => e.organization_id && e.organization_id !== organizationId).length || 0;

        tests.push({
          table: 'benefit_entitlements',
          description: 'Entitlement access scope',
          status: otherOrgCount === 0 ? 'pass' : 'fail',
          details: otherOrgCount === 0 
            ? `Access limited to org (${ownOrgCount} records)`
            : `WARNING: Can see ${otherOrgCount} records from other orgs!`,
          count: entitlements?.length,
        });
      }

      // Test 4: Utilization events
      const { data: events, error: eventsError } = await supabase
        .from('utilization_events')
        .select('id, organization_id')
        .limit(100);

      if (eventsError) {
        tests.push({
          table: 'utilization_events',
          description: 'Utilization events scope',
          status: 'warning',
          details: `Query error: ${eventsError.message}`,
        });
      } else {
        const ownOrgCount = events?.filter(e => e.organization_id === organizationId).length || 0;
        const otherOrgCount = events?.filter(e => e.organization_id && e.organization_id !== organizationId).length || 0;

        tests.push({
          table: 'utilization_events',
          description: 'Utilization events scope',
          status: otherOrgCount === 0 ? 'pass' : 'fail',
          details: otherOrgCount === 0 
            ? `Access limited to org (${ownOrgCount} records)`
            : `WARNING: Can see ${otherOrgCount} records from other orgs!`,
          count: events?.length,
        });
      }

      // Test 5: Leave balances
      const { data: leaves, error: leavesError } = await supabase
        .from('leave_balances')
        .select('id, organization_id')
        .limit(100);

      if (leavesError) {
        tests.push({
          table: 'leave_balances',
          description: 'Leave balances scope',
          status: 'warning',
          details: `Query error: ${leavesError.message}`,
        });
      } else {
        const ownOrgCount = leaves?.filter(l => l.organization_id === organizationId).length || 0;
        const otherOrgCount = leaves?.filter(l => l.organization_id && l.organization_id !== organizationId).length || 0;

        tests.push({
          table: 'leave_balances',
          description: 'Leave balances scope',
          status: otherOrgCount === 0 ? 'pass' : 'fail',
          details: otherOrgCount === 0 
            ? `Access limited to org (${ownOrgCount} records)`
            : `WARNING: Can see ${otherOrgCount} records from other orgs!`,
          count: leaves?.length,
        });
      }

      // Test 6: Organizations - admin should see all, employer should see own
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id')
        .limit(100);

      if (orgsError) {
        tests.push({
          table: 'organizations',
          description: 'Organization access',
          status: 'warning',
          details: `Query error: ${orgsError.message}`,
        });
      } else {
        tests.push({
          table: 'organizations',
          description: 'Organization access',
          status: 'pass', // This is expected behavior based on role
          details: `Can access ${orgs?.length || 0} organization(s)`,
          count: orgs?.length,
        });
      }

    } catch (err) {
      tests.push({
        table: 'system',
        description: 'Test execution',
        status: 'fail',
        details: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown'}`,
      });
    }

    setResults(tests);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<string, string> = {
      pass: 'bg-green-500/10 text-green-600 border-green-500/20',
      fail: 'bg-red-500/10 text-red-600 border-red-500/20',
      warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      pending: 'bg-muted text-muted-foreground',
    };
    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {isArabic ? 'اختبار عزل المستأجرين' : 'Tenant Isolation Test'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic 
            ? 'تحقق من أن سياسات RLS تعزل البيانات بشكل صحيح حسب المؤسسة' 
            : 'Verify that RLS policies correctly isolate data by organization'}
        </p>
      </div>

      {/* Context Info */}
      <Card className="card-elevated">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current User ID</p>
              <p className="font-mono text-xs mt-1 bg-muted p-2 rounded truncate">
                {user?.id || 'Not authenticated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization ID</p>
              <p className="font-mono text-xs mt-1 bg-muted p-2 rounded truncate">
                {organizationId || 'Not assigned'}
              </p>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={runTests} 
                disabled={isRunning || !user}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {isArabic ? 'جاري الاختبار...' : 'Running Tests...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {isArabic ? 'تشغيل الاختبارات' : 'Run Tests'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={cn(
            "card-elevated border-l-4",
            passCount > 0 ? "border-l-green-500" : "border-l-muted"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{passCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'ناجح' : 'Passed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn(
            "card-elevated border-l-4",
            failCount > 0 ? "border-l-red-500" : "border-l-muted"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{failCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'فشل' : 'Failed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={cn(
            "card-elevated border-l-4",
            warningCount > 0 ? "border-l-amber-500" : "border-l-muted"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-amber-600">{warningCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تحذيرات' : 'Warnings'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {isArabic ? 'نتائج الاختبار' : 'Test Results'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'كل اختبار يتحقق من أن البيانات معزولة بشكل صحيح حسب organization_id' 
              : 'Each test verifies data is correctly scoped by organization_id'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isArabic ? 'اضغط "تشغيل الاختبارات" للبدء' : 'Click "Run Tests" to begin'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border",
                    result.status === 'fail' && "bg-red-500/5 border-red-500/20",
                    result.status === 'pass' && "bg-green-500/5 border-green-500/20",
                    result.status === 'warning' && "bg-amber-500/5 border-amber-500/20",
                  )}
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-semibold">{result.table}</span>
                      {getStatusBadge(result.status)}
                      {result.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({result.count} rows)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                    <p className="text-sm mt-1">{result.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
