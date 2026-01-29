/**
 * Operations Hub Tab Navigation
 * 
 * Three tabs within /employer/ops:
 * - Queue (default): The claims/requests queue workbench
 * - Overview: HR Ops metrics dashboard (Queue Health, SLA, Throughput, Payments)
 * - Payments: Deep link to settlements with pipeline summary
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, BarChart3, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OpsHubTab = 'queue' | 'overview' | 'payments';

interface OpsHubTabsProps {
  activeTab: OpsHubTab;
  onTabChange: (tab: OpsHubTab) => void;
  queueCount?: number;
  paymentsReadyCount?: number;
}

interface TabDef {
  id: OpsHubTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TAB_DEFS: TabDef[] = [
  { 
    id: 'queue', 
    label: 'Queue', 
    icon: <LayoutGrid className="w-4 h-4" />, 
    description: 'Process claims and requests',
  },
  { 
    id: 'overview', 
    label: 'Overview', 
    icon: <BarChart3 className="w-4 h-4" />, 
    description: 'Operational health metrics',
  },
  { 
    id: 'payments', 
    label: 'Payments', 
    icon: <Banknote className="w-4 h-4" />, 
    description: 'Settlements pipeline',
  },
];

export function OpsHubTabs({
  activeTab,
  onTabChange,
  queueCount,
  paymentsReadyCount,
}: OpsHubTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as OpsHubTab)}>
      <TabsList className="w-full justify-start h-auto gap-1 bg-transparent p-0 border-b border-border pb-2">
        {TAB_DEFS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'queue' ? queueCount : tab.id === 'payments' ? paymentsReadyCount : undefined;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "relative gap-2 px-4 py-2.5 text-sm rounded-none border-b-2 border-transparent -mb-[2px]",
                "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground",
                "hover:text-foreground"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {count !== undefined && count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-1 text-xs min-w-[1.5rem] justify-center",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </Badge>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default OpsHubTabs;
