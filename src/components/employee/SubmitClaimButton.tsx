import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Receipt, Send, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SubmitClaimButtonProps {
  category: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
}

const claimTypes = [
  { value: 'reimbursement', label: 'Reimbursement', description: 'Request refund for expenses paid' },
  { value: 'pre-approval', label: 'Pre-Approval', description: 'Get approval before making a purchase' },
  { value: 'direct-billing', label: 'Direct Billing Request', description: 'Request direct payment to vendor' },
];

export function SubmitClaimButton({
  category,
  buttonText = 'Submit Claim',
  buttonVariant = 'default',
  buttonSize = 'default',
  className,
  showIcon = true,
}: SubmitClaimButtonProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    claimType: '',
    subject: '',
    description: '',
    amount: '',
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.claimType || !formData.subject || !formData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would submit to the database
    toast({
      title: 'Claim Submitted',
      description: `Your ${category} claim has been submitted for review. Track it in Documents & Claims.`,
    });

    setFormData({ claimType: '', subject: '', description: '', amount: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={cn(className)}>
          {showIcon && <Receipt className="w-4 h-4 mr-2" />}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            Submit {category} Claim
          </DialogTitle>
          <DialogDescription>
            Submit a claim or request related to your {category.toLowerCase()} benefit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Claim Type *</Label>
            <Select
              value={formData.claimType}
              onValueChange={(v) => setFormData({ ...formData, claimType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select claim type..." />
              </SelectTrigger>
              <SelectContent>
                {claimTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              placeholder={`e.g., ${category} expense reimbursement`}
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Amount (د.إ) *</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Provide details about your claim..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent/50 transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload receipts or documents
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit Claim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
