import { Dependency } from "@shared/schema";

interface DependencyTableProps {
  dependencies: Dependency[];
  onViewDependency: (id: number) => void;
  onOptimizeDependency: (id: number) => void;
}

export default function DependencyTable({ 
  dependencies, 
  onViewDependency, 
  onOptimizeDependency 
}: DependencyTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success bg-opacity-10 text-success';
      case 'in-progress':
        return 'bg-info bg-opacity-10 text-info';
      case 'at-risk':
        return 'bg-warning bg-opacity-10 text-warning';
      case 'blocked':
        return 'bg-error bg-opacity-10 text-error';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'bg-error';
    if (riskScore >= 40) return 'bg-warning';
    return 'bg-info';
  };
  
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Not set';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const getDaysRemaining = (dueDate: Date | string | null | undefined) => {
    if (!dueDate) return '';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-xs text-error">{Math.abs(diffDays)} days overdue</span>;
    } else if (diffDays < 7) {
      return <span className="text-xs text-warning">{diffDays} days remaining</span>;
    } else {
      return <span className="text-xs text-success">{diffDays} days remaining</span>;
    }
  };
  
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Risk Score
            </th>
            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dependencies.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                No dependencies found
              </td>
            </tr>
          ) : (
            dependencies.map((dependency) => (
              <tr key={dependency.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="material-icons text-secondary">task_alt</span>
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          onViewDependency(dependency.id);
                        }} className="hover:text-primary">
                          {dependency.title}
                        </a>
                      </div>
                      <div className="text-xs text-gray-500">{dependency.jiraId || 'No JIRA ID'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dependency.sourceTeam}</div>
                  <div className="text-xs text-gray-500">{dependency.sourceArt}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dependency.targetTeam}</div>
                  <div className="text-xs text-gray-500">{dependency.targetArt}</div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(dependency.dueDate)}</div>
                  {getDaysRemaining(dependency.dueDate)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(dependency.status)}`}>
                    {dependency.status.charAt(0).toUpperCase() + dependency.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2.5">
                      <div className={`${getRiskColor(dependency.riskScore)} h-2.5 rounded-full`} style={{ width: `${dependency.riskScore}%` }}></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{dependency.riskScore}%</span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    className="text-primary hover:text-primary-dark mr-3 font-medium"
                    onClick={() => onViewDependency(dependency.id)}
                  >
                    View Details
                  </button>
                  <button 
                    className="text-primary hover:text-primary-dark font-medium"
                    onClick={() => onOptimizeDependency(dependency.id)}
                  >
                    Optimize
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
