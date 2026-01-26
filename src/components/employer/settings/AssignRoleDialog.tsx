import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const ROLES = [
  { value: 'executive', label: 'Executive' },
  { value: 'hr_ops', label: 'HR Ops' },
  { value: 'comp_ben', label: 'Comp & Ben' },
  { value: 'finance', label: 'Finance' },
  { value: 'policy_owner', label: 'Policy Owner' },
  { value: 'it_admin', label: 'IT Admin' },
  { value: 'viewer', label: 'Viewer' },
];

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { user_id: string; employer_role: string }) => void;
  isLoading: boolean;
}

export function AssignRoleDialog({ open, onOpenChange, onSubmit, isLoading }: AssignRoleDialogProps) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ user_id: userId, employer_role: role });
    setUserId('');
    setRole('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>User ID</Label>
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} required placeholder="Enter user ID" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !role} className="w-full">
            {isLoading ? 'Assigning...' : 'Assign Role'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
