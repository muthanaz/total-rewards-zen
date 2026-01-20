import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface InfoTooltipProps {
  formula?: string;
  dataSource?: string;
  lastUpdated?: string;
  notes?: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ formula, dataSource, lastUpdated, notes, children }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center w-4 h-4 ml-1 text-muted-foreground hover:text-foreground transition-colors">
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs p-3 space-y-2" side="top">
        {children ? (
          children
        ) : (
          <>
            {formula && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Formula</p>
                <p className="text-sm">{formula}</p>
              </div>
            )}
            {dataSource && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Data Source</p>
                <p className="text-sm">{dataSource}</p>
              </div>
            )}
            {lastUpdated && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                <p className="text-sm">{lastUpdated}</p>
              </div>
            )}
            {notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
}