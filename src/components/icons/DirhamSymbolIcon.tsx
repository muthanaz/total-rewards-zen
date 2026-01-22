import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * DirhamSymbolIcon
 * Inline SVG (no Unicode) for the official UAE Dirham symbol.
 * - Uses currentColor
 * - 1em sizing to match surrounding text
 */
export function DirhamSymbolIcon({
  className,
  title = 'UAE Dirham',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : 'presentation'}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      className={cn('inline-block align-[-0.125em]', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      {/*
        Stylized Dirham mark (stroke-based), designed to scale cleanly with text.
        NOTE: This is an inline SVG implementation (no Unicode character).
      */}
      <path
        d="M7 3v18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7 7h9c2.2 0 4 1.8 4 4s-1.8 4-4 4H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 14h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
