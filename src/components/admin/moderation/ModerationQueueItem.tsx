/**
 * ModerationQueueItem
 * 
 * Individual item in the moderation queue with SLA badges and selection.
 */

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Tag, 
  Image, 
  FileText, 
  Clock,
  AlertTriangle,
  User,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow, differenceInHours } from 'date-fns';

export interface ModerationItem {
  id: string;
  type: 'vendor' | 'offer' | 'image' | 'copy';
  entity: string;
  reason: string;
  submitted_at: Date;
  priority: 'high' | 'medium' | 'low';
  details: string;
  vendor_name?: string;
  organization?: string;
  assigned_to?: string;
  status: 'pending' | 'in_review' | 'changes_requested';
}

interface ModerationQueueItemProps {
  item: ModerationItem;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

const TYPE_CONFIG = {
  vendor: { icon: Store, label: 'Vendor', labelAr: 'بائع', color: 'bg-warning/10 text-warning border-warning/30' },
  offer: { icon: Tag, label: 'Offer', labelAr: 'عرض', color: 'bg-accent/10 text-accent-foreground border-accent/30' },
  image: { icon: Image, label: 'Image', labelAr: 'صورة', color: 'bg-primary/10 text-primary border-primary/30' },
  copy: { icon: FileText, label: 'Copy', labelAr: 'نص', color: 'bg-success/10 text-success border-success/30' },
};

const PRIORITY_CONFIG = {
  high: { label: 'High', labelAr: 'عالي', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  medium: { label: 'Medium', labelAr: 'متوسط', color: 'bg-warning/10 text-warning border-warning/30' },
  low: { label: 'Low', labelAr: 'منخفض', color: 'bg-muted text-muted-foreground border-border' },
};

function getSLAStatus(submittedAt: Date, priority: string): { status: 'ok' | 'warning' | 'breach'; label: string } {
  const hoursAgo = differenceInHours(new Date(), submittedAt);
  
  // SLA thresholds based on priority
  const thresholds = {
    high: { warning: 4, breach: 8 },
    medium: { warning: 24, breach: 48 },
    low: { warning: 48, breach: 168 }, // 7 days
  };
  
  const threshold = thresholds[priority as keyof typeof thresholds] || thresholds.medium;
  
  if (hoursAgo >= threshold.breach) {
    return { status: 'breach', label: 'SLA Breach' };
  } else if (hoursAgo >= threshold.warning) {
    return { status: 'warning', label: 'SLA Warning' };
  }
  return { status: 'ok', label: '' };
}

export function ModerationQueueItem({
  item,
  isSelected,
  isActive,
  onSelect,
  onClick,
}: ModerationQueueItemProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const typeConfig = TYPE_CONFIG[item.type];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const slaStatus = getSLAStatus(item.submitted_at, item.priority);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={cn(
        "group relative p-4 rounded-lg border cursor-pointer transition-all",
        isActive 
          ? "border-primary bg-primary/5 ring-1 ring-primary" 
          : "hover:border-primary/50 hover:bg-muted/50",
        slaStatus.status === 'breach' && "border-destructive/50 bg-destructive/5",
        slaStatus.status === 'warning' && !isActive && "border-warning/50"
      )}
      onClick={onClick}
    >
      <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
        {/* Checkbox */}
        <div 
          className="pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
          />
        </div>

        {/* Type Icon */}
        <div className={cn("p-2 rounded-lg shrink-0", typeConfig.color)}>
          <TypeIcon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
          <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
            <h4 className="font-medium truncate">{item.entity}</h4>
            {slaStatus.status !== 'ok' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "shrink-0 text-xs",
                  slaStatus.status === 'breach' 
                    ? "bg-destructive/10 text-destructive border-destructive/30 animate-pulse" 
                    : "bg-warning/10 text-warning border-warning/30"
                )}
              >
                <AlertTriangle className="w-3 h-3 me-1" />
                {slaStatus.label}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground truncate">{item.reason}</p>
          
          <div className={cn(
            "flex items-center gap-3 mt-2 text-xs text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}>
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(item.submitted_at, { addSuffix: true })}
            </span>
            {item.vendor_name && (
              <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                <Store className="w-3 h-3" />
                {item.vendor_name}
              </span>
            )}
            {item.organization && (
              <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                <Building2 className="w-3 h-3" />
                {item.organization}
              </span>
            )}
            {item.assigned_to && (
              <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
                <User className="w-3 h-3" />
                {item.assigned_to}
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className={cn("flex flex-col items-end gap-1.5 shrink-0", isRTL && "items-start")}>
          <Badge variant="outline" className={priorityConfig.color}>
            {isRTL ? priorityConfig.labelAr : priorityConfig.label}
          </Badge>
          <Badge variant="outline" className={typeConfig.color}>
            {isRTL ? typeConfig.labelAr : typeConfig.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function getSLAStatusForItem(item: ModerationItem) {
  return getSLAStatus(item.submitted_at, item.priority);
}
