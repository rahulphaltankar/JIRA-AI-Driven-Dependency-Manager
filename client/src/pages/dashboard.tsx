import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatusCard from "@/components/dashboard/StatusCard";
import DependencyNetwork from "@/components/dashboard/DependencyNetwork";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import CrossARTDependencies from "@/components/dashboard/CrossARTDependencies";
import DependencyTable from "@/components/dashboard/DependencyTable";
import DependencyModal from "@/components/modals/DependencyModal";
import { Dependency } from "@shared/schema";
import { 
  DependencyMetrics, 
  DependencyNetwork as DependencyNetworkType,
  DependencyNode,
  Recommendation,
  CrossArtDependency,
  RiskAnalysis,
} from "@shared/types";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<Dependency | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'analysis' | 'scenarios' | 'insights'>('analysis');
  const { toast } = useToast();

  // Fetch dashboard data
  const { data: metrics, isLoading: metricsLoading } = useQuery<DependencyMetrics>({
    queryKey: ['/api/metrics'],
  });

  const { data: networkData, isLoading: networkLoading } = useQuery<DependencyNetworkType>({
    queryKey: ['/api/dependencies/network'],
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
  });

  const { data: crossArtDependencies, isLoading: crossArtLoading } = useQuery<CrossArtDependency[]>({
    queryKey: ['/api/dependencies/cross-art'],
  });

  const { data: criticalDependencies, isLoading: criticalLoading } = useQuery<Dependency[]>({
    queryKey: ['/api/dependencies/critical'],
  });

  const { data: riskAnalysis, isLoading: riskAnalysisLoading } = useQuery<RiskAnalysis>({
    queryKey: ['/api/dependencies/risk-analysis', selectedDependency?.id],
    enabled: !!selectedDependency,
  });

  // Handle network node click
  const handleNodeClick = (node: DependencyNode) => {
    if (node.type === "epic" && (node.status === "at-risk" || node.status === "blocked")) {
      fetchDependencyDetails(node.id);
    }
  };

  // Fetch dependency details
  const fetchDependencyDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/dependencies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch dependency details');
      const dependency = await response.json();
      setSelectedDependency(dependency);
      setModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dependency details",
        variant: "destructive",
      });
    }
  };

  // Handle recommendation actions
  const handleViewRecommendation = (id: number) => {
    toast({
      title: "Info",
      description: `Viewing recommendation details for ID: ${id}`,
    });
  };

  const handleApplyRecommendation = (id: number) => {
    toast({
      title: "Success",
      description: `Applied recommendation ID: ${id}`,
    });
  };

  // Handle dependency actions
  const handleViewDependency = (id: number) => {
    const dependency = criticalDependencies?.find(d => d.id === id) || null;
    if (dependency) {
      setSelectedDependency(dependency);
      setModalOpen(true);
    }
  };

  const handleOptimizeDependency = (id: number) => {
    toast({
      title: "Optimizing",
      description: `Running optimization for dependency ID: ${id}`,
    });
  };

  const handleApplyOptimization = (id: number) => {
    toast({
      title: "Success",
      description: `Applied optimization for dependency ID: ${id}`,
    });
    setModalOpen(false);
  };

  const handleViewAllCrossArt = () => {
    toast({
      title: "Info",
      description: "Viewing all cross-ART dependencies",
    });
  };

  // Default data for development if API fails
  const defaultMetrics: DependencyMetrics = {
    totalDependencies: 187,
    totalDependenciesChange: "+12 from last PI",
    atRiskDependencies: 23,
    atRiskDependenciesChange: "+5 from last week",
    blockedWorkItems: 18,
    blockedItemsChange: "+3 from yesterday",
    optimizationScore: "76%",
    optimizationScoreChange: "+4% from last PI",
  };

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
        <Header title="Dependency Optimizer Dashboard" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16 md:ml-0">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatusCard 
              title="Total Dependencies" 
              value={metrics?.totalDependencies || defaultMetrics.totalDependencies} 
              change={metrics?.totalDependenciesChange || defaultMetrics.totalDependenciesChange} 
              icon="link" 
              type="info"
              trendDirection="positive"
            />
            <StatusCard 
              title="At-Risk Dependencies" 
              value={metrics?.atRiskDependencies || defaultMetrics.atRiskDependencies} 
              change={metrics?.atRiskDependenciesChange || defaultMetrics.atRiskDependenciesChange} 
              icon="warning" 
              type="warning"
              trendDirection="negative"
            />
            <StatusCard 
              title="Blocked Work Items" 
              value={metrics?.blockedWorkItems || defaultMetrics.blockedWorkItems} 
              change={metrics?.blockedItemsChange || defaultMetrics.blockedItemsChange} 
              icon="block" 
              type="error"
              trendDirection="negative"
            />
            <StatusCard 
              title="Optimization Score" 
              value={metrics?.optimizationScore || defaultMetrics.optimizationScore} 
              change={metrics?.optimizationScoreChange || defaultMetrics.optimizationScoreChange} 
              icon="trending_up" 
              type="success"
              trendDirection="positive"
            />
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dependency Network */}
            <div className="lg:col-span-2">
              <DependencyNetwork 
                data={networkData || defaultNetwork} 
                onNodeClick={handleNodeClick} 
              />
            </div>
            
            {/* Right Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* AI Recommendations */}
              <RecommendationsPanel 
                recommendations={recommendations || []} 
                onViewDetails={handleViewRecommendation}
                onApplyRecommendation={handleApplyRecommendation}
              />
              
              {/* Cross-ART Dependencies */}
              <CrossARTDependencies 
                dependencies={crossArtDependencies || []} 
                onViewDependency={handleViewDependency}
                onViewAll={handleViewAllCrossArt}
              />
            </div>
          </div>
          
          {/* Dependency Analysis Tabs */}
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button 
                  className={`${selectedTab === 'analysis' ? 'border-primary text-primary border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'} py-4 px-6 text-sm font-medium`}
                  onClick={() => setSelectedTab('analysis')}
                >
                  Dependency Analysis
                </button>
                <button 
                  className={`${selectedTab === 'scenarios' ? 'border-primary text-primary border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'} py-4 px-6 text-sm font-medium`}
                  onClick={() => setSelectedTab('scenarios')}
                >
                  Optimization Scenarios
                </button>
                <button 
                  className={`${selectedTab === 'insights' ? 'border-primary text-primary border-b-2' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2'} py-4 px-6 text-sm font-medium`}
                  onClick={() => setSelectedTab('insights')}
                >
                  Scientific ML Insights
                </button>
              </nav>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h3 className="text-lg font-medium mb-2 sm:mb-0">Critical Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <span className="material-icons text-sm mr-1">file_download</span>
                    Export
                  </button>
                  <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none">
                    <span className="material-icons text-sm mr-1">play_arrow</span>
                    Run Optimization
                  </button>
                </div>
              </div>
              
              <DependencyTable 
                dependencies={criticalDependencies || []} 
                onViewDependency={handleViewDependency}
                onOptimizeDependency={handleOptimizeDependency}
              />
            </div>
          </div>
        </main>
      </div>
      
      {/* Dependency Modal */}
      <DependencyModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dependency={selectedDependency}
        riskAnalysis={riskAnalysis || null}
        onApplyOptimization={handleApplyOptimization}
      />
    </div>
  );
}
