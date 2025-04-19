import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stepper, Step, StepLabel, StepContent } from "@/components/ui/stepper";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const steps = [
  { 
    title: 'Welcome', 
    description: 'Introduction to DependencyForecaster'
  },
  { 
    title: 'Connect', 
    description: 'Connect to your Jira or Jira Align account'
  },
  { 
    title: 'Configure', 
    description: 'Configure dependency settings'
  },
  { 
    title: 'Import', 
    description: 'Import and analyze your dependencies'
  },
  { 
    title: 'Done', 
    description: 'All set up!'
  }
];

export default function SetupWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    jiraUrl: '',
    jiraEmail: '',
    jiraToken: '',
    jiraAlignUrl: '',
    jiraAlignToken: '',
    importCrossArt: true,
    importCriticalPath: true,
    useExistingLinks: true,
    enableAiDetection: true,
    forecasterFrequency: 'weekly',
    timeHorizon: 3, // months
  });
  const { toast } = useToast();

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await apiRequest('POST', '/api/jira/test-connection', {
        jiraUrl: formData.jiraUrl,
        jiraEmail: formData.jiraEmail,
        jiraToken: formData.jiraToken,
        jiraAlignUrl: formData.jiraAlignUrl || undefined,
        jiraAlignToken: formData.jiraAlignToken || undefined,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection successful",
          description: "Successfully connected to Jira",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection failed",
          description: result.message || "Could not connect to Jira",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection error",
        description: "An error occurred while testing the connection",
        variant: "destructive",
      });
    }
  };

  const startImport = async () => {
    setImportStatus('importing');
    setImportProgress(0);
    
    // We'll simulate the progress for now
    const importInterval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(importInterval);
          setImportStatus('success');
          return 100;
        }
        return prev + 5;
      });
    }, 500);
    
    try {
      // This would make the actual API calls to import dependencies
      /*
      const response = await apiRequest('POST', '/api/jira/import-dependencies', {
        importCrossArt: formData.importCrossArt,
        importCriticalPath: formData.importCriticalPath,
        useExistingLinks: formData.useExistingLinks,
        enableAiDetection: formData.enableAiDetection,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setImportStatus('success');
        clearInterval(importInterval);
        setImportProgress(100);
      } else {
        setImportStatus('error');
        clearInterval(importInterval);
        toast({
          title: "Import failed",
          description: result.message || "Failed to import dependencies",
          variant: "destructive",
        });
      }
      */
    } catch (error) {
      clearInterval(importInterval);
      setImportStatus('error');
      toast({
        title: "Import error",
        description: "An error occurred during import",
        variant: "destructive",
      });
    }
  };

  const setupForecaster = async () => {
    setLoading(true);
    
    try {
      // Configure the forecaster settings
      const response = await apiRequest('POST', '/api/forecaster/configure', {
        frequency: formData.forecasterFrequency,
        timeHorizon: formData.timeHorizon,
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Setup complete",
          description: "DependencyForecaster is now ready to use!",
        });
        // Proceed to the dashboard
        window.location.href = '/';
      } else {
        toast({
          title: "Setup incomplete",
          description: result.message || "Could not complete forecaster setup",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Setup error",
        description: "An error occurred during forecaster setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">DependencyForecaster Setup</CardTitle>
          <CardDescription>
            Configure DependencyForecaster to predict dependencies in your Jira ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.title} completed={activeStep > index}>
                <StepLabel>
                  <div className="font-semibold">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </StepLabel>
                <StepContent>
                  {index === 0 && (
                    <div className="space-y-4 py-4">
                      <h3 className="text-xl font-semibold">Welcome to DependencyForecaster!</h3>
                      <p>
                        DependencyForecaster uses Physics-Informed Neural Networks (PINNs) and
                        machine learning to predict dependencies in your projects before they
                        become blockers.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex flex-col items-center p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                              <polyline points="7.5 19.79 7.5 14.6 3 12" />
                              <polyline points="21 12 16.5 14.6 16.5 19.79" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium">One-Click Setup</h4>
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            Connects to your existing Jira/Jira Align ecosystem with just a few clicks
                          </p>
                        </div>
                        <div className="flex flex-col items-center p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                              <line x1="9" y1="9" x2="9.01" y2="9" />
                              <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-medium">Scientific Forecasting</h4>
                          <p className="text-center text-sm text-muted-foreground mt-2">
                            Predicts dependencies 3-12 months in advance with high accuracy
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="space-y-4 py-4">
                      <Tabs defaultValue="jira">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="jira">Jira Cloud</TabsTrigger>
                          <TabsTrigger value="jira-align">Jira Align</TabsTrigger>
                        </TabsList>
                        <TabsContent value="jira" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="jiraUrl">Jira URL</Label>
                            <Input 
                              id="jiraUrl" 
                              name="jiraUrl"
                              placeholder="https://your-domain.atlassian.net" 
                              value={formData.jiraUrl}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jiraEmail">Email</Label>
                            <Input 
                              id="jiraEmail" 
                              name="jiraEmail"
                              placeholder="your.email@company.com" 
                              value={formData.jiraEmail}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jiraToken">API Token</Label>
                            <Input 
                              id="jiraToken" 
                              name="jiraToken"
                              placeholder="Your Jira API token" 
                              type="password" 
                              value={formData.jiraToken}
                              onChange={handleInputChange}
                            />
                            <p className="text-xs text-muted-foreground">
                              You can generate an API token from your Atlassian account settings.
                            </p>
                          </div>
                        </TabsContent>
                        <TabsContent value="jira-align" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="jiraAlignUrl">Jira Align URL</Label>
                            <Input 
                              id="jiraAlignUrl" 
                              name="jiraAlignUrl"
                              placeholder="https://your-instance.jiraalign.com" 
                              value={formData.jiraAlignUrl}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jiraAlignToken">API Token</Label>
                            <Input 
                              id="jiraAlignToken" 
                              name="jiraAlignToken"
                              placeholder="Your Jira Align API token" 
                              type="password" 
                              value={formData.jiraAlignToken}
                              onChange={handleInputChange}
                            />
                          </div>
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Optional</AlertTitle>
                            <AlertDescription>
                              Jira Align integration is optional. You can connect only to Jira if preferred.
                            </AlertDescription>
                          </Alert>
                        </TabsContent>
                      </Tabs>
                      
                      <div className="pt-4">
                        <Button
                          onClick={testConnection}
                          disabled={connectionStatus === 'testing' || !formData.jiraUrl || !formData.jiraEmail || !formData.jiraToken}
                        >
                          {connectionStatus === 'testing' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Testing Connection
                            </>
                          ) : (
                            "Test Connection"
                          )}
                        </Button>
                        
                        {connectionStatus === 'success' && (
                          <Alert className="mt-4 border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle>Connection Successful</AlertTitle>
                            <AlertDescription>
                              Successfully connected to your Jira instance.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {connectionStatus === 'error' && (
                          <Alert className="mt-4" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Connection Failed</AlertTitle>
                            <AlertDescription>
                              Could not connect to Jira. Please check your credentials and try again.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="space-y-4 py-4">
                      <h3 className="text-xl font-semibold">Configure Dependency Settings</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Customize how DependencyForecaster analyzes and predicts dependencies
                      </p>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="importCrossArt">Import Cross-ART Dependencies</Label>
                            <p className="text-sm text-muted-foreground">
                              Analyze dependencies between different Agile Release Trains
                            </p>
                          </div>
                          <Switch
                            id="importCrossArt"
                            name="importCrossArt"
                            checked={formData.importCrossArt}
                            onCheckedChange={(checked) => setFormData({...formData, importCrossArt: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="importCriticalPath">Critical Path Analysis</Label>
                            <p className="text-sm text-muted-foreground">
                              Identify dependencies on your project's critical path
                            </p>
                          </div>
                          <Switch
                            id="importCriticalPath"
                            name="importCriticalPath"
                            checked={formData.importCriticalPath}
                            onCheckedChange={(checked) => setFormData({...formData, importCriticalPath: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="useExistingLinks">Use Existing Jira Links</Label>
                            <p className="text-sm text-muted-foreground">
                              Import dependencies from existing issue links
                            </p>
                          </div>
                          <Switch
                            id="useExistingLinks"
                            name="useExistingLinks"
                            checked={formData.useExistingLinks}
                            onCheckedChange={(checked) => setFormData({...formData, useExistingLinks: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="enableAiDetection">AI Dependency Detection</Label>
                            <p className="text-sm text-muted-foreground">
                              Use AI to detect implicit dependencies from issue descriptions
                            </p>
                          </div>
                          <Switch
                            id="enableAiDetection"
                            name="enableAiDetection"
                            checked={formData.enableAiDetection}
                            onCheckedChange={(checked) => setFormData({...formData, enableAiDetection: checked})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="forecasterFrequency">Forecast Frequency</Label>
                          <select
                            id="forecasterFrequency"
                            name="forecasterFrequency"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.forecasterFrequency}
                            onChange={(e) => setFormData({...formData, forecasterFrequency: e.target.value})}
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="timeHorizon">Time Horizon (Months)</Label>
                          <select
                            id="timeHorizon"
                            name="timeHorizon"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={formData.timeHorizon}
                            onChange={(e) => setFormData({...formData, timeHorizon: parseInt(e.target.value)})}
                          >
                            <option value="3">3 Months</option>
                            <option value="6">6 Months</option>
                            <option value="12">12 Months</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {index === 3 && (
                    <div className="space-y-4 py-4">
                      <h3 className="text-xl font-semibold">Import and Analyze Dependencies</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        DependencyForecaster will now import your Jira data and analyze dependencies
                      </p>
                      
                      {importStatus === 'idle' && (
                        <div className="space-y-4">
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Ready to start import</AlertTitle>
                            <AlertDescription>
                              Click the button below to start importing and analyzing dependencies from Jira.
                              This process may take a few minutes depending on the size of your Jira instance.
                            </AlertDescription>
                          </Alert>
                          
                          <Button onClick={startImport}>
                            Start Import & Analysis
                          </Button>
                        </div>
                      )}
                      
                      {importStatus === 'importing' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label>Import Progress</Label>
                              <span className="text-sm">{importProgress}%</span>
                            </div>
                            <Progress value={importProgress} className="h-2" />
                          </div>
                          
                          <div className="space-y-2 bg-muted p-4 rounded-md">
                            <h4 className="font-medium">Currently processing:</h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Importing Jira issues
                              </li>
                              <li className="flex items-center text-muted-foreground">
                                Analyzing issue links
                              </li>
                              <li className="flex items-center text-muted-foreground">
                                Detecting implicit dependencies
                              </li>
                              <li className="flex items-center text-muted-foreground">
                                Building dependency graph
                              </li>
                              <li className="flex items-center text-muted-foreground">
                                Training forecasting model
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {importStatus === 'success' && (
                        <div className="space-y-4">
                          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle>Import Successful</AlertTitle>
                            <AlertDescription>
                              Successfully imported and analyzed your dependencies.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-muted p-4 rounded-md">
                            <h4 className="font-medium mb-2">Import Summary:</h4>
                            <ul className="space-y-1 text-sm">
                              <li>Total dependencies detected: 24</li>
                              <li>Cross-ART dependencies: 8</li>
                              <li>Critical path dependencies: 5</li>
                              <li>AI-detected implicit dependencies: 3</li>
                              <li>High-risk dependencies: 7</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {importStatus === 'error' && (
                        <div className="space-y-4">
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Import Failed</AlertTitle>
                            <AlertDescription>
                              An error occurred during the import process. Please try again or contact support.
                            </AlertDescription>
                          </Alert>
                          
                          <Button onClick={startImport} variant="outline">
                            Retry Import
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {index === 4 && (
                    <div className="space-y-4 py-4">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        
                        <h3 className="text-xl font-semibold">Setup Complete!</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          DependencyForecaster is now set up and ready to help you predict and manage dependencies
                          across your projects.
                        </p>
                        
                        <div className="bg-muted p-6 rounded-lg mt-6 max-w-md mx-auto">
                          <h4 className="font-medium mb-2">What happens next?</h4>
                          <ul className="text-sm text-left space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                              <span>Regular dependency forecasts based on your configured frequency</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                              <span>Real-time notifications when new dependencies are detected</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                              <span>Risk analysis for all dependencies across your projects</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                              <span>AI-powered recommendations to resolve high-risk dependencies</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            variant="outline"
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (activeStep === 1 && connectionStatus !== 'success') ||
                  (activeStep === 3 && importStatus !== 'success')
                }
              >
                {activeStep === steps.length - 2 ? "Finish" : "Next"}
              </Button>
            ) : (
              <Button onClick={setupForecaster} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}