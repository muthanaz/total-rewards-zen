/**
 * CopyReviewPanel
 * 
 * Before/after diff view for copy/text changes.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowRight,
  Plus,
  Minus,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface CopyChange {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

interface CopyReviewPanelProps {
  copyName: string;
  beforeText: string;
  afterText: string;
  category?: string;
  submittedBy?: string;
}

function computeDiff(before: string, after: string): CopyChange[] {
  // Simple word-based diff for demo
  const beforeWords = before.split(/\s+/);
  const afterWords = after.split(/\s+/);
  const changes: CopyChange[] = [];
  
  let i = 0, j = 0;
  while (i < beforeWords.length || j < afterWords.length) {
    if (i >= beforeWords.length) {
      changes.push({ type: 'added', text: afterWords[j] });
      j++;
    } else if (j >= afterWords.length) {
      changes.push({ type: 'removed', text: beforeWords[i] });
      i++;
    } else if (beforeWords[i] === afterWords[j]) {
      changes.push({ type: 'unchanged', text: beforeWords[i] });
      i++;
      j++;
    } else {
      // Check if word was added or removed
      const nextBeforeMatch = afterWords.slice(j).indexOf(beforeWords[i]);
      const nextAfterMatch = beforeWords.slice(i).indexOf(afterWords[j]);
      
      if (nextBeforeMatch !== -1 && (nextAfterMatch === -1 || nextBeforeMatch <= nextAfterMatch)) {
        changes.push({ type: 'added', text: afterWords[j] });
        j++;
      } else {
        changes.push({ type: 'removed', text: beforeWords[i] });
        i++;
      }
    }
  }
  
  return changes;
}

export function CopyReviewPanel({ 
  copyName,
  beforeText = 'Get 20% off on all wellness services. Terms apply. Valid for premium members.',
  afterText = 'Get 25% off on all wellness and fitness services. Terms and conditions apply. Valid for all employees.',
  category = 'Offer Terms',
  submittedBy = 'vendor@example.com',
}: CopyReviewPanelProps) {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const diff = computeDiff(beforeText, afterText);
  const addedCount = diff.filter(d => d.type === 'added').length;
  const removedCount = diff.filter(d => d.type === 'removed').length;

  return (
    <div className="space-y-4">
      {/* Change Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={cn("text-sm flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <span>{t('Copy Change Request', 'طلب تغيير النص')}</span>
            <Badge variant="outline">{category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className={cn("flex items-center gap-4 text-sm", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-1.5 text-success", isRTL && "flex-row-reverse")}>
              <Plus className="w-4 h-4" />
              <span>{addedCount} {t('added', 'مضاف')}</span>
            </div>
            <div className={cn("flex items-center gap-1.5 text-destructive", isRTL && "flex-row-reverse")}>
              <Minus className="w-4 h-4" />
              <span>{removedCount} {t('removed', 'محذوف')}</span>
            </div>
            <span className="text-muted-foreground">
              {t('by', 'بواسطة')} {submittedBy}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side View */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-destructive/20">
          <CardHeader className="pb-2 bg-destructive/5">
            <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Minus className="w-4 h-4 text-destructive" />
              {t('Before', 'قبل')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-sm leading-relaxed">{beforeText}</p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="pb-2 bg-success/5">
            <CardTitle className={cn("text-sm flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Plus className="w-4 h-4 text-success" />
              {t('After', 'بعد')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <p className="text-sm leading-relaxed">{afterText}</p>
          </CardContent>
        </Card>
      </div>

      {/* Inline Diff View */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('Changes Highlighted', 'التغييرات المميزة')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-3 rounded-lg bg-muted/30 text-sm leading-relaxed">
            {diff.map((change, index) => (
              <span
                key={index}
                className={cn(
                  change.type === 'added' && "bg-success/20 text-success-foreground px-0.5 rounded",
                  change.type === 'removed' && "bg-destructive/20 text-destructive line-through px-0.5 rounded"
                )}
              >
                {change.text}{' '}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning if significant changes */}
      {(addedCount + removedCount) > 5 && (
        <div className={cn(
          "flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm",
          isRTL && "flex-row-reverse"
        )}>
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className={isRTL ? "text-right" : ""}>
            {t(
              'Significant changes detected. Please review carefully to ensure terms remain compliant.',
              'تم اكتشاف تغييرات كبيرة. يرجى المراجعة بعناية للتأكد من بقاء الشروط متوافقة.'
            )}
          </p>
        </div>
      )}
    </div>
  );
}
