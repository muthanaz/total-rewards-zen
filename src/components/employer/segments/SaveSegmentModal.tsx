/**
 * Save Segment Modal
 * 
 * Simple modal for naming and saving a new segment.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bookmark, Sparkles } from 'lucide-react';

interface SaveSegmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
  matchCount: number;
}

export function SaveSegmentModal({
  open,
  onOpenChange,
  onSave,
  matchCount,
}: SaveSegmentModalProps) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-accent" />
            Save Segment
          </DialogTitle>
          <DialogDescription>
            Save this filter combination as a reusable segment. It will appear in your AI Watchlist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="segment-name">Segment Name</Label>
            <Input
              id="segment-name"
              placeholder="e.g., High-Value Expats in IT"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <p className="text-sm">
              This segment will track <strong>{matchCount} employees</strong> based on your current filters.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Segment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
