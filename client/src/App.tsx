import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import Dependencies from "@/pages/dependencies";
import Analysis from "@/pages/analysis";
import Optimization from "@/pages/optimization";
import Settings from "@/pages/settings";
import Integrations from "@/pages/integrations";
import MlConfig from "@/pages/ml-config";
import PinnConfig from "@/pages/pinn-config";
import UserGuide from "@/pages/user-guide";
import SetupWizard from "@/pages/setup-wizard";
import OneClickGuide from "@/pages/one-click-guide";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={OneClickGuide} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/dependencies" component={Dependencies} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/optimization" component={Optimization} />
          <Route path="/settings" component={Settings} />
          <Route path="/integrations" component={Integrations} />
          <Route path="/ml-config" component={MlConfig} />
          <Route path="/pinn-config" component={PinnConfig} />
          <Route path="/user-guide" component={UserGuide} />
          <Route path="/setup" component={SetupWizard} />
          <Route path="/app-entry" component={SetupWizard} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </main>
    </QueryClientProvider>
  );
}

export default App;
