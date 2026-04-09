// src/lib/permissions.ts

export type AppRole = "master" | "admin" | "user"

export type UserPermissions = {
  canCreateCamisa: boolean
  canEditCamisa: boolean
  canDeleteCamisa: boolean
  canManageUsers: boolean
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
  canCreateCamisa: false,
  canEditCamisa: false,
  canDeleteCamisa: false,
  canManageUsers: false,
}

/** Verifica se o papel tem acesso total (sem restrições) */
export function isFullAccess(role: AppRole): boolean {
  return role === "master" || role === "admin"
}

/** Verifica se o viewer pode ver usuários Master */
export function canSeeMasters(viewerRole: AppRole): boolean {
  return viewerRole === "master"
}

/** Verifica se o viewer pode criar/editar usuários Master */
export function canManageMasters(viewerRole: AppRole): boolean {
  return viewerRole === "master"
}

/** Verifica se o viewer pode configurar permissões de um usuário */
export function canConfigurePermissions(viewerRole: AppRole): boolean {
  return viewerRole === "master" || viewerRole === "admin"
}

/** Verifica se o viewer pode editar um target dado os papéis */
export function canEditUser(
  viewerRole: AppRole,
  targetRole: AppRole,
): boolean {
  if (viewerRole === "master") return true
  if (viewerRole === "admin") return targetRole !== "master"
  return false // user não pode editar outros usuários (a menos que canManageUsers)
}
