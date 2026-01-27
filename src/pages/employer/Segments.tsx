/**
 * People Intelligence Engine
 * 
 * Dynamic segment builder with customizable filters, live preview,
 * and AI-powered watchlist for workforce analytics.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
} from '@/components/employer/segments';
import { Rocket, ArrowRight, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function SegmentsPage() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const {
    filters,
    updateFilter,
    resetFilters,
    metrics,
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

  const handleExportSegment = () => {
    toast.success('Exporting segment data...', {
      description: 'Download will start shortly',
    });
  };

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              People Intelligence Engine
            </h1>
            <p className="text-muted-foreground">
              Build custom segments and uncover workforce insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DataConfidenceBadge metrics={coverageMetrics} />
          </div>
        </div>

        {/* AI Watchlist Strip */}
        <AIWatchlistStrip
          selectedId={selectedWatchlistId}
          onSelect={applyWatchlistSegment}
          savedSegments={savedSegments}
        />

        {/* Main Content: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          {/* Right Panel: Live Preview */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Metrics Row */}
            <SegmentMetricsRow 
              metrics={metrics} 
              title={dynamicTitle} 
            />

            {/* Charts & Visualizations */}
            <SegmentCharts metrics={metrics} />

            {/* Action Bar */}
            {metrics.matches > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg bg-muted/50 border">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleLaunchCampaign}
                >
                  <Rocket className="h-4 w-4" />
                  Launch Targeted Campaign
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleExportSegment}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>

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
