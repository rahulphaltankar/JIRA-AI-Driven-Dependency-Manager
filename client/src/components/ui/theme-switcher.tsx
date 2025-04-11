import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = "light" | "dark" | "system";

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Once mounted, we can access window
  useEffect(() => {
    setMounted(true);
    
    // Get the initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  // Update the DOM when theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }

    // Store the preference in localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Track system preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  if (!mounted) {
    // Render a placeholder to avoid layout shift
    return (
      <Button variant="ghost" size="icon">
        <i className="material-icons">light_mode</i>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === "light" ? (
            <i className="material-icons">light_mode</i>
          ) : theme === "dark" ? (
            <i className="material-icons">dark_mode</i>
          ) : (
            <i className="material-icons">devices</i>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <i className="material-icons mr-2 text-base">light_mode</i>
          <span>Light</span>
          {theme === "light" && <i className="material-icons ml-auto">check</i>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <i className="material-icons mr-2 text-base">dark_mode</i>
          <span>Dark</span>
          {theme === "dark" && <i className="material-icons ml-auto">check</i>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <i className="material-icons mr-2 text-base">devices</i>
          <span>System</span>
          {theme === "system" && <i className="material-icons ml-auto">check</i>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}