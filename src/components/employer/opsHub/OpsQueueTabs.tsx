/**
 * Operations Hub Queue Tabs
 * 
 * Simplified tab bar with two options:
 * - My Queue (assigned to me) - DEFAULT
 * - All Queue (all action-required items)
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QueueTab, QueueStats } from './types';

interface OpsQueueTabsProps {
  activeTab: QueueTab;
  onTabChange: (tab: QueueTab) => void;
  stats: QueueStats;
  currentUserId?: string | null;
}

interface TabDef {
  id: QueueTab;
  label: string;
  icon: React.ReactNode;
  countKey: keyof QueueStats;
  description: string;
}

const TAB_DEFS: TabDef[] = [
  { 
    id: 'my_queue', 
    label: 'My Queue', 
    icon: <User className="w-4 h-4" />, 
    countKey: 'myQueue',
    description: 'Items assigned to you',
  },
  { 
    id: 'all_queue', 
    label: 'All Queue', 
    icon: <Inbox className="w-4 h-4" />, 
    countKey: 'actionRequired',
    description: 'All action-required items',
  },
];

export function OpsQueueTabs({
  activeTab,
  onTabChange,
  stats,
}: OpsQueueTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as QueueTab)}>
      <TabsList className="w-full justify-start h-auto gap-1 bg-transparent p-0">
        {TAB_DEFS.map((tab) => {
          const count = stats[tab.countKey];
          const isActive = activeTab === tab.id;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                "gap-2 px-4 py-2.5 text-sm"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "ml-1 text-xs min-w-[1.5rem] justify-center",
                  isActive 
                    ? "bg-accent-foreground/20" 
                    : "bg-muted text-muted-foreground"
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
