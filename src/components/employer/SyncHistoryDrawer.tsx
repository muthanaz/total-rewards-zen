/**
 * Sync History Drawer
 * 
 * Detailed view of a sync operation including:
 * - Duration, records processed, skipped reasons
 * - Top error messages, affected modules
 * - Retry failed option
 * - Audit trail
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, 
  User, Database, FileText, ArrowRight
} from 'lucide-react';
import { formatInteger, cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SyncRecord {
  id: string;
  source: string;
  sourceId: string;
  time: string;
  timestamp: Date;
  duration: number; // seconds
  recordsProcessed: number;
  recordsSkipped: number;
  status: 'success' | 'warning' | 'error';
  errorMessage?: string;
  skippedReasons?: { reason: string; count: number }[];
  topErrors?: { message: string; count: number }[];
  affectedModules?: string[];
  initiatedBy?: string;
  initiationType?: 'scheduled' | 'manual' | 'webhook';
}

interface SyncHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sync: SyncRecord | null;
  onRetry: (syncId: string) => Promise<void>;
}

export function SyncHistoryDrawer({
  open,
  onOpenChange,
  sync,
  onRetry,
}: SyncHistoryDrawerProps) {
  if (!sync) return null;

  const handleRetry = async () => {
    await onRetry(sync.id);
    toast.success('Retry initiated', { description: `Re-syncing ${sync.source}` });
    onOpenChange(false);
  };

  const successRate = ((sync.recordsProcessed - sync.recordsSkipped) / sync.recordsProcessed) * 100;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            {sync.status === 'success' ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : sync.status === 'warning' ? (
              <AlertTriangle className="h-6 w-6 text-warning" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <div className="flex-1">
              <SheetTitle>Sync Details</SheetTitle>
              <SheetDescription>{sync.source} • {sync.time}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Duration</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-bold">
                    {sync.duration < 60 ? `${sync.duration}s` : `${Math.floor(sync.duration / 60)}m ${sync.duration % 60}s`}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Processed</p>
                <p className="text-lg font-bold text-success">
                  {formatInteger(sync.recordsProcessed - sync.recordsSkipped)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Skipped</p>
                <p className={cn(
                  'text-lg font-bold',
                  sync.recordsSkipped > 0 ? 'text-warning' : 'text-muted-foreground'
                )}>
                  {formatInteger(sync.recordsSkipped)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Success Rate</span>
              <span className={cn(
                'font-medium',
                successRate >= 99 ? 'text-success' :
                successRate >= 95 ? 'text-warning' : 'text-destructive'
              )}>
                {successRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={successRate} className="h-2" />
          </div>

          {/* Skipped Reasons */}
          {sync.skippedReasons && sync.skippedReasons.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-4 w-4" />
                  Skipped Reasons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sync.skippedReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-warning/5">
                      <span>{reason.reason}</span>
                      <Badge variant="outline" className="text-xs">
                        {reason.count} records
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Errors */}
          {sync.topErrors && sync.topErrors.length > 0 && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  Top Error Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sync.topErrors.map((error, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-destructive/5">
                      <span className="font-mono text-xs">{error.message}</span>
                      <Badge variant="outline" className="text-xs text-destructive">
                        {error.count}×
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Affected Modules */}
          {sync.affectedModules && sync.affectedModules.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  Affected Modules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {sync.affectedModules.map((module, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Audit Trail */}
          <div>
            <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Audit Trail
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Initiated by:</span>
                <span className="font-medium">{sync.initiatedBy || 'System'}</span>
                <Badge variant="outline" className="text-xs capitalize ml-auto">
                  {sync.initiationType || 'scheduled'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Started:</span>
                <span className="font-medium">
                  {sync.timestamp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {sync.status !== 'success' && (
            <Button onClick={handleRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Failed
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
