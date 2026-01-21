/**
 * Template B: Operations Queue Template
 * 
 * Structure:
 * 1. Header (PageLayout with actions)
 * 2. Filters Bar
 * 3. Status Tabs (Pending/In Review/SLA Risk/etc.)
 * 4. Data Table with actions
 * 5. Detail Sheet
 * 6. Bulk Actions Bar
 */

import { ReactNode, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageLayout } from '@/components/shared/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Clock, CheckCircle2, FileWarning, DollarSign } from 'lucide-react';

export interface QueueTab {
  id: string;
  label: string;
  count: number;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'destructive' | 'success';
}

interface OpsQueueTemplateProps {
  // Header
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
  
  // Filters
  filters?: ReactNode;
  
  // Queue tabs
  tabs: QueueTab[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  
  // Table content (rendered per tab)
  children: ReactNode;
  
  // Bulk actions
  selectedCount?: number;
  bulkActions?: ReactNode;
  
  // Stats (optional inline stats above table)
  inlineStats?: ReactNode;
  
  className?: string;
}

const tabVariants = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
};

export function OpsQueueTemplate({
  title,
  description,
  icon,
  iconClassName,
  actions,
  filters,
  tabs,
  activeTab,
  onTabChange,
  children,
  selectedCount = 0,
  bulkActions,
  inlineStats,
  className,
}: OpsQueueTemplateProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const currentTab = activeTab ?? internalTab;
  const handleTabChange = onTabChange ?? setInternalTab;

  return (
    <PageLayout
      title={title}
      description={description}
      icon={icon}
      iconClassName={iconClassName}
      actions={actions}
      filters={filters}
      className={cn('space-y-6', className)}
    >
      {/* Inline Stats */}
      {inlineStats && (
        <section aria-label="Queue statistics">
          {inlineStats}
        </section>
      )}

      {/* Queue Card with Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                        "gap-2 px-3 py-2"
                      )}
                    >
                      {TabIcon && <TabIcon className="w-4 h-4" />}
                      {tab.label}
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-1 text-xs",
                          currentTab === tab.id ? "bg-accent-foreground/20" : tabVariants[tab.variant || 'default']
                        )}
                      >
                        {tab.count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {children}
        </CardContent>
      </Card>

      {/* Bulk Actions Bar (Sticky at bottom when items selected) */}
      {selectedCount > 0 && bulkActions && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-lg z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={true} />
              <span className="text-sm font-medium">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bulkActions}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

// ============= DEFAULT QUEUE TABS =============

export const DEFAULT_CLAIMS_TABS: QueueTab[] = [
  { id: 'pending', label: 'Pending', count: 0, icon: Clock, variant: 'warning' },
  { id: 'in_review', label: 'In Review', count: 0, icon: FileWarning, variant: 'default' },
  { id: 'sla_risk', label: 'SLA Risk', count: 0, icon: AlertCircle, variant: 'destructive' },
  { id: 'missing_docs', label: 'Missing Docs', count: 0, icon: FileWarning, variant: 'warning' },
  { id: 'high_value', label: 'High Value', count: 0, icon: DollarSign, variant: 'default' },
  { id: 'completed', label: 'Completed', count: 0, icon: CheckCircle2, variant: 'success' },
];

export default OpsQueueTemplate;
