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
  AlertTriangle,
  Lock,
  Archive,
  ExternalLink,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmployerGlobalFiltersBar } from '@/components/employer';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { useEmployerPermissions } from '@/hooks/useEmployerPermissions';
import { useOrganizationPolicies, BenefitPolicy } from '@/hooks/useSharedPolicies';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PolicyEditorSheet } from './PolicyEditorSheet';
import { CreatePolicyModal } from './CreatePolicyModal';
import { format } from 'date-fns';
import { isPolicyVersionActive } from '@/lib/crossPortalContract';
import { LifeAreaChip, getLifeAreaLabel } from '@/components/shared/EnumChip';
import { LIFE_AREA_LABELS } from '@/lib/constants';

type PolicyStatus = 'published' | 'draft' | 'archived';

export function PolicyManagementView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<BenefitPolicy | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { hasPermission } = useEmployerPermissions();
  const { user } = useAuth();

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
  const { data: policies = [], isLoading } = useOrganizationPolicies(organizationId);

  const getVersionStatus = (policy: BenefitPolicy): PolicyStatus => {
    if (!policy.currentVersion) return 'draft';
    if (isPolicyVersionActive(policy.currentVersion)) return 'published';
    return 'archived';
  };

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published</Badge>;
      case 'draft':
        return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Archived</Badge>;
      default:
        return null;
    }
  };

  const filteredPolicies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return policies.filter(policy => {
      const nameMatch = policy.benefit.name.toLowerCase().includes(query);
      // Search by both raw enum and human label
      const lifeAreaLabel = getLifeAreaLabel(policy.benefit.life_area).toLowerCase();
      const lifeAreaMatch = policy.benefit.life_area?.toLowerCase().includes(query) || 
                           lifeAreaLabel.includes(query);
      return nameMatch || lifeAreaMatch;
    });
  }, [policies, searchQuery]);

  const publishedCount = policies.filter(p => getVersionStatus(p) === 'published').length;
  const draftCount = policies.filter(p => getVersionStatus(p) === 'draft').length;
  const archivedVersionsCount = policies.reduce((acc, p) => 
    acc + p.allVersions.filter(v => !isPolicyVersionActive(v)).length, 0
  );

  const handleEditPolicy = (policy: BenefitPolicy) => {
    setSelectedPolicy(policy);
    setEditorOpen(true);
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
                <p className="text-2xl font-bold">{policies.length}</p>
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
                <p className="text-sm text-muted-foreground">Archived Versions</p>
                <p className="text-2xl font-bold text-gray-600">{archivedVersionsCount}</p>
              </div>
              <Archive className="w-8 h-8 text-gray-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Policies ({policies.length})</TabsTrigger>
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
                <div className="text-center py-8 text-muted-foreground">No policies found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benefit</TableHead>
                      <TableHead>Life Area</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Effective Dates</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => {
                      const status = getVersionStatus(policy);
                      const currentVersion = policy.currentVersion;
                      return (
                        <TableRow key={policy.benefit.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{policy.benefit.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <LifeAreaChip value={policy.benefit.life_area || ''} showTooltip={true} />
                          </TableCell>
                          <TableCell>
                            {currentVersion ? `v${currentVersion.version}` : '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell className="text-sm">
                            {currentVersion ? (
                              <>
                                {format(new Date(currentVersion.effective_from), 'MMM d, yyyy')}
                                {currentVersion.effective_until && (
                                  <> - {format(new Date(currentVersion.effective_until), 'MMM d, yyyy')}</>
                                )}
                              </>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {currentVersion 
                              ? format(new Date(currentVersion.updated_at), 'MMM d, yyyy')
                              : '—'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <PermissionGate permission="can_manage_policies">
                                <Button variant="ghost" size="sm" onClick={() => handleEditPolicy(policy)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </PermissionGate>
                              <Button variant="ghost" size="sm">
                                <History className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                {filteredPolicies.filter(p => getVersionStatus(p) === 'published').map((policy) => (
                  <div key={policy.benefit.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{policy.benefit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.currentVersion?.version} • Effective from {
                            policy.currentVersion 
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
                {filteredPolicies.filter(p => getVersionStatus(p) === 'published').length === 0 && (
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
                {filteredPolicies.filter(p => getVersionStatus(p) === 'draft').map((policy) => (
                  <div key={policy.benefit.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{policy.benefit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          No published version • Created {
                            policy.benefit.created_at
                              ? format(new Date(policy.benefit.created_at), 'MMM d, yyyy')
                              : '—'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Draft</Badge>
                      <PermissionGate permission="can_manage_policies">
                        <Button size="sm" onClick={() => handleEditPolicy(policy)}>
                          Create First Version
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>
                ))}
                {filteredPolicies.filter(p => getVersionStatus(p) === 'draft').length === 0 && (
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
                  <div key={policy.benefit.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{policy.benefit.name}</span>
                      </div>
                      <PermissionGate permission="can_manage_policies">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Requirements
                        </Button>
                      </PermissionGate>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.requiredDocuments.length > 0 ? (
                        policy.requiredDocuments.map((doc) => (
                          <Badge 
                            key={doc.id} 
                            variant={doc.is_required ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {doc.document_name}
                            {doc.is_required && ' *'}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No documents configured</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Editor Sheet */}
      <PolicyEditorSheet
        policy={selectedPolicy}
        organizationId={organizationId || ''}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </div>
  );
}
