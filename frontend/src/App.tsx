import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import useStart from "./hooks/useStart";
import "./App.css";
import { AppRoutes } from "./routes/AppRoutes";
import Footer from "./components/Footer";
import { Loader2 } from "lucide-react";

function App() {
  const { isInitializing } = useStart();
  console.log('Admin =>', isInitializing);
  if (isInitializing) {
    return (
      <ThemeProvider defaultTheme="dark">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="w-20 h-20 animate-spin text-blue-400 mb-1" />
          <span className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading...
          </span>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <Navbar />
        <main className="min-h-[45vh]">
          <AppRoutes />
        </main>
        <Toaster position="top-right" />
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
