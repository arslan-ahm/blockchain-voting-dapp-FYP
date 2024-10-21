import type { JSX } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/home/Home";
import { Profile } from "./pages/profile/Profile";
import { CampaignList } from "./pages/campaignList/CampaignList";
import { AdminDashboard } from "./pages/adminDashboard/AdminDashboard";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { Role } from "./types";
import { useAppSelector } from "./hooks/useRedux";
import "./App.css";

const PrivateRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles: Role[] }) => {
  const user = useAppSelector((state) => state.user);
  return user.account && allowedRoles.includes(user.role as Role) ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={[Role.Unverified, Role.PendingVerification, Role.Voter, Role.Candidate]}>
                  <Profile />
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;