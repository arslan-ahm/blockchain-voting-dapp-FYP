// src/pages/App.tsx
import type { JSX } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/home/Home";
import { Profile } from "./pages/profile/Profile";
import { CampaignList } from "./pages/campaignList/CampaignList";
import { AdminDashboard } from "./pages/adminDashboard/AdminDashboard";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { Role } from "./types";
import { useAppSelector } from "./hooks/useRedux";
import './App.css';
import useStart from "./hooks/useStart";

const PrivateRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles: Role[] }) => {
  const user = useAppSelector((state) => state.user);
  return user.account && allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
};

function App() {
  const { user } = useStart();

  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={[Role.Unverified, Role.Voter, Role.Candidate, Role.PendingVerification]}>
                {user.role === Role.Admin ? <Navigate to="/admin" replace /> : <Profile />}
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns"
            element={
              <PrivateRoute allowedRoles={[Role.Voter, Role.Candidate, Role.Admin]}>
                <CampaignList />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={[Role.Admin]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;