import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  BarChart3, 
  BookOpen,
} from 'lucide-react';
import { 
  PolicyManagementView,
  PolicyInsightsTabContent,
  KnowledgeBaseTabContent,
  OpsOnlyGuard,
} from '@/components/employer';

// Unified Policy Management page with tabs
export default function PoliciesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'policies';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    if (value === 'policies') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <OpsOnlyGuard
      title="Policy Management"
      description="Manage policy documents, insights, and knowledge resources."
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Policy Management</h1>
            <p className="text-muted-foreground">Policy lifecycle, insights analysis, and knowledge resources</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Policies List</span>
              <span className="sm:hidden">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Insights & Heatmaps</span>
              <span className="sm:hidden">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Knowledge Base</span>
              <span className="sm:hidden">Knowledge</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="mt-6">
            <PolicyManagementView />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <PolicyInsightsTabContent />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <KnowledgeBaseTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </OpsOnlyGuard>
  );
}
