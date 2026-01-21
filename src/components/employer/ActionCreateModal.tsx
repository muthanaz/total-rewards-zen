import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ActionItem, ActionType, Priority, Confidence } from '@/hooks/useEmployerActions';

const TYPE_OPTIONS: Array<{ value: ActionType; label: string }> = [
  { value: 'policy', label: 'Policy' },
  { value: 'process', label: 'Process' },
  { value: 'comms', label: 'Communications' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'analytics', label: 'Analytics' },
];

const PRIORITY_OPTIONS: Array<{ value: Priority; label: string; description: string }> = [
  { value: 'P0', label: 'P0 - Critical', description: 'Immediate action required' },
  { value: 'P1', label: 'P1 - High', description: 'Complete within 2 weeks' },
  { value: 'P2', label: 'P2 - Medium', description: 'Plan for this quarter' },
];

const CATEGORY_OPTIONS = [
  'Learning & Development',
  'Wellbeing',
  'Health Insurance',
  'Transport',
  'Housing',
  'Leave',
  'Gym',
  'Claims Processing',
  'Flight Tickets',
  'Retention',
];

interface ActionCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (action: Partial<ActionItem>) => void;
  owners: Array<{ id: string | null; name: string }>;
}

export function ActionCreateModal({
  open,
  onOpenChange,
  onCreate,
  owners,
}: ActionCreateModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ActionType>('process');
  const [priority, setPriority] = useState<Priority>('P2');
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [expectedImpact, setExpectedImpact] = useState('');
  const [confidence, setConfidence] = useState<Confidence>('medium');
  const [linkedCategories, setLinkedCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  
  const handleSubmit = () => {
    const owner = owners.find(o => o.id === ownerId);
    
    onCreate({
      title,
      description,
      type,
      priority,
      ownerId,
      owner: owner?.name || 'Unassigned',
      dueDate: dueDate || null,
      expectedImpact: expectedImpact ? { costAvoidance: parseFloat(expectedImpact) } : {},
      confidence,
      linkedCategories,
      sourceType: 'manual',
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setType('process');
    setPriority('P2');
    setOwnerId(null);
    setDueDate(undefined);
    setExpectedImpact('');
    setConfidence('medium');
    setLinkedCategories([]);
    onOpenChange(false);
  };
  
  const addCategory = (cat: string) => {
    if (cat && !linkedCategories.includes(cat)) {
      setLinkedCategories([...linkedCategories, cat]);
    }
    setCategoryInput('');
  };
  
  const removeCategory = (cat: string) => {
    setLinkedCategories(linkedCategories.filter(c => c !== cat));
  };
  
  const isValid = title.trim().length > 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Action</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Launch L&D Awareness Campaign"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the action, context, and expected outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ActionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <div>{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Owner & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={ownerId || 'unassigned'} onValueChange={(v) => setOwnerId(v === 'unassigned' ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id || 'unassigned'} value={owner.id || 'unassigned'}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Expected Impact & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="impact">Expected Impact (AED)</Label>
              <Input
                id="impact"
                type="number"
                placeholder="e.g., 50000"
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Confidence</Label>
              <Select value={confidence} onValueChange={(v) => setConfidence(v as Confidence)}>
                <SelectTrigger>
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
          
          {/* Linked Categories */}
          <div className="space-y-2">
            <Label>Linked Categories</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {linkedCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => removeCategory(cat)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Select value={categoryInput} onValueChange={addCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Add a category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.filter(c => !linkedCategories.includes(c)).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Create Action
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
