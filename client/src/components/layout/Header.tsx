import { useState } from "react";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [searchText, setSearchText] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm fixed w-full z-10">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 text-gray-600 focus:outline-none"
            onClick={onMenuClick}
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-medium">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="absolute left-2 top-2.5 text-gray-400">
              <span className="material-icons text-sm">search</span>
            </div>
          </div>
          
          <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
            <span className="material-icons">notifications</span>
          </button>
          
          <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
            <span className="material-icons">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
