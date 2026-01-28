/**
 * Drivers & Segments Page
 * 
 * Dynamic segment builder with customizable filters, live preview,
 * AI-powered watchlist, and dual-view tabs for Exec/HR modes.
 * 
 * MISSION: Every insight leads to a target list and an action.
 * - Every chart click opens a drilldown drawer
 * - Segment Playbook recommends interventions
 * - CTAs enforced on every insight
 */

import { useState, useCallback } from 'react';
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
  SegmentDrilldownDrawer,
  SegmentPlaybookPanel,
  DrilldownContext,
} from '@/components/employer/segments';
import { Rocket, Download, BarChart3, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AI_WATCHLIST_SEGMENTS } from '@/components/employer/segments/mockData';

export default function SegmentsPage() {
  const navigate = useNavigate();
  const coverageMetrics = useDataCoverageMetrics();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'members'>('insights');
  
  // Drilldown drawer state
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [drilldownContext, setDrilldownContext] = useState<DrilldownContext>({
    title: 'Segment',
    description: 'View segment details',
    source: 'filter',
  });

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

  // Get current segment name for CTAs
  const currentSegmentName = selectedWatchlistId 
    ? aiWatchlist.find(s => s.id === selectedWatchlistId)?.name || 'Custom'
    : hasActiveFilters ? dynamicTitle.replace('Analysis: ', '') : 'All Employees';

  const handleSaveSegment = (name: string) => {
    saveSegment(name);
    toast.success('Segment saved', {
      description: `"${name}" has been added to your AI Watchlist`,
    });
  };

  const handleLaunchCampaign = () => {
    navigate(`/employer/actions?create=true&source=segments&segment=${encodeURIComponent(currentSegmentName)}`);
  };

  const handleExportReport = () => {
    toast.success('Exporting segment report...', {
      description: `${metrics.matches} employees included`,
    });
  };

  // Handle benefit chart click - opens drilldown drawer
  const handleBenefitClick = useCallback((benefitName: string) => {
    // Apply the filter
    updateFilter('benefitType', benefitName);
    
    // Open drilldown drawer with benefit context
    setDrilldownContext({
      title: `${benefitName} Users`,
      description: `Employees utilizing ${benefitName} benefits`,
      source: 'benefit',
      filterApplied: benefitName,
    });
    setDrilldownOpen(true);
  }, [updateFilter]);

  // Handle watchlist segment click - opens drilldown drawer
  const handleWatchlistClick = useCallback((segmentId: string) => {
    const segment = AI_WATCHLIST_SEGMENTS.find(s => s.id === segmentId);
    if (segment) {
      applyWatchlistSegment(segmentId);
      
      // Open drilldown drawer with watchlist context
      setDrilldownContext({
        title: segment.name,
        description: segment.description,
        source: 'watchlist',
      });
      setDrilldownOpen(true);
    }
  }, [applyWatchlistSegment]);

  // Handle behavioral gap insight click
  const handleInsightClick = useCallback(() => {
    setDrilldownContext({
      title: 'Behavioral Gap Analysis',
      description: metrics.behavioralGapInsight,
      source: 'chart',
    });
    setDrilldownOpen(true);
  }, [metrics.behavioralGapInsight]);

  return (
    <PageConfidenceGate metrics={coverageMetrics} threshold={70}>
      <div className="space-y-6">
        {/* Header with Dynamic Title and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Drivers & Segments
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

        {/* AI Watchlist Strip - now opens drilldown on click */}
        <AIWatchlistStrip
          selectedId={selectedWatchlistId}
          onSelect={handleWatchlistClick}
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
            {/* Left Panel: The Slicer + Playbook */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="lg:sticky lg:top-6 space-y-4">
                <SegmentFilterPanel
                  filters={filters}
                  onFilterChange={updateFilter}
                  onReset={resetFilters}
                  onSave={() => setSaveModalOpen(true)}
                  hasActiveFilters={hasActiveFilters}
                />
                
                {/* Segment Playbook - Always visible when segment is flagged */}
                {metrics.matches > 0 && (
                  <SegmentPlaybookPanel 
                    metrics={metrics}
                    segmentName={currentSegmentName}
                  />
                )}
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
                
                {/* Bullet Chart for Usage vs Adoption - Clickable */}
                <div 
                  onClick={handleInsightClick}
                  className="cursor-pointer transition-transform hover:scale-[1.01]"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleInsightClick()}
                >
                  <BulletChart metrics={metrics} />
                </div>
                
                {/* Behavioral Gap + Charts with Drill-Down */}
                <SegmentCharts 
                  metrics={metrics} 
                  onBenefitClick={handleBenefitClick}
                />
                
                {/* Quick CTA for non-empty segments */}
                {metrics.matches > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-4 p-4 rounded-lg border border-dashed bg-muted/30"
                  >
                    <Sparkles className="h-5 w-5 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      Ready to take action on this segment?
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDrilldownContext({
                          title: currentSegmentName,
                          description: `${metrics.matches} employees matching current filters`,
                          source: 'filter',
                        });
                        setDrilldownOpen(true);
                      }}
                    >
                      View & Act
                    </Button>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                {/* Member List - HR Ops View */}
                <SegmentMemberTable employees={filteredEmployees} />
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Drilldown Drawer - Opens on every chart/insight click */}
        <SegmentDrilldownDrawer
          open={drilldownOpen}
          onOpenChange={setDrilldownOpen}
          context={drilldownContext}
          filters={filters}
          metrics={metrics}
          employees={filteredEmployees}
          segmentName={currentSegmentName}
        />

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
