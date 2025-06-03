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