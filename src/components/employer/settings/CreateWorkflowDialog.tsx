import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowType: string;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function CreateWorkflowDialog({ open, onOpenChange, workflowType, onSubmit, isLoading }: CreateWorkflowDialogProps) {
  const [name, setName] = useState('');
  const [enforcementMode, setEnforcementMode] = useState('soft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, enforcement_mode: enforcementMode, is_active: true, is_default: false });
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Standard Approval" />
          </div>
          <div>
            <Label>Enforcement Mode</Label>
            <Select value={enforcementMode} onValueChange={setEnforcementMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="soft">Soft (warn but allow)</SelectItem>
                <SelectItem value="strict">Strict (block if invalid)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Workflow'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
