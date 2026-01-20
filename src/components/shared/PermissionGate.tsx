import { ReactNode } from 'react';
import { useEmployerPermissions, EmployerPermission } from '@/hooks/useEmployerPermissions';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGateProps {
  /** Single permission or array of permissions to check */
  permission: EmployerPermission | EmployerPermission[];
  /** If true, requires ALL permissions. If false (default), requires ANY permission */
  requireAll?: boolean;
  /** Content to render if permission is granted */
  children: ReactNode;
  /** Optional fallback to render if permission is denied (defaults to null/hidden) */
  fallback?: ReactNode;
  /** Show loading skeleton while checking permissions */
  showLoading?: boolean;
}

/**
 * PermissionGate component for conditionally rendering UI based on employer permissions.
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="can_manage_policies">
 *   <Button>Edit Policy</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permission={['can_manage_policies', 'can_process_claims']}>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate permission={['can_manage_policies', 'can_manage_integrations']} requireAll>
 *   <AdvancedSettings />
 * </PermissionGate>
 * 
 * @example
 * // With fallback content
 * <PermissionGate 
 *   permission="can_process_claims" 
 *   fallback={<p className="text-muted-foreground">You don't have permission to process claims.</p>}
 * >
 *   <ClaimsQueue />
 * </PermissionGate>
 */
export function PermissionGate({ 
  permission, 
  requireAll = false,
  children, 
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = useEmployerPermissions();

  if (loading && showLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (loading) {
    return null;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook-based permission check for programmatic use
 */
export function usePermissionCheck(permission: EmployerPermission | EmployerPermission[], requireAll = false): boolean {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = useEmployerPermissions();

  if (loading) return false;

  const permissions = Array.isArray(permission) ? permission : [permission];
  return requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
}
