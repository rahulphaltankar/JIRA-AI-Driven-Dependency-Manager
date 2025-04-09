import { Recommendation } from "@shared/types";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onViewDetails: (id: number) => void;
  onApplyRecommendation: (id: number) => void;
}

export default function RecommendationsPanel({ 
  recommendations, 
  onViewDetails, 
  onApplyRecommendation 
}: RecommendationsPanelProps) {
  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-error';
      case 'medium':
        return 'border-warning';
      case 'low':
        return 'border-info';
      default:
        return 'border-info';
    }
  };
  
  const getButtonText = (type: string) => {
    switch (type) {
      case 'cycle':
        return 'Apply Recommendation';
      case 'team-pairing':
        return 'Schedule Session';
      case 'critical-path':
        return 'Optimize Sequence';
      default:
        return 'Apply Recommendation';
    }
  };
  
  const getViewButtonText = (type: string) => {
    switch (type) {
      case 'cycle':
        return 'View Details';
      case 'team-pairing':
        return 'View Details';
      case 'critical-path':
        return 'View Critical Path';
      default:
        return 'View Details';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">AI Recommendations</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No recommendations available at this time
            </div>
          ) : (
            recommendations.map((recommendation) => (
              <div 
                key={recommendation.id} 
                className={`border-l-4 ${getBorderColor(recommendation.severity)} pl-3 py-2`}
              >
                <h3 className="font-medium">{recommendation.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                <div className="mt-2">
                  <button 
                    className="text-primary text-sm font-medium hover:text-primary-dark focus:outline-none"
                    onClick={() => onViewDetails(recommendation.id)}
                  >
                    {getViewButtonText(recommendation.type)}
                  </button>
                  <button 
                    className="ml-4 text-primary text-sm font-medium hover:text-primary-dark focus:outline-none"
                    onClick={() => onApplyRecommendation(recommendation.id)}
                  >
                    {getButtonText(recommendation.type)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
