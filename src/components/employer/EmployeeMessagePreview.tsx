/**
 * Employee Message Preview
 * 
 * Shows preview of the message that will be sent to employee
 * before sending request info or rejection.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Eye, 
  Send, 
  Edit2,
  User,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeMessagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'request_info' | 'rejection';
  employeeName: string;
  requestSubject: string;
  defaultMessage: string;
  onConfirm: (message: string) => void;
}

export function EmployeeMessagePreview({
  open,
  onOpenChange,
  type,
  employeeName,
  requestSubject,
  defaultMessage,
  onConfirm,
}: EmployeeMessagePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const handleConfirm = () => {
    onConfirm(message);
    onOpenChange(false);
  };

  const isRejection = type === 'rejection';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {isRejection ? 'Rejection Notice Preview' : 'Information Request Preview'}
          </DialogTitle>
          <DialogDescription>
            Review the message before sending to the employee
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Info */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{employeeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{requestSubject}</span>
            </div>
          </div>

          {/* Message Preview/Edit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Message Content</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-1 text-xs"
              >
                {isEditing ? <Eye className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
            </div>

            {isEditing ? (
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
                placeholder="Enter message to employee..."
              />
            ) : (
              <div className={cn(
                "p-4 rounded-lg border min-h-[120px]",
                isRejection ? "bg-destructive/5 border-destructive/20" : "bg-muted/30"
              )}>
                {/* Email Preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        isRejection 
                          ? "bg-destructive/10 text-destructive border-destructive/30" 
                          : "bg-info/10 text-info border-info/30"
                      )}
                    >
                      {isRejection ? 'Claim Rejected' : 'Action Required'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dear {employeeName},
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Best regards,<br />
                    HR Team
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Warning for rejection */}
          {isRejection && (
            <Alert variant="destructive" className="bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This action cannot be undone. The employee will be notified immediately.
              </AlertDescription>
            </Alert>
          )}

          {/* Delivery Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Message will be sent via email and in-app notification</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className={cn(
              "gap-2",
              isRejection && "bg-destructive hover:bg-destructive/90"
            )}
          >
            <Send className="w-4 h-4" />
            {isRejection ? 'Send Rejection' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
