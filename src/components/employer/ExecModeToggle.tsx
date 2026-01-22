/**
 * Executive Mode Toggle
 * 
 * Toggle between Board-ready and CFO-style views.
 */

import { Button } from '@/components/ui/button';
import { LayoutGrid, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExecMode, ExecModeType } from './ExecModeContext';

interface ExecModeToggleProps {
  className?: string;
}

export function ExecModeToggle({ className }: ExecModeToggleProps) {
  const { mode, setMode } = useExecMode();

  const modes: { id: ExecModeType; label: string; icon: React.ElementType }[] = [
    { id: 'board', label: 'Board-ready', icon: LayoutGrid },
    { id: 'cfo', label: 'CFO Detail', icon: BarChart3 },
  ];

  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted/50 rounded-lg', className)}>
      {modes.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant="ghost"
          size="sm"
          onClick={() => setMode(id)}
          className={cn(
            'gap-1.5 h-8 px-3 text-xs font-medium transition-all',
            mode === id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}
