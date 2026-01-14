import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, 
  XCircle, 
  Filter,
  Zap,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  labelAr: string;
  count: number;
  amount?: number;
  action: () => void;
}

interface QuickActionsBarProps {
  approveActions: QuickAction[];
  rejectTemplates: { id: string; label: string; labelAr: string }[];
  selectedCount: number;
  onBulkApprove: (actionId: string) => void;
  onBulkReject: (templateId: string) => void;
  onClearSelection: () => void;
  className?: string;
}

export function QuickActionsBar({
  approveActions,
  rejectTemplates,
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  className
}: QuickActionsBarProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(0)}K`;
    }
    return `AED ${value}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50",
        isRTL && "flex-row-reverse",
        className
      )}
    >
      {/* Quick Approve Buttons */}
      <div className={cn(
        "flex items-center gap-2",
        isRTL && "flex-row-reverse"
      )}>
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {isRTL ? "موافقة سريعة:" : "Quick Approve:"}
        </span>
        
        {approveActions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={() => onBulkApprove(action.id)}
            disabled={action.count === 0}
            className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50"
          >
            <CheckCircle2 className={cn("w-3.5 h-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
            {isRTL ? action.labelAr : action.label}
            {action.amount && (
              <span className="text-[10px] opacity-70 ml-1">
                (&lt; {formatCurrency(action.amount)})
              </span>
            )}
            <Badge 
              variant="secondary" 
              className="ml-1.5 h-4 px-1.5 text-[10px] bg-emerald-500/20 text-emerald-700"
            >
              {action.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-6 w-px bg-border/50" />

      {/* Bulk Reject Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-red-500/30 text-red-600 hover:bg-red-500/10"
          >
            <XCircle className={cn("w-3.5 h-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
            {isRTL ? "رفض جماعي" : "Bulk Reject"}
            <ChevronDown className={cn("w-3 h-3", isRTL ? "mr-1" : "ml-1")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRTL ? "start" : "end"}>
          {rejectTemplates.map((template) => (
            <DropdownMenuItem 
              key={template.id}
              onClick={() => onBulkReject(template.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-500/10"
            >
              {isRTL ? template.labelAr : template.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selection Info */}
      {selectedCount > 0 && (
        <>
          <div className="hidden sm:block h-6 w-px bg-border/50" />
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {selectedCount} {isRTL ? "محدد" : "selected"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              {isRTL ? "إلغاء التحديد" : "Clear"}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
