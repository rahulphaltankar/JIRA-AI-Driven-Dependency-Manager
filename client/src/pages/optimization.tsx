import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { OptimizationScenario } from "@shared/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Optimization() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch optimization scenarios
  const { data: scenarios, isLoading } = useQuery<OptimizationScenario[]>({
    queryKey: ['/api/optimization/scenarios'],
  });

  const handleRunOptimization = () => {
    if (!selectedScenario) {
      toast({
        title: "Error",
        description: "Please select a scenario first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Optimization Started",
      description: "Running optimization algorithm...",
    });
  };

  const handleApplyScenario = (scenarioId: number) => {
    toast({
      title: "Success",
      description: `Applied optimization scenario ${scenarioId}`,
    });
  };

  // Default scenarios if API fails
  const defaultScenarios: OptimizationScenario[] = [
    {
      id: 1,
      name: "Minimize Critical Path",
      description: "Optimizes work sequence to reduce the critical path length by identifying and eliminating bottlenecks",
      riskReduction: 35,
      timelineReduction: 28,
      complexityScore: 65
    },
    {
      id: 2,
      name: "Team Load Balancing",
      description: "Redistributes dependencies to balance workload across teams and reduce overallocation",
      riskReduction: 25,
      timelineReduction: 15,
      complexityScore: 40
    },
    {
      id: 3,
      name: "Dependency Cycle Breaking",
      description: "Identifies and resolves circular dependencies by suggesting parallel development opportunities",
      riskReduction: 45,
      timelineReduction: 20,
      complexityScore: 70
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dependency Optimization" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-medium">Optimization Engine</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Leverage Scientific Machine Learning to optimize dependency scheduling and resolution
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 border-r border-gray-200 pr-4">
                  <h3 className="text-md font-medium mb-3">Optimization Scenarios</h3>
                  
                  {isLoading ? (
                    <div className="py-4 text-center">Loading scenarios...</div>
                  ) : (
                    <div className="space-y-3">
                      {(scenarios || defaultScenarios).map((scenario) => (
                        <div 
                          key={scenario.id}
                          className={`border rounded-md p-3 cursor-pointer hover:border-primary ${selectedScenario === scenario.id ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}
                          onClick={() => setSelectedScenario(scenario.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{scenario.name}</h4>
                            <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                              {scenario.riskReduction}% risk ↓
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {scenario.description}
                          </p>
                          <div className="flex mt-2 text-xs text-gray-500 space-x-3">
                            <span>Timeline: -{scenario.timelineReduction}%</span>
                            <span>Complexity: {scenario.complexityScore}/100</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleRunOptimization}
                    disabled={!selectedScenario}
                  >
                    <span className="material-icons text-sm mr-1">play_arrow</span>
                    Run Optimization
                  </Button>
                </div>
                
                <div className="col-span-2">
                  <h3 className="text-md font-medium mb-3">Optimization Results</h3>
                  
                  {!selectedScenario ? (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-md">
                      <div className="text-center">
                        <p className="text-gray-500">Select a scenario to view optimization results</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="font-medium">Optimization Recommendations</h4>
                        <div className="mt-3 space-y-3">
                          <div className="bg-white p-3 border border-gray-200 rounded-md">
                            <div className="flex justify-between">
                              <h5 className="font-medium">Resequence Authentication API Development</h5>
                              <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">High Impact</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Start implementation 5 days earlier to reduce blockage risk for mobile team by 65%
                            </p>
                          </div>
                          
                          <div className="bg-white p-3 border border-gray-200 rounded-md">
                            <div className="flex justify-between">
                              <h5 className="font-medium">Split Database Schema Migration</h5>
                              <span className="text-xs bg-info text-white px-2 py-0.5 rounded-full">Medium Impact</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Break into 3 independent components to allow parallel development with API Gateway
                            </p>
                          </div>
                          
                          <div className="bg-white p-3 border border-gray-200 rounded-md">
                            <div className="flex justify-between">
                              <h5 className="font-medium">Pair Security and Mobile Teams</h5>
                              <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">High Impact</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Schedule joint sessions 2x weekly to accelerate dependency resolution
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button variant="outline">Export Results</Button>
                        <Button onClick={() => handleApplyScenario(selectedScenario)}>Apply Scenario</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
