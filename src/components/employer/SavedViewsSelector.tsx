/**
 * Saved Views Selector
 * 
 * Allows users to save and switch between filter presets:
 * - Executive default
 * - HR Ops default  
 * - Finance default
 * - Custom saved views
 * 
 * Per-org and per-role configuration.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookmarkIcon, 
  ChevronDown, 
  Plus, 
  Star,
  Trash2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, string>;
  isDefault?: boolean;
  isSystem?: boolean;
  role?: 'executive' | 'hr_ops' | 'finance' | 'all';
}

interface SavedViewsSelectorProps {
  currentFilters: Record<string, string>;
  onApplyView: (filters: Record<string, string>) => void;
  className?: string;
}

// System default views
const SYSTEM_VIEWS: SavedView[] = [
  {
    id: 'exec-default',
    name: 'Executive Default',
    filters: { timeRange: 'ytd', groupBy: 'category' },
    isSystem: true,
    isDefault: true,
    role: 'executive',
  },
  {
    id: 'hrops-default',
    name: 'HR Ops Default',
    filters: { timeRange: 'mtd', status: 'pending,in_review' },
    isSystem: true,
    role: 'hr_ops',
  },
  {
    id: 'finance-default',
    name: 'Finance Default',
    filters: { timeRange: 'ytd', groupBy: 'cost_center', showBudget: 'true' },
    isSystem: true,
    role: 'finance',
  },
];

export function SavedViewsSelector({
  currentFilters,
  onApplyView,
  className,
}: SavedViewsSelectorProps) {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Load saved views from localStorage (would be DB in production)
  useEffect(() => {
    const stored = localStorage.getItem('employer_saved_views');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedViews(parsed);
      } catch (e) {
        console.error('Failed to parse saved views');
      }
    }
  }, []);

  // Save views to localStorage
  const persistViews = (views: SavedView[]) => {
    localStorage.setItem('employer_saved_views', JSON.stringify(views));
    setSavedViews(views);
  };

  const handleApplyView = (view: SavedView) => {
    setActiveViewId(view.id);
    onApplyView(view.filters);
    toast.success(`Applied "${view.name}" view`);
  };

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    const newView: SavedView = {
      id: `custom-${Date.now()}`,
      name: newViewName.trim(),
      filters: currentFilters,
      role: 'all',
    };

    persistViews([...savedViews, newView]);
    setNewViewName('');
    setSaveDialogOpen(false);
    setActiveViewId(newView.id);
    toast.success(`Saved "${newView.name}" view`);
  };

  const handleDeleteView = (viewId: string) => {
    const updated = savedViews.filter(v => v.id !== viewId);
    persistViews(updated);
    if (activeViewId === viewId) {
      setActiveViewId(null);
    }
    toast.success('View deleted');
  };

  const handleSetDefault = (viewId: string) => {
    const updated = savedViews.map(v => ({
      ...v,
      isDefault: v.id === viewId,
    }));
    persistViews(updated);
    toast.success('Default view updated');
  };

  const allViews = [...SYSTEM_VIEWS, ...savedViews];
  const activeView = allViews.find(v => v.id === activeViewId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <BookmarkIcon className="w-3.5 h-3.5" />
            {activeView?.name || 'Saved Views'}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            System Views
          </DropdownMenuLabel>
          {SYSTEM_VIEWS.map(view => (
            <DropdownMenuItem 
              key={view.id}
              onClick={() => handleApplyView(view)}
              className="gap-2"
            >
              {activeViewId === view.id && <Check className="w-3 h-3" />}
              {activeViewId !== view.id && <span className="w-3" />}
              <span className="flex-1">{view.name}</span>
              {view.isDefault && (
                <Badge variant="outline" className="text-[10px] h-4">Default</Badge>
              )}
            </DropdownMenuItem>
          ))}

          {savedViews.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Custom Views
              </DropdownMenuLabel>
              {savedViews.map(view => (
                <DropdownMenuItem 
                  key={view.id}
                  className="gap-2 group"
                >
                  <div 
                    className="flex items-center gap-2 flex-1"
                    onClick={() => handleApplyView(view)}
                  >
                    {activeViewId === view.id && <Check className="w-3 h-3" />}
                    {activeViewId !== view.id && <span className="w-3" />}
                    <span className="flex-1">{view.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(view.id);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Star className={cn('w-3 h-3', view.isDefault && 'fill-current text-warning')} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteView(view.id);
                      }}
                      className="p-1 hover:bg-muted rounded text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)} className="gap-2">
            <Plus className="w-3 h-3" />
            Save current filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save the current filter configuration for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="e.g., Q1 Review, Housing Focus"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Current filters:</strong>
              <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-auto">
                {JSON.stringify(currentFilters, null, 2)}
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCurrentView}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
