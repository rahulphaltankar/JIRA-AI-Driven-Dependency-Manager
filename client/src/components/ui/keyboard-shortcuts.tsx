import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: "Navigation",
    shortcuts: [
      { keys: ["g", "d"], description: "Go to Dashboard" },
      { keys: ["g", "p"], description: "Go to Dependencies" },
      { keys: ["g", "o"], description: "Go to Optimization" },
      { keys: ["g", "a"], description: "Go to Analysis" },
      { keys: ["g", "s"], description: "Go to Settings" },
      { keys: ["g", "h"], description: "Go to Help" },
    ],
  },
  {
    name: "Dependencies",
    shortcuts: [
      { keys: ["n"], description: "New Dependency" },
      { keys: ["e"], description: "Edit Selected Dependency" },
      { keys: ["Delete"], description: "Delete Selected Dependency" },
      { keys: ["f"], description: "Filter Dependencies" },
      { keys: ["r"], description: "Refresh Dependencies" },
      { keys: ["c"], description: "Show Critical Dependencies" },
    ],
  },
  {
    name: "Optimization",
    shortcuts: [
      { keys: ["o", "r"], description: "Run Optimization" },
      { keys: ["o", "a"], description: "Apply Recommendations" },
      { keys: ["o", "c"], description: "Configure Optimization Model" },
      { keys: ["o", "e"], description: "Export Recommendations" },
    ],
  },
  {
    name: "Analysis",
    shortcuts: [
      { keys: ["a", "r"], description: "Run Analysis" },
      { keys: ["a", "e"], description: "Export Analysis" },
      { keys: ["a", "f"], description: "Filter Analysis" },
      { keys: ["a", "p"], description: "Print Analysis" },
    ],
  },
  {
    name: "Global",
    shortcuts: [
      { keys: ["?"], description: "Show Keyboard Shortcuts" },
      { keys: ["Ctrl", "/"], description: "Focus Search" },
      { keys: ["Escape"], description: "Close Modal / Cancel" },
      { keys: ["Ctrl", "s"], description: "Save Changes" },
      { keys: ["Ctrl", "z"], description: "Undo" },
      { keys: ["t"], description: "Toggle Theme" },
    ],
  },
];

export function KeyboardShortcutsButton() {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(shortcutCategories[0].name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <i className="material-icons text-base">keyboard</i>
          <span className="sr-only">Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate quickly through the application
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4 justify-start overflow-auto">
            {shortcutCategories.map((category) => (
              <TabsTrigger key={category.name} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="overflow-y-auto pr-2">
            {shortcutCategories.map((category) => (
              <TabsContent key={category.name} value={category.name} className="mt-0">
                <div className="rounded-md border mb-4">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-2">{category.name} Shortcuts</h3>
                    <div className="space-y-3">
                      {category.shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center space-x-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <kbd
                                key={keyIndex}
                                className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-md"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Hook to enable keyboard shortcuts system-wide
export function useKeyboardShortcuts() {
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, etc.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Record the key press
      setKeysPressed((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
      setLastKeyTime(Date.now());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => {
        const newState = { ...prev };
        delete newState[e.key.toLowerCase()];
        return newState;
      });

      // Process combinations
      // This would be expanded to handle all defined shortcuts
      if (e.key === "?" || (e.ctrlKey && e.key === "/")) {
        // Open keyboard shortcuts dialog
        console.log("Keyboard shortcuts dialog triggered");
        // setOpen(true); (you would need to implement a global state)
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Reset key state if no activity for 1.5 seconds
    const interval = setInterval(() => {
      if (Date.now() - lastKeyTime > 1500 && Object.keys(keysPressed).length > 0) {
        setKeysPressed({});
      }
    }, 1500);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(interval);
    };
  }, [keysPressed, lastKeyTime]);

  return { keysPressed };
}