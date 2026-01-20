import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings2, Users, Briefcase, ShieldCheck, Store,
  LayoutDashboard, BarChart3, Eye, EyeOff
} from 'lucide-react';
import { useUIVisibility, UI_ELEMENTS_CONFIG, UserRole } from '@/contexts/UIVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

const ROLE_CONFIG = {
  employee: { 
    icon: Users, 
    label: 'Employee', 
    labelAr: 'الموظف',
    color: 'bg-primary/10 text-primary border-primary/20' 
  },
  employer: { 
    icon: Briefcase, 
    label: 'Employer', 
    labelAr: 'صاحب العمل',
    color: 'bg-accent/10 text-accent-foreground border-accent/20' 
  },
  vendor: { 
    icon: Store, 
    label: 'Vendor', 
    labelAr: 'البائع',
    color: 'bg-warning/10 text-warning border-warning/20' 
  },
  admin: { 
    icon: ShieldCheck, 
    label: 'Admin', 
    labelAr: 'المسؤول',
    color: 'bg-success/10 text-success border-success/20' 
  },
};

const PAGE_LABELS: Record<string, { en: string; ar: string }> = {
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  benefits_analysis: { en: 'Benefits Analysis', ar: 'تحليل المزايا' },
};

export default function UIConfiguration() {
  const { isElementVisible, setElementVisibility, loading } = useUIVisibility();
  const { direction, language } = useLanguage();
  const isRTL = direction === 'rtl';
  const [activeRole, setActiveRole] = useState<UserRole>('employee');
  const [updating, setUpdating] = useState<string | null>(null);
  const { createAuditLog } = useAdminAuditLog();

  const handleToggle = async (role: UserRole, pageKey: string, elementKey: string, currentValue: boolean) => {
    const toggleId = `${role}-${pageKey}-${elementKey}`;
    setUpdating(toggleId);
    
    try {
      await setElementVisibility(role, pageKey, elementKey, !currentValue);
      
      // P1 FIX: Audit log for UI config changes
      await createAuditLog({
        action: 'SETTINGS_UPDATE',
        entityType: 'settings',
        entityId: `ui_visibility_${role}_${pageKey}_${elementKey}`,
        metadata: { 
          role, 
          page_key: pageKey, 
          element_key: elementKey,
          new_value: !currentValue,
        },
      });
      
      toast.success(
        isRTL 
          ? `تم ${!currentValue ? 'إظهار' : 'إخفاء'} العنصر بنجاح`
          : `Element ${!currentValue ? 'shown' : 'hidden'} successfully`
      );
    } catch (error) {
      toast.error(isRTL ? 'فشل في تحديث الإعداد' : 'Failed to update setting');
    } finally {
      setUpdating(null);
    }
  };

  const roleConfig = UI_ELEMENTS_CONFIG[activeRole as keyof typeof UI_ELEMENTS_CONFIG] || {} as Record<string, { key: string; label: string; labelAr: string }[]>;
  const pages = Object.keys(roleConfig) as string[];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className={cn("space-y-1", isRTL && "text-right")}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-accent" />
          {isRTL ? 'تكوين الواجهة' : 'UI Configuration'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'تحكم في العناصر المرئية لكل دور في المنصة'
            : 'Control which UI elements are visible for each role in the platform'}
        </p>
      </div>

      {/* Role Tabs */}
      <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          {Object.entries(ROLE_CONFIG).map(([role, config]) => (
            <TabsTrigger 
              key={role} 
              value={role}
              className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}
            >
              <config.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? config.labelAr : config.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(ROLE_CONFIG).map((role) => (
          <TabsContent key={role} value={role} className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pages.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {isRTL ? 'لا توجد عناصر قابلة للتكوين لهذا الدور' : 'No configurable elements for this role'}
                      </p>
                    </Card>
                  ) : (
                    pages.map((pageKey) => {
                      const elements = roleConfig[pageKey as keyof typeof roleConfig] || [];
                      const pageLabel = PAGE_LABELS[pageKey] || { en: pageKey, ar: pageKey };
                      const visibleCount = elements.filter(el => 
                        isElementVisible(role as UserRole, pageKey, el.key)
                      ).length;

                      return (
                        <Card key={pageKey} className="overflow-hidden">
                          <CardHeader className="pb-3 bg-muted/30">
                            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                                <LayoutDashboard className="w-4 h-4 text-accent" />
                                <CardTitle className="text-base">
                                  {isRTL ? pageLabel.ar : pageLabel.en}
                                </CardTitle>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {visibleCount}/{elements.length} {isRTL ? 'مرئي' : 'visible'}
                              </Badge>
                            </div>
                            <CardDescription className={cn(isRTL && "text-right")}>
                              {isRTL 
                                ? 'قم بتبديل رؤية العناصر في هذه الصفحة'
                                : 'Toggle visibility of elements on this page'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="grid gap-3">
                              {elements.map((element, idx) => {
                                const isVisible = isElementVisible(role as UserRole, pageKey, element.key);
                                const toggleId = `${role}-${pageKey}-${element.key}`;
                                const isUpdating = updating === toggleId;

                                return (
                                  <motion.div
                                    key={element.key}
                                    initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-lg border transition-all",
                                      isVisible 
                                        ? "bg-card border-border" 
                                        : "bg-muted/30 border-dashed border-muted-foreground/30",
                                      isRTL && "flex-row-reverse"
                                    )}
                                  >
                                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                                      {isVisible ? (
                                        <Eye className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                      )}
                                      <Label 
                                        htmlFor={toggleId}
                                        className={cn(
                                          "font-medium cursor-pointer",
                                          !isVisible && "text-muted-foreground"
                                        )}
                                      >
                                        {isRTL ? element.labelAr : element.label}
                                      </Label>
                                    </div>
                                    <Switch
                                      id={toggleId}
                                      checked={isVisible}
                                      onCheckedChange={() => handleToggle(role as UserRole, pageKey, element.key, isVisible)}
                                      disabled={isUpdating}
                                    />
                                  </motion.div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
