/**
 * Seed Demo Policies Button
 * 
 * Button component for quickly creating all 7 demo policies for an organization.
 * Used in Policy Management for quick onboarding.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle, XCircle, SkipForward, Home, GraduationCap, Heart, Car, Dumbbell, BookOpen, PiggyBank } from 'lucide-react';
import { seedAllDemoPolicies, SeedAllResult } from '@/lib/demoPolicySeed';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  housing: Home,
  home_living: Home,
  schooling: GraduationCap,
  education: GraduationCap,
  health: Heart,
  transport: Car,
  wellbeing: Dumbbell,
  learning: BookOpen,
  long_term_financials: PiggyBank,
  financial: PiggyBank,
};

interface SeedDemoPoliciesButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function SeedDemoPoliciesButton({
  variant = 'outline',
  size = 'sm',
  className,
}: SeedDemoPoliciesButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedAllResult | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get organization ID
  const { data: profile } = useQuery({
    queryKey: ['profile-org', user?.id],
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

  const organizationId = profile?.organization_id;

  const handleSeed = async () => {
    if (!organizationId || !user?.id) {
      toast.error('Missing organization or user context');
      return;
    }

    setIsSeeding(true);
    setResult(null);

    try {
      const seedResult = await seedAllDemoPolicies(organizationId, user.id, true);
      setResult(seedResult);

      if (seedResult.created > 0) {
        toast.success(`Created ${seedResult.created} demo policies`, {
          description: 'All policies are published and ready for use.',
        });
        await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
        await queryClient.invalidateQueries({ queryKey: ['policies'] });
        await queryClient.invalidateQueries({ queryKey: ['organization_policies'] });
      } else if (seedResult.skipped > 0 && seedResult.failed === 0) {
        toast.info('All policies already exist', {
          description: 'No new policies were created.',
        });
      } else if (seedResult.failed > 0) {
        toast.error(`Failed to create ${seedResult.failed} policies`);
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed demo policies');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClose = () => {
    if (!isSeeding) {
      setOpen(false);
      setResult(null);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="w-4 h-4 text-amber-500" />
        Create Demo Policies
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <DialogTitle>Create Demo Policies</DialogTitle>
                <DialogDescription>
                  Instantly create all 7 UAE/GCC-style benefit policies
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {!result ? (
              <>
                <p className="text-sm text-muted-foreground">
                  This will create published policies for:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Housing Allowance', icon: 'housing' },
                    { name: 'Schooling', icon: 'schooling' },
                    { name: 'Health Insurance', icon: 'health' },
                    { name: 'Transport', icon: 'transport' },
                    { name: 'Wellbeing', icon: 'wellbeing' },
                    { name: 'Learning & Dev', icon: 'learning' },
                    { name: 'Long-Term Financials', icon: 'long_term_financials' },
                  ].map((policy) => {
                    const Icon = CATEGORY_ICONS[policy.icon] || Home;
                    return (
                      <div
                        key={policy.name}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span>{policy.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-600">
                    DEMO TEMPLATE
                  </Badge>
                  <span className="text-xs text-amber-700">
                    All policies will be tagged as demo templates
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-6 py-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-success/10 mb-2">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <p className="text-2xl font-bold">{result.created}</p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                  {result.skipped > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-muted mb-2">
                        <SkipForward className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-2xl font-bold">{result.skipped}</p>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  )}
                  {result.failed > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-destructive/10 mb-2">
                        <XCircle className="w-6 h-6 text-destructive" />
                      </div>
                      <p className="text-2xl font-bold">{result.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  )}
                </div>

                {result.details.length > 0 && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.details.map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs p-2 rounded bg-muted/50"
                      >
                        <span>{detail.templateName}</span>
                        {detail.result.alreadyExists ? (
                          <Badge variant="outline" className="text-[10px]">
                            Exists
                          </Badge>
                        ) : detail.result.success ? (
                          <Badge className="bg-success/10 text-success text-[10px]">
                            Created
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Failed
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {!result ? (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isSeeding}>
                  Cancel
                </Button>
                <Button onClick={handleSeed} disabled={isSeeding}>
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create All 7 Policies
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>Done</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SeedDemoPoliciesButton;
