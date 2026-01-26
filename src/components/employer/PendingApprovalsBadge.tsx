/**
 * Pending Approvals Badge
 * 
 * Displays a count of pending approvals requiring executive decision.
 * Deep links to the Actions & Decisions approvals tab.
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingApprovalsBadgeProps {
  count: number;
  className?: string;
}

export function PendingApprovalsBadge({ count, className }: PendingApprovalsBadgeProps) {
  if (count === 0) return null;

  return (
    <Link to="/employer/recommendations?tab=approvals">
      <Badge 
        variant="outline" 
        className={cn(
          "gap-1.5 px-2.5 py-1 bg-warning/10 text-warning border-warning/30 hover:bg-warning/20 transition-colors cursor-pointer",
          className
        )}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="font-medium">{count} Pending</span>
      </Badge>
    </Link>
  );
}
