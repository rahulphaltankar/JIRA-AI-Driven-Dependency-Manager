import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function UserGuide() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>("overview");

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setActiveTopic(id);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="User Guide" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">JIRA-PINN Dependency Optimizer Guide</h1>
              <p className="text-gray-600 mb-6">
                Welcome to the JIRA-PINN Dependency Optimizer user guide. This document will help you understand 
                how to use the application to optimize your project dependencies and improve team collaboration.
              </p>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Navigation sidebar */}
                <div className="md:w-64 space-y-1 flex-shrink-0">
                  <div className="font-medium text-gray-900 mb-2">Quick Navigation</div>
                  <button 
                    onClick={() => scrollToSection("overview")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "overview" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => scrollToSection("dashboard")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "dashboard" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => scrollToSection("dependencies")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "dependencies" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Managing Dependencies
                  </button>
                  <button 
                    onClick={() => scrollToSection("analytics")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "analytics" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Analytics
                  </button>
                  <button 
                    onClick={() => scrollToSection("optimization")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "optimization" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Optimization
                  </button>
                  <button 
                    onClick={() => scrollToSection("integration")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "integration" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Jira Integration
                  </button>
                  <button 
                    onClick={() => scrollToSection("ml-config")}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${activeTopic === "ml-config" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    ML Configuration
                  </button>
                </div>
                
                {/* Guide content */}
                <div className="flex-1 space-y-8">
                  <section id="overview" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Overview</h2>
                    <p className="mb-3">
                      JIRA-PINN is an advanced dependency management tool that leverages Scientific Machine Learning and Physics-Informed Neural Networks to optimize dependencies in Jira and Jira Align.
                    </p>
                    <p className="mb-3">
                      Key features include:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>Real-time dependency visualization</li>
                      <li>AI-powered optimization recommendations</li>
                      <li>Risk analysis using UDEs (Universal Differential Equations)</li>
                      <li>Cross-ART dependency management</li>
                      <li>Integration with Jira and Jira Align</li>
                    </ul>
                    <p>
                      This tool is designed to help Agile teams, Release Train Engineers, and Product Managers 
                      to identify, manage, and optimize dependencies across their organization.
                    </p>
                  </section>
                  
                  <section id="dashboard" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Dashboard</h2>
                    <p className="mb-3">
                      The Dashboard provides a comprehensive overview of all dependencies in your organization.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Components:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>Status Cards</strong>: Shows metrics for total dependencies, at-risk dependencies, 
                        blocked work items, and overall optimization score.
                      </li>
                      <li>
                        <strong>Dependency Network</strong>: Interactive visualization of teams, epics, and their dependencies. 
                        Nodes are color-coded by status (completed, in-progress, at-risk, blocked).
                      </li>
                      <li>
                        <strong>AI Recommendations</strong>: Automatically generated suggestions to optimize dependencies 
                        based on machine learning analysis.
                      </li>
                      <li>
                        <strong>Cross-ART Dependencies</strong>: Lists dependencies that span across Agile Release Trains.
                      </li>
                      <li>
                        <strong>Critical Dependencies</strong>: Table of high-risk dependencies that require immediate attention.
                      </li>
                    </ul>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-600 italic">
                        <strong>Tip:</strong> Click on any node in the Dependency Network to view its details or click 
                        on the "View Details" button in the Critical Dependencies table.
                      </p>
                    </div>
                  </section>
                  
                  <section id="dependencies" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Managing Dependencies</h2>
                    <p className="mb-3">
                      The Dependencies page allows you to view, add, edit, and manage all dependencies in your organization.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Actions:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>View Dependencies</strong>: Browse all dependencies with detailed information including 
                        source and target teams, status, and risk score.
                      </li>
                      <li>
                        <strong>Add New Dependency</strong>: Manually create a new dependency by specifying source and target teams, 
                        due date, and other relevant information.
                      </li>
                      <li>
                        <strong>Edit Dependency</strong>: Update dependency details such as status, due date, or description.
                      </li>
                      <li>
                        <strong>Delete Dependency</strong>: Remove dependencies that are no longer relevant.
                      </li>
                      <li>
                        <strong>Optimize Dependency</strong>: Run optimization algorithms on a specific dependency to 
                        reduce its risk and impact.
                      </li>
                    </ul>
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Changes to dependencies will affect the risk calculations and network visualization. 
                        Always review the impact of changes before applying them.
                      </p>
                    </div>
                  </section>
                  
                  <section id="analytics" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Analytics</h2>
                    <p className="mb-3">
                      The Analytics page provides advanced insights into dependency patterns and risks using 
                      Scientific Machine Learning techniques.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Features:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>Advanced Dependency Analysis</strong>: Uses network analysis algorithms to 
                        identify critical paths, bottlenecks, and risk factors.
                      </li>
                      <li>
                        <strong>Network Statistics</strong>: Metrics such as network density, clustering coefficient, 
                        and centrality distribution to understand dependency complexity.
                      </li>
                      <li>
                        <strong>SciML Insights</strong>: Machine learning-generated insights highlighting 
                        high dependency nodes, potential cycles, and critical path bottlenecks.
                      </li>
                      <li>
                        <strong>Trend Analysis</strong>: Historical data visualization to track dependency 
                        patterns over time.
                      </li>
                    </ul>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Pro Tip:</strong> Use the network visualization filters to focus on specific teams 
                        or dependency types for more targeted analysis.
                      </p>
                    </div>
                  </section>
                  
                  <section id="optimization" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Optimization</h2>
                    <p className="mb-3">
                      The Optimization page provides tools to improve dependency management and reduce risks 
                      using scientific optimization algorithms.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Features:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>Optimization Scenarios</strong>: Generate different optimization scenarios 
                        with varying levels of risk reduction and implementation complexity.
                      </li>
                      <li>
                        <strong>Risk Simulation</strong>: Simulate the impact of changes before applying them 
                        to real dependencies.
                      </li>
                      <li>
                        <strong>Optimization History</strong>: Track all optimization actions and their results 
                        over time.
                      </li>
                      <li>
                        <strong>Batch Optimization</strong>: Apply optimization algorithms to multiple 
                        dependencies simultaneously.
                      </li>
                    </ul>
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <p className="text-sm text-green-800">
                        <strong>Best Practice:</strong> Review optimization scenarios with stakeholders before 
                        applying them to ensure all perspectives are considered.
                      </p>
                    </div>
                  </section>
                  
                  <section id="integration" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Jira Integration</h2>
                    <p className="mb-3">
                      The Integrations page allows you to connect JIRA-PINN with Jira and Jira Align 
                      to import and synchronize dependency data.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Features:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>Jira Connection Setup</strong>: Configure connection to Jira and Jira Align instances.
                      </li>
                      <li>
                        <strong>Dependency Import</strong>: Import dependencies from Jira issues and issue links.
                      </li>
                      <li>
                        <strong>Cross-ART Dependency Import</strong>: Import dependencies that span multiple ARTs from Jira Align.
                      </li>
                      <li>
                        <strong>Synchronization Settings</strong>: Configure automatic or manual synchronization options.
                      </li>
                      <li>
                        <strong>Mapping Configuration</strong>: Map Jira and Jira Align fields to JIRA-PINN dependency attributes.
                      </li>
                    </ul>
                    <div className="bg-red-50 p-3 rounded-md border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Important:</strong> Jira API credentials are required for integration. These should be 
                        obtained from your Jira administrator.
                      </p>
                    </div>
                  </section>
                  
                  <section id="ml-config" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">ML Configuration</h2>
                    <p className="mb-3">
                      The ML Configuration page allows you to customize the machine learning models used for dependency analysis and optimization.
                    </p>
                    <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Key Features:</h3>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>Model Selection</strong>: Choose between different machine learning models, including UDEs (Universal Differential Equations), PINNs (Physics-Informed Neural Networks), and traditional ML approaches.
                      </li>
                      <li>
                        <strong>Parameter Tuning</strong>: Adjust model hyperparameters to optimize performance for your specific dependency network.
                      </li>
                      <li>
                        <strong>Model Training</strong>: Train models on your dependency data to improve accuracy and recommendations.
                      </li>
                      <li>
                        <strong>Model Evaluation</strong>: View model performance metrics and compare different model configurations.
                      </li>
                      <li>
                        <strong>Advanced Settings</strong>: Configure advanced parameters for scientific machine learning algorithms.
                      </li>
                    </ul>
                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                      <p className="text-sm text-purple-800">
                        <strong>Advanced User Tip:</strong> For optimal results, use UDEs for complex dependency networks with time-dependent behaviors, and PINNs for networks with known physical or organizational constraints.
                      </p>
                    </div>
                  </section>
                  
                  <section id="faq" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900">What is JIRA-PINN?</h3>
                        <p className="text-gray-600">
                          JIRA-PINN is a dependency optimization tool that uses Scientific Machine Learning and Physics-Informed Neural Networks to help teams manage and optimize dependencies in Jira and Jira Align.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">How does JIRA-PINN calculate risk scores?</h3>
                        <p className="text-gray-600">
                          Risk scores are calculated using a combination of factors including dependency complexity, team capacity, historical performance, and due date proximity. The exact calculation is performed by the UDE models that combine physical constraints with neural network insights.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Can I use JIRA-PINN without Jira Align?</h3>
                        <p className="text-gray-600">
                          Yes, JIRA-PINN works with standard Jira for dependency management. Jira Align integration provides additional features for cross-ART dependencies and portfolio-level insights.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">How often should I run optimization?</h3>
                        <p className="text-gray-600">
                          We recommend running optimization at least once per sprint or whenever significant changes occur in your dependency network.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Does JIRA-PINN automatically apply recommendations?</h3>
                        <p className="text-gray-600">
                          No, all recommendations must be reviewed and approved by users before they are applied. JIRA-PINN provides the insights, but humans make the final decisions.
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  <section id="support" className="scroll-mt-20">
                    <h2 className="text-xl font-semibold mb-3 text-gray-900 border-b pb-2">Getting Support</h2>
                    <p className="mb-3">
                      If you need additional help or have questions about JIRA-PINN, there are several support options available:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 mb-3">
                      <li>
                        <strong>In-App Help</strong>: Click the Help icon in the top-right corner of any page for contextual help.
                      </li>
                      <li>
                        <strong>Documentation</strong>: Visit our comprehensive documentation portal for detailed guides and tutorials.
                      </li>
                      <li>
                        <strong>Support Tickets</strong>: Submit a support ticket through the Settings page for technical issues.
                      </li>
                      <li>
                        <strong>Training</strong>: Request a training session for your team to get the most out of JIRA-PINN.
                      </li>
                    </ul>
                    <p className="text-gray-600">
                      For urgent issues, please contact our support team at support@jira-pinn.com or call our support hotline at +1-888-JIRA-PINN.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}