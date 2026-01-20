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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard, MetricGrid } from '@/components/shared';

interface Organization {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
}

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  
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

      const orgsWithCounts = orgs?.map(org => ({
        ...org,
        member_count: memberCounts[org.id] || 0,
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
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
        });

      if (error) throw error;

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
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedOrg.id);

      if (error) throw error;

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
                  <TableHead>{t('Domain', 'النطاق')}</TableHead>
                  <TableHead>{t('Members', 'الأعضاء')}</TableHead>
                  <TableHead>{t('Created', 'تاريخ الإنشاء')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {org.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {org.domain ? (
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" />
                          {org.domain}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="w-3 h-3" />
                        {org.member_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(org.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/organizations/${org.id}/settings`)}>
                            <Settings className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('Settings', 'الإعدادات')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignUserDialog(org)}>
                            <Users className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('Assign User', 'تعيين مستخدم')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(org)}>
                            <Edit2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('Edit', 'تعديل')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(org)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('Delete', 'حذف')}
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
    </div>
  );
}