/**
 * Create Action Modal
 * 
 * Modal to create an action plan item pre-filled with opportunity details.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, Clock, User, AlertCircle } from 'lucide-react';
import { formatCurrencyAED, cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface OpportunityData {
  id: string;
  title: string;
  category: string;
  type: 'hard_savings' | 'value_realization';
  valueOpportunity: number;
  rootCause: string;
  effort: 'low' | 'medium' | 'high';
  timeToImpact: string;
}

interface CreateActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: OpportunityData | null;
  onCreateAction: (actionData: {
    title: string;
    description: string;
    owner: string;
    dueDate: string;
    priority: string;
    expectedImpact: number;
    opportunityId: string;
  }) => void;
}

const effortConfig = {
  low: { label: 'Low Effort', className: 'bg-success/10 text-success border-success/30' },
  medium: { label: 'Medium Effort', className: 'bg-warning/10 text-warning border-warning/30' },
  high: { label: 'High Effort', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const typeLabels = {
  hard_savings: { label: 'Hard Savings', className: 'bg-success/10 text-success' },
  value_realization: { label: 'Engagement', className: 'bg-info/10 text-info' },
};

export function CreateActionModal({
  open,
  onOpenChange,
  opportunity,
  onCreateAction,
}: CreateActionModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('high');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill when opportunity changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && opportunity) {
      setTitle(`${opportunity.type === 'hard_savings' ? 'Recover' : 'Improve'}: ${opportunity.title}`);
      setDescription(`Address ${opportunity.rootCause} in ${opportunity.category} to ${opportunity.type === 'hard_savings' ? 'recover' : 'unlock'} ${formatCurrencyAED(opportunity.valueOpportunity, { abbreviate: true })}`);
      setOwner('');
      setDueDate('');
      setPriority(opportunity.effort === 'low' ? 'high' : opportunity.effort === 'medium' ? 'medium' : 'low');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!opportunity) return;
    
    if (!title.trim() || !owner.trim() || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateAction({
        title,
        description,
        owner,
        dueDate,
        priority,
        expectedImpact: opportunity.valueOpportunity,
        opportunityId: opportunity.id,
      });
      toast.success('Action plan item created successfully');
      onOpenChange(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setOwner('');
      setDueDate('');
      setPriority('high');
    } catch (error) {
      toast.error('Failed to create action plan item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!opportunity) return null;

  const effort = effortConfig[opportunity.effort];
  const typeConfig = typeLabels[opportunity.type];

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create Action Plan Item
          </DialogTitle>
          <DialogDescription>
            Turn this optimization opportunity into a tracked action.
          </DialogDescription>
        </DialogHeader>

        {/* Opportunity Summary */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-sm">{opportunity.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {opportunity.category} · {opportunity.rootCause}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-success">
                {formatCurrencyAED(opportunity.valueOpportunity, { abbreviate: true })}
              </p>
              <p className="text-xs text-muted-foreground">Value Opportunity</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-xs", typeConfig.className)}>
              {typeConfig.label}
            </Badge>
            <Badge variant="outline" className={cn("text-xs", effort.className)}>
              {effort.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {opportunity.timeToImpact}
            </Badge>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="action-title">Action Title *</Label>
            <Input
              id="action-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Launch awareness campaign for housing benefits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-description">Description</Label>
            <Textarea
              id="action-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the action steps..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action-owner">Owner *</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger id="action-owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr_ops">HR Operations</SelectItem>
                  <SelectItem value="comp_ben">Comp & Ben</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="comms">Internal Comms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="action-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action-due-date">Due Date *</Label>
            <Input
              id="action-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Action'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
