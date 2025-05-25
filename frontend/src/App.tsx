import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import useStart from "./hooks/useStart";
import './App.css';
import { AppRoutes } from "./routes/AppRoutes";

function App() {
  const { isInitializing } = useStart();

  if (isInitializing) {
    return (
      <ThemeProvider defaultTheme="dark">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Navbar />
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;