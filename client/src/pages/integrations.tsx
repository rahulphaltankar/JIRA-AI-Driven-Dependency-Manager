import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { JiraConfig } from "@shared/types";

const jiraConfigSchema = z.object({
  jiraUrl: z.string().url("Please enter a valid URL"),
  jiraEmail: z.string().email("Please enter a valid email address"),
  jiraToken: z.string().min(1, "API token is required"),
  jiraAlignUrl: z.string().url("Please enter a valid URL").or(z.literal("")),
  jiraAlignToken: z.string().or(z.literal("")),
});

export default function Integrations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch Jira configuration
  const { data: jiraConfig, isLoading } = useQuery<JiraConfig>({
    queryKey: ['/api/integrations/jira'],
  });

  const jiraForm = useForm<z.infer<typeof jiraConfigSchema>>({
    resolver: zodResolver(jiraConfigSchema),
    defaultValues: {
      jiraUrl: jiraConfig?.jiraUrl || "",
      jiraEmail: jiraConfig?.jiraEmail || "",
      jiraToken: jiraConfig?.jiraToken || "",
      jiraAlignUrl: jiraConfig?.jiraAlignUrl || "",
      jiraAlignToken: jiraConfig?.jiraAlignToken || "",
    },
  });

  // Update form values when data is loaded
  useState(() => {
    if (jiraConfig) {
      jiraForm.reset({
        jiraUrl: jiraConfig.jiraUrl || "",
        jiraEmail: jiraConfig.jiraEmail || "",
        jiraToken: jiraConfig.jiraToken || "",
        jiraAlignUrl: jiraConfig.jiraAlignUrl || "",
        jiraAlignToken: jiraConfig.jiraAlignToken || "",
      });
    }
  });

  // Save Jira configuration
  const saveJiraConfig = useMutation({
    mutationFn: async (data: z.infer<typeof jiraConfigSchema>) => {
      const res = await apiRequest('POST', '/api/integrations/jira', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/jira'] });
      toast({
        title: "Success",
        description: "Jira integration configured successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save Jira configuration",
        variant: "destructive",
      });
    },
  });

  const testJiraConnection = useMutation({
    mutationFn: async (data: z.infer<typeof jiraConfigSchema>) => {
      const res = await apiRequest('POST', '/api/integrations/jira/test', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection Successful",
        description: "Successfully connected to Jira APIs",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Jira APIs",
        variant: "destructive",
      });
    },
  });

  const onJiraSubmit = (values: z.infer<typeof jiraConfigSchema>) => {
    saveJiraConfig.mutate(values);
  };

  const onTestConnection = () => {
    const values = jiraForm.getValues();
    testJiraConnection.mutate(values);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Integrations" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jira Integration</CardTitle>
                <CardDescription>
                  Connect to your Jira and Jira Align instances to import dependencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...jiraForm}>
                  <form onSubmit={jiraForm.handleSubmit(onJiraSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Jira Core</h3>
                      
                      <FormField
                        control={jiraForm.control}
                        name="jiraUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jira URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="https://your-domain.atlassian.net" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={jiraForm.control}
                          name="jiraEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jira Email</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email" 
                                  placeholder="your-email@example.com" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={jiraForm.control}
                          name="jiraToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jira API Token</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password" 
                                  placeholder="Your Jira API token" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Jira Align (Optional)</h3>
                      
                      <FormField
                        control={jiraForm.control}
                        name="jiraAlignUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jira Align URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="https://your-instance.jiraalign.com" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={jiraForm.control}
                        name="jiraAlignToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jira Align API Token</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password" 
                                placeholder="Your Jira Align API token" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={onTestConnection}
                        disabled={testJiraConnection.isPending}
                      >
                        {testJiraConnection.isPending ? "Testing..." : "Test Connection"}
                      </Button>
                      <Button 
                        type="submit"
                        disabled={saveJiraConfig.isPending}
                      >
                        {saveJiraConfig.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Import Dependencies</CardTitle>
                <CardDescription>
                  Import dependencies from your Jira and Jira Align instances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Jira Issue Links</h3>
                      <p className="text-sm text-gray-500">Import dependencies from Jira issue links</p>
                    </div>
                    <Button disabled={!jiraConfig}>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Jira Align Dependencies</h3>
                      <p className="text-sm text-gray-500">Import dependencies from Jira Align</p>
                    </div>
                    <Button disabled={!jiraConfig?.jiraAlignUrl}>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Cross-ART Dependencies</h3>
                      <p className="text-sm text-gray-500">Import dependencies between ARTs</p>
                    </div>
                    <Button disabled={!jiraConfig?.jiraAlignUrl}>Import</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="text-sm text-gray-500">
                  <p>Last import: Never</p>
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
