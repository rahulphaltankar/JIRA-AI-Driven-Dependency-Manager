// Define interface for navigation items
export interface NavItem {
  path: string;
  icon: string;
  label: string;
}

// Main navigation items - matches the material icons with appropriate descriptions
export const mainNavItems: NavItem[] = [
  { path: "/", icon: "dashboard", label: "Dashboard" },
  { path: "/dependencies", icon: "device_hub", label: "Dependencies" },
  { path: "/analysis", icon: "analytics", label: "Analytics" },
  { path: "/optimization", icon: "auto_graph", label: "Optimization" },
  { path: "/user-guide", icon: "help_outline", label: "User Guide" },
];

// Configuration navigation items
export const configNavItems: NavItem[] = [
  { path: "/settings", icon: "settings", label: "Settings" },
  { path: "/integrations", icon: "integration_instructions", label: "Integrations" },
  { path: "/ml-config", icon: "model_training", label: "ML Configuration" },
];