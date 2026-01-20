import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  History, 
  Upload, 
  CheckCircle, 
  Clock,
  Search,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { EmployerGlobalFiltersBar } from '@/components/employer';

const policyDocuments = [
  {
    id: '1',
    name: 'Employee Benefits Policy 2025',
    version: '2.1',
    status: 'published',
    lastUpdated: '2025-01-05',
    updatedBy: 'HR Manager',
    category: 'Benefits',
    requiredDocs: ['ID Copy', 'Employment Contract'],
  },
  {
    id: '2',
    name: 'Leave Management Guidelines',
    version: '1.5',
    status: 'published',
    lastUpdated: '2024-12-20',
    updatedBy: 'HR Manager',
    category: 'Leave',
    requiredDocs: ['Leave Form', 'Manager Approval'],
  },
  {
    id: '3',
    name: 'Housing Allowance Policy',
    version: '3.0',
    status: 'draft',
    lastUpdated: '2025-01-10',
    updatedBy: 'HR Manager',
    category: 'Allowances',
    requiredDocs: ['Tenancy Contract', 'DEWA Bill'],
  },
  {
    id: '4',
    name: 'Health Insurance Coverage',
    version: '2.0',
    status: 'review',
    lastUpdated: '2025-01-08',
    updatedBy: 'Benefits Admin',
    category: 'Health',
    requiredDocs: ['Claim Form', 'Medical Receipt', 'Prescription'],
  },
  {
    id: '5',
    name: 'Learning & Development Policy',
    version: '1.2',
    status: 'published',
    lastUpdated: '2024-11-15',
    updatedBy: 'L&D Manager',
    category: 'Development',
    requiredDocs: ['Course Registration', 'Manager Approval', 'Completion Certificate'],
  },
];

const pendingApprovals = [
  { policy: 'Housing Allowance Policy v3.0', submittedBy: 'HR Manager', date: '2025-01-10', changes: 5 },
  { policy: 'Health Insurance Coverage v2.0', submittedBy: 'Benefits Admin', date: '2025-01-08', changes: 3 },
];

export function PoliciesOpsView() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Published</Badge>;
      case 'draft':
        return <Badge className="bg-muted text-muted-foreground">Draft</Badge>;
      case 'review':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending Review</Badge>;
      default:
        return null;
    }
  };

  const filteredPolicies = policyDocuments.filter(policy =>
    policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    policy.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Policy Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage organization policies</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create New Policy
        </Button>
      </div>

      {/* Global Filters */}
      <EmployerGlobalFiltersBar compact />

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  {pendingApprovals.length} Policies Pending Approval
                </p>
                <div className="mt-2 space-y-2">
                  {pendingApprovals.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{item.policy} • {item.changes} changes</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList>
            <TabsTrigger value="all">All Policies</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Policy Name</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Version</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Last Updated</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPolicies.map((policy) => (
                      <tr key={policy.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{policy.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{policy.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">v{policy.version}</td>
                        <td className="py-3 px-4">{getStatusBadge(policy.status)}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(policy.lastUpdated).toLocaleDateString()}
                          <br />
                          <span className="text-xs">by {policy.updatedBy}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => p.status === 'published').map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.version} • Published {new Date(policy.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">New Version</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredPolicies.filter(p => p.status === 'draft' || p.status === 'review').map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.version} • Last edited {new Date(policy.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(policy.status)}
                      <Button variant="outline" size="sm">Continue Editing</Button>
                      {policy.status === 'draft' && (
                        <Button size="sm">Submit for Review</Button>
                      )}
                    </div>
                  </div>
                ))}
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
                {policyDocuments.map((policy) => (
                  <div key={policy.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{policy.name}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit Requirements
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {policy.requiredDocs.map((doc, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
