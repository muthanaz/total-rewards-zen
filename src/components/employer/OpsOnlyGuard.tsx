import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmployerViewMode } from '@/contexts/EmployerViewModeContext';
import { Briefcase, LayoutDashboard, ShieldCheck } from 'lucide-react';

interface OpsOnlyGuardProps {
  children: ReactNode;
  /** Custom title for the guard message */
  title?: string;
  /** Custom description for the guard message */
  description?: string;
}

/**
 * Guards ops-only pages from Executive users.
 * Shows a friendly empty state guiding them to switch modes or go to dashboard.
 */
export function OpsOnlyGuard({ 
  children,
  title = 'Managed by HR Operations',
  description = 'This workspace is used for day-to-day processing including claims review, policy edits, and data integrations.',
}: OpsOnlyGuardProps) {
  const { isExecutive, setViewMode } = useEmployerViewMode();
  const navigate = useNavigate();

  const handleSwitchToOps = () => {
    setViewMode('operational');
  };

  const handleGoToDashboard = () => {
    navigate('/employer');
  };

  if (!isExecutive) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-lg w-full border-border/50 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-xl font-display font-semibold">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-sm text-left space-y-2">
            <p className="text-muted-foreground">
              As an <span className="font-medium text-foreground">Executive</span>, you have access to strategic analytics and insights. 
              HR Operations handles tactical workflows.
            </p>
            <p className="text-muted-foreground">
              You can switch to HR Ops mode anytime to access this page.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={handleSwitchToOps}
              className="gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Switch to HR Ops
            </Button>
            <Button 
              onClick={handleGoToDashboard}
              className="gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Executive Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
