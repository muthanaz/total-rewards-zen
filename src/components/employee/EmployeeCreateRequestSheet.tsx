/**
 * Employee Create Request Sheet
 * 
 * Modal/drawer for creating new claims, requests, or questions.
 * Integrates with Supabase for persistence.
 */

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  FileText, 
  HelpCircle, 
  Send,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useCreateRequest } from '@/hooks/useEmployeeRequests';
import { getRequiredDocsForCategory } from '@/hooks/useClaimDocs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EmployeeCreateRequestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'claim' | 'request' | 'question';
  initialCategory?: string;
  initialTitle?: string;
  initialDescription?: string;
}

const categories = [
  'Health Insurance',
  'Housing',
  'Education Allowance',
  'Transport',
  'Learning & Development',
  'Wellbeing',
  'Leave',
  'Per Diem',
  'Financial',
  'Other',
];

const typeConfig = {
  claim: {
    icon: Receipt,
    title: 'Submit a Claim',
    description: 'Request reimbursement for eligible expenses. Receipts required.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  request: {
    icon: FileText,
    title: 'Make a Request',
    description: 'Request approvals, allowances, or policy exceptions.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  question: {
    icon: HelpCircle,
    title: 'Ask a Question',
    description: 'Get clarification on policies or eligibility. No documents needed.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
};

export function EmployeeCreateRequestSheet({
  open,
  onOpenChange,
  initialType,
  initialCategory,
  initialTitle,
  initialDescription,
}: EmployeeCreateRequestSheetProps) {
  const [type, setType] = useState<'claim' | 'request' | 'question'>(initialType || 'claim');
  const [category, setCategory] = useState(initialCategory || '');
  const [title, setTitle] = useState(initialTitle || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<'low' | 'standard' | 'high' | 'urgent'>('standard');
  
  const createRequest = useCreateRequest();
  const { toast } = useToast();
  
  // Get required docs for preview
  const requiredDocs = category ? getRequiredDocsForCategory(category) : [];
  
  const resetForm = () => {
    setType(initialType || 'claim');
    setCategory(initialCategory || '');
    setTitle(initialTitle || '');
    setDescription(initialDescription || '');
    setAmount('');
    setPriority('standard');
  };
  
  const handleSubmit = async () => {
    if (!category || !title) {
      toast({
        title: 'Missing information',
        description: 'Please fill in the category and title.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await createRequest.mutateAsync({
        type,
        category,
        title,
        description,
        amount: type === 'claim' && amount ? parseFloat(amount) : undefined,
        priority,
      });
      
      toast({
        title: 'Request submitted',
        description: 'Your request has been submitted and is now pending review.',
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Apply initial values when sheet opens with new values
  if (open && initialType && initialType !== type) {
    setType(initialType);
  }
  if (open && initialCategory && initialCategory !== category) {
    setCategory(initialCategory);
  }
  if (open && initialTitle && initialTitle !== title) {
    setTitle(initialTitle);
  }
  if (open && initialDescription && initialDescription !== description) {
    setDescription(initialDescription);
  }
  
  const TypeIcon = typeConfig[type].icon;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", typeConfig[type].bgColor)}>
              <TypeIcon className={cn("h-5 w-5", typeConfig[type].color)} />
            </div>
            {typeConfig[type].title}
          </SheetTitle>
          <SheetDescription>{typeConfig[type].description}</SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 space-y-6 py-6 overflow-y-auto">
          {/* Request Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as 'claim' | 'request' | 'question')}
              className="grid grid-cols-3 gap-3"
            >
              {(['claim', 'request', 'question'] as const).map((t) => {
                const config = typeConfig[t];
                const Icon = config.icon;
                return (
                  <Label
                    key={t}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      type === t 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground/50"
                    )}
                  >
                    <RadioGroupItem value={t} className="sr-only" />
                    <Icon className={cn("h-5 w-5", config.color)} />
                    <span className="text-xs font-medium capitalize">{t}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your request"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Details</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context to help HR process your request faster..."
              rows={4}
            />
          </div>
          
          {/* Amount (for claims only) */}
          {type === 'claim' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (AED)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}
          
          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Required Documents Preview */}
          {type !== 'question' && category && requiredDocs.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Documents Required</Label>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    You'll need to upload these documents after submitting:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {requiredDocs.map((doc) => (
                      <Badge key={doc.type} variant="outline" className="text-xs">
                        {doc.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* SLA Info */}
          <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Expected Response Time</p>
              {type === 'question' && <p>Questions are typically answered within 2 business days.</p>}
              {type === 'claim' && <p>Claims are processed within 3 business days after all documents are provided.</p>}
              {type === 'request' && <p>Requests are reviewed within 4 business days.</p>}
            </div>
          </div>
        </div>
        
        <SheetFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!category || !title || createRequest.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {createRequest.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
