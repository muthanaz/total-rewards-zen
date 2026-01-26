/**
 * Roles & Access Page
 * 
 * Manage employer role assignments and permissions.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Shield, 
  Users,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useOrgRoleAssignments } from '@/hooks/useOrgRoleAssignments';
import { AssignRoleDialog } from '@/components/employer/settings/AssignRoleDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const ROLE_LABELS: Record<string, { label: string; labelAr: string; color: string }> = {
  executive: { label: 'Executive', labelAr: 'تنفيذي', color: 'bg-purple-100 text-purple-700' },
  hr_ops: { label: 'HR Ops', labelAr: 'عمليات الموارد البشرية', color: 'bg-blue-100 text-blue-700' },
  comp_ben: { label: 'Comp & Ben', labelAr: 'التعويضات والمزايا', color: 'bg-green-100 text-green-700' },
  finance: { label: 'Finance', labelAr: 'المالية', color: 'bg-amber-100 text-amber-700' },
  policy_owner: { label: 'Policy Owner', labelAr: 'مالك السياسة', color: 'bg-indigo-100 text-indigo-700' },
  it_admin: { label: 'IT Admin', labelAr: 'مسؤول تقنية المعلومات', color: 'bg-slate-100 text-slate-700' },
  viewer: { label: 'Viewer', labelAr: 'مشاهد', color: 'bg-gray-100 text-gray-700' },
};

export default function RolesAccessPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  
  const { 
    assignments, 
    isLoading, 
    assignRole,
    revokeRole,
    isAssigning,
  } = useOrgRoleAssignments();

  // Group by role
  const assignmentsByRole = assignments?.reduce((acc, a) => {
    if (!acc[a.employer_role]) {
      acc[a.employer_role] = [];
    }
    acc[a.employer_role].push(a);
    return acc;
  }, {} as Record<string, typeof assignments>) || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'الأدوار والصلاحيات' : 'Roles & Access'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إدارة تعيينات الأدوار والصلاحيات للمستخدمين'
                : 'Manage role assignments and permissions for users'
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setAssignDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'تعيين دور' : 'Assign Role'}
        </Button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(ROLE_LABELS).map(([role, config]) => {
          const count = assignmentsByRole[role]?.length || 0;
          return (
            <Card key={role} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Badge className={`${config.color} mb-2`}>
                  {isRTL ? config.labelAr : config.label}
                </Badge>
                <p className="text-2xl font-semibold">{count}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'مستخدم' : count === 1 ? 'user' : 'users'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            {isRTL ? 'تعيينات الأدوار' : 'Role Assignments'}
          </CardTitle>
          <CardDescription>
            {isRTL 
              ? 'جميع تعيينات الأدوار النشطة في المنظمة'
              : 'All active role assignments in the organization'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : assignments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{isRTL ? 'لا توجد تعيينات أدوار' : 'No role assignments'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'المستخدم' : 'User'}</TableHead>
                  <TableHead>{isRTL ? 'الدور' : 'Role'}</TableHead>
                  <TableHead>{isRTL ? 'النطاق' : 'Scope'}</TableHead>
                  <TableHead>{isRTL ? 'تاريخ التعيين' : 'Assigned'}</TableHead>
                  <TableHead>{isRTL ? 'تاريخ الانتهاء' : 'Expires'}</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {assignments?.map((assignment) => {
                  const roleConfig = ROLE_LABELS[assignment.employer_role];
                  // User info would be from a join - for now show user_id
                  const userInitials = 'U';
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-muted-foreground text-xs truncate max-w-[200px]">
                              {assignment.user_id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleConfig?.color}>
                          {isRTL ? roleConfig?.labelAr : roleConfig?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">
                          {assignment.scope_type === 'global' 
                            ? (isRTL ? 'عالمي' : 'Global')
                            : assignment.scope_type
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {assignment.expires_at 
                          ? format(new Date(assignment.expires_at), 'MMM d, yyyy')
                          : (isRTL ? 'لا ينتهي' : 'Never')
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeRole.mutate(assignment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onSubmit={(data) => {
          assignRole.mutate(data, {
            onSuccess: () => setAssignDialogOpen(false),
          });
        }}
        isLoading={isAssigning}
      />
    </div>
  );
}
