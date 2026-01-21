/**
 * Launch Playbook Modal
 * 
 * Modal for configuring and launching a recovery playbook.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Target, DollarSign, Clock, Users } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { RecoveryPlaybook, ZombieCategory, PlaybookRun, CONFIDENCE_FACTORS } from '@/hooks/useZombieSpendData';
import { toast } from 'sonner';

interface LaunchPlaybookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playbook: RecoveryPlaybook | null;
  category: ZombieCategory | null;
  allCategories: ZombieCategory[];
  onLaunch: (run: Omit<PlaybookRun, 'id' | 'createdAt' | 'status'>) => void;
}

const effortColors = {
  low: 'text-success border-success/30 bg-success/10',
  medium: 'text-warning border-warning/30 bg-warning/10',
  high: 'text-destructive border-destructive/30 bg-destructive/10',
};

export function LaunchPlaybookModal({ 
  open, 
  onOpenChange, 
  playbook,
  category,
  allCategories,
  onLaunch,
}: LaunchPlaybookModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(category?.id || '');
  const [targetSegment, setTargetSegment] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  if (!playbook) return null;
  
  const selectedCat = allCategories.find(c => c.id === selectedCategoryId) || category;
  const expectedImpactAED = selectedCat 
    ? Math.round(selectedCat.unusedEntitlement * (playbook.expectedImpactPercent / 100) * CONFIDENCE_FACTORS[selectedCat.confidence])
    : 0;
  
  const handleLaunch = () => {
    if (!selectedCategoryId || !owner || !dueDate) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const catName = allCategories.find(c => c.id === selectedCategoryId)?.name || '';
    
    onLaunch({
      playbookId: playbook.id,
      categoryId: selectedCategoryId,
      categoryName: catName,
      targetSegment: targetSegment || undefined,
      owner,
      dueDate,
      expectedImpactAED,
      notes: notes || undefined,
    });
    
    toast.success('Playbook launched!', {
      description: `${playbook.title} started for ${catName}`,
    });
    
    // Reset form
    setTargetSegment('');
    setOwner('');
    setDueDate('');
    setNotes('');
    onOpenChange(false);
  };
  
  const PlaybookIcon = playbook.icon;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <PlaybookIcon className="h-5 w-5 text-accent" />
            </div>
            <DialogTitle>Launch: {playbook.title}</DialogTitle>
          </div>
          <DialogDescription>{playbook.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Impact Preview */}
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Impact</p>
                    <p className="font-bold text-success">{formatCurrencyAED(expectedImpactAED)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time to Impact</p>
                    <p className="font-medium">{playbook.timeToImpact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Effort</p>
                    <Badge variant="outline" className={`capitalize ${effortColors[playbook.effortLevel]}`}>
                      {playbook.effortLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Playbook Steps Preview */}
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">PLAYBOOK STEPS</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              {playbook.steps.slice(0, 3).map((step, idx) => (
                <li key={idx} className="text-muted-foreground">{step}</li>
              ))}
              {playbook.steps.length > 3 && (
                <li className="text-muted-foreground">...and {playbook.steps.length - 3} more</li>
              )}
            </ol>
          </div>
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Target Category *</Label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border z-50">
                    {allCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="segment">Target Segment (optional)</Label>
                <Select value={targetSegment} onValueChange={setTargetSegment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border z-50">
                    <SelectItem value="">All employees</SelectItem>
                    <SelectItem value="dept:Engineering">Engineering</SelectItem>
                    <SelectItem value="dept:Sales">Sales</SelectItem>
                    <SelectItem value="dept:Operations">Operations</SelectItem>
                    <SelectItem value="grade:M1-M2">Grade M1-M2</SelectItem>
                    <SelectItem value="grade:M3">Grade M3</SelectItem>
                    <SelectItem value="grade:M4+">Grade M4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Owner *</Label>
                <Select value={owner} onValueChange={setOwner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border z-50">
                    <SelectItem value="HR Ops">HR Ops</SelectItem>
                    <SelectItem value="C&B Team">C&B Team</SelectItem>
                    <SelectItem value="Vendor Manager">Vendor Manager</SelectItem>
                    <SelectItem value="Comms Team">Comms Team</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Additional context or instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          {/* Outputs */}
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">EXPECTED OUTPUTS</p>
            <div className="flex flex-wrap gap-1">
              {playbook.outputs.map((output, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {output}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLaunch} className="gap-2">
            <Play className="h-4 w-4" />
            Launch Playbook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
