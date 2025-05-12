import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

     type Theme = "dark" | "light" | "system";
     type ThemeContextType = {
       theme: Theme;
       setTheme: (theme: Theme) => void;
     };

     const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

     export function ThemeProvider({ children, defaultTheme = "dark" }: { children: ReactNode; defaultTheme?: Theme }) {
       const [theme, setTheme] = useState<Theme>(defaultTheme);

       useEffect(() => {
         const root = window.document.documentElement;
         root.classList.remove("light", "dark");

         if (theme === "system") {
           const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
           root.classList.add(systemTheme);
         } else {
           root.classList.add(theme);
         }
       }, [theme]);

       return (
         <ThemeContext.Provider value={{ theme, setTheme }}>
           {children}
         </ThemeContext.Provider>
       );
     }

    // Removed useTheme function. It is now in a separate file.