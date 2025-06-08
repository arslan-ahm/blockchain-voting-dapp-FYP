import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { Home } from "../pages/home/Home";
import { Profile } from "../pages/profile/Profile";
import { CampaignList } from "../pages/campaignList/CampaignList";
import AdminDashboard from "../pages/adminDashboard/AdminDashboard";
import { Role } from "../types";

export interface RouteConfig {
  path: string;
  element: JSX.Element;
  allowedRoles?: Role[];
  requiresAuth?: boolean;
  redirectTo?: string;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: "/",
    element: <Home />,
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
    allowedRoles: [Role.Voter, Role.Candidate, Role.Admin, Role.Unverified, Role.PendingVerification],
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

export const checkRouteAccess = (
  userAccount: string,
  userRole: Role,
  route: RouteConfig
): { canAccess: boolean; redirectTo?: string } => {
  // If route doesn't require authentication, allow access
  if (!route.requiresAuth) {
    return { canAccess: true };
  }

  // If route requires authentication but user is not authenticated, redirect to home
  if (route.requiresAuth && !userAccount) {
    return { canAccess: false, redirectTo: "/" };
  }

  // If route requires authentication but has no specific role restrictions,
  // deny access (this prevents unintended access when allowedRoles is undefined)
  if (route.requiresAuth && !route.allowedRoles) {
    return { canAccess: false, redirectTo: "/" };
  }

  // Check if user's role is in the allowed roles
  const hasRoleAccess = route.allowedRoles!.includes(userRole);

  if (!hasRoleAccess) {
    // Special case: Admin trying to access profile should go to admin dashboard
    if (route.path === "/profile" && userRole === Role.Admin) {
      return { canAccess: false, redirectTo: "/admin" };
    }

    // Default redirect for unauthorized access
    return { canAccess: false, redirectTo: "/" };
  }

  return { canAccess: true };
};

export const getDefaultPathForRole = (userRole: Role): string => {
  switch (userRole) {
    case Role.Admin:
      return "/admin";
    case Role.Voter:
      case Role.Candidate:
        return "/campaigns";
    case Role.PendingVerification:
      case Role.Unverified:
      return "/profile";
    default:
      return "/";
  }
};