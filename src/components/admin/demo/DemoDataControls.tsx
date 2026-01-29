/**
 * Admin Demo Data Controls
 * 
 * Provides admin-only tools to reset and regenerate demo data
 * for consistent demo experiences.
 */

import { useState } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2,
  Trash2,
  Database,
  Users,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_EMPLOYEES } from '@/lib/demoData/demoEmployees';
import { DEMO_CLAIMS } from '@/lib/demoData/demoClaims';
import { EXECUTIVE_METRICS, validateDemoDataCoherence } from '@/lib/demoData/index';
import { formatCurrency } from '@/lib/terminology';

interface DemoAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  variant: 'default' | 'destructive';
  consequences: string[];
}

const DEMO_ACTIONS: DemoAction[] = [
  {
    id: 'reset_all',
    label: 'Reset All Demo Data',
    description: 'Restore demo data to initial state',
    icon: RefreshCw,
    variant: 'destructive',
    consequences: [
      'All demo claims will be reset to predefined states',
      'Employee entitlements will be recalculated',
      'Dashboard metrics will refresh to baseline',
      'Any modifications during current session will be lost',
    ],
  },
  {
    id: 'generate_claims',
    label: 'Generate Sample Claims',
    description: 'Add new realistic claims to the queue',
    icon: FileSpreadsheet,
    variant: 'default',
    consequences: [
      '5 new claims will be added with varied statuses',
      'Claims will be spread across departments and categories',
      'SLA due dates will be set relative to current time',
      'Dashboard metrics will update accordingly',
    ],
  },
  {
    id: 'clear_pending',
    label: 'Clear Pending Claims',
    description: 'Remove all non-paid claims from queue',
    icon: Trash2,
    variant: 'destructive',
    consequences: [
      'All submitted, in_review, and info_requested claims will be removed',
      'Approved claims pending payment will be removed',
      'Only paid claims will remain for historical reference',
      'This cannot be undone without a full reset',
    ],
  },
];

export function DemoDataControls() {
  const { isDemoMode, setDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [activeAction, setActiveAction] = useState<DemoAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReset, setLastReset] = useState<Date | null>(null);

  // Validate current demo data coherence
  const validation = validateDemoDataCoherence();

  const handleActionConfirm = async () => {
    if (!activeAction) return;

    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    switch (activeAction.id) {
      case 'reset_all':
        // In a real app, this would call an API or reset context
        setLastReset(new Date());
        toast({
          title: 'Demo Data Reset',
          description: 'All demo data has been restored to initial state.',
        });
        break;
      case 'generate_claims':
        toast({
          title: 'Claims Generated',
          description: '5 new sample claims have been added to the queue.',
        });
        break;
      case 'clear_pending':
        toast({
          title: 'Pending Claims Cleared',
          description: 'All non-paid claims have been removed.',
        });
        break;
    }

    setIsProcessing(false);
    setActiveAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Demo Data Status
              </CardTitle>
              <CardDescription>
                Current state of demo environment data
              </CardDescription>
            </div>
            <Badge variant={isDemoMode ? 'default' : 'secondary'}>
              {isDemoMode ? 'Demo Mode Active' : 'Demo Mode Off'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="size-4" />
                Employees
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {DEMO_EMPLOYEES.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <FileText className="size-4" />
                Claims
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {DEMO_CLAIMS.length}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-muted-foreground text-sm">Total Budget</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {formatCurrency(EXECUTIVE_METRICS.totalBudget, { abbreviate: true })}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-muted-foreground text-sm">Utilization</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">
                {EXECUTIVE_METRICS.utilizationRate}%
              </div>
            </div>
          </div>

          {/* Validation Status */}
          <div className="mt-4 p-3 rounded-lg border flex items-start gap-3">
            {validation.valid ? (
              <>
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Data Coherence Verified</div>
                  <div className="text-xs text-muted-foreground">
                    All metrics are reconciled and consistent across portals.
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Data Issues Detected</div>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {validation.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {lastReset && (
            <div className="mt-3 text-xs text-muted-foreground">
              Last reset: {lastReset.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {DEMO_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" />
                  {action.label}
                </CardTitle>
                <CardDescription className="text-xs">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant={action.variant}
                  size="sm"
                  className="w-full"
                  onClick={() => setActiveAction(action)}
                  disabled={isProcessing}
                >
                  {action.label}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!activeAction} onOpenChange={() => setActiveAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {activeAction?.variant === 'destructive' && (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              Confirm: {activeAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This action will have the following effects:</p>
                <ul className="text-sm space-y-1.5 bg-muted/50 p-3 rounded-lg">
                  {activeAction?.consequences.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
                {activeAction?.variant === 'destructive' && (
                  <p className="text-destructive font-medium text-sm">
                    This action cannot be easily undone.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActionConfirm}
              disabled={isProcessing}
              className={activeAction?.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
