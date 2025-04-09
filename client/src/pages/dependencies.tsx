import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DependencyTable from "@/components/dashboard/DependencyTable";
import DependencyModal from "@/components/modals/DependencyModal";
import { useToast } from "@/hooks/use-toast";
import { Dependency } from "@shared/schema";
import { RiskAnalysis } from "@shared/types";

export default function Dependencies() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<Dependency | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all dependencies
  const { data: dependencies, isLoading } = useQuery<Dependency[]>({
    queryKey: ['/api/dependencies'],
  });

  const { data: riskAnalysis, isLoading: riskAnalysisLoading } = useQuery<RiskAnalysis>({
    queryKey: ['/api/dependencies/risk-analysis', selectedDependency?.id],
    enabled: !!selectedDependency,
  });

  // Handle dependency actions
  const handleViewDependency = (id: number) => {
    const dependency = dependencies?.find(d => d.id === id) || null;
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dependencies Management" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium">All Dependencies</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <span className="material-icons text-sm mr-1">filter_list</span>
                  Filter
                </button>
                <button className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none">
                  <span className="material-icons text-sm mr-1">add</span>
                  New Dependency
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-6">Loading dependencies...</div>
              ) : (
                <DependencyTable 
                  dependencies={dependencies || []} 
                  onViewDependency={handleViewDependency}
                  onOptimizeDependency={handleOptimizeDependency}
                />
              )}
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
