/**
 * Demo Reset Button
 * 
 * Provides a way to reset demo data and restart the demo scenario.
 * Only visible in demo mode.
 */

import { useState } from 'react';
import { RotateCcw, CheckCircle2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ORG } from '@/lib/demoScenario';
import { DEMO_SCRIPT_STEPS } from '@/hooks/useDemoScenario';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DemoResetButtonProps {
  variant?: 'button' | 'floating' | 'compact';
  className?: string;
}

export function DemoResetButton({ variant = 'button', className }: DemoResetButtonProps) {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleReset = async () => {
    setIsResetting(true);
    
    // Simulate reset delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Clear any local demo state
    localStorage.removeItem('bnft_demo_step');
    localStorage.removeItem('bnft_demo_started');
    
    setIsResetting(false);
    setIsDialogOpen(false);
    
    toast.success('Demo reset complete', {
      description: 'Starting fresh with Nexa Holdings scenario',
    });
    
    // Navigate to employer dashboard to start demo
    navigate('/employer/dashboard');
  };

  const handleStartDemo = () => {
    localStorage.setItem('bnft_demo_started', 'true');
    localStorage.setItem('bnft_demo_step', '1');
    
    toast.success('Demo started', {
      description: `Welcome to ${DEMO_ORG.displayName}`,
    });
    
    navigate('/employer/dashboard');
    setIsDialogOpen(false);
  };

  if (variant === 'floating') {
    return (
      <div className={cn("fixed bottom-4 left-4 z-50", className)}>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-lg gap-2">
              <Play className="w-4 h-4" />
              Demo Controls
            </Button>
          </DialogTrigger>
          <DemoControlDialog
            onReset={handleReset}
            onStart={handleStartDemo}
            isResetting={isResetting}
          />
        </Dialog>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        disabled={isResetting}
        className={cn("gap-2", className)}
      >
        <RotateCcw className={cn("w-4 h-4", isResetting && "animate-spin")} />
        Reset
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <RotateCcw className="w-4 h-4" />
          Reset Demo
        </Button>
      </DialogTrigger>
      <DemoControlDialog
        onReset={handleReset}
        onStart={handleStartDemo}
        isResetting={isResetting}
      />
    </Dialog>
  );
}

function DemoControlDialog({
  onReset,
  onStart,
  isResetting,
}: {
  onReset: () => void;
  onStart: () => void;
  isResetting: boolean;
}) {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Demo Controls
        </DialogTitle>
        <DialogDescription>
          <span className="font-semibold text-foreground">{DEMO_ORG.displayName}</span>
          <span className="mx-2">•</span>
          <span>{DEMO_ORG.employeeCount} employees</span>
          <span className="mx-2">•</span>
          <span>{DEMO_ORG.industry}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Demo Script Overview */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            10-Minute Demo Script
            <Badge variant="outline" className="text-xs">
              {DEMO_SCRIPT_STEPS.length} steps
            </Badge>
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Employer/Executive: Budget, Budget Leakage, SLA Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>HR Ops: Claims & Requests, Policy Publish</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Employee: Dashboard, Request Tracking, Marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Admin: Audit Log, Feature Flags, Sync Monitor</span>
            </div>
          </div>
        </div>

        {/* Key Data Points */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground">Total Investment</div>
            <div className="font-semibold">AED 24.6M</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground">Utilization</div>
            <div className="font-semibold">68%</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground">Pending Claims</div>
            <div className="font-semibold">47 (8 urgent)</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-muted-foreground">Zombie Spend</div>
            <div className="font-semibold">AED 2.95M</div>
          </div>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onReset} disabled={isResetting}>
          <RotateCcw className={cn("w-4 h-4 me-2", isResetting && "animate-spin")} />
          Reset Demo
        </Button>
        <Button onClick={onStart}>
          <Play className="w-4 h-4 me-2" />
          Start Demo
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
