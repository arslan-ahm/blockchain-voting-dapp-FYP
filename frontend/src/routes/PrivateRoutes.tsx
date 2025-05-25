// src/components/PrivateRoute.tsx
import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import { checkRouteAccess, type RouteConfig } from "../config/routes";

interface PrivateRouteProps {
  children: JSX.Element;
  routeConfig: RouteConfig;
}

export const PrivateRoute = ({ children, routeConfig }: PrivateRouteProps) => {
  const user = useAppSelector((state) => state.user);
  
  // Check route access based on current user state
  const { canAccess, redirectTo } = checkRouteAccess(
    user.account ?? "", 
    user.role, 
    routeConfig
  );

  // If user cannot access the route, redirect
  if (!canAccess && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user can access the route, render the component
  if (canAccess) {
    return children;
  }

  // Default fallback - redirect to home
  return <Navigate to="/" replace />;
};