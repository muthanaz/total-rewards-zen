/**
 * Admin Policy Templates Page
 * 
 * Manage reusable policy templates that can be used to create 
 * organization-specific policies quickly.
 */

import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  FileText,
  MoreHorizontal,
  Copy,
  Loader2,
  LayoutTemplate,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { LIFE_AREA_LABELS } from '@/lib/constants';
import { 
  BENEFIT_TYPE_OPTIONS, 
  TRANSACTION_MODEL_OPTIONS,
  DEFAULT_POLICY_LOGIC,
  DEFAULT_POLICY_CONTENT,
  type TransactionModel,
  type BenefitPolicyType,
} from '@/lib/policyEngine';
import {
  useAllPolicyTemplates,
  useCreatePolicyTemplate,
  useUpdatePolicyTemplate,
  useDeletePolicyTemplate,
  type PolicyTemplate,
  type CreateTemplateInput,
} from '@/hooks/usePolicyTemplates';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminPolicyTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PolicyTemplate | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTemplateInput>({
    name: '',
    description: '',
    category: '',
    benefit_type: 'allowance',
    transaction_model: 'claim_only',
    default_sla_days: undefined,
    default_content: DEFAULT_POLICY_CONTENT,
    default_eligibility_rules: DEFAULT_POLICY_LOGIC.eligibility_rules,
    default_limits: DEFAULT_POLICY_LOGIC.limits_caps,
    default_workflow: DEFAULT_POLICY_LOGIC.workflow,
    default_required_docs: [],
  });

  const { data: templates = [], isLoading } = useAllPolicyTemplates();
  const createTemplate = useCreatePolicyTemplate();
  const updateTemplate = useUpdatePolicyTemplate();
  const deleteTemplate = useDeletePolicyTemplate();

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query) ||
      t.description?.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  const activeCount = templates.filter(t => t.is_active).length;
  const inactiveCount = templates.filter(t => !t.is_active).length;

  const lifeAreaOptions = Object.entries(LIFE_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const handleOpenEditor = (template?: PolicyTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category,
        benefit_type: template.benefit_type || 'allowance',
        transaction_model: template.transaction_model || 'claim_only',
        default_sla_days: template.default_sla_days || undefined,
        default_content: template.default_content || DEFAULT_POLICY_CONTENT,
        default_eligibility_rules: template.default_eligibility_rules || DEFAULT_POLICY_LOGIC.eligibility_rules,
        default_limits: template.default_limits || DEFAULT_POLICY_LOGIC.limits_caps,
        default_workflow: template.default_workflow || DEFAULT_POLICY_LOGIC.workflow,
        default_required_docs: template.default_required_docs || [],
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        benefit_type: 'allowance',
        transaction_model: 'claim_only',
        default_sla_days: undefined,
        default_content: DEFAULT_POLICY_CONTENT,
        default_eligibility_rules: DEFAULT_POLICY_LOGIC.eligibility_rules,
        default_limits: DEFAULT_POLICY_LOGIC.limits_caps,
        default_workflow: DEFAULT_POLICY_LOGIC.workflow,
        default_required_docs: [],
      });
    }
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category) {
      toast.error('Name and category are required');
      return;
    }

    try {
      if (editingTemplate) {
        // Cast formData to the expected type for update
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category,
          benefit_type: formData.benefit_type || null,
          transaction_model: formData.transaction_model || null,
          default_sla_days: formData.default_sla_days || null,
          default_content: formData.default_content || null,
          default_eligibility_rules: formData.default_eligibility_rules || null,
          default_limits: formData.default_limits || null,
          default_workflow: formData.default_workflow || null,
          default_required_docs: formData.default_required_docs || null,
        } as any);
      } else {
        await createTemplate.mutateAsync(formData);
      }
      setEditorOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (template: PolicyTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;
    try {
      await deleteTemplate.mutateAsync(template.id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDuplicate = (template: PolicyTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      category: template.category,
      benefit_type: template.benefit_type || 'allowance',
      transaction_model: template.transaction_model || 'claim_only',
      default_sla_days: template.default_sla_days || undefined,
      default_content: template.default_content || DEFAULT_POLICY_CONTENT,
      default_eligibility_rules: template.default_eligibility_rules || DEFAULT_POLICY_LOGIC.eligibility_rules,
      default_limits: template.default_limits || DEFAULT_POLICY_LOGIC.limits_caps,
      default_workflow: template.default_workflow || DEFAULT_POLICY_LOGIC.workflow,
      default_required_docs: template.default_required_docs || [],
    });
    setEditorOpen(true);
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <PageLayout
      title="Policy Templates"
      description="Create and manage reusable policy templates for client organizations"
      icon={LayoutTemplate}
      actions={
        <Button className="gap-2" onClick={() => handleOpenEditor()}>
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <LayoutTemplate className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="text-lg">Templates Library</CardTitle>
              <CardDescription>
                Templates provide default configuration for new client policies
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first template to get started'}
              </p>
              {!searchQuery && (
                <Button className="mt-4 gap-2" onClick={() => handleOpenEditor()}>
                  <Plus className="w-4 h-4" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Transaction Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {LIFE_AREA_LABELS[template.category as keyof typeof LIFE_AREA_LABELS] || template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {TRANSACTION_MODEL_OPTIONS.find(o => o.value === template.transaction_model)?.label || template.transaction_model}
                      </span>
                    </TableCell>
                    <TableCell>
                      {template.is_active ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(template.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditor(template)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(template)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Editor Sheet */}
      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </SheetTitle>
            <SheetDescription>
              Templates define default configurations for organization policies
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Medical Insurance Standard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this template..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Life Area / Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lifeAreaOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="benefit_type">Benefit Type</Label>
                  <Select
                    value={formData.benefit_type || 'allowance'}
                    onValueChange={(v) =>
                      setFormData({ ...formData, benefit_type: v as BenefitPolicyType })
                    }
                  >
                    <SelectTrigger id="benefit_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BENEFIT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction_model">Transaction Model</Label>
                  <Select
                    value={formData.transaction_model || 'claim_only'}
                    onValueChange={(v) =>
                      setFormData({ ...formData, transaction_model: v as TransactionModel })
                    }
                  >
                    <SelectTrigger id="transaction_model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_MODEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sla_days">Default SLA (days)</Label>
                <Input
                  id="sla_days"
                  type="number"
                  min={0}
                  value={formData.default_sla_days || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_sla_days: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="e.g., 3"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if SLA is not applicable
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Advanced configuration (eligibility rules, limits, required documents) 
                can be edited after creating the template or when creating an organization policy.
              </p>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}
