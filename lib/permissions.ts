import { Prisma } from "@prisma/client"

export interface PermissionCheckOptions {
  planId: string
  userId: string
  requiredPermissions: Prisma.Permission[]
}

export async function checkPlanPermissions({
  planId,
  userId,
  requiredPermissions,
}: PermissionCheckOptions) {
  const hasPermission = requiredPermissions.every((permission) => {
    return checkPermission(planId, userId, permission)
  })

  return hasPermission
}

export function checkPermission(
  planId: string,
  userId: string,
  permission: Prisma.Permission
): boolean {
  // Get the user's role and permissions for the plan
  const share = prisma.planShare.findFirst({
    where: {
      planId,
      userId,
    },
    include: {
      permissions: true,
    },
  })

  if (!share) {
    return false
  }

  // Check if the permission is explicitly granted
  const hasExplicitPermission = share.permissions.some(
    (p) => p.permission === permission
  )

  if (hasExplicitPermission) {
    return true
  }

  // Check role-based permissions
  switch (share.role) {
    case 'ADMIN':
      return true
    case 'EDITOR':
      return [
        'VIEW',
        'EDIT',
        'COMMENT',
      ].includes(permission)
    case 'VIEWER':
      return [
        'VIEW',
        'COMMENT',
      ].includes(permission)
    default:
      return false
  }
}
