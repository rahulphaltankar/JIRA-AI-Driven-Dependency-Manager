import { CrossArtDependency } from "@shared/types";

interface CrossARTDependenciesProps {
  dependencies: CrossArtDependency[];
  onViewDependency: (id: number) => void;
  onViewAll: () => void;
}

export default function CrossARTDependencies({ 
  dependencies, 
  onViewDependency, 
  onViewAll 
}: CrossARTDependenciesProps) {
  const getIconColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk':
        return 'text-warning';
      case 'Medium':
        return 'text-info';
      case 'Low Risk':
        return 'text-success';
      default:
        return 'text-info';
    }
  };
  
  const getBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High Risk':
        return 'bg-warning text-white';
      case 'Medium':
        return 'bg-info text-white';
      case 'Low Risk':
        return 'bg-success text-white';
      default:
        return 'bg-info text-white';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Cross-ART Dependencies</h2>
      </div>
      <div className="p-4">
        {dependencies.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No cross-ART dependencies found
          </div>
        ) : (
          <div className="space-y-3">
            {dependencies.map((dependency) => (
              <div 
                key={dependency.id}
                className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => onViewDependency(dependency.id)}
              >
                <div className="flex-shrink-0">
                  <span className={`material-icons ${getIconColor(dependency.riskLevel)}`}>
                    account_tree
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{dependency.title}</span>
                    <span className={`text-xs ${getBadgeColor(dependency.riskLevel)} px-2 py-0.5 rounded-full`}>
                      {dependency.riskLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dependency.sourceArt} → {dependency.targetArt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md focus:outline-none"
          onClick={onViewAll}
        >
          View All Cross-ART Dependencies
        </button>
      </div>
    </div>
  );
}
