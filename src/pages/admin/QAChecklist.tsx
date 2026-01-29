/**
 * QA Checklist Page - Admin only
 * 
 * Internal verification tool for QA gates.
 */

import { QAChecklistPanel } from '@/components/admin/qa';
import { ClipboardCheck } from 'lucide-react';

export default function QAChecklistPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <ClipboardCheck className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">QA Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Internal verification gates for preventing regressions
          </p>
        </div>
      </div>

      {/* Checklist */}
      <QAChecklistPanel />
    </div>
  );
}
