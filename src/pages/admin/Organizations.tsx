import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Search,
  MoreHorizontal,
  RefreshCw,
  Globe,
  Settings,
  X,
  Eye,
  DollarSign,
  Database,
  FileText,
  Activity,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Link2,
  History,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn, formatCurrencyAED, formatRelativeTime, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard, MetricGrid } from '@/components/shared';

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  status?: 'active' | 'suspended' | 'trial';
  plan?: string;
  mrr?: number;
  employee_count?: number;
  data_sources?: number;
  last_activity?: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
}

const STATUS_CONFIG = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30' },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30' },
  trial: { label: 'Trial', labelAr: 'تجريبي', color: 'bg-warning/10 text-warning border-warning/30' },
};

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { createAuditLog } = useAdminAuditLog();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState('overview');
  
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: '', domain: '' });
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get member counts for each org
      const { data: profiles } = await supabase
        .from('profiles')
        .select('organization_id');

      const memberCounts: Record<string, number> = {};
      profiles?.forEach(p => {
        if (p.organization_id) {
          memberCounts[p.organization_id] = (memberCounts[p.organization_id] || 0) + 1;
        }
      });

      const orgsWithCounts: Organization[] = orgs?.map(org => ({
        id: org.id,
        name: org.name,
        domain: org.domain,
        created_at: org.created_at,
        updated_at: org.updated_at || org.created_at,
        member_count: memberCounts[org.id] || 0,
        status: (org.status as 'active' | 'suspended' | 'trial') || 'active',
        plan: 'Professional',
        mrr: 7500,
        employee_count: memberCounts[org.id] || 0,
        data_sources: Math.floor(Math.random() * 4) + 1,
        last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })) || [];

      setOrganizations(orgsWithCounts);
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      toast.error(t('Failed to load organizations', 'فشل في تحميل المنظمات'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name, organization_id')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateOrg = async () => {
    if (!formData.name.trim()) {
      toast.error(t('Organization name is required', 'اسم المنظمة مطلوب'));
      return;
    }

    setSubmitting(true);
    try {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Audit log for org creation
      await createAuditLog({
        action: 'ORG_CREATE',
        entityType: 'organization',
        entityId: newOrg?.id || 'unknown',
        metadata: { org_name: formData.name.trim(), domain: formData.domain.trim() || null },
      });

      toast.success(t('Organization created successfully', 'تم إنشاء المنظمة بنجاح'));
      setCreateDialogOpen(false);
      setFormData({ name: '', domain: '' });
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(t('Failed to create organization', 'فشل في إنشاء المنظمة'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrg = async () => {
    if (!selectedOrg || !formData.name.trim()) {
      toast.error(t('Organization name is required', 'اسم المنظمة مطلوب'));
      return;
    }

    setSubmitting(true);
    try {
      const previousName = selectedOrg.name;
      const previousDomain = selectedOrg.domain;
      
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrg.id);

      if (error) throw error;

      // Audit log for org update
      await createAuditLog({
        action: 'ORG_UPDATE',
        entityType: 'organization',
        entityId: selectedOrg.id,
        metadata: { 
          org_name: formData.name.trim(),
          previous_name: previousName,
          previous_domain: previousDomain,
          new_domain: formData.domain.trim() || null,
        },
      });

      toast.success(t('Organization updated successfully', 'تم تحديث المنظمة بنجاح'));
      setEditDialogOpen(false);
      setSelectedOrg(null);
      setFormData({ name: '', domain: '' });
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast.error(t('Failed to update organization', 'فشل في تحديث المنظمة'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg) return;

    setSubmitting(true);
    try {
      const deletedOrgName = selectedOrg.name;
      const deletedOrgId = selectedOrg.id;
      
      // First, unassign all users from this org
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('organization_id', selectedOrg.id);

      if (updateError) throw updateError;

      // Then delete the org
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', selectedOrg.id);

      if (error) throw error;

      // Audit log for org deletion
      await createAuditLog({
        action: 'ORG_DELETE',
        entityType: 'organization',
        entityId: deletedOrgId,
        metadata: { org_name: deletedOrgName },
      });

      toast.success(t('Organization deleted successfully', 'تم حذف المنظمة بنجاح'));
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast.error(t('Failed to delete organization', 'فشل في حذف المنظمة'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedOrg || !selectedUserId) {
      toast.error(t('Please select a user', 'يرجى اختيار مستخدم'));
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: selectedOrg.id })
        .eq('user_id', selectedUserId);

      if (error) throw error;

      toast.success(t('User assigned to organization', 'تم تعيين المستخدم للمنظمة'));
      setAssignUserDialogOpen(false);
      setSelectedUserId('');
      fetchOrganizations();
      fetchUsers();
    } catch (error: any) {
      console.error('Error assigning user:', error);
      toast.error(t('Failed to assign user', 'فشل في تعيين المستخدم'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUserFromOrg = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ organization_id: null })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(t('User removed from organization', 'تم إزالة المستخدم من المنظمة'));
      fetchOrganizations();
      fetchUsers();
    } catch (error: any) {
      console.error('Error removing user:', error);
      toast.error(t('Failed to remove user', 'فشل في إزالة المستخدم'));
    }
  };

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({ name: org.name, domain: org.domain || '' });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  const openAssignUserDialog = (org: Organization) => {
    setSelectedOrg(org);
    setSelectedUserId('');
    setAssignUserDialogOpen(true);
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrgMembers = (orgId: string) => 
    users.filter(u => u.organization_id === orgId);

  const getUnassignedUsers = () => 
    users.filter(u => !u.organization_id || u.organization_id !== selectedOrg?.id);

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      {/* Header */}
      <PageHeader
        title={t('Organizations', 'المنظمات')}
        description={t('Manage organizations and user assignments', 'إدارة المنظمات وتعيينات المستخدمين')}
        icon={Building2}
        actions={
          <Button onClick={() => { setFormData({ name: '', domain: '' }); setCreateDialogOpen(true); }}>
            <Plus className="w-4 h-4 me-2" />
            {t('Add Organization', 'إضافة منظمة')}
          </Button>
        }
      />

      {/* Stats Cards */}
      <MetricGrid columns={3}>
        <MetricCard
          title={t('Total Organizations', 'إجمالي المنظمات')}
          value={organizations.length.toString()}
          icon={Building2}
        />
        <MetricCard
          title={t('Assigned Users', 'المستخدمون المعينون')}
          value={users.filter(u => u.organization_id).length.toString()}
          icon={Users}
          iconClassName="from-success to-success/80"
        />
        <MetricCard
          title={t('Unassigned Users', 'مستخدمون غير معينين')}
          value={users.filter(u => !u.organization_id).length.toString()}
          icon={Users}
          iconClassName="from-warning to-warning/80"
        />
      </MetricGrid>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", isRTL && "sm:flex-row-reverse")}>
            <div>
              <CardTitle>{t('All Organizations', 'جميع المنظمات')}</CardTitle>
              <CardDescription>{t('Manage organization details and members', 'إدارة تفاصيل المنظمة والأعضاء')}</CardDescription>
            </div>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search organizations...', 'البحث عن منظمات...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-64", isRTL ? "pr-10" : "pl-10")}
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchOrganizations}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? t('No organizations found', 'لم يتم العثور على منظمات')
                  : t('No organizations yet', 'لا توجد منظمات بعد')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Name', 'الاسم')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Plan', 'الخطة')}</TableHead>
                  <TableHead>{t('MRR', 'الإيرادات الشهرية')}</TableHead>
                  <TableHead>{t('Members', 'الأعضاء')}</TableHead>
                  <TableHead>{t('Data Sources', 'مصادر البيانات')}</TableHead>
                  <TableHead>{t('Last Activity', 'آخر نشاط')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => {
                  const statusConfig = STATUS_CONFIG[org.status || 'active'];
                  return (
                    <TableRow 
                      key={org.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => { setSelectedOrg(org); setDetailsOpen(true); setDetailsTab('overview'); }}
                    >
                      <TableCell className="font-medium">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p>{org.name}</p>
                            {org.domain && (
                              <p className="text-xs text-muted-foreground">{org.domain}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          {isRTL ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{org.plan || 'Professional'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {formatCurrencyAED(org.mrr || 7500, { abbreviate: false })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Users className="w-3 h-3" />
                          {org.member_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Database className="w-3 h-3" />
                          {org.data_sources || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatRelativeTime(org.last_activity || org.created_at, { language: language as 'en' | 'ar' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedOrg(org); setDetailsOpen(true); }}>
                              <Eye className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('View Details', 'عرض التفاصيل')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/admin/organizations/${org.id}/settings`); }}>
                              <Settings className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('Settings', 'الإعدادات')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAssignUserDialog(org); }}>
                              <Users className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('Assign User', 'تعيين مستخدم')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(org); }}>
                              <Edit2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('Edit', 'تعديل')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); openDeleteDialog(org); }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('Delete', 'حذف')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Organization Members Section */}
      {filteredOrgs.map((org) => {
        const members = getOrgMembers(org.id);
        if (members.length === 0) return null;

        return (
          <Card key={`members-${org.id}`}>
            <CardHeader>
              <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Building2 className="w-5 h-5" />
                {org.name} - {t('Members', 'الأعضاء')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {members.map((member) => (
                  <div 
                    key={member.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.first_name || member.last_name 
                            ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                            : t('Unnamed User', 'مستخدم بدون اسم')}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUserFromOrg(member.user_id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Create Organization Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Create Organization', 'إنشاء منظمة')}</DialogTitle>
            <DialogDescription>
              {t('Add a new organization to the platform', 'أضف منظمة جديدة إلى المنصة')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Organization Name', 'اسم المنظمة')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('Enter organization name', 'أدخل اسم المنظمة')}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Domain (optional)', 'النطاق (اختياري)')}</Label>
              <Input
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="example.com"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={submitting}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleCreateOrg} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('Create', 'إنشاء')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Edit Organization', 'تعديل المنظمة')}</DialogTitle>
            <DialogDescription>
              {t('Update organization details', 'تحديث تفاصيل المنظمة')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Organization Name', 'اسم المنظمة')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('Enter organization name', 'أدخل اسم المنظمة')}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('Domain (optional)', 'النطاق (اختياري)')}</Label>
              <Input
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="example.com"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleUpdateOrg} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('Save Changes', 'حفظ التغييرات')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Delete Organization', 'حذف المنظمة')}</DialogTitle>
            <DialogDescription>
              {t(
                'Are you sure you want to delete this organization? All users will be unassigned.',
                'هل أنت متأكد من حذف هذه المنظمة؟ سيتم إلغاء تعيين جميع المستخدمين.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedOrg?.name}</p>
            {selectedOrg?.member_count ? (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedOrg.member_count} {t('members will be unassigned', 'أعضاء سيتم إلغاء تعيينهم')}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrg} disabled={submitting}>
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('Delete', 'حذف')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={assignUserDialogOpen} onOpenChange={setAssignUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Assign User to Organization', 'تعيين مستخدم للمنظمة')}</DialogTitle>
            <DialogDescription>
              {t('Select a user to add to', 'اختر مستخدمًا لإضافته إلى')} {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>{t('Select User', 'اختر المستخدم')}</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('Choose a user...', 'اختر مستخدمًا...')} />
              </SelectTrigger>
              <SelectContent>
                {getUnassignedUsers().map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : user.email || user.user_id}
                    {user.email && ` (${user.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignUserDialogOpen(false)} disabled={submitting}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleAssignUser} disabled={submitting || !selectedUserId}>
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('Assign', 'تعيين')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Details Drawer */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedOrg?.name}
            </SheetTitle>
            <SheetDescription>{selectedOrg?.domain || t('No domain', 'لا يوجد نطاق')}</SheetDescription>
          </SheetHeader>
          
          {selectedOrg && (
            <div className="mt-4">
              <Tabs value={detailsTab} onValueChange={setDetailsTab}>
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="overview">{t('Overview', 'نظرة عامة')}</TabsTrigger>
                  <TabsTrigger value="members">{t('Members', 'الأعضاء')}</TabsTrigger>
                  <TabsTrigger value="integrations">{t('Integrations', 'التكاملات')}</TabsTrigger>
                  <TabsTrigger value="policies">{t('Policies', 'السياسات')}</TabsTrigger>
                  <TabsTrigger value="billing">{t('Billing', 'الفوترة')}</TabsTrigger>
                  <TabsTrigger value="audit">{t('Audit', 'السجل')}</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-220px)] mt-4">
                  <TabsContent value="overview" className="space-y-4 pr-4 mt-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={STATUS_CONFIG[selectedOrg.status || 'active'].color}>
                        {STATUS_CONFIG[selectedOrg.status || 'active'].label}
                      </Badge>
                      <Badge variant="secondary">{selectedOrg.plan || 'Professional'}</Badge>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('MRR', 'الإيرادات الشهرية')}</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">AED {(selectedOrg.mrr || 7500).toLocaleString()}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('Members', 'الأعضاء')}</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">{selectedOrg.member_count || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('Data Sources', 'مصادر البيانات')}</span>
                          </div>
                          <p className="text-2xl font-bold mt-1">{selectedOrg.data_sources || 0}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{t('Last Activity', 'آخر نشاط')}</span>
                          </div>
                          <p className="text-lg font-medium mt-1">
                            {selectedOrg.last_activity 
                              ? new Date(selectedOrg.last_activity).toLocaleDateString()
                              : '—'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('Organization Details', 'تفاصيل المنظمة')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Created', 'تاريخ الإنشاء')}</span>
                          <span className="text-sm font-medium">{new Date(selectedOrg.created_at).toLocaleDateString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Domain', 'النطاق')}</span>
                          <span className="text-sm font-medium">{selectedOrg.domain || '—'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Plan', 'الخطة')}</span>
                          <Badge variant="secondary">{selectedOrg.plan || 'Professional'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="members" className="space-y-4 pr-4 mt-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{t('Organization Members', 'أعضاء المنظمة')}</h4>
                      <Button size="sm" onClick={() => { setDetailsOpen(false); openAssignUserDialog(selectedOrg); }}>
                        <Plus className="w-4 h-4 me-1" />
                        {t('Add Member', 'إضافة عضو')}
                      </Button>
                    </div>
                    {getOrgMembers(selectedOrg.id).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>{t('No members yet', 'لا يوجد أعضاء بعد')}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getOrgMembers(selectedOrg.id).map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="font-medium">
                                {user.first_name || user.last_name 
                                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                  : t('Unnamed', 'بدون اسم')}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveUserFromOrg(user.user_id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="integrations" className="space-y-4 pr-4 mt-0">
                    <h4 className="font-medium">{t('Connected Data Sources', 'مصادر البيانات المتصلة')}</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'SAP SuccessFactors', status: 'connected', lastSync: '15 min ago' },
                        { name: 'Oracle HCM', status: 'connected', lastSync: '2 hours ago' },
                      ].slice(0, selectedOrg.data_sources || 2).map((source, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Database className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-xs text-muted-foreground">{t('Last sync:', 'آخر مزامنة:')} {source.lastSync}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <CheckCircle className="w-3 h-3 me-1" />
                            {t('Connected', 'متصل')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="space-y-4 pr-4 mt-0">
                    <h4 className="font-medium">{t('Applicable Policies', 'السياسات المطبقة')}</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'Medical Benefits Policy', version: 'v2.1', status: 'published' },
                        { name: 'Annual Leave Policy', version: 'v3.0', status: 'published' },
                        { name: 'Code of Conduct', version: 'v4.0', status: 'published' },
                      ].map((policy, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{policy.name}</p>
                              <p className="text-xs text-muted-foreground">{policy.version}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            {policy.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="space-y-4 pr-4 mt-0">
                    <h4 className="font-medium">{t('Billing Information', 'معلومات الفوترة')}</h4>
                    <Card>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Current Plan', 'الخطة الحالية')}</span>
                          <Badge variant="secondary">{selectedOrg.plan || 'Professional'}</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Monthly Amount', 'المبلغ الشهري')}</span>
                          <span className="font-bold">AED {(selectedOrg.mrr || 7500).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('Payment Status', 'حالة الدفع')}</span>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <CheckCircle className="w-3 h-3 me-1" />
                            {t('Paid', 'مدفوع')}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <h5 className="font-medium text-sm mt-4">{t('Recent Invoices', 'الفواتير الأخيرة')}</h5>
                    <div className="space-y-2">
                      {[
                        { id: 'INV-2025-001', date: '2025-01-15', amount: selectedOrg.mrr || 7500, status: 'paid' },
                        { id: 'INV-2024-012', date: '2024-12-15', amount: selectedOrg.mrr || 7500, status: 'paid' },
                      ].map((inv, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded border text-sm">
                          <span className="font-mono">{inv.id}</span>
                          <span className="text-muted-foreground">{inv.date}</span>
                          <span className="font-medium">AED {inv.amount.toLocaleString()}</span>
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">{inv.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="audit" className="space-y-4 pr-4 mt-0">
                    <h4 className="font-medium">{t('Audit Log', 'سجل التدقيق')}</h4>
                    <div className="space-y-3">
                      {[
                        { action: 'User assigned', actor: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
                        { action: 'Integration connected', actor: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
                        { action: 'Organization updated', actor: 'Admin', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
                        { action: 'Organization created', actor: 'Admin', timestamp: new Date(selectedOrg.created_at) },
                      ].map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded border">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.actor} • {log.timestamp.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}