import { Link, useLocation } from "wouter";
import { mainNavItems, configNavItems } from "@/lib/sidebar-config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={`bg-gradient-to-b from-primary to-primary/90 text-white w-64 flex-shrink-0 h-screen fixed z-30 transition-all duration-300 transform md:relative md:translate-x-0 shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-primary-foreground mr-3">device_hub</span>
          <span className="font-semibold text-lg tracking-wide">JIRA-PINN</span>
        </div>
        <button 
          className="md:hidden focus:outline-none text-white/80 hover:text-white"
          onClick={onClose}
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      
      <nav className="pt-6 flex flex-col h-[calc(100%-64px)] overflow-y-auto">
        <div className="px-5 mb-2 text-xs font-medium text-white/70 uppercase tracking-wider">Main Navigation</div>
        {mainNavItems.map((item) => (
          <Link 
            href={item.path}
            key={item.path}
            className={`flex items-center py-3 px-5 text-white/90 hover:bg-white/10 transition-colors duration-150 ${location === item.path ? 'bg-white/20 text-white border-l-4 border-white' : ''}`}
          >
            <span className="material-icons mr-3 text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        
        <div className="px-5 mt-8 mb-2 text-xs font-medium text-white/70 uppercase tracking-wider">Configuration</div>
        {configNavItems.map((item) => (
          <Link 
            href={item.path}
            key={item.path}
            className={`flex items-center py-3 px-5 text-white/90 hover:bg-white/10 transition-colors duration-150 ${location === item.path ? 'bg-white/20 text-white border-l-4 border-white' : ''}`}
          >
            <span className="material-icons mr-3 text-[20px]">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
        
        <div className="mt-auto p-5 border-t border-white/10">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="material-icons text-base">person</span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-white">John Smith</div>
              <div className="text-xs text-white/70">Administrator</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
