/**
 * Demo Tools Page - Admin only
 * 
 * Central hub for managing demo data and templates.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemoDataControls, DemoTemplateManager } from '@/components/admin/demo';
import { Database, FileText, Beaker } from 'lucide-react';

export default function DemoToolsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
          <Beaker className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Demo Tools</h1>
          <p className="text-sm text-muted-foreground">
            Manage demo data, templates, and presentation settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="data" className="space-y-4">
        <TabsList>
          <TabsTrigger value="data" className="gap-2">
            <Database className="size-4" />
            Demo Data
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="size-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data">
          <DemoDataControls />
        </TabsContent>

        <TabsContent value="templates">
          <DemoTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
