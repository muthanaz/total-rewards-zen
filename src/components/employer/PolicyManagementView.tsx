import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  History, 
  CheckCircle, 
  Clock,
  Search,
  FileCheck,
  Lock,
  Archive,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Trash2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EmployerGlobalFiltersBar, DataConfidenceBadge } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PageLayout } from '@/components/shared/PageLayout';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PolicyEditorSheetV2 } from './PolicyEditorSheetV2';
import { CreatePolicyModal } from './CreatePolicyModal';
import { PolicyEmptyState, PolicyInsightsStrip } from './PolicyEmptyState';
import { 
  PolicyModelChip, 
  PolicyCapabilityChips, 
} from './PolicyCapabilityDisplay';
import { format } from 'date-fns';
import { LifeAreaChip, getLifeAreaLabel } from '@/components/shared/EnumChip';
import { toast } from 'sonner';
import { PolicyLogic } from '@/lib/policyEngine';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useOrgSettings } from '@/hooks/useOrgSettings';

interface PolicyRow {
  id: string;
  organization_id: string | null;
  policy_ref: string;
  title: string;
  category: string;
  version: string;
  status: string;
  effective_from: string;
  effective_to: string | null;
  benefit_type: string | null;
  transaction_model: string | null;
  benefit_key: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined version data
  currentVersion?: {
    id: string;
    version_number: number;
    status: string;
    effective_from: string | null;
    effective_to: string | null;
    updated_at: string;
    logic_json?: PolicyLogic | null;
  } | null;
  draftVersion?: {
    id: string;
    version_number: number;
    logic_json?: PolicyLogic | null;
  } | null;
}

export function PolicyManagementView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRow | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { hasPermission } = useEmployerPermissions();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch organization ID
  const { data: profile } = useQuery({
    queryKey: ['profile-org', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const organizationId = profile?.organization_id;

  // Fetch org settings for admin-managed mode
  const { data: orgSettingsData } = useOrgSettings(organizationId);
  const policyManagementMode = orgSettingsData?.settings?.policy_management_mode || 'admin_led';
  const isAdminManaged = policyManagementMode === 'admin_led';
  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['policies_management', organizationId],
    queryFn: async (): Promise<PolicyRow[]> => {
      if (!organizationId) return [];

      // Fetch policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('policies')
        .select('*')
        .eq('organization_id', organizationId)
        .order('title');

      if (policiesError) throw policiesError;

      // Fetch all versions
      const policyIds = (policiesData || []).map(p => p.id);
      if (policyIds.length === 0) return [];

      const { data: versions, error: versionsError } = await (supabase
        .from('policy_versions' as any)
        .select('*')
        .in('policy_id', policyIds)
        .order('version_number', { ascending: false })) as any;

      if (versionsError) throw versionsError;

      // Map policies with version info
      return (policiesData || []).map(policy => {
        const policyVersions = (versions || []).filter((v: any) => v.policy_id === policy.id);
        const published = policyVersions.find((v: any) => v.status === 'published');
        const draft = policyVersions.find((v: any) => v.status === 'draft');

        return {
          ...policy,
          currentVersion: published ? {
            id: published.id,
            version_number: published.version_number,
            status: published.status,
            effective_from: published.effective_from,
            effective_to: published.effective_to,
            updated_at: published.last_updated_at || published.created_at,
            logic_json: published.logic_json as PolicyLogic | null,
          } : null,
          draftVersion: draft ? {
            id: draft.id,
            version_number: draft.version_number,
            logic_json: draft.logic_json as PolicyLogic | null,
          } : null,
        };
      });
    },
    enabled: !!organizationId,
  });

  const getStatusBadge = (policy: PolicyRow) => {
    if (policy.currentVersion) {
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published v{policy.currentVersion.version_number}</Badge>;
    }
    if (policy.draftVersion) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Draft v{policy.draftVersion.version_number}</Badge>;
    }
    if (!policy.is_active) {
      return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Archived</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">No Version</Badge>;
  };

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return policies.filter(policy => {
      if (!policy.is_active) return false;
      const nameMatch = policy.title.toLowerCase().includes(query);
      const lifeAreaLabel = getLifeAreaLabel(policy.category).toLowerCase();
      const lifeAreaMatch = policy.category?.toLowerCase().includes(query) || lifeAreaLabel.includes(query);
      return nameMatch || lifeAreaMatch;
    });
  }, [policies, searchQuery]);

  const publishedCount = policies.filter(p => p.currentVersion && p.is_active).length;
  const draftCount = policies.filter(p => !p.currentVersion && p.draftVersion && p.is_active).length;
  const archivedCount = policies.filter(p => !p.is_active).length;

  const handleEditPolicy = (policy: PolicyRow, versionId?: string) => {
    setSelectedPolicy(policy);
    setSelectedVersionId(versionId || policy.draftVersion?.id || policy.currentVersion?.id || null);
    setEditorOpen(true);
  };

  const handlePolicyCreated = async (policyId: string, versionId: string) => {
    // Invalidate and wait for refetch
    await queryClient.invalidateQueries({ queryKey: ['policies_management'] });
    
    // Fetch the newly created policy directly and open editor
    const { data: newPolicy } = await supabase
      .from('policies')
      .select('*')
      .eq('id', policyId)
      .single();
    
    if (newPolicy) {
      setSelectedPolicy({
        ...newPolicy,
        currentVersion: null,
        draftVersion: { id: versionId, version_number: 1 },
      });
      setSelectedVersionId(versionId);
      setEditorOpen(true);
    }
  };

  // Listen for policy-created events from CreatePolicyModal
  useEffect(() => {
    const handlePolicyCreatedEvent = (event: CustomEvent<{ policyId: string; versionId: string }>) => {
      const { policyId, versionId } = event.detail;
      handlePolicyCreated(policyId, versionId);
    };

    window.addEventListener('policy-created', handlePolicyCreatedEvent as EventListener);
    return () => {
      window.removeEventListener('policy-created', handlePolicyCreatedEvent as EventListener);
    };
  }, [queryClient]);

  const handleDuplicate = async (policy: PolicyRow) => {
    try {
      const policyRef = `POL-${policy.title.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: newPolicy, error } = await supabase
        .from('policies')
        .insert({
          organization_id: organizationId,
          policy_ref: policyRef,
          title: `${policy.title} (Copy)`,
          category: policy.category,
          version: '1.0',
          status: 'draft',
          effective_from: new Date().toISOString().split('T')[0],
          benefit_type: policy.benefit_type,
          transaction_model: policy.transaction_model,
          benefit_key: policy.benefit_key,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Create draft version
      await (supabase
        .from('policy_versions' as any)
        .insert({
          policy_id: newPolicy.id,
          version_number: 1,
          status: 'draft',
          created_by: user?.id,
        } as any));

      queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      toast.success('Policy duplicated');
    } catch (error) {
      toast.error('Failed to duplicate policy');
    }
  };

  const { logEvent } = useAuditLog();

  const handleArchive = async (policy: PolicyRow) => {
    try {
      await supabase
        .from('policies')
        .update({ is_active: false, status: 'archived' })
        .eq('id', policy.id);

      logEvent({
        action: 'POLICY_ARCHIVE',
        resourceType: 'policy',
        resourceId: policy.id,
        details: { title: policy.title },
      });

      queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      toast.success('Policy archived');
    } catch (error) {
      toast.error('Failed to archive policy');
    }
  };

  // Generate insights
  const insights = useMemo(() => {
    const result: Array<{ type: 'info' | 'warning' | 'success'; message: string }> = [];
    
    if (draftCount > 0) {
      result.push({
        type: 'warning',
        message: `${draftCount} draft${draftCount > 1 ? 's' : ''} pending review and publication`,
      });
    }
    
    const policiesWithoutSLA = filteredPolicies.filter(p => {
      const logic = p.currentVersion?.logic_json || p.draftVersion?.logic_json;
      return !logic?.workflow?.sla_days || logic.workflow.sla_days === 0;
    });
    if (policiesWithoutSLA.length > 0 && publishedCount > 0) {
      result.push({
        type: 'info',
        message: `${policiesWithoutSLA.length} polic${policiesWithoutSLA.length > 1 ? 'ies have' : 'y has'} no SLA configured (optional)`,
      });
    }
    
    if (publishedCount > 0) {
      result.push({
        type: 'success',
        message: `${publishedCount} polic${publishedCount > 1 ? 'ies are' : 'y is'} live and visible to employees`,
      });
    }
    
    return result;
  }, [filteredPolicies, draftCount, publishedCount]);

  return (
    <TooltipProvider>
      <PageLayout
        title="Policy Management"
        description="Create, edit, and manage organization benefit policies"
        icon={BookOpen}
        confidenceBadge={
          <DataConfidenceBadge 
            metrics={{
              employeeCoverage: 100,
              entitlementCoverage: 100,
              policyCoverage: publishedCount > 0 ? 100 : 30,
              claimsCoverage: 100,
            }} 
          />
        }
        actions={
          <div className="flex items-center gap-3">
            {/* Admin-managed indicator */}
            {isAdminManaged && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Managed
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-xs">
                    Policies are configured by your platform administrator. 
                    You can view policies and request changes.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <PermissionGate 
              permission="can_manage_policies"
              fallback={
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Lock className="w-3 h-3" /> View Only
                </Badge>
              }
            >
              <Button className="gap-2" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Create New Policy
              </Button>
            </PermissionGate>
          </div>
        }
        filters={<EmployerGlobalFiltersBar compact />}
      >
        {/* Key Insights */}
        {insights.length > 0 && <PolicyInsightsStrip insights={insights} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{policies.filter(p => p.is_active).length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-emerald-600">{publishedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-amber-600">{draftCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold text-muted-foreground">{archivedCount}</p>
              </div>
              <Archive className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Policies ({filteredPolicies.length})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCount})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftCount})</TabsTrigger>
            <TabsTrigger value="documents">Required Documents</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
              </CardContent>
            </Card>
          ) : filteredPolicies.length === 0 ? (
            <PolicyEmptyState 
              onCreateClick={() => setCreateModalOpen(true)}
              canCreate={hasPermission('can_manage_policies')}
            />
          ) : (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy Name</TableHead>
                      <TableHead>Life Area</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Capabilities</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{policy.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <LifeAreaChip value={policy.category || ''} showTooltip={true} />
                        </TableCell>
                        <TableCell>
                          <PolicyModelChip model={policy.transaction_model || 'claim_only'} />
                        </TableCell>
                        <TableCell>
                          <PolicyCapabilityChips 
                            logicJson={policy.currentVersion?.logic_json || policy.draftVersion?.logic_json} 
                            transactionModel={policy.transaction_model}
                            compact
                          />
                        </TableCell>
                        <TableCell>
                          {policy.currentVersion 
                            ? `v${policy.currentVersion.version_number}`
                            : policy.draftVersion 
                              ? `v${policy.draftVersion.version_number} (draft)`
                              : '—'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(policy)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {policy.currentVersion?.updated_at
                            ? format(new Date(policy.currentVersion.updated_at), 'MMM d, yyyy')
                            : format(new Date(policy.updated_at), 'MMM d, yyyy')
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <PermissionGate permission="can_manage_policies">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditPolicy(policy)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicate(policy)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <History className="w-4 h-4 mr-2" />
                                    Version History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleArchive(policy)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => p.currentVersion).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.currentVersion?.version_number} • Effective from {
                            policy.currentVersion?.effective_from
                              ? format(new Date(policy.currentVersion.effective_from), 'MMM d, yyyy')
                              : '—'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                        View
                      </Button>
                      <PermissionGate permission="can_manage_policies">
                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                          New Version
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
                {filteredPolicies.filter(p => p.currentVersion).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No published policies</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cross-portal info */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">
                    Cross-Portal Consistency
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Published policies are immediately visible to employees. Only the current published version 
                    is shown on employee benefit pages. Previous versions are archived but accessible for reference.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => !p.currentVersion && p.draftVersion).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Draft v{policy.draftVersion?.version_number} • Created {
                            format(new Date(policy.created_at), 'MMM d, yyyy')
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Draft</Badge>
                      <PermissionGate permission="can_manage_policies">
                        <Button size="sm" onClick={() => handleEditPolicy(policy, policy.draftVersion?.id)}>
                          Continue Editing
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
                {filteredPolicies.filter(p => !p.currentVersion && p.draftVersion).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No drafts pending</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-lg">Required Documents by Policy</CardTitle>
              <CardDescription>Configure what documents employees must submit for each benefit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{policy.title}</span>
                        {getStatusBadge(policy)}
                      </div>
                      <PermissionGate permission="can_manage_policies">
                        <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)}>
                          <Edit className="w-3 h-3 mr-1" />
                          Configure Docs
                        </Button>
                      </PermissionGate>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Document requirements are configured in the Policy Logic tab
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Policy Modal */}
      <CreatePolicyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        organizationId={organizationId || ''}
        onCreated={handlePolicyCreated}
      />

      {/* Policy Editor Sheet */}
      {selectedPolicy && (
        <PolicyEditorSheetV2
          policyId={selectedPolicy.id}
          versionId={selectedVersionId}
          organizationId={organizationId || ''}
          open={editorOpen}
          onOpenChange={setEditorOpen}
        />
      )}
      </PageLayout>
    </TooltipProvider>
  );
}
