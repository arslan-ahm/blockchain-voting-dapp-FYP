import { Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoutes";
import { routeConfigs } from "./routes";

export const AppRoutes = () => {
  return (
    <Routes>
      {routeConfigs.map((routeConfig) => {
        const { path, element, allowedRoles } = routeConfig;        
        
        if (allowedRoles) {
          return (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute routeConfig={routeConfig}>
                  {element}
                </PrivateRoute>
              }
            />
          );
        }
        
        return <Route key={path} path={path} element={element} />;
      })}
    </Routes>
  );
};