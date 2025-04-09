import { useState } from "react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [searchText, setSearchText] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 shadow-md fixed w-full z-20">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 text-primary hover:text-primary/80 focus:outline-none transition-colors"
            onClick={onMenuClick}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="Search dependencies..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-primary/60">
              <span className="material-icons text-sm">search</span>
            </div>
          </div>
          
          <button className="text-primary/70 hover:text-primary focus:outline-none transition-colors bg-gray-50 p-2 rounded-full">
            <span className="material-icons">notifications</span>
          </button>
          
          <button className="text-primary/70 hover:text-primary focus:outline-none transition-colors bg-gray-50 p-2 rounded-full">
            <span className="material-icons">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
