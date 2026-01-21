/**
 * Template C: Configuration Page Template
 * 
 * Structure:
 * 1. Header (PageLayout with save action)
 * 2. Tabs for different config sections
 * 3. Settings Cards with grouped controls
 * 4. Save States (dirty/clean indicator)
 * 5. Audit Trail Panel
 */

import { ReactNode, useState } from 'react';
import { LucideIcon, Save, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';

export interface ConfigTab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details?: string;
}

interface ConfigurationTemplateProps {
  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  
  // Tabs
  tabs: ConfigTab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Save state
  isDirty?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  onReset?: () => void;
  lastSaved?: Date;
  
  // Audit trail
  auditLog?: AuditEntry[];
  showAuditLog?: boolean;
  
  // Additional actions
  additionalActions?: ReactNode;
  
  className?: string;
}

export function ConfigurationTemplate({
  title,
  description,
  icon,
  iconClassName,
  tabs,
  activeTab,
  onTabChange,
  isDirty = false,
  isSaving = false,
  onSave,
  onReset,
  lastSaved,
  auditLog,
  showAuditLog = true,
  additionalActions,
  className,
}: ConfigurationTemplateProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const currentTab = activeTab ?? internalTab;
  const handleTabChange = onTabChange ?? setInternalTab;

  const headerActions = (
    <div className="flex items-center gap-2">
      {isDirty && (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
          Unsaved changes
        </Badge>
      )}
      {lastSaved && !isDirty && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-success" />
          Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
      {additionalActions}
      {onReset && isDirty && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      )}
      {onSave && (
        <Button size="sm" onClick={onSave} disabled={!isDirty || isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      )}
    </div>
  );

  return (
    <PageLayout
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      actions={headerActions}
      className={cn('space-y-6', className)}
    >
      <div className={cn(
        "grid gap-6",
        showAuditLog && auditLog ? "lg:grid-cols-[1fr_300px]" : ""
      )}>
        {/* Main Settings Area */}
        <div className="space-y-6">
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="gap-2"
                  >
                    {TabIcon && <TabIcon className="w-4 h-4" />}
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Audit Trail Sidebar */}
        {showAuditLog && auditLog && auditLog.length > 0 && (
          <AuditTrailPanel entries={auditLog} />
        )}
      </div>
    </PageLayout>
  );
}

// ============= SETTINGS CARD COMPONENT =============

interface SettingsCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
}: SettingsCardProps) {
  return (
    <Card className={cn("border-border/40", className)}>
      <CardHeader>
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t pt-4">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// ============= SETTING ROW COMPONENT =============

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingRow({ label, description, children, className }: SettingRowProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3", className)}>
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="sm:ml-4 shrink-0">
        {children}
      </div>
    </div>
  );
}

// ============= AUDIT TRAIL PANEL =============

interface AuditTrailPanelProps {
  entries: AuditEntry[];
  maxItems?: number;
}

function AuditTrailPanel({ entries, maxItems = 10 }: AuditTrailPanelProps) {
  const displayEntries = entries.slice(0, maxItems);

  return (
    <Card className="h-fit sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayEntries.map((entry) => (
            <div key={entry.id} className="text-xs space-y-1">
              <p className="font-medium">{entry.action}</p>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{entry.user}</span>
                <span>{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</span>
              </div>
              {entry.details && (
                <p className="text-muted-foreground truncate">{entry.details}</p>
              )}
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ConfigurationTemplate;
