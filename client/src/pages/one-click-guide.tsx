import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function OneClickGuide() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DependencyForecaster</CardTitle>
          <CardDescription className="text-xl mt-2">
            One-Click Dependency Prediction for Jira and Jira Align
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Connect. Predict. Optimize.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DependencyForecaster uses Physics-Informed Neural Networks to predict dependencies in Jira and Jira Align before they become blockers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  One-Click Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Connect to your Jira ecosystem in minutes with our guided setup wizard. No complex configuration required.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Real-Time Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get alerted when new dependencies are detected or when risk levels change. Stay ahead of potential blockers.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                    <polyline points="7.5 19.79 7.5 14.6 3 12" />
                    <polyline points="21 12 16.5 14.6 16.5 19.79" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  ML-Powered Forecasting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Predict dependencies 3-12 months in advance with our Physics-Informed Neural Networks and machine learning models.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Why DependencyForecaster?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Scientific Precision</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Built on advanced scientific principles including Physics-Informed Neural Networks and Universal Differential Equations.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Jira/Jira Align Native</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Deeply integrated with the Atlassian ecosystem. Works where your teams already work.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Proactive, Not Reactive</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Shift from reacting to dependencies to proactively managing them before they impact your timeline.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Cross-ART Visibility</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gain unprecedented visibility into dependencies across Agile Release Trains and teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Get Started in Minutes</h3>
            <ol className="space-y-4 ml-6 list-decimal">
              <li className="text-sm">
                <span className="font-medium">Connect to Jira/Jira Align</span>
                <p className="text-muted-foreground mt-1">
                  Enter your Jira credentials or authorize via OAuth. We'll securely connect to your instance.
                </p>
              </li>
              <li className="text-sm">
                <span className="font-medium">Configure Forecasting Settings</span>
                <p className="text-muted-foreground mt-1">
                  Choose your preferred time horizon (3-12 months) and the types of dependencies to track.
                </p>
              </li>
              <li className="text-sm">
                <span className="font-medium">Import Initial Data</span>
                <p className="text-muted-foreground mt-1">
                  We'll analyze your existing Jira data to build the initial dependency graph.
                </p>
              </li>
              <li className="text-sm">
                <span className="font-medium">Review Forecasts and Insights</span>
                <p className="text-muted-foreground mt-1">
                  Start exploring predicted dependencies and optimization recommendations.
                </p>
              </li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/setup">
            <Button size="lg" className="rounded-full px-8">
              Start One-Click Setup
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}