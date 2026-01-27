/**
 * Operations Workbench Page
 * 
 * Unified view merging the former Workbench and Claims Queue into a single page.
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
