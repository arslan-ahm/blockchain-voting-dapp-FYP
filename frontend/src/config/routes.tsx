// src/config/routes.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { Home } from "../pages/home/Home";
import { Profile } from "../pages/profile/Profile";
import { CampaignList } from "../pages/campaignList/CampaignList";
import { AdminDashboard } from "../pages/adminDashboard/AdminDashboard";
import { Role } from "../types";

export interface RouteConfig {
  path: string;
  element: JSX.Element;
  allowedRoles?: Role[];
  requiresAuth?: boolean;
  redirectTo?: string;
}

// Define all routes configuration
export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    element: <Home />,
    // Public route - no authentication required
  },
  {
    path: "/profile",
    element: <Profile />,
    allowedRoles: [Role.Unverified, Role.Voter, Role.Candidate, Role.PendingVerification],
    requiresAuth: true,
  },
  {
    path: "/campaigns",
    element: <CampaignList />,
    allowedRoles: [Role.Voter, Role.Candidate, Role.Admin],
    requiresAuth: true,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
    allowedRoles: [Role.Admin],
    requiresAuth: true,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

/**
 * Check if user can access route based on authentication and role
 * @param userAccount - User's account address (empty if not authenticated)
 * @param userRole - User's role
 * @param route - Route configuration
 * @returns Object with access permission and redirect path if needed
 */
export const checkRouteAccess = (
  userAccount: string, 
  userRole: Role, 
  route: RouteConfig
): { canAccess: boolean; redirectTo?: string } => {
  // Public routes (no auth required)
  if (!route.requiresAuth) {
    return { canAccess: true };
  }

  // If route requires auth but user is not authenticated
  if (route.requiresAuth && !userAccount) {
    return { canAccess: false, redirectTo: "/" };
  }

  // If no role restrictions, allow authenticated users
  if (!route.allowedRoles) {
    return { canAccess: true };
  }

  // Check role-based access
  const hasRoleAccess = route.allowedRoles.includes(userRole);
  
  if (!hasRoleAccess) {
    // Special case: Admin trying to access profile should go to admin dashboard
    if (route.path === "/profile" && userRole === Role.Admin) {
      return { canAccess: false, redirectTo: "/admin" };
    }
    
    // Other unauthorized access redirects to home
    return { canAccess: false, redirectTo: "/" };
  }

  return { canAccess: true };
};

/**
 * Get the appropriate redirect path for a user role
 * @param userRole - User's role
 * @returns Default dashboard/home path for the role
 */
export const getDefaultPathForRole = (userRole: Role): string => {
  switch (userRole) {
    case Role.Admin:
      return "/admin";
    case Role.Voter:
    case Role.Candidate:
      return "/campaigns";
    case Role.Unverified:
    case Role.PendingVerification:
      return "/profile";
    default:
      return "/";
  }
};