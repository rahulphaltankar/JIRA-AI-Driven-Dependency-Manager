import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DependencyNetwork from "@/components/dashboard/DependencyNetwork";
import { DependencyNetwork as DependencyNetworkType, DependencyNode } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

export default function Analysis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch network data
  const { data: networkData, isLoading } = useQuery<DependencyNetworkType>({
    queryKey: ['/api/dependencies/network'],
  });

  // Handle network node click
  const handleNodeClick = (node: DependencyNode) => {
    toast({
      title: "Node Selected",
      description: `Selected ${node.type}: ${node.name}`,
    });
  };

  // Default network data if API fails
  const defaultNetwork: DependencyNetworkType = {
    nodes: [
      { id: "team1", name: "Frontend Team", group: 1, type: "team" },
      { id: "team2", name: "Backend Team", group: 1, type: "team" },
      { id: "team3", name: "Security Team", group: 1, type: "team" },
      { id: "team4", name: "Data Team", group: 1, type: "team" },
      { id: "team5", name: "Mobile Team", group: 1, type: "team" },
      { id: "epic1", name: "User Auth", group: 2, type: "epic", status: "at-risk" },
      { id: "epic2", name: "API Gateway", group: 2, type: "epic", status: "blocked" },
      { id: "epic3", name: "DB Schema", group: 2, type: "epic", status: "in-progress" },
      { id: "epic4", name: "Mobile App", group: 2, type: "epic", status: "in-progress" },
      { id: "epic5", name: "User Profile", group: 2, type: "epic", status: "completed" }
    ],
    links: [
      { source: "team3", target: "epic1", value: 1 },
      { source: "team2", target: "epic1", value: 1 },
      { source: "team2", target: "epic2", value: 1 },
      { source: "team4", target: "epic3", value: 1 },
      { source: "team5", target: "epic4", value: 1 },
      { source: "epic1", target: "epic4", value: 2 },
      { source: "epic2", target: "epic4", value: 2 },
      { source: "epic3", target: "epic2", value: 2 },
      { source: "team1", target: "epic5", value: 1 },
      { source: "epic5", target: "epic4", value: 2 }
    ]
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dependency Analysis" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-lg font-medium">Advanced Dependency Analysis</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Explore dependency relationships and identify optimization opportunities using Scientific Machine Learning
                </p>
              </div>
              
              <div className="h-[600px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading network data...</p>
                  </div>
                ) : (
                  <DependencyNetwork 
                    data={networkData || defaultNetwork} 
                    onNodeClick={handleNodeClick} 
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-3">Network Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Network Density</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                      <span className="ml-2 text-sm">65%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Clustering Coefficient</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: "42%" }}></div>
                      </div>
                      <span className="ml-2 text-sm">42%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Centrality Distribution</p>
                    <div className="flex items-center mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-accent h-2.5 rounded-full" style={{ width: "78%" }}></div>
                      </div>
                      <span className="ml-2 text-sm">78%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium mb-3">SciML Insights</h3>
                <div className="space-y-2">
                  <div className="border-l-4 border-info pl-3 py-1">
                    <p className="text-sm font-medium">High Dependency Node Detected</p>
                    <p className="text-xs text-gray-500">Mobile Team is a critical junction with 5 dependencies</p>
                  </div>
                  
                  <div className="border-l-4 border-warning pl-3 py-1">
                    <p className="text-sm font-medium">Potential Dependency Cycle</p>
                    <p className="text-xs text-gray-500">ApiGateway → DBSchema → ApiGateway forms a circular path</p>
                  </div>
                  
                  <div className="border-l-4 border-error pl-3 py-1">
                    <p className="text-sm font-medium">Critical Path Bottleneck</p>
                    <p className="text-xs text-gray-500">Authentication Service is a bottleneck for 3 downstream teams</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
