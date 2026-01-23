/**
 * Copy-to-Clipboard for Reference IDs
 * 
 * Displays an ID or reference with click-to-copy functionality.
 * Shows visual feedback on hover and after copying.
 */

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generalToasts } from '@/lib/actionToasts';

interface CopyableIdProps {
  value: string;
  label?: string;
  className?: string;
  truncate?: boolean;
  showIcon?: boolean;
  variant?: 'default' | 'subtle' | 'badge';
}

export function CopyableId({
  value,
  label,
  className,
  truncate = true,
  showIcon = true,
  variant = 'default',
}: CopyableIdProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      generalToasts.copied(label || value);
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayValue = truncate && value.length > 12 
    ? `${value.slice(0, 6)}...${value.slice(-4)}`
    : value;

  const baseStyles = 'inline-flex items-center gap-1.5 font-mono text-xs cursor-pointer transition-all';
  
  const variantStyles = {
    default: 'text-muted-foreground hover:text-foreground',
    subtle: 'text-muted-foreground/70 hover:text-muted-foreground',
    badge: 'px-2 py-1 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground',
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(baseStyles, variantStyles[variant], className)}
      title={`Click to copy: ${value}`}
    >
      {label && <span className="text-muted-foreground/70 font-sans">{label}:</span>}
      <span className="tabular-nums">{displayValue}</span>
      {showIcon && (
        <span className="shrink-0">
          {copied ? (
            <Check className="w-3 h-3 text-success" />
          ) : (
            <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          )}
        </span>
      )}
    </button>
  );
}

// Inline variant for use within text
export function CopyableInline({
  value,
  children,
  className,
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      generalToasts.copied();
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 hover:text-primary transition-colors',
        copied && 'text-success',
        className
      )}
      title={`Click to copy: ${value}`}
    >
      {children || value}
      {copied ? (
        <Check className="w-3 h-3" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50 hover:opacity-100" />
      )}
    </button>
  );
}
