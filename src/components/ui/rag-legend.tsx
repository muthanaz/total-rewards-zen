import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RAG_INDICATORS } from '@/lib/colorUtils';

interface RAGLegendProps {
  className?: string;
  compact?: boolean;
}

export function RAGLegend({ className, compact = false }: RAGLegendProps) {
  const items = [
    { 
      status: 'green' as const, 
      icon: CheckCircle2, 
      label: RAG_INDICATORS.green.label,
      description: '80-100%',
      classes: RAG_INDICATORS.green,
    },
    { 
      status: 'amber' as const, 
      icon: Clock, 
      label: RAG_INDICATORS.amber.label,
      description: '30-79%',
      classes: RAG_INDICATORS.amber,
    },
    { 
      status: 'red' as const, 
      icon: AlertCircle, 
      label: RAG_INDICATORS.red.label,
      description: '0-29%',
      classes: RAG_INDICATORS.red,
    },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 text-xs", className)}>
        {items.map(({ status, icon: Icon, label, classes }) => (
          <div key={status} className="flex items-center gap-1">
            <Icon className={cn("w-3 h-3", classes.textClass)} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4 text-xs", className)}>
      {items.map(({ status, icon: Icon, label, description, classes }) => (
        <div 
          key={status} 
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 rounded-md border",
            classes.bgClass,
            classes.borderClass
          )}
        >
          <Icon className={cn("w-3.5 h-3.5", classes.textClass)} />
          <div className="flex flex-col">
            <span className={cn("font-medium", classes.textClass)}>{label}</span>
            <span className="text-muted-foreground text-[10px]">{description}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
