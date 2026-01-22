/**
 * Admin Onboarding Status Card
 * 
 * Shows onboarding status + policy coverage checklist for each organization.
 * Designed for the demo pack to show platform value at a glance.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  CheckCircle2, 
  Circle,
  ChevronRight, 
  ChevronLeft,
  FileText,
  Users,
  Shield,
  Plug,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ORGS, getOrgTypeLabel } from '@/lib/clientDemoData';

interface OnboardingStep {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  status: 'complete' | 'in_progress' | 'pending';
  route: string;
}

interface OrgOnboardingStatus {
  orgId: string;
  orgName: string;
  orgType: string;
  steps: OnboardingStep[];
  overallProgress: number;
  policyCoverage: number;
  createdAt: string;
}

interface OnboardingStatusCardProps {
  className?: string;
  variant?: 'list' | 'detail';
  selectedOrgId?: string;
}

export function OnboardingStatusCard({ className, variant = 'list', selectedOrgId }: OnboardingStatusCardProps) {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { isDemoMode } = useDemoMode();
  const isRTL = direction === 'rtl';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  // Generate onboarding status for demo orgs
  const orgStatuses: OrgOnboardingStatus[] = useMemo(() => {
    if (!isDemoMode) {
      // Fallback for non-demo mode
      return [{
        orgId: 'sample-org',
        orgName: 'Sample Organization',
        orgType: 'large_private',
        steps: [
          { id: 'profile', label: 'Organization Profile', labelAr: 'ملف المنظمة', icon: Building2, status: 'complete', route: '/admin/organizations' },
          { id: 'governance', label: 'Governance Settings', labelAr: 'إعدادات الحوكمة', icon: Shield, status: 'complete', route: '/admin/settings' },
          { id: 'policies', label: 'Policies Setup', labelAr: 'إعداد السياسات', icon: FileText, status: 'in_progress', route: '/admin/policy-library' },
          { id: 'roles', label: 'Roles & Permissions', labelAr: 'الأدوار والصلاحيات', icon: Users, status: 'pending', route: '/admin/users-roles' },
          { id: 'integrations', label: 'Integrations', labelAr: 'التكاملات', icon: Plug, status: 'pending', route: '/admin/integration-readiness' },
        ],
        overallProgress: 45,
        policyCoverage: 60,
        createdAt: new Date().toISOString(),
      }];
    }

    return DEMO_ORGS.map((org, index) => {
      // Simulate different onboarding states for each org type
      const isGov = org.type === 'government';
      const isPrivate = org.type === 'large_private';
      
      const steps: OnboardingStep[] = [
        { 
          id: 'profile', 
          label: 'Organization Profile', 
          labelAr: 'ملف المنظمة', 
          icon: Building2, 
          status: 'complete', 
          route: '/admin/organizations' 
        },
        { 
          id: 'governance', 
          label: 'Governance Settings', 
          labelAr: 'إعدادات الحوكمة', 
          icon: Shield, 
          status: isGov || isPrivate ? 'complete' : 'in_progress', 
          route: '/admin/settings' 
        },
        { 
          id: 'policies', 
          label: 'Policies Setup', 
          labelAr: 'إعداد السياسات', 
          icon: FileText, 
          status: isGov ? 'complete' : isPrivate ? 'in_progress' : 'pending', 
          route: '/admin/policy-library' 
        },
        { 
          id: 'roles', 
          label: 'Roles & Permissions', 
          labelAr: 'الأدوار والصلاحيات', 
          icon: Users, 
          status: isGov ? 'complete' : 'pending', 
          route: '/admin/users-roles' 
        },
        { 
          id: 'integrations', 
          label: 'Integrations', 
          labelAr: 'التكاملات', 
          icon: Plug, 
          status: isGov ? 'in_progress' : 'pending', 
          route: '/admin/integration-readiness' 
        },
      ];

      const completedSteps = steps.filter(s => s.status === 'complete').length;
      const overallProgress = Math.round((completedSteps / steps.length) * 100);
      
      return {
        orgId: org.id,
        orgName: org.name,
        orgType: org.type,
        steps,
        overallProgress,
        policyCoverage: isGov ? 100 : isPrivate ? 85 : 60,
        createdAt: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
  }, [isDemoMode]);

  const statusColors = {
    complete: 'text-success',
    in_progress: 'text-warning',
    pending: 'text-muted-foreground',
  };

  const statusBadges = {
    complete: { label: 'Complete', labelAr: 'مكتمل', variant: 'default' as const },
    in_progress: { label: 'In Progress', labelAr: 'قيد التنفيذ', variant: 'secondary' as const },
    pending: { label: 'Pending', labelAr: 'معلق', variant: 'outline' as const },
  };

  const selectedOrg = selectedOrgId ? orgStatuses.find(o => o.orgId === selectedOrgId) : orgStatuses[0];

  if (variant === 'detail' && selectedOrg) {
    return (
      <Card className={cn("border border-border/60 bg-card", className)}>
        <CardHeader className="pb-2">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              {selectedOrg.orgName}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {getOrgTypeLabel(selectedOrg.orgType as any, language === 'ar')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5">
          {/* Overall Progress */}
          <div>
            <div className={cn("flex items-center justify-between mb-2", isRTL && "flex-row-reverse")}>
              <span className="text-sm text-muted-foreground">{t('Onboarding Progress', 'تقدم الإعداد')}</span>
              <span className="text-sm font-medium">{selectedOrg.overallProgress}%</span>
            </div>
            <Progress value={selectedOrg.overallProgress} className="h-2" />
          </div>
          
          {/* Checklist */}
          <div className="space-y-2">
            {selectedOrg.steps.map((step) => {
              const StepIcon = step.status === 'complete' ? CheckCircle2 : step.status === 'in_progress' ? Clock : Circle;
              return (
                <button
                  key={step.id}
                  onClick={() => navigate(step.route)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border border-border/40",
                    "hover:border-accent/50 hover:bg-accent/5 transition-all duration-200",
                    step.status === 'complete' && "bg-success/5 border-success/20",
                    step.status === 'in_progress' && "bg-warning/5 border-warning/20",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <step.icon className={cn("w-5 h-5 shrink-0", statusColors[step.status])} />
                  <span className="flex-1 text-sm text-left">{language === 'ar' ? step.labelAr : step.label}</span>
                  <StepIcon className={cn("w-4 h-4 shrink-0", statusColors[step.status])} />
                </button>
              );
            })}
          </div>
          
          {/* Policy Coverage */}
          <div className={cn("p-4 rounded-xl bg-muted/30 border border-border/40", isRTL && "text-right")}>
            <div className={cn("flex items-center gap-2 mb-2", isRTL && "flex-row-reverse")}>
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('Policy Coverage', 'تغطية السياسات')}</span>
            </div>
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <Progress value={selectedOrg.policyCoverage} className="flex-1 h-2" />
              <span className="text-sm font-semibold">{selectedOrg.policyCoverage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedOrg.policyCoverage < 100 
                ? t('Some benefit categories need policy definitions', 'بعض فئات المزايا تحتاج تعريفات سياسات')
                : t('All benefit categories have active policies', 'جميع فئات المزايا لديها سياسات نشطة')
              }
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/admin/policy-library')}
            >
              {t('Manage Policies', 'إدارة السياسات')}
            </Button>
            <Button 
              className="flex-1"
              onClick={() => navigate('/admin/onboarding')}
            >
              {t('Continue Setup', 'متابعة الإعداد')}
              <ChevronIcon className="w-4 h-4 ms-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <Card className={cn("border border-border/60 bg-card", className)}>
      <CardHeader className="pb-2">
        <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
          <CardTitle className={cn("flex items-center gap-2 text-lg", isRTL && "flex-row-reverse")}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            {t('Onboarding Status', 'حالة الإعداد')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/onboarding')}>
            {t('New Org', 'منظمة جديدة')}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {orgStatuses.map((org) => {
          const overallStatus = org.overallProgress === 100 ? 'complete' : org.overallProgress > 0 ? 'in_progress' : 'pending';
          const StatusIcon = overallStatus === 'complete' ? CheckCircle2 : overallStatus === 'in_progress' ? Clock : AlertTriangle;
          
          return (
            <button
              key={org.orgId}
              onClick={() => navigate(`/admin/organizations?id=${org.orgId}`)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-background/50",
                "hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 group",
                isRTL && "flex-row-reverse"
              )}
            >
              {/* Org Info */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <p className="font-medium truncate">{org.orgName}</p>
                <p className="text-xs text-muted-foreground">
                  {getOrgTypeLabel(org.orgType as any, language === 'ar')}
                </p>
              </div>
              
              {/* Progress */}
              <div className="w-24">
                <Progress value={org.overallProgress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground text-center">{org.overallProgress}%</p>
              </div>
              
              {/* Status Badge */}
              <Badge 
                variant={statusBadges[overallStatus].variant}
                className={cn("shrink-0", statusColors[overallStatus])}
              >
                <StatusIcon className="w-3 h-3 me-1" />
                {language === 'ar' ? statusBadges[overallStatus].labelAr : statusBadges[overallStatus].label}
              </Badge>
              
              <ChevronIcon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </button>
          );
        })}
        
        {/* Quick Summary */}
        <div className={cn("grid grid-cols-3 gap-3 pt-3 border-t border-border/40", isRTL && "text-right")}>
          <div className="text-center p-2 rounded-lg bg-success/5">
            <p className="text-lg font-bold text-success">{orgStatuses.filter(o => o.overallProgress === 100).length}</p>
            <p className="text-xs text-muted-foreground">{t('Complete', 'مكتمل')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/5">
            <p className="text-lg font-bold text-warning">{orgStatuses.filter(o => o.overallProgress > 0 && o.overallProgress < 100).length}</p>
            <p className="text-xs text-muted-foreground">{t('In Progress', 'قيد التنفيذ')}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-muted-foreground">{orgStatuses.filter(o => o.overallProgress === 0).length}</p>
            <p className="text-xs text-muted-foreground">{t('Pending', 'معلق')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OnboardingStatusCard;
