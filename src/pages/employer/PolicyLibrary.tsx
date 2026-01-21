/**
 * Employer Policy Library Page
 * 
 * Central hub for managing organization policies.
 * Searchable table with filters by category, status, and version.
 */

import { useState, useMemo } from 'react';
import { PageLayout, SectionCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  FileText,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Archive,
  ExternalLink,
  Filter,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolicies, usePolicyStats, type Policy } from '@/hooks/usePolicies';
import { PolicyDetailSheet } from '@/components/shared/PolicyRefBadge';
import { format } from 'date-fns';

export default function EmployerPolicyLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  
  const { data: policies = [], isLoading } = usePolicies();
  const stats = usePolicyStats();
  
  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(policies.map(p => p.category))].sort();
  }, [policies]);
  
  // Filter policies
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch = 
          policy.title.toLowerCase().includes(search) ||
          policy.policy_ref.toLowerCase().includes(search) ||
          policy.category.toLowerCase().includes(search) ||
          (policy.summary?.toLowerCase().includes(search) || false);
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && policy.category !== categoryFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && policy.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [policies, searchQuery, categoryFilter, statusFilter]);
  
  const handleViewPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setDetailSheetOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 gap-1">
            <Archive className="h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <PageLayout
      title="Policy Library"
      description="Manage and publish organization policies"
      actions={
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Policy
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10">
                <Archive className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.archived}</p>
                <p className="text-xs text-muted-foreground">Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Policies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Effective From</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                      Loading policies...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No policies found</p>
                      {searchQuery && (
                        <p className="text-sm">Try adjusting your search or filters</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((policy) => (
                  <TableRow key={policy.id} className="group">
                    <TableCell>
                      <div className="font-medium">{policy.title}</div>
                      {policy.summary && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {policy.summary}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{policy.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {policy.policy_ref}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{policy.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(policy.effective_from), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(policy.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPolicy(policy)}
                        className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Policy Detail Sheet */}
      <PolicyDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        policy={selectedPolicy}
        policyRef={selectedPolicy?.policy_ref || ''}
        isLoading={false}
        error={null}
      />
    </PageLayout>
  );
}
