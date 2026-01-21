import { useState, useMemo } from 'react';
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
  Users,
  DollarSign,
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PolicyEditorSheetV2 } from './PolicyEditorSheetV2';
import { CreatePolicyModal } from './CreatePolicyModal';
import { format } from 'date-fns';
import { LifeAreaChip, getLifeAreaLabel } from '@/components/shared/EnumChip';
import { toast } from 'sonner';
import { TransactionModel } from '@/lib/policyEngine';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ============ Policy Capability Chips ============

function PolicyModelChip({ model }: { model: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    'request_only': { label: 'Request', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    'claim_only': { label: 'Claim', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    'request_and_claim': { label: 'Request + Claim', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  };
  const config = labels[model] || { label: model, className: '' };
  return <Badge className={`text-xs ${config.className}`}>{config.label}</Badge>;
}

function PolicyCapabilityChips({ policy }: { policy: PolicyRow }) {
  // For now, show placeholder chips based on policy properties
  // In a full implementation, this would come from policy_versions.logic_json
  const chips: Array<{ label: string; icon: React.ReactNode; enabled: boolean }> = [
    { 
      label: 'SLA', 
      icon: <Clock className="w-3 h-3" />, 
      enabled: true // Would check policy.currentVersion?.logic_json?.workflow?.sla_days > 0
    },
    { 
      label: 'Docs', 
      icon: <FileCheck className="w-3 h-3" />, 
      enabled: true // Would check if required_docs exist
    },
    { 
      label: 'Eligibility', 
      icon: <Users className="w-3 h-3" />, 
      enabled: true // Would check if eligibility rules are set
    },
    { 
      label: 'Limits', 
      icon: <DollarSign className="w-3 h-3" />, 
      enabled: !!policy.benefit_type && ['allowance', 'reimbursement'].includes(policy.benefit_type)
    },
  ];
  
  return (
    <div className="flex gap-1 flex-wrap">
      {chips.filter(c => c.enabled).slice(0, 3).map((chip) => (
        <Tooltip key={chip.label}>
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs gap-1 py-0 px-1.5">
              {chip.icon}
              {chip.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{chip.label} configured</TooltipContent>
        </Tooltip>
      ))}
      {chips.filter(c => c.enabled).length > 3 && (
        <Badge variant="outline" className="text-xs py-0 px-1.5">
          +{chips.filter(c => c.enabled).length - 3}
        </Badge>
      )}
    </div>
  );
}

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
  } | null;
  draftVersion?: {
    id: string;
    version_number: number;
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

  // Fetch policies with their versions
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
          } : null,
          draftVersion: draft ? {
            id: draft.id,
            version_number: draft.version_number,
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

  const handleArchive = async (policy: PolicyRow) => {
    try {
      await supabase
        .from('policies')
        .update({ is_active: false, status: 'archived' })
        .eq('id', policy.id);

      queryClient.invalidateQueries({ queryKey: ['policies_management'] });
      toast.success('Policy archived');
    } catch (error) {
      toast.error('Failed to archive policy');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Policy Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage organization benefit policies</p>
        </div>
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

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

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
                <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500/30" />
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
                <p className="text-2xl font-bold text-gray-600">{archivedCount}</p>
              </div>
              <Archive className="w-8 h-8 text-gray-500/30" />
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
          <Card className="card-elevated">
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
              ) : filteredPolicies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p>No policies found</p>
                  <Button variant="outline" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first policy
                  </Button>
                </div>
              ) : (
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
                          <PolicyCapabilityChips policy={policy} />
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
              )}
            </CardContent>
          </Card>
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
    </div>
  );
}
