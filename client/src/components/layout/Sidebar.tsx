import { Link, useLocation } from "wouter";

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const mainNavItems: NavItem[] = [
  { path: "/", icon: "dashboard", label: "Dashboard" },
  { path: "/dependencies", icon: "network_check", label: "Dependencies" },
  { path: "/analysis", icon: "analytics", label: "Analysis" },
  { path: "/optimization", icon: "precision_manufacturing", label: "Optimization" },
];

const configNavItems: NavItem[] = [
  { path: "/settings", icon: "settings", label: "Settings" },
  { path: "/integrations", icon: "link", label: "Integrations" },
  { path: "/ml-config", icon: "science", label: "ML Configuration" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={`bg-primary-dark text-white w-64 flex-shrink-0 h-screen fixed z-30 transition-all duration-300 transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-4 border-b border-primary flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons mr-3">device_hub</span>
          <span className="font-medium text-lg tracking-wide">JIRA-PINN</span>
        </div>
        <button 
          className="md:hidden focus:outline-none"
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      
      <nav className="pt-4 flex flex-col h-[calc(100%-64px)] overflow-y-auto">
        <div className="px-4 mb-3 text-sm text-gray-300 uppercase tracking-wider">Main</div>
        {mainNavItems.map((item) => (
          <Link 
            href={item.path}
            key={item.path}
            className={`flex items-center py-2 px-4 text-white hover:bg-primary-light ${location === item.path ? 'bg-primary' : ''}`}
          >
            <span className="material-icons mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <div className="px-4 mt-6 mb-3 text-sm text-gray-300 uppercase tracking-wider">Configuration</div>
        {configNavItems.map((item) => (
          <Link 
            href={item.path}
            key={item.path}
            className={`flex items-center py-2 px-4 text-white hover:bg-primary-light ${location === item.path ? 'bg-primary' : ''}`}
          >
            <span className="material-icons mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <div className="mt-auto p-4 border-t border-primary">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-800">
              <span className="material-icons text-sm">person</span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium">John Smith</div>
              <div className="text-xs text-gray-300">Administrator</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
