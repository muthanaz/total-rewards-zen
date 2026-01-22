/**
 * UniversalReviewQueue - Category-Agnostic Request/Claim Queue
 * 
 * ONE shared review queue component that works for ALL benefit categories.
 * Displays pending items with unified status, SLA, and action patterns.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  User,
  Filter,
  ChevronRight,
  Inbox,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { cn, formatCurrencyAED } from '@/lib/utils';
import { 
  getStatusBadgeStyle, 
  getStatusDisplayLabel, 
  calculateSLA,
  REQUEST_STATUSES,
} from '@/lib/crossPortalContract';
import { useLanguage } from '@/contexts/LanguageContext';
import { ZeroState } from '@/components/shared/ZeroState';
import { formatDistanceToNow } from 'date-fns';

// =============================================================================
// TYPES
// =============================================================================

export interface QueueItem {
  id: string;
  subject: string;
  category: string;
  request_type: 'claim' | 'request' | 'question';
  status: string;
  amount?: number;
  priority?: 'low' | 'standard' | 'high' | 'urgent';
  created_at: string;
  sla_due_at?: string;
  employee_name?: string;
  employee_id?: string;
  assigned_to?: string;
  policy_ref?: string;
}

export interface UniversalReviewQueueProps {
  /** Items to display in queue */
  items: QueueItem[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Callback when an item is selected for review */
  onSelectItem: (item: QueueItem) => void;
  
  /** Callback for bulk actions */
  onBulkAction?: (action: string, itemIds: string[]) => void;
  
  /** Filter by category (optional) */
  categoryFilter?: string;
  
  /** Custom title */
  title?: string;
  
  /** Show category column */
  showCategory?: boolean;
}

// =============================================================================
// QUEUE STATUS COUNTERS
// =============================================================================

interface QueueCountersProps {
  items: QueueItem[];
}

function QueueCounters({ items }: QueueCountersProps) {
  const counts = useMemo(() => {
    const pending = items.filter(i => i.status === 'submitted' || i.status === 'pending_review').length;
    const inReview = items.filter(i => i.status === 'in_review').length;
    const actionRequired = items.filter(i => i.status === 'action_required').length;
    const overdue = items.filter(i => {
      if (!i.sla_due_at) return false;
      const sla = calculateSLA(i.sla_due_at, i.status);
      return sla.isOverdue;
    }).length;
    
    return { pending, inReview, actionRequired, overdue };
  }, [items]);
  
  return (
    <div className="grid grid-cols-4 gap-3">
      <Card className="bg-info/10 border-info/20">
        <CardContent className="p-3 flex items-center gap-3">
          <Inbox className="w-5 h-5 text-info" />
          <div>
            <p className="text-2xl font-bold text-info">{counts.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-warning/10 border-warning/20">
        <CardContent className="p-3 flex items-center gap-3">
          <Timer className="w-5 h-5 text-warning" />
          <div>
            <p className="text-2xl font-bold text-warning">{counts.inReview}</p>
            <p className="text-xs text-muted-foreground">In Review</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-chart-3/10 border-chart-3/20">
        <CardContent className="p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-chart-3" />
          <div>
            <p className="text-2xl font-bold text-chart-3">{counts.actionRequired}</p>
            <p className="text-xs text-muted-foreground">Action Req.</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="p-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-2xl font-bold text-destructive">{counts.overdue}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================================================
// QUEUE ITEM ROW
// =============================================================================

interface QueueItemRowProps {
  item: QueueItem;
  onSelect: () => void;
  showCategory?: boolean;
}

function QueueItemRow({ item, onSelect, showCategory }: QueueItemRowProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const statusStyle = getStatusBadgeStyle(item.status);
  const slaInfo = item.sla_due_at ? calculateSLA(item.sla_due_at, item.status) : null;
  
  const getPriorityBadge = () => {
    if (!item.priority || item.priority === 'standard') return null;
    const colors = {
      low: 'bg-muted text-muted-foreground',
      high: 'bg-warning/10 text-warning',
      urgent: 'bg-destructive/10 text-destructive',
    };
    return (
      <Badge className={cn('text-xs', colors[item.priority])}>
        {item.priority}
      </Badge>
    );
  };
  
  const getTypeBadge = () => {
    const colors = {
      claim: 'bg-success/10 text-success',
      request: 'bg-blue-100 text-blue-700',
      question: 'bg-purple-100 text-purple-700',
    };
    return (
      <Badge className={cn('text-xs capitalize', colors[item.request_type] || colors.claim)}>
        {item.request_type}
      </Badge>
    );
  };
  
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors",
        slaInfo?.isOverdue && "border-red-500/50 bg-red-500/5",
        isRTL && "flex-row-reverse"
      )}
      onClick={onSelect}
    >
      {/* Left: Main info */}
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
          <p className="font-medium text-sm truncate">{item.subject}</p>
          {getTypeBadge()}
          {getPriorityBadge()}
        </div>
        <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
          <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            <User className="w-3 h-3" />
            {item.employee_name || 'Unknown'}
          </span>
          {showCategory && (
            <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <FileText className="w-3 h-3" />
              {item.category}
            </span>
          )}
          <span className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      
      {/* Middle: Amount & Status */}
      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
        {item.amount && (
          <span className="font-mono text-sm font-medium">
            {formatCurrencyAED(item.amount, { abbreviate: false })}
          </span>
        )}
        <Badge className={cn('text-xs', statusStyle.className)}>
          {getStatusDisplayLabel(item.status)}
        </Badge>
        {slaInfo && (
          <span className={cn(
            "text-xs flex items-center gap-1",
            slaInfo.isOverdue ? "text-red-600" : slaInfo.isUrgent ? "text-amber-600" : "text-muted-foreground",
            isRTL && "flex-row-reverse"
          )}>
            <Timer className="w-3 h-3" />
            {slaInfo.isOverdue 
              ? `${Math.abs(slaInfo.hoursRemaining)}h overdue` 
              : slaInfo.hoursRemaining < 24 
                ? `${slaInfo.hoursRemaining}h left`
                : `${slaInfo.daysRemaining}d left`
            }
          </span>
        )}
      </div>
      
      {/* Right: Action arrow */}
      <ChevronRight className={cn("w-4 h-4 text-muted-foreground", isRTL && "rotate-180")} />
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalReviewQueue({
  items,
  isLoading,
  onSelectItem,
  onBulkAction,
  categoryFilter,
  title = 'Review Queue',
  showCategory = true,
}: UniversalReviewQueueProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sla');
  
  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // Apply category filter if provided
    if (categoryFilter) {
      result = result.filter(item => 
        item.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.subject.toLowerCase().includes(term) ||
        item.employee_name?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(item => item.request_type === typeFilter);
    }
    
    // Sort
    switch (sortBy) {
      case 'sla':
        result.sort((a, b) => {
          if (!a.sla_due_at) return 1;
          if (!b.sla_due_at) return -1;
          return new Date(a.sla_due_at).getTime() - new Date(b.sla_due_at).getTime();
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'amount':
        result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
    }
    
    return result;
  }, [items, categoryFilter, searchTerm, statusFilter, typeFilter, sortBy]);
  
  // Get unique statuses for filter
  const availableStatuses = useMemo(() => {
    const statuses = [...new Set(items.map(i => i.status))];
    return statuses.sort();
  }, [items]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="h-32" />
        </Card>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <ZeroState 
        page="claims"
        portal="employer"
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Queue Counters */}
      <QueueCounters items={items} />
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className={cn("flex flex-col md:flex-row gap-4", isRTL && "md:flex-row-reverse")}>
            <div className="relative flex-1">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
              <Input
                placeholder="Search by subject, employee, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(isRTL ? "pr-9" : "pl-9")}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {getStatusDisplayLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="claim">Claims</SelectItem>
                <SelectItem value="request">Requests</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sla">SLA Priority</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount">Highest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Queue List */}
      <Card>
        <CardHeader className={cn("pb-3", isRTL && "text-right")}>
          <CardTitle className={cn("text-base font-display flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>{title}</span>
            <Badge variant="secondary">{filteredItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No items match your filters</p>
            </div>
          ) : (
            filteredItems.map(item => (
              <QueueItemRow
                key={item.id}
                item={item}
                onSelect={() => onSelectItem(item)}
                showCategory={showCategory}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UniversalReviewQueue;
