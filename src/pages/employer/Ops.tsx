/**
 * Operations Hub Page
 * 
 * Unified view merging Claims & Requests into a single page.
 * This is the primary operational hub for HR Ops users.
 */

import { UnifiedWorkbench } from '@/components/employer/UnifiedWorkbench';

export default function OpsPage() {
  return (
    <div className="animate-fade-in">
      <UnifiedWorkbench />
    </div>
  );
}
