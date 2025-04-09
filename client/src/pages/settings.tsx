import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const userSettingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  dependencyUpdates: z.boolean().default(true),
  riskAlerts: z.boolean().default(true),
  weeklyReports: z.boolean().default(false),
  teamMentions: z.boolean().default(true),
});

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();

  const userForm = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      fullName: "John Smith",
      email: "john.smith@example.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      dependencyUpdates: true,
      riskAlerts: true,
      weeklyReports: false,
      teamMentions: true,
    },
  });

  const onUserSubmit = (values: z.infer<typeof userSettingsSchema>) => {
    toast({
      title: "Account settings updated",
      description: "Your account settings have been saved successfully.",
    });
  };

  const onNotificationsSubmit = (values: z.infer<typeof notificationsSchema>) => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Update your account information and change your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={userForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={userForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-medium mb-4">Change Password</h3>
                          
                          <div className="space-y-4">
                            <FormField
                              control={userForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={userForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={userForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Customize how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationsForm}>
                      <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Email Notifications</h3>
                              <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <FormField
                              control={notificationsForm.control}
                              name="emailNotifications"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Dependency Updates</h3>
                              <p className="text-sm text-gray-500">Get notified when dependencies change</p>
                            </div>
                            <FormField
                              control={notificationsForm.control}
                              name="dependencyUpdates"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Risk Alerts</h3>
                              <p className="text-sm text-gray-500">Receive notifications for high-risk dependencies</p>
                            </div>
                            <FormField
                              control={notificationsForm.control}
                              name="riskAlerts"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Weekly Reports</h3>
                              <p className="text-sm text-gray-500">Get a weekly summary of dependency health</p>
                            </div>
                            <FormField
                              control={notificationsForm.control}
                              name="weeklyReports"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium">Team Mentions</h3>
                              <p className="text-sm text-gray-500">Get notified when your team is mentioned</p>
                            </div>
                            <FormField
                              control={notificationsForm.control}
                              name="teamMentions"
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit">Save Preferences</Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the look and feel of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Theme</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border-2 border-primary p-3 rounded-md cursor-pointer flex flex-col items-center">
                            <div className="h-24 w-full bg-primary mb-2 rounded"></div>
                            <span className="text-sm">Default</span>
                          </div>
                          <div className="border-2 border-gray-200 p-3 rounded-md cursor-pointer flex flex-col items-center">
                            <div className="h-24 w-full bg-blue-600 mb-2 rounded"></div>
                            <span className="text-sm">Blue</span>
                          </div>
                          <div className="border-2 border-gray-200 p-3 rounded-md cursor-pointer flex flex-col items-center">
                            <div className="h-24 w-full bg-green-600 mb-2 rounded"></div>
                            <span className="text-sm">Green</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Color Mode</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border-2 border-primary p-3 rounded-md cursor-pointer flex flex-col items-center">
                            <div className="h-24 w-full bg-white border mb-2 rounded flex items-center justify-center">
                              <span className="material-icons text-gray-800">light_mode</span>
                            </div>
                            <span className="text-sm">Light</span>
                          </div>
                          <div className="border-2 border-gray-200 p-3 rounded-md cursor-pointer flex flex-col items-center">
                            <div className="h-24 w-full bg-gray-800 mb-2 rounded flex items-center justify-center">
                              <span className="material-icons text-white">dark_mode</span>
                            </div>
                            <span className="text-sm">Dark</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Save Appearance</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
