import { Outlet } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { VendorSidebar } from './VendorSidebar';
import { SkipLink, MainContent } from '@/components/ui/skip-link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { VendorPortalGate } from '@/components/shared/Phase2Gate';
import { useVendor } from '@/hooks/useVendorData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, LogOut } from 'lucide-react';

function VendorSuspendedState() {
  const { direction, t } = useLanguage();
  const { signOut } = useAuth();
  const isRTL = direction === 'rtl';

  return (
    <div className={cn(
      "min-h-screen bg-background flex items-center justify-center p-4",
      isRTL && "rtl"
    )}>
      <Card className="max-w-md w-full border-destructive/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl text-foreground">
            {t('vendor.accountSuspended') || 'Account Suspended'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground text-sm">
            {t('vendor.suspendedExplanation') || 
              'Your vendor account has been temporarily suspended by a platform administrator. This may be due to policy review or compliance verification.'}
          </p>
          <div className={cn(
            "flex flex-col sm:flex-row gap-3",
            isRTL && "sm:flex-row-reverse"
          )}>
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <a href="mailto:support@bnft.ae">
                <Mail className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('common.contactSupport') || 'Contact Support'}
              </a>
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => signOut()}
            >
              <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('common.signOut') || 'Sign Out'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VendorLayout() {
  const { direction } = useLanguage();
  const { user } = useAuth();
  const { data: vendor, isLoading } = useVendor();
  const isRTL = direction === 'rtl';
  const hasLoggedSuspensionView = useRef(false);

  // Log suspension notice view once per session (P2: audit trail)
  useEffect(() => {
    if (
      vendor?.status === 'suspended' && 
      user?.id && 
      !hasLoggedSuspensionView.current
    ) {
      hasLoggedSuspensionView.current = true;
      supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'VIEW',
        resource_type: 'vendor_suspended_notice',
        resource_id: vendor.id,
        details: { 
          actor_role: 'vendor',
          event: 'view_suspended_notice',
        },
      }).then(() => {
        // Silent - don't block UI
      });
    }
  }, [vendor?.status, vendor?.id, user?.id]);

  // Show suspended state if vendor is suspended
  if (!isLoading && vendor?.status === 'suspended') {
    return <VendorSuspendedState />;
  }

  return (
    <VendorPortalGate>
      <div className={cn("min-h-screen bg-background", isRTL && "rtl")}>
        <SkipLink targetId="vendor-main-content" />
        <VendorSidebar />
        <MainContent 
          id="vendor-main-content"
          className={cn(
            "transition-all duration-300",
            isRTL ? "lg:mr-64" : "lg:ml-64"
          )}
        >
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">
            <Outlet />
          </div>
        </MainContent>
      </div>
    </VendorPortalGate>
  );
}