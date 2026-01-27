/**
 * People Intelligence Engine
 * 
 * Dynamic segment builder with customizable filters, live preview,
 * AI-powered watchlist, and dual-view tabs for Exec/HR modes.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DataConfidenceBadge, 
  PageConfidenceGate, 
  useDataCoverageMetrics 
} from '@/components/employer';
import {
  useSegmentBuilder,
  SegmentFilterPanel,
  SegmentMetricsRow,
  SegmentCharts,
  AIWatchlistStrip,
  SaveSegmentModal,
  SegmentMemberTable,
  BulletChart,
} from '@/components/employer/segments';
import { Rocket, Download, BarChart3, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SegmentsPage() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'members'>('insights');

  const {
    filters,
    updateFilter,
    resetFilters,
    metrics,
    filteredEmployees,
    dynamicTitle,
    hasActiveFilters,
    savedSegments,
    saveSegment,
    aiWatchlist,
    selectedWatchlistId,
    applyWatchlistSegment,
  } = useSegmentBuilder();

  const handleSaveSegment = (name: string) => {
    saveSegment(name);
    toast.success('Segment saved', {
      description: `"${name}" has been added to your AI Watchlist`,
    });
  };

  const handleLaunchCampaign = () => {
    const segmentName = selectedWatchlistId 
      ? aiWatchlist.find(s => s.id === selectedWatchlistId)?.name || 'Custom'
      : 'Custom Segment';
    navigate(`/employer/actions?create=true&source=segments&segment=${encodeURIComponent(segmentName)}`);
  };

  const handleExportReport = () => {
    toast.success('Exporting segment report...', {
      description: `${metrics.matches} employees included`,
    });
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header with Dynamic Title and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-bold text-foreground">
                People Intelligence Engine
              </h1>
              <DataConfidenceBadge metrics={coverageMetrics} />
            </div>
            <motion.p
              key={dynamicTitle}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-medium text-accent"
            >
              {dynamicTitle}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.matches} employees match current filters
            </p>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExportReport}
              disabled={metrics.matches === 0}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button 
              className="gap-2" 
              onClick={handleLaunchCampaign}
              disabled={metrics.matches === 0}
            >
              <Rocket className="h-4 w-4" />
              Launch Campaign
            </Button>
          </div>
        </div>

        {/* AI Watchlist Strip */}
        <AIWatchlistStrip
          selectedId={selectedWatchlistId}
          onSelect={applyWatchlistSegment}
          savedSegments={savedSegments}
        />

        {/* View Tabs - Strategic Insights vs Member List */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'insights' | 'members')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insights" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Strategic Insights
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              Member List
            </TabsTrigger>
          </TabsList>

          {/* Main Content: Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left Panel: The Slicer */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-6">
                <SegmentFilterPanel
                  filters={filters}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                  onSave={() => setSaveModalOpen(true)}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            {/* Right Panel: Tab Content */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Metrics Row (visible in both tabs) */}
              <SegmentMetricsRow 
                metrics={metrics} 
                title="" 
              />

              {/* Tab Content */}
              <TabsContent value="insights" className="mt-0 space-y-6">
                {/* Strategic Insights - Executive View */}
                
                {/* Bullet Chart for Usage vs Adoption */}
                <BulletChart metrics={metrics} />
                
                {/* Behavioral Gap + Charts */}
                <SegmentCharts metrics={metrics} />
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                {/* Member List - HR Ops View */}
                <SegmentMemberTable employees={filteredEmployees} />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Save Segment Modal */}
        <SaveSegmentModal
          open={saveModalOpen}
          onOpenChange={setSaveModalOpen}
          onSave={handleSaveSegment}
          matchCount={metrics.matches}
        />
      </div>
    </PageConfidenceGate>
  );
}
