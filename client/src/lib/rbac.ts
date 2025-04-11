// Role-Based Access Control System
import React from "react";

export type Permission =
  // Dependency permissions
  | "dependencies:view"
  | "dependencies:create"
  | "dependencies:edit"
  | "dependencies:delete"
  // Analytics permissions
  | "analytics:view"
  | "analytics:export"
  // Optimization permissions
  | "optimization:view"
  | "optimization:run"
  | "optimization:apply"
  // Integration permissions
  | "integrations:view"
  | "integrations:configure"
  | "integrations:sync"
  // Settings permissions
  | "settings:view"
  | "settings:edit"
  // PINN model permissions
  | "pinn:view"
  | "pinn:create"
  | "pinn:train"
  | "pinn:delete"
  // ML model permissions
  | "ml:view"
  | "ml:create"
  | "ml:train"
  | "ml:delete"
  // User management permissions
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  // Role management permissions
  | "roles:view"
  | "roles:create"
  | "roles:edit"
  | "roles:delete"
  // Audit log permissions
  | "audit:view";

export type Role =
  | "admin"
  | "manager"
  | "analyst"
  | "user"
  | "readonly"
  | "api"
  | "custom";

// Define permissions for each role
export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "dependencies:view",
    "dependencies:create",
    "dependencies:edit",
    "dependencies:delete",
    "analytics:view",
    "analytics:export",
    "optimization:view",
    "optimization:run",
    "optimization:apply",
    "integrations:view",
    "integrations:configure",
    "integrations:sync",
    "settings:view",
    "settings:edit",
    "pinn:view",
    "pinn:create",
    "pinn:train",
    "pinn:delete",
    "ml:view",
    "ml:create",
    "ml:train",
    "ml:delete",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "roles:view",
    "roles:create",
    "roles:edit",
    "roles:delete",
    "audit:view",
  ],
  manager: [
    "dependencies:view",
    "dependencies:create",
    "dependencies:edit",
    "dependencies:delete",
    "analytics:view",
    "analytics:export",
    "optimization:view",
    "optimization:run",
    "optimization:apply",
    "integrations:view",
    "settings:view",
    "pinn:view",
    "pinn:create",
    "pinn:train",
    "ml:view",
    "ml:create",
    "ml:train",
    "users:view",
    "audit:view",
  ],
  analyst: [
    "dependencies:view",
    "dependencies:create",
    "dependencies:edit",
    "analytics:view",
    "analytics:export",
    "optimization:view",
    "optimization:run",
    "pinn:view",
    "pinn:create",
    "pinn:train",
    "ml:view",
    "ml:create",
    "ml:train",
  ],
  user: [
    "dependencies:view",
    "dependencies:create",
    "dependencies:edit",
    "analytics:view",
    "optimization:view",
    "pinn:view",
    "ml:view",
  ],
  readonly: [
    "dependencies:view",
    "analytics:view",
    "optimization:view",
    "pinn:view",
    "ml:view",
  ],
  api: [
    "dependencies:view",
    "dependencies:create",
    "dependencies:edit",
    "dependencies:delete",
    "analytics:view",
    "optimization:view",
    "optimization:run",
  ],
  custom: [], // Custom roles would have permissions defined per user
};

export interface UserPermissions {
  role: Role;
  customPermissions?: Permission[]; // Only used for custom role
}

export function hasPermission(
  userPermissions: UserPermissions,
  requiredPermission: Permission
): boolean {
  // If user has a custom role, check their custom permissions
  if (userPermissions.role === "custom" && userPermissions.customPermissions) {
    return userPermissions.customPermissions.includes(requiredPermission);
  }

  // Otherwise, check the standard role permissions
  return rolePermissions[userPermissions.role].includes(requiredPermission);
}

// Helper function to check multiple permissions (AND logic - all required)
export function hasAllPermissions(
  userPermissions: UserPermissions,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission)
  );
}

// Helper function to check multiple permissions (OR logic - at least one required)
export function hasAnyPermission(
  userPermissions: UserPermissions,
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission)
  );
}

// Create protected component wrapper
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission | Permission[],
  FallbackComponent?: React.ComponentType<P>
) {
  return (props: P & { userPermissions: UserPermissions }) => {
    const { userPermissions, ...rest } = props;
    
    const hasAccess = Array.isArray(requiredPermission)
      ? hasAllPermissions(userPermissions, requiredPermission)
      : hasPermission(userPermissions, requiredPermission);

    if (hasAccess) {
      return React.createElement(Component, rest as P);
    }

    if (FallbackComponent) {
      return React.createElement(FallbackComponent, rest as P);
    }

    return React.createElement(
      'div',
      { className: "p-4 bg-red-50 border border-red-200 rounded-md" },
      [
        React.createElement(
          'div',
          { className: "flex items-center", key: "header" },
          [
            React.createElement('i', { className: "material-icons text-red-500 mr-2", key: "icon" }, "error"),
            React.createElement('h3', { className: "text-red-800 font-medium", key: "title" }, "Access Denied")
          ]
        ),
        React.createElement(
          'p',
          { className: "text-red-600 text-sm mt-1", key: "message" },
          "You don't have permission to access this feature"
        )
      ]
    );
  };
}

// Create protected route wrapper (for use with wouter)
export function createProtectedRoute(requiredPermission: Permission | Permission[]) {
  return ({ component: Component, ...rest }: any) => {
    // Assuming useAuth hook gives us the user and their permissions
    const userPermissions = useAuth().userPermissions;
    
    const hasAccess = Array.isArray(requiredPermission)
      ? hasAllPermissions(userPermissions, requiredPermission)
      : hasPermission(userPermissions, requiredPermission);

    if (hasAccess) {
      return React.createElement(Component, rest);
    }

    return React.createElement(Redirect, { to: "/unauthorized" });
  };
}

// Mock useAuth for type checking (would be replaced by actual auth hook)
function useAuth() {
  return {
    userPermissions: { role: "admin" } as UserPermissions,
  };
}

// Mock Redirect for type checking (would be provided by wouter)
function Redirect({ to }: { to: string }) {
  return null;
}