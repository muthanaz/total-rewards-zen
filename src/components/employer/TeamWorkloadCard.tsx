/**
 * TeamWorkloadCard - Sidebar card showing HR team workload distribution
 * 
 * Displays active task counts per team member with visual load indicators:
 * - Red: Overloaded (10+ tasks)
 * - Amber: High load (6-9 tasks)
 * - Green: Available (<6 tasks)
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  activeTasks: number;
}

interface TeamWorkloadCardProps {
  members: TeamMember[];
  unassignedCount: number;
}

const OVERLOAD_THRESHOLD = 10;
const HIGH_LOAD_THRESHOLD = 6;

function getLoadStatus(count: number): { label: string; className: string; icon?: React.ReactNode } {
  if (count >= OVERLOAD_THRESHOLD) {
    return { 
      label: 'Overloaded', 
      className: 'bg-destructive/10 text-destructive border-destructive/30',
      icon: <AlertTriangle className="w-3 h-3" />
    };
  }
  if (count >= HIGH_LOAD_THRESHOLD) {
    return { 
      label: 'High Load', 
      className: 'bg-warning/10 text-warning border-warning/30' 
    };
  }
  return { 
    label: 'Available', 
    className: 'bg-success/10 text-success border-success/30',
    icon: <CheckCircle2 className="w-3 h-3" />
  };
}

export function TeamWorkloadCard({ members, unassignedCount }: TeamWorkloadCardProps) {
  const sortedMembers = [...members].sort((a, b) => b.activeTasks - a.activeTasks);

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">Team Workload</p>
        </div>
        
        <div className="space-y-2">
          {sortedMembers.map((member) => {
            const status = getLoadStatus(member.activeTasks);
            return (
              <div 
                key={member.id} 
                className="flex items-center justify-between py-1.5 px-2 rounded-md bg-background/50 hover:bg-background/80 transition-colors"
              >
                <span className="text-sm text-foreground truncate max-w-[120px]">
                  {member.name}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs font-semibold tabular-nums gap-1", status.className)}
                >
                  {status.icon}
                  {member.activeTasks}
                </Badge>
              </div>
            );
          })}
          
          {/* Unassigned Row */}
          <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50 border border-dashed border-muted-foreground/20">
            <span className="text-sm text-muted-foreground italic">Unassigned</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-semibold tabular-nums",
                unassignedCount > 10 
                  ? "bg-destructive/10 text-destructive border-destructive/30" 
                  : "bg-muted text-muted-foreground border-muted-foreground/30"
              )}
            >
              {unassignedCount}
            </Badge>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Click "Assign to..." to distribute work
        </p>
      </CardContent>
    </Card>
  );
}

export default TeamWorkloadCard;
