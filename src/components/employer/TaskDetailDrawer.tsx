/**
 * Task Detail Drawer - HR Ops Dashboard
 * 
 * Opens when clicking on a task from Upcoming Tasks list.
 */

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  CheckCircle2,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export type TaskDetailType = 'meeting' | 'policy' | 'report' | 'contract' | 'deadline' | 'review';

export interface TaskDetail {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: TaskDetailType;
  link?: string;
  priority?: 'low' | 'normal' | 'high';
  owner?: string;
  notes?: string;
}

interface TaskDetailDrawerProps {
  task: TaskDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owners?: { id: string; name: string }[];
  onAssign?: (taskId: string, ownerId: string) => void;
  onSetDueDate?: (taskId: string, date: Date) => void;
  onComplete?: (taskId: string) => void;
  onAddNote?: (taskId: string, note: string) => void;
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-muted' },
  normal: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-destructive', bg: 'bg-destructive/10' },
};

const typeConfig: Record<TaskDetailType, { label: string; icon: typeof CalendarIcon }> = {
  meeting: { label: 'Meeting', icon: CalendarIcon },
  policy: { label: 'Policy Update', icon: FileText },
  report: { label: 'Report', icon: FileText },
  contract: { label: 'Contract', icon: FileText },
  deadline: { label: 'Deadline', icon: Clock },
  review: { label: 'Review', icon: FileText },
};

export function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  owners = [],
  onAssign,
  onSetDueDate,
  onComplete,
  onAddNote,
}: TaskDetailDrawerProps) {
  const [selectedOwner, setSelectedOwner] = useState(task?.owner || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [newNote, setNewNote] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  if (!task) return null;

  const priority = task.priority || 'normal';
  const type = typeConfig[task.type] || typeConfig.deadline;
  const TypeIcon = type.icon;

  const handleAssign = () => {
    if (selectedOwner && onAssign) {
      onAssign(task.id, selectedOwner);
    }
  };

  const handleSetDate = (date: Date | undefined) => {
    if (date && onSetDueDate) {
      setSelectedDate(date);
      onSetDueDate(task.id, date);
      setDatePickerOpen(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(task.id, newNote);
      setNewNote('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', priorityConfig[priority].bg)}>
              <TypeIcon className={cn('w-4 h-4', priorityConfig[priority].color)} />
            </div>
            <Badge variant="outline">{type.label}</Badge>
          </div>
          <SheetTitle className="text-lg mt-2">{task.title}</SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {task.date}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <Badge className={cn('gap-1', priorityConfig[priority].bg, priorityConfig[priority].color)}>
              <Flag className="w-3 h-3" />
              {priorityConfig[priority].label}
            </Badge>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm">{task.description}</p>
            </div>
          )}

          {/* Assign Owner */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Assign To</Label>
            <div className="flex gap-2">
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAssign} disabled={!selectedOwner}>
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Due Date</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : task.date}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSetDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Add Note</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleAddNote} disabled={!newNote.trim()}>
              Add Note
            </Button>
          </div>

          {/* Link */}
          {task.link && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Related Page</Label>
              <Link to={task.link}>
                <Button variant="outline" className="w-full justify-between">
                  Open related page
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button 
            className="w-full gap-2" 
            onClick={() => onComplete?.(task.id)}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
