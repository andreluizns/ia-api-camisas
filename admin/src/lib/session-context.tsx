"use client"

import { createContext, useContext } from "react"
import type { AppRole, UserPermissions } from "./permissions"
import { DEFAULT_PERMISSIONS } from "./permissions"

type SessionContextValue = {
  role: AppRole
  permissions: UserPermissions
  userId: string
}

const SessionContext = createContext<SessionContextValue>({
  role: "user",
  permissions: DEFAULT_PERMISSIONS,
  userId: "",
})

export function SessionProvider({
  children,
  role,
  permissions,
  userId,
}: SessionContextValue & { children: React.ReactNode }) {
  return (
    <SessionContext.Provider value={{ role, permissions, userId }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionRole(): SessionContextValue {
  return useContext(SessionContext)
}
