import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Notification } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Query notifications from the API
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/notifications/${id}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/read-all");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "dependency_change":
        return "compare_arrows";
      case "risk_alert":
        return "warning";
      case "recommendation":
        return "psychology";
      case "team_mention":
        return "alternate_email";
      case "system":
        return "computer";
      default:
        return "notifications";
    }
  };

  // Get color for notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "dependency_change":
        return "text-blue-500";
      case "risk_alert":
        return "text-red-500";
      case "recommendation":
        return "text-purple-500";
      case "team_mention":
        return "text-amber-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-primary";
    }
  };

  // Format notification time
  const formatNotificationTime = (date: Date | null) => {
    if (!date) return "Unknown";
    const dateObj = new Date(date);
    
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } else {
      return format(dateObj, "MMM d, yyyy h:mm a");
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read if it's not already
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Close popover
    setOpen(false);
    
    // Call the callback if provided
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <i className="material-icons">notifications</i>
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="dependency_change" className="text-xs">
                Dependencies
              </TabsTrigger>
              <TabsTrigger value="risk_alert" className="text-xs">
                Alerts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="focus-visible:outline-none">
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <i className="material-icons animate-spin text-2xl text-primary mb-2">refresh</i>
                  <p className="text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <ul className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div 
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${!notification.isRead ? 'bg-blue-100' : 'bg-slate-100'}`}
                        >
                          <i 
                            className={`material-icons ${getNotificationColor(notification.type)}`}
                          >
                            {getNotificationIcon(notification.type)}
                          </i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {notification.title}
                            </p>
                            <div className="flex items-center">
                              <span className="text-xs text-slate-500">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                              <button 
                                className="ml-2 text-slate-400 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotificationMutation.mutate(notification.id);
                                }}
                              >
                                <i className="material-icons text-sm">close</i>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {notification.content}
                          </p>
                          {notification.referenceId && (
                            <p className="text-xs text-slate-500 mt-1">
                              {notification.referenceType}: #{notification.referenceId}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <i className="material-icons text-4xl text-slate-300 mb-2">notifications_off</i>
                  <p className="text-sm text-slate-500 text-center">No notifications found</p>
                  <p className="text-xs text-slate-400 text-center mt-1">
                    {activeTab === "all"
                      ? "You're all caught up!"
                      : activeTab === "unread"
                      ? "No unread notifications"
                      : `No ${activeTab.replace("_", " ")} notifications`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t flex justify-between items-center text-xs text-slate-500">
          <span>
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </span>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
            <a href="/settings/notifications">Notification Settings</a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}