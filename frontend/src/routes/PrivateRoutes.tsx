import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import { checkRouteAccess, type RouteConfig } from "./routes";

export const PrivateRoute = ({
  children,
  routeConfig,
}: {
  children: JSX.Element;
  routeConfig: RouteConfig;
}) => {
  const user = useAppSelector((state) => state.user);

  const { canAccess, redirectTo } = checkRouteAccess(
    user.account ?? "",
    user.role,
    routeConfig
  );

  if (!canAccess && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (canAccess) {
    return children;
  }

  return <Navigate to="/" replace />;
};
