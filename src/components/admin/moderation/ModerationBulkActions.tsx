/**
 * ModerationBulkActions
 * 
 * Bulk action bar for selected moderation items.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ModerationBulkActionsProps {
  selectedCount: number;
  onApprove: () => Promise<void>;
  onRequestChanges: (reason: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export function ModerationBulkActions({
  selectedCount,
  onApprove,
  onRequestChanges,
  onReject,
  onClearSelection,
  isProcessing,
}: ModerationBulkActionsProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [dialogType, setDialogType] = useState<'reject' | 'changes' | null>(null);
  const [reason, setReason] = useState('');

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const handleConfirm = async () => {
    if (dialogType === 'reject') {
      await onReject(reason);
    } else if (dialogType === 'changes') {
      await onRequestChanges(reason);
    }
    setDialogType(null);
    setReason('');
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20",
        isRTL && "flex-row-reverse"
      )}>
        <Badge variant="secondary" className="h-7 px-3">
          {selectedCount} {t('selected', 'محدد')}
        </Badge>

        <div className={cn("flex items-center gap-2 flex-1", isRTL && "flex-row-reverse")}>
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isProcessing}
            className="bg-success hover:bg-success/90"
          >
            <CheckCircle className="w-4 h-4 me-1.5" />
            {t('Approve All', 'الموافقة على الكل')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogType('changes')}
            disabled={isProcessing}
          >
            <MessageSquare className="w-4 h-4 me-1.5" />
            {t('Request Changes', 'طلب تغييرات')}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDialogType('reject')}
            disabled={isProcessing}
          >
            <XCircle className="w-4 h-4 me-1.5" />
            {t('Reject All', 'رفض الكل')}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Reason Dialog */}
      <Dialog open={dialogType !== null} onOpenChange={() => setDialogType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              {dialogType === 'reject' ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  {t('Reject Selected Items', 'رفض العناصر المحددة')}
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5 text-warning" />
                  {t('Request Changes', 'طلب تغييرات')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'reject'
                ? t(`You are about to reject ${selectedCount} items. Please provide a reason.`, `أنت على وشك رفض ${selectedCount} عناصر. يرجى تقديم سبب.`)
                : t(`Request changes for ${selectedCount} items. Please specify what needs to be changed.`, `طلب تغييرات لـ ${selectedCount} عناصر. يرجى تحديد ما يجب تغييره.`)
              }
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder={dialogType === 'reject' 
              ? t('Enter rejection reason...', 'أدخل سبب الرفض...')
              : t('Enter required changes...', 'أدخل التغييرات المطلوبة...')
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button
              variant={dialogType === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={!reason.trim() || isProcessing}
            >
              {dialogType === 'reject' 
                ? t('Reject', 'رفض')
                : t('Request Changes', 'طلب تغييرات')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
