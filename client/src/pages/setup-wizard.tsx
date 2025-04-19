import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper, Step, StepLabel, StepContent } from "@/components/ui/stepper";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SetupWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Form states
  const [jiraConfig, setJiraConfig] = useState({
    jiraUrl: "",
    jiraEmail: "",
    jiraToken: "",
    useOAuth: false,
    oauthClientId: "",
    oauthSecret: "",
    jiraAlignUrl: "",
    jiraAlignToken: "",
    webhookEnabled: true,
    webhookUrl: ""
  });
  
  const [dataOptions, setDataOptions] = useState({
    importProjects: true,
    importTeams: true,
    importDependencies: true,
    forecastMonths: "6",
    crossArtOnly: false,
  });
  
  const [pinnConfig, setPinnConfig] = useState({
    usePinnModels: true,
    trainingInterval: "weekly",
    complexityLevel: "medium"
  });
  
  // Check if Jira config exists
  const { data: existingConfig, isLoading } = useQuery({ 
    queryKey: ["/api/integrations/jira"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/integrations/jira");
      return res.json();
    },
  });
  
  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async (config: typeof jiraConfig) => {
      const res = await apiRequest("POST", "/api/integrations/jira/test", config);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to Jira",
        });
        handleNext();
      } else {
        toast({
          title: "Connection failed",
          description: data.message || "Failed to connect to Jira",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: typeof jiraConfig) => {
      const res = await apiRequest("POST", "/api/integrations/jira", config);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuration saved",
        description: "Your Jira configuration has been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving configuration",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Import dependencies mutation
  const importDependenciesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/jira/import/dependencies");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Import successful",
        description: `Successfully imported ${data.count || 0} dependencies`,
      });
      handleNext();
    },
    onError: (error: Error) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Effect to load existing config
  useEffect(() => {
    if (existingConfig && !isLoading) {
      setJiraConfig({
        ...jiraConfig,
        jiraUrl: existingConfig.jiraUrl || "",
        jiraEmail: existingConfig.jiraEmail || "",
        jiraToken: "", // Don't display the token for security
        useOAuth: existingConfig.useOAuth || false,
        oauthClientId: existingConfig.oauthClientId || "",
        oauthSecret: "", // Don't display the secret for security
        jiraAlignUrl: existingConfig.jiraAlignUrl || "",
        jiraAlignToken: "", // Don't display the token for security
        webhookEnabled: existingConfig.webhookEnabled || true,
        webhookUrl: existingConfig.webhookUrl || ""
      });
    }
  }, [existingConfig, isLoading, jiraConfig]);
  
  // Handle input changes
  const handleJiraConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setJiraConfig({
      ...jiraConfig,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleDataOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setDataOptions({
      ...dataOptions,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handlePinnConfigChange = (name: string, value: string | boolean) => {
    setPinnConfig({
      ...pinnConfig,
      [name]: value,
    });
  };
  
  // Stepper navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleTestConnection = () => {
    testConnectionMutation.mutate(jiraConfig);
  };
  
  const handleSaveJiraConfig = () => {
    saveConfigMutation.mutate(jiraConfig);
    handleNext();
  };
  
  const handleImportData = () => {
    importDependenciesMutation.mutate();
  };
  
  const handleFinish = () => {
    toast({
      title: "Setup complete",
      description: "Your DependencyForecaster has been set up successfully!",
    });
    setLocation("/dashboard");
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DependencyForecaster Setup
          </CardTitle>
          <CardDescription className="text-lg">
            Complete this quick setup to start forecasting your dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical" className="mt-6">
            <Step>
              <StepLabel>Connect to Jira</StepLabel>
              <StepContent>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="jiraUrl">Jira URL</Label>
                      <Input
                        id="jiraUrl"
                        name="jiraUrl"
                        placeholder="https://your-company.atlassian.net"
                        value={jiraConfig.jiraUrl}
                        onChange={handleJiraConfigChange}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useOAuth"
                        name="useOAuth"
                        checked={jiraConfig.useOAuth}
                        onCheckedChange={(checked) => setJiraConfig({...jiraConfig, useOAuth: !!checked})}
                      />
                      <Label htmlFor="useOAuth">Use OAuth 2.0 (recommended)</Label>
                    </div>
                    
                    {jiraConfig.useOAuth ? (
                      <>
                        <div>
                          <Label htmlFor="oauthClientId">OAuth Client ID</Label>
                          <Input
                            id="oauthClientId"
                            name="oauthClientId"
                            placeholder="OAuth Client ID"
                            value={jiraConfig.oauthClientId}
                            onChange={handleJiraConfigChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="oauthSecret">OAuth Secret</Label>
                          <Input
                            id="oauthSecret"
                            name="oauthSecret"
                            type="password"
                            placeholder="OAuth Secret"
                            value={jiraConfig.oauthSecret}
                            onChange={handleJiraConfigChange}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="jiraEmail">Email</Label>
                          <Input
                            id="jiraEmail"
                            name="jiraEmail"
                            placeholder="your.email@company.com"
                            value={jiraConfig.jiraEmail}
                            onChange={handleJiraConfigChange}
                          />
                        </div>
                        <div>
                          <Label htmlFor="jiraToken">API Token</Label>
                          <Input
                            id="jiraToken"
                            name="jiraToken"
                            type="password"
                            placeholder="Your Jira API Token"
                            value={jiraConfig.jiraToken}
                            onChange={handleJiraConfigChange}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Generate an API token from your Atlassian account settings
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <Label htmlFor="jiraAlignUrl">Jira Align URL (Optional)</Label>
                      <Input
                        id="jiraAlignUrl"
                        name="jiraAlignUrl"
                        placeholder="https://your-company.jiraalign.com"
                        value={jiraConfig.jiraAlignUrl}
                        onChange={handleJiraConfigChange}
                      />
                    </div>
                    
                    {jiraConfig.jiraAlignUrl && (
                      <div>
                        <Label htmlFor="jiraAlignToken">Jira Align API Token</Label>
                        <Input
                          id="jiraAlignToken"
                          name="jiraAlignToken"
                          type="password"
                          placeholder="Your Jira Align API Token"
                          value={jiraConfig.jiraAlignToken}
                          onChange={handleJiraConfigChange}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="webhookEnabled"
                        name="webhookEnabled"
                        checked={jiraConfig.webhookEnabled}
                        onCheckedChange={(checked) => setJiraConfig({...jiraConfig, webhookEnabled: !!checked})}
                      />
                      <Label htmlFor="webhookEnabled">Enable real-time updates via webhooks</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" disabled>Back</Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleTestConnection}
                        disabled={testConnectionMutation.isPending}
                      >
                        {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                      </Button>
                      <Button
                        onClick={handleSaveJiraConfig}
                        disabled={
                          saveConfigMutation.isPending ||
                          (!jiraConfig.jiraUrl) ||
                          (!jiraConfig.useOAuth && (!jiraConfig.jiraEmail || !jiraConfig.jiraToken)) ||
                          (jiraConfig.useOAuth && (!jiraConfig.oauthClientId || !jiraConfig.oauthSecret))
                        }
                      >
                        {saveConfigMutation.isPending ? "Saving..." : "Next"}
                      </Button>
                    </div>
                  </div>
                </div>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Configure Data Import</StepLabel>
              <StepContent>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="importProjects"
                        name="importProjects"
                        checked={dataOptions.importProjects}
                        onCheckedChange={(checked) => setDataOptions({...dataOptions, importProjects: !!checked})}
                      />
                      <Label htmlFor="importProjects">Import Jira projects</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="importTeams"
                        name="importTeams"
                        checked={dataOptions.importTeams}
                        onCheckedChange={(checked) => setDataOptions({...dataOptions, importTeams: !!checked})}
                      />
                      <Label htmlFor="importTeams">Import teams</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="importDependencies"
                        name="importDependencies"
                        checked={dataOptions.importDependencies}
                        onCheckedChange={(checked) => setDataOptions({...dataOptions, importDependencies: !!checked})}
                      />
                      <Label htmlFor="importDependencies">Import existing dependencies</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="forecastMonths">Forecast horizon (months)</Label>
                      <Select
                        value={dataOptions.forecastMonths}
                        onValueChange={(value) => setDataOptions({...dataOptions, forecastMonths: value})}
                      >
                        <SelectTrigger id="forecastMonths">
                          <SelectValue placeholder="Select forecast horizon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 months</SelectItem>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="9">9 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crossArtOnly"
                        name="crossArtOnly"
                        checked={dataOptions.crossArtOnly}
                        onCheckedChange={(checked) => setDataOptions({...dataOptions, crossArtOnly: !!checked})}
                      />
                      <Label htmlFor="crossArtOnly">Focus on cross-ART dependencies only</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button
                      onClick={handleImportData}
                      disabled={importDependenciesMutation.isPending || !dataOptions.importDependencies}
                    >
                      {importDependenciesMutation.isPending ? "Importing..." : "Import & Continue"}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
            
            <Step>
              <StepLabel>Configure PINN Models</StepLabel>
              <StepContent>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="usePinnModels"
                        checked={pinnConfig.usePinnModels}
                        onCheckedChange={(checked) => handlePinnConfigChange("usePinnModels", !!checked)}
                      />
                      <Label htmlFor="usePinnModels">
                        Use Physics-Informed Neural Networks for dependency forecasting
                      </Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trainingInterval">Model training interval</Label>
                      <Select
                        value={pinnConfig.trainingInterval}
                        onValueChange={(value) => handlePinnConfigChange("trainingInterval", value)}
                      >
                        <SelectTrigger id="trainingInterval">
                          <SelectValue placeholder="Select training interval" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="complexityLevel">Model complexity</Label>
                      <Select
                        value={pinnConfig.complexityLevel}
                        onValueChange={(value) => handlePinnConfigChange("complexityLevel", value)}
                      >
                        <SelectTrigger id="complexityLevel">
                          <SelectValue placeholder="Select complexity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple - Less accurate but faster</SelectItem>
                          <SelectItem value="medium">Medium - Balanced accuracy and performance</SelectItem>
                          <SelectItem value="complex">Complex - Most accurate but resource intensive</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Higher complexity models require more computational resources but may produce more accurate forecasts
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button onClick={handleFinish}>Finish Setup</Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          DependencyForecaster uses advanced Physics-Informed Neural Networks (PINNs) to predict dependencies before they become blockers
        </CardFooter>
      </Card>
    </div>
  );
}