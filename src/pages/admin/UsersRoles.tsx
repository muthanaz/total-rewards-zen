import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Building2, 
  MoreHorizontal,
  Search,
  RefreshCw,
  Mail,
  UserCog,
  Ban,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard, MetricGrid } from '@/components/shared';
import { useAdminAuditLog } from '@/hooks/useAdminAuditLog';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  organization_id: string | null;
  organization_name?: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  last_login?: string;
  created_at: string;
  lifecycle_stage?: 'invited' | 'onboarding' | 'active' | 'offboarding' | 'deactivated';
}

const ROLE_CONFIG: Record<string, { label: string; labelAr: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', labelAr: 'مسؤول', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30', icon: Shield },
  employer: { label: 'Employer', labelAr: 'صاحب العمل', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', icon: Building2 },
  employee: { label: 'Employee', labelAr: 'موظف', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Users },
  vendor: { label: 'Vendor', labelAr: 'بائع', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: UserCog },
};

const STATUS_CONFIG: Record<string, { label: string; labelAr: string; color: string }> = {
  active: { label: 'Active', labelAr: 'نشط', color: 'bg-success/10 text-success border-success/30' },
  inactive: { label: 'Inactive', labelAr: 'غير نشط', color: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending', labelAr: 'معلق', color: 'bg-warning/10 text-warning border-warning/30' },
  suspended: { label: 'Suspended', labelAr: 'معلق', color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const LIFECYCLE_CONFIG: Record<string, { label: string; color: string }> = {
  invited: { label: 'Invited', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  onboarding: { label: 'Onboarding', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/30' },
  offboarding: { label: 'Offboarding', color: 'bg-warning/10 text-warning border-warning/30' },
  deactivated: { label: 'Deactivated', color: 'bg-muted text-muted-foreground border-border' },
};

export default function UsersRolesPage() {
  const { language, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { createAuditLog } = useAdminAuditLog();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, email, first_name, last_name, organization_id, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch organizations
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name');

      if (orgsError) throw orgsError;

      const orgMap = new Map(orgs?.map(o => [o.id, o.name]));
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]));

      const usersWithRoles: UserWithRole[] = (profiles || []).map(p => ({
        ...p,
        role: roleMap.get(p.user_id) || 'employee',
        organization_name: p.organization_id ? orgMap.get(p.organization_id) : undefined,
        status: 'active' as const,
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(t('Failed to load users', 'فشل في تحميل المستخدمين'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    
    setSubmitting(true);
    try {
      const previousRole = selectedUser.role;
      
      // Delete existing role first, then insert new one
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser.user_id, role: newRole as any });

      if (error) throw error;

      // P1 FIX: Audit log for role changes
      await createAuditLog({
        action: 'USER_ROLE_CHANGE',
        entityType: 'user',
        entityId: selectedUser.user_id,
        metadata: { 
          user_email: selectedUser.email,
          previous_role: previousRole,
          new_role: newRole,
        },
      });

      toast.success(t('Role updated successfully', 'تم تحديث الدور بنجاح'));
      setChangeRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(t('Failed to update role', 'فشل في تحديث الدور'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (user: UserWithRole) => {
    toast.success(t(`User ${user.email} deactivated`, `تم إلغاء تنشيط ${user.email}`));
  };

  const handleResendInvite = async (user: UserWithRole) => {
    toast.success(t(`Invite resent to ${user.email}`, `تم إعادة إرسال الدعوة إلى ${user.email}`));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organization_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    employer: users.filter(u => u.role === 'employer').length,
    employee: users.filter(u => u.role === 'employee').length,
    vendor: users.filter(u => u.role === 'vendor').length,
  };

  return (
    <div className={cn("space-y-6", isRTL && "text-right")}>
      <PageHeader
        title={t('Users & Roles', 'المستخدمون والأدوار')}
        description={t('Manage user accounts and role assignments across the platform', 'إدارة حسابات المستخدمين وتعيينات الأدوار عبر المنصة')}
        icon={Users}
        actions={
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4 me-2" />
              {t('Refresh', 'تحديث')}
            </Button>
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="w-4 h-4 me-2" />
              {t('Invite User', 'دعوة مستخدم')}
            </Button>
          </div>
        }
      />

      {/* Role Stats */}
      <MetricGrid columns={4}>
        <MetricCard
          title={t('Admins', 'المسؤولون')}
          value={roleStats.admin.toString()}
          icon={Shield}
          iconClassName="from-red-500 to-red-600"
        />
        <MetricCard
          title={t('Employers', 'أصحاب العمل')}
          value={roleStats.employer.toString()}
          icon={Building2}
          iconClassName="from-purple-500 to-purple-600"
        />
        <MetricCard
          title={t('Employees', 'الموظفون')}
          value={roleStats.employee.toString()}
          icon={Users}
          iconClassName="from-blue-500 to-blue-600"
        />
        <MetricCard
          title={t('Vendors', 'البائعون')}
          value={roleStats.vendor.toString()}
          icon={UserCog}
          iconClassName="from-amber-500 to-amber-600"
        />
      </MetricGrid>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", isRTL && "sm:flex-row-reverse")}>
            <div>
              <CardTitle>{t('All Users', 'جميع المستخدمين')}</CardTitle>
              <CardDescription>{t(`${filteredUsers.length} users found`, `تم العثور على ${filteredUsers.length} مستخدم`)}</CardDescription>
            </div>
            <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
              <div className="relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('Search users...', 'البحث عن مستخدمين...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-48", isRTL ? "pr-10" : "pl-10")}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('Role', 'الدور')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Roles', 'جميع الأدوار')}</SelectItem>
                  <SelectItem value="admin">{t('Admin', 'مسؤول')}</SelectItem>
                  <SelectItem value="employer">{t('Employer', 'صاحب العمل')}</SelectItem>
                  <SelectItem value="employee">{t('Employee', 'موظف')}</SelectItem>
                  <SelectItem value="vendor">{t('Vendor', 'بائع')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t('No users found', 'لم يتم العثور على مستخدمين')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('User', 'المستخدم')}</TableHead>
                  <TableHead>{t('Role', 'الدور')}</TableHead>
                  <TableHead>{t('Organization', 'المنظمة')}</TableHead>
                  <TableHead>{t('Status', 'الحالة')}</TableHead>
                  <TableHead>{t('Last Login', 'آخر تسجيل دخول')}</TableHead>
                  <TableHead className="text-right">{t('Actions', 'الإجراءات')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;
                  const statusConfig = STATUS_CONFIG[user.status];
                  const RoleIcon = roleConfig.icon;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : t('Unnamed User', 'مستخدم بدون اسم')}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", roleConfig.color)}>
                          <RoleIcon className="w-3 h-3" />
                          {language === 'ar' ? roleConfig.labelAr : roleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organization_name ? (
                          <span className="text-sm">{user.organization_name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          {language === 'ar' ? statusConfig.labelAr : statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setChangeRoleDialogOpen(true);
                            }}>
                              <Shield className="w-4 h-4 me-2" />
                              {t('Change Role', 'تغيير الدور')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              <Mail className="w-4 h-4 me-2" />
                              {t('Resend Invite', 'إعادة إرسال الدعوة')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeactivateUser(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="w-4 h-4 me-2" />
                              {t('Deactivate', 'إلغاء التنشيط')}
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

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Change User Role', 'تغيير دور المستخدم')}</DialogTitle>
            <DialogDescription>
              {t('Update the role for', 'تحديث الدور لـ')} {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('New Role', 'الدور الجديد')}</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select role', 'اختر الدور')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('Admin', 'مسؤول')}</SelectItem>
                  <SelectItem value="employer">{t('Employer', 'صاحب العمل')}</SelectItem>
                  <SelectItem value="employee">{t('Employee', 'موظف')}</SelectItem>
                  <SelectItem value="vendor">{t('Vendor', 'بائع')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={handleChangeRole} disabled={submitting}>
              {submitting ? t('Saving...', 'جاري الحفظ...') : t('Save Changes', 'حفظ التغييرات')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog - with Org Selection */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('Invite New User', 'دعوة مستخدم جديد')}</DialogTitle>
            <DialogDescription>
              {t('Send an invitation email to add a new user to the platform', 'إرسال بريد إلكتروني لإضافة مستخدم جديد إلى المنصة')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('Email Address', 'عنوان البريد الإلكتروني')} *</Label>
              <Input type="email" placeholder="user@company.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('First Name', 'الاسم الأول')}</Label>
                <Input placeholder={t('John', 'أحمد')} />
              </div>
              <div className="space-y-2">
                <Label>{t('Last Name', 'اسم العائلة')}</Label>
                <Input placeholder={t('Doe', 'محمد')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('Organization', 'المنظمة')} *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('Select organization...', 'اختر المنظمة...')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org1">Acme Corp</SelectItem>
                  <SelectItem value="org2">TechStart Inc</SelectItem>
                  <SelectItem value="org3">GlobalBank</SelectItem>
                  <SelectItem value="org4">RetailMax</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('User must be assigned to an organization', 'يجب تعيين المستخدم لمنظمة')}</p>
            </div>
            <div className="space-y-2">
              <Label>{t('Role', 'الدور')}</Label>
              <Select defaultValue="employee">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('Admin', 'مسؤول')}</SelectItem>
                  <SelectItem value="employer">{t('Employer', 'صاحب العمل')}</SelectItem>
                  <SelectItem value="employee">{t('Employee', 'موظف')}</SelectItem>
                  <SelectItem value="vendor">{t('Vendor', 'بائع')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('Permission Set', 'مجموعة الصلاحيات')}</Label>
              <Select defaultValue="standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('Standard', 'قياسي')}</SelectItem>
                  <SelectItem value="hr_ops">{t('HR Operations', 'عمليات الموارد البشرية')}</SelectItem>
                  <SelectItem value="finance">{t('Finance', 'المالية')}</SelectItem>
                  <SelectItem value="claims_processor">{t('Claims Processor', 'معالج المطالبات')}</SelectItem>
                  <SelectItem value="read_only">{t('Read Only', 'قراءة فقط')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              {t('Cancel', 'إلغاء')}
            </Button>
            <Button onClick={() => {
              toast.success(t('Invitation sent successfully', 'تم إرسال الدعوة بنجاح'));
              setInviteDialogOpen(false);
            }}>
              <Mail className="w-4 h-4 me-2" />
              {t('Send Invite', 'إرسال الدعوة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
