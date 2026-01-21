/**
 * Launch Playbook Modal
 * 
 * Modal for configuring and launching a recovery playbook.
 * Enhanced with "What will be created" summary and better validation.
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Target, DollarSign, Clock, CheckCircle2, ListTodo, FileOutput, Loader2 } from 'lucide-react';
import { formatCurrencyAED } from '@/lib/utils';
import { RecoveryPlaybook, ZombieCategory, CONFIDENCE_FACTORS } from '@/hooks/useZombieSpendData';
import { toast } from 'sonner';

interface LaunchPlaybookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playbook: RecoveryPlaybook | null;
  category: ZombieCategory | null;
  allCategories: ZombieCategory[];
  onLaunch: (params: {
    playbookId: string;
    categoryId: string;
    categoryName: string;
    targetSegment?: string;
    owner: string;
    dueDate: string;
    expectedImpactAED: number;
    notes?: string;
  }) => Promise<any>;
  onLaunchComplete?: () => void;
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
  onLaunchComplete,
}: LaunchPlaybookModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [targetSegment, setTargetSegment] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  
  // Pre-fill category when modal opens with a category selected
  useEffect(() => {
    if (open && category) {
      setSelectedCategoryId(category.id);
    }
  }, [open, category]);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTargetSegment('');
      setOwner('');
      setDueDate('');
      setNotes('');
      setIsLaunching(false);
    }
  }, [open]);
  
  if (!playbook) return null;
  
  const selectedCat = allCategories.find(c => c.id === selectedCategoryId) || category;
  const expectedImpactAED = selectedCat 
    ? Math.round(selectedCat.unusedEntitlement * (playbook.expectedImpactPercent / 100) * CONFIDENCE_FACTORS[selectedCat.confidence])
    : 0;
  
  const isFormValid = selectedCategoryId && owner && dueDate;
  
  const handleLaunch = async () => {
    if (!isFormValid) {
      toast.error('Please fill in required fields: Category, Owner, and Due Date');
      return;
    }
    
    const catName = allCategories.find(c => c.id === selectedCategoryId)?.name || '';
    
    setIsLaunching(true);
    
    try {
      await onLaunch({
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
        description: `${playbook.title} started for ${catName}. View in Active Runs tab.`,
      });
      
      onOpenChange(false);
      onLaunchComplete?.();
    } catch (err) {
      console.error('Launch failed:', err);
      toast.error('Failed to launch playbook');
    } finally {
      setIsLaunching(false);
    }
  };
  
  const PlaybookIcon = playbook.icon;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
          
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Target Category *</Label>
                <Select 
                  value={selectedCategoryId} 
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className={!selectedCategoryId ? 'border-destructive/50' : ''}>
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
                <Select value={targetSegment || 'all'} onValueChange={(val) => setTargetSegment(val === 'all' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border z-50">
                    <SelectItem value="all">All employees</SelectItem>
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
                <Select value={owner || 'none'} onValueChange={(val) => setOwner(val === 'none' ? '' : val)}>
                  <SelectTrigger className={!owner ? 'border-destructive/50' : ''}>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border z-50">
                    <SelectItem value="none" disabled>Select owner</SelectItem>
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
                  className={!dueDate ? 'border-destructive/50' : ''}
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
          
          <Separator />
          
          {/* What Will Be Created */}
          <div className="p-3 rounded-lg bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              What Will Be Created
            </p>
            
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <div>
                  <p className="font-medium">1 Run Record</p>
                  <p className="text-xs text-muted-foreground">Trackable initiative</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium">{playbook.steps.length} Tasks</p>
                  <p className="text-xs text-muted-foreground">Action items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FileOutput className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium">{playbook.outputs.length} Outputs</p>
                  <p className="text-xs text-muted-foreground">Deliverables</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Outputs Preview */}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLaunching}>
            Cancel
          </Button>
          <Button 
            onClick={handleLaunch} 
            className="gap-2"
            disabled={!isFormValid || isLaunching}
          >
            {isLaunching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Launch Playbook
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}