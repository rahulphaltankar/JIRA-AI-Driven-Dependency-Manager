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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
      { keys: ["g", "a"], description: "Go to Analytics" },
      { keys: ["g", "o"], description: "Go to Optimization" },
      { keys: ["g", "s"], description: "Go to Settings" },
      { keys: ["g", "h"], description: "Go to User Guide" },
    ],
  },
  {
    name: "Dependencies",
    shortcuts: [
      { keys: ["n"], description: "Create new dependency" },
      { keys: ["f"], description: "Filter dependencies" },
      { keys: ["s"], description: "Sort dependencies" },
      { keys: ["e"], description: "Edit selected dependency" },
      { keys: ["Shift", "Delete"], description: "Delete selected dependency" },
    ],
  },
  {
    name: "Analytics",
    shortcuts: [
      { keys: ["1"], description: "Network view" },
      { keys: ["2"], description: "Reports view" },
      { keys: ["3"], description: "Matrix view" },
      { keys: ["r"], description: "Refresh data" },
      { keys: ["e"], description: "Export current view" },
    ],
  },
  {
    name: "PINN Configuration",
    shortcuts: [
      { keys: ["n"], description: "Create new model" },
      { keys: ["t"], description: "Train selected model" },
      { keys: ["v"], description: "View model details" },
      { keys: ["r"], description: "Run simulation" },
    ],
  },
  {
    name: "Global",
    shortcuts: [
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Ctrl", "s"], description: "Save current changes" },
      { keys: ["Esc"], description: "Close dialog / Cancel" },
      { keys: ["Ctrl", "f"], description: "Search" },
      { keys: ["Ctrl", "/"], description: "Focus command bar" },
    ],
  },
];

export function KeyboardShortcutsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <i className="material-icons text-base">keyboard</i>
          <span className="hidden sm:inline">Keyboard Shortcuts</span>
          <span className="inline sm:hidden">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Keyboard shortcuts can significantly improve your workflow speed
            </p>
            <div className="flex items-center space-x-2">
              <Switch id="keyboard-shortcuts" defaultChecked={true} />
              <Label htmlFor="keyboard-shortcuts">Enable shortcuts</Label>
            </div>
          </div>

          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.name} className="space-y-3">
                <h3 className="text-lg font-semibold text-primary">
                  {category.name}
                </h3>
                <div className="grid gap-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              You can customize these shortcuts in{" "}
              <a href="/settings" className="text-primary underline">
                Settings
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts() {
  const [keysPressed, setKeysPressed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, etc.
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      setKeysPressed((prev) => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => {
        const updated = new Set(prev);
        updated.delete(e.key.toLowerCase());
        return updated;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Check if a shortcut is currently pressed
  const isShortcutPressed = (keys: string[]) => {
    if (keys.length !== keysPressed.size) return false;
    
    return keys.every(key => 
      keysPressed.has(key.toLowerCase())
    );
  };

  return { keysPressed, isShortcutPressed };
}