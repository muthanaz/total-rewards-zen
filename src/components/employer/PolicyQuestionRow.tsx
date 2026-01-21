import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  Check,
  Edit3,
  BookOpen,
  Plus,
  AlertTriangle,
  MessageSquare,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/shared';
import { toast } from 'sonner';

export interface PolicyQuestion {
  id: string;
  question: string;
  count: number;
  category: string;
  policyId: string;
  policyName: string;
  clause: string;
  suggestedAnswer: string;
  policyCitation: string;
  status: 'answered' | 'needs_review' | 'unanswered';
  confidence: 'measured' | 'estimated' | 'proxy';
  department?: string;
  segment?: string;
  slaHours?: number;
  createdAt: Date;
}

interface PolicyQuestionRowProps {
  question: PolicyQuestion;
  index: number;
  onApproveAnswer: (id: string, answer: string) => void;
  onEditAnswer: (id: string, answer: string) => void;
  onCreateArticle: (question: PolicyQuestion) => void;
  onCreateAction: (question: PolicyQuestion) => void;
  onViewPolicy: (policyId: string, clause: string) => void;
}

export function PolicyQuestionRow({
  question,
  index,
  onApproveAnswer,
  onEditAnswer,
  onCreateArticle,
  onCreateAction,
  onViewPolicy,
}: PolicyQuestionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnswer, setEditedAnswer] = useState(question.suggestedAnswer);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'answered':
        return { 
          bg: 'bg-green-500/10', 
          text: 'text-green-600', 
          border: 'border-green-500/20',
          icon: CheckCircle2, 
          label: 'Answered' 
        };
      case 'needs_review':
        return { 
          bg: 'bg-amber-500/10', 
          text: 'text-amber-600', 
          border: 'border-amber-500/20',
          icon: Clock, 
          label: 'Needs Review' 
        };
      default:
        return { 
          bg: 'bg-red-500/10', 
          text: 'text-red-600', 
          border: 'border-red-500/20',
          icon: AlertTriangle, 
          label: 'Unanswered' 
        };
    }
  };

  const statusConfig = getStatusConfig(question.status);
  const StatusIcon = statusConfig.icon;

  const handleApprove = () => {
    onApproveAnswer(question.id, editedAnswer);
    setIsEditing(false);
    toast.success('Answer approved and published to Knowledge Center');
  };

  const handleSaveEdit = () => {
    onEditAnswer(question.id, editedAnswer);
    setIsEditing(false);
    toast.success('Answer updated');
  };

  return (
    <div className="p-4 rounded-lg border hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{question.question}</h4>
              <div className="flex items-center flex-wrap gap-2 mt-1.5 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">{question.category}</Badge>
                <span>•</span>
                <span className="font-medium text-primary">{question.count} times</span>
                <span>this month</span>
                {question.department && (
                  <>
                    <span>•</span>
                    <span>{question.department}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ConfidenceBadge level={question.confidence as 'measured' | 'estimated' | 'proxy' | 'missing'} size="sm" />
              <Badge className={cn(statusConfig.bg, statusConfig.text, "border", statusConfig.border, "gap-1")}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* SLA Timer (if applicable) */}
          {question.status === 'unanswered' && question.slaHours && (
            <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-600 bg-amber-500/10 rounded-md px-2 py-1 w-fit">
              <Clock className="h-3 w-3" />
              SLA: {question.slaHours}h remaining
            </div>
          )}

          {/* Policy Link */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <FileText className="w-4 h-4" />
            <span>{question.policyName}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{question.clause}</span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-primary"
              onClick={() => onViewPolicy(question.policyId, question.clause)}
            >
              Open clause <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* AI Draft / Answer */}
          {question.status === 'unanswered' && (
            <div className="mb-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">AI Draft Answer — Needs HR Approval</span>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-3.5 w-3.5 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{question.suggestedAnswer}</p>
              )}
            </div>
          )}

          {question.status === 'answered' && (
            <div className="mb-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <p className="text-xs font-medium text-green-600 mb-1">Approved Answer</p>
              <p className="text-sm">{question.suggestedAnswer}</p>
            </div>
          )}

          {question.status === 'needs_review' && (
            <div className="mb-3 p-3 rounded-lg bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Answer</p>
              <p className="text-sm">{question.suggestedAnswer}</p>
            </div>
          )}

          {/* Policy Citation */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-3">
            <p className="text-xs font-medium text-primary mb-1">Policy Citation</p>
            <p className="text-sm italic text-muted-foreground">{question.policyCitation}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {question.status !== 'answered' && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={handleApprove}
                  className="gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Answer
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Answer
                </Button>
              </>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCreateArticle(question)}
              className="gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Create Article
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCreateAction(question)}
              className="gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
