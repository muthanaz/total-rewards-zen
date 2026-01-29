import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Banknote, 
  Plus, 
  Download, 
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { StandardPageHeader } from '@/components/shared';
import {
  SettlementStats,
  BatchTable,
  BatchFiltersComponent,
  ExceptionsPanel,
  ReconciliationPanel,
  CreateBatchModal,
  MarkPaidModal,
  mockBatches,
  mockPendingClaims,
  mockExceptions,
  getLifecycleStats,
} from '@/components/employer/settlements';
import type { SettlementBatch, BatchFilters } from '@/components/employer/settlements';

export default function SettlementsPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const [activeTab, setActiveTab] = useState<'batches' | 'exceptions'>('batches');
  const [filters, setFilters] = useState<BatchFilters>({ status: 'all', reconciliation: 'all' });
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [markPaidModalOpen, setMarkPaidModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null);

  const stats = useMemo(() => getLifecycleStats(mockBatches), []);

  const filteredBatches = useMemo(() => {
    return mockBatches.filter(batch => {
      if (filters.status && filters.status !== 'all' && batch.status !== filters.status) {
        return false;
      }
      if (filters.reconciliation && filters.reconciliation !== 'all' && 
          batch.reconciliation.status !== filters.reconciliation) {
        return false;
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return (
          batch.batchRef.toLowerCase().includes(search) ||
          batch.period.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [filters]);

  const handleStageClick = (stage: 'ready' | 'exported' | 'paid' | 'exceptions') => {
    if (stage === 'exceptions') {
      setActiveTab('exceptions');
    } else {
      setActiveTab('batches');
      setFilters({ ...filters, status: stage });
    }
  };

  const handleExport = (batch: SettlementBatch) => {
    toast.success(`Exporting ${batch.batchRef}...`, {
      description: 'File will be ready for download shortly',
    });
  };

  const handleMarkPaid = (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    setMarkPaidModalOpen(true);
  };

  const handleConfirmPaid = (bankRef: string, paymentDate: string, notes?: string) => {
    toast.success('Batch marked as paid', {
      description: `${selectedBatch?.batchRef} - ${bankRef}`,
    });
  };

  const handleRunReconciliation = (batch: SettlementBatch) => {
    toast.info('Running reconciliation...', {
      description: 'Matching transactions with bank statement',
    });
  };

  const handleViewDetails = (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    toast.info(`Viewing ${batch.batchRef}`, {
      description: 'Detail drawer coming soon',
    });
  };

  const handleCreateBatch = (claimIds: string[]) => {
    toast.success(`Batch created with ${claimIds.length} claims`, {
      description: 'Batch is ready for export',
    });
  };

  const resetFilters = () => {
    setFilters({ status: 'all', reconciliation: 'all' });
  };

  return (
    <div className={cn('space-y-6 animate-fade-in', isRTL && 'text-right')}>
      {/* Standard Page Header - HR Ops variant */}
      <StandardPageHeader
        variant="hr_ops"
        title={language === 'ar' ? 'التسويات' : 'Settlements'}
        helperText={language === 'ar' 
          ? 'إدارة دفعات المطالبات ومطابقة البنك'
          : 'Manage claim payments and bank reconciliation'
        }
        icon={Banknote}
        iconClassName="from-success to-success/80 shadow-success/25"
        primaryCTA={{
          label: 'Create Batch',
          icon: Plus,
          onClick: () => setCreateModalOpen(true),
        }}
        secondaryActions={
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export Report
          </Button>
        }
        metaBadges={[
          { label: `${stats.ready} Ready`, variant: 'success' },
          { label: `${mockExceptions.length} Exceptions`, variant: mockExceptions.length > 0 ? 'warning' : 'default' },
        ]}
      />

      {/* Lifecycle Stats */}
      <SettlementStats stats={stats} onStageClick={handleStageClick} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="batches" className="gap-2">
            <Banknote className="w-4 h-4" />
            Batches
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Exceptions
            {mockExceptions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full">
                {mockExceptions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4 mt-4">
          {/* Filters */}
          <BatchFiltersComponent
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />

          {/* Batch Actions Bar */}
          {selectedBatchIds.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <span className="text-sm font-medium">
                {selectedBatchIds.length} batch{selectedBatchIds.length > 1 ? 'es' : ''} selected
              </span>
              <div className="flex-1" />
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-3 h-3" />
                Export Selected
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <RefreshCw className="w-3 h-3" />
                Run Reconciliation
              </Button>
            </div>
          )}

          {/* Batch Table */}
          <BatchTable
            batches={filteredBatches}
            selectedIds={selectedBatchIds}
            onSelectionChange={setSelectedBatchIds}
            onExport={handleExport}
            onMarkPaid={handleMarkPaid}
            onRunReconciliation={handleRunReconciliation}
            onViewDetails={handleViewDetails}
          />

          {/* Pending Claims Summary */}
          {mockPendingClaims.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-warning" />
                  {mockPendingClaims.length} Approved Claims Awaiting Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create New Batch
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="exceptions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Exceptions List */}
            <div className="lg:col-span-2">
              <ExceptionsPanel
                exceptions={mockExceptions}
                onResolve={(exc) => {
                  toast.success('Exception resolved', {
                    description: exc.claimId,
                  });
                }}
                onViewClaim={(claimId) => {
                  toast.info(`Opening claim ${claimId}`);
                }}
              />
            </div>

            {/* Reconciliation Panel for Selected Batch */}
            <div className="space-y-4">
              {mockBatches
                .filter(b => b.status === 'exported')
                .slice(0, 2)
                .map(batch => (
                  <ReconciliationPanel
                    key={batch.id}
                    batch={batch}
                    onRunReconciliation={() => handleRunReconciliation(batch)}
                  />
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateBatchModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        claims={mockPendingClaims}
        onCreateBatch={handleCreateBatch}
      />

      <MarkPaidModal
        open={markPaidModalOpen}
        onOpenChange={setMarkPaidModalOpen}
        batch={selectedBatch}
        onConfirm={handleConfirmPaid}
      />
    </div>
  );
}
