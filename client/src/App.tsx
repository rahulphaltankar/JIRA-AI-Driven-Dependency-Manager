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
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dependencies" component={Dependencies} />
        <Route path="/analysis" component={Analysis} />
        <Route path="/optimization" component={Optimization} />
        <Route path="/settings" component={Settings} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/ml-config" component={MlConfig} />
        <Route path="/pinn-config" component={PinnConfig} />
        <Route path="/user-guide" component={UserGuide} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
