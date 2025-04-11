import { useState } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { Link } from "wouter";
import { KeyboardShortcutsButton } from "@/components/ui/keyboard-shortcuts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [searchText, setSearchText] = useState("");

  const handleNotificationClick = (notification: any) => {
    // Handle navigation based on notification type
    console.log("Notification clicked:", notification);
  };

  return (
    <header className="bg-background border-b shadow-md fixed w-full z-20">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 text-primary hover:text-primary/80 focus:outline-none transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <i className="material-icons">menu</i>
          </button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder="Search dependencies, teams..." 
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm w-56 md:w-64 lg:w-72 transition-all duration-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              aria-label="Search"
            />
            <div className="absolute left-3 top-2.5 text-muted-foreground">
              <i className="material-icons text-sm">search</i>
            </div>
          </div>
          
          {/* Notification Center */}
          <NotificationCenter onNotificationClick={handleNotificationClick} />
          
          {/* Theme Switcher */}
          <ThemeSwitcher />
          
          {/* Keyboard Shortcuts */}
          <KeyboardShortcutsButton />
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">JS</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">John Smith</p>
                  <p className="text-xs text-muted-foreground">john.smith@company.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <i className="material-icons mr-2 text-muted-foreground text-sm">account_circle</i>
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/teams">
                    <i className="material-icons mr-2 text-muted-foreground text-sm">groups</i>
                    <span>My Teams</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api-keys">
                    <i className="material-icons mr-2 text-muted-foreground text-sm">key</i>
                    <span>API Keys</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/user-guide">
                    <i className="material-icons mr-2 text-muted-foreground text-sm">help_outline</i>
                    <span>Help & Documentation</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <i className="material-icons mr-2 text-muted-foreground text-sm">settings</i>
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                <i className="material-icons mr-2 text-sm">logout</i>
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
