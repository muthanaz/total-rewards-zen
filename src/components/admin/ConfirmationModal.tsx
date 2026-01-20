import { ReactNode, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Ban, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type ActionType = 'delete' | 'suspend' | 'revoke' | 'destructive';

interface ConfirmationModalProps {
  trigger: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionType?: ActionType;
  confirmText?: string; // Text user must type to confirm
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}

const ACTION_CONFIG = {
  delete: { icon: Trash2, color: 'text-destructive', buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  suspend: { icon: Ban, color: 'text-warning', buttonClass: 'bg-warning text-warning-foreground hover:bg-warning/90' },
  revoke: { icon: XCircle, color: 'text-destructive', buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
  destructive: { icon: AlertTriangle, color: 'text-destructive', buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
};

export function ConfirmationModal({
  trigger,
  title,
  description,
  actionLabel,
  actionType = 'destructive',
  confirmText,
  onConfirm,
  disabled = false,
}: ConfirmationModalProps) {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const config = ACTION_CONFIG[actionType];
  const Icon = config.icon;

  const isConfirmEnabled = !confirmText || inputValue === confirmText;

  const handleConfirm = async () => {
    if (!isConfirmEnabled) return;
    setIsLoading(true);
    try {
      await onConfirm();
      setOpen(false);
      setInputValue('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Icon className={cn("w-5 h-5", config.color)} />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {confirmText && (
          <div className="space-y-2 py-2">
            <Label>
              {isRTL ? `اكتب "${confirmText}" للتأكيد` : `Type "${confirmText}" to confirm`}
            </Label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmText}
              className="font-mono"
            />
          </div>
        )}

        <AlertDialogFooter className={isRTL ? "flex-row-reverse" : ""}>
          <AlertDialogCancel onClick={() => setInputValue('')}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmEnabled || isLoading}
            className={config.buttonClass}
          >
            {isLoading ? (
              <span className="animate-pulse">{isRTL ? 'جاري...' : 'Processing...'}</span>
            ) : (
              <>
                <Icon className="w-4 h-4 me-2" />
                {actionLabel}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
