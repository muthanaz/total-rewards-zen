/**
 * Operations Hub Queue Tabs
 * 
 * Tab bar with counts for queue segments:
 * - My Team Queue (default)
 * - Pending
 * - In Review
 * - SLA Risk
 * - Missing Docs
 * - High Value
 * - All
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Clock,
  Hourglass,
  Flame,
  FileQuestion,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueueTab, QueueStats } from './types';

interface OpsQueueTabsProps {
  activeTab: QueueTab;
  onTabChange: (tab: QueueTab) => void;
  stats: QueueStats;
  slaEnabled?: boolean;
}

interface TabDef {
  id: QueueTab;
  label: string;
  icon: React.ReactNode;
  countKey: keyof QueueStats;
  variant?: 'default' | 'warning' | 'destructive';
}

const TAB_DEFS: TabDef[] = [
  { id: 'my_team', label: 'My Team Queue', icon: <Users className="w-4 h-4" />, countKey: 'total' },
  { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" />, countKey: 'pending', variant: 'warning' },
  { id: 'in_review', label: 'In Review', icon: <Hourglass className="w-4 h-4" />, countKey: 'inReview' },
  { id: 'sla_risk', label: 'SLA Risk', icon: <Flame className="w-4 h-4" />, countKey: 'slaAtRisk', variant: 'destructive' },
  { id: 'missing_docs', label: 'Needs Info', icon: <FileQuestion className="w-4 h-4" />, countKey: 'missingDocs', variant: 'warning' },
  { id: 'high_value', label: 'High Value', icon: <TrendingUp className="w-4 h-4" />, countKey: 'highValue' },
  { id: 'all', label: 'All', icon: <Inbox className="w-4 h-4" />, countKey: 'total' },
];

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
};

export function OpsQueueTabs({
  activeTab,
  onTabChange,
  stats,
  slaEnabled = true,
}: OpsQueueTabsProps) {
  // Filter out SLA Risk tab if SLA is disabled
  const visibleTabs = slaEnabled 
    ? TAB_DEFS 
    : TAB_DEFS.filter(t => t.id !== 'sla_risk');

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as QueueTab)}>
      <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
        {visibleTabs.map((tab) => {
          const count = stats[tab.countKey];
          const isActive = activeTab === tab.id;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "gap-2 px-3 py-2"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-1 text-xs",
                  isActive 
                    ? "bg-accent-foreground/20" 
                    : variantStyles[tab.variant || 'default']
                )}
              >
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default OpsQueueTabs;
