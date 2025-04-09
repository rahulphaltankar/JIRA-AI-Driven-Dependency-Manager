import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dependency } from "@shared/schema";
import { RiskAnalysis } from "@shared/types";

interface DependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  dependency: Dependency | null;
  riskAnalysis: RiskAnalysis | null;
  onApplyOptimization: (id: number) => void;
}

export default function DependencyModal({
  isOpen,
  onClose,
  dependency,
  riskAnalysis,
  onApplyOptimization
}: DependencyModalProps) {
  if (!dependency) return null;
  
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
      return ` (${Math.abs(diffDays)} days overdue)`;
    } else {
      return ` (${diffDays} days remaining)`;
    }
  };
  
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-warning bg-opacity-20 sm:mx-0 sm:h-10 sm:w-10">
              <span className="material-icons text-warning">warning</span>
            </div>
            <DialogTitle className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              {dependency.title} ({dependency.jiraId || 'No JIRA ID'})
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source Team
            </div>
            <p className="mt-1 text-sm text-gray-900">{dependency.sourceTeam} ({dependency.sourceArt})</p>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target Team
            </div>
            <p className="mt-1 text-sm text-gray-900">{dependency.targetTeam} ({dependency.targetArt})</p>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </div>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(dependency.dueDate)}
              {dependency.dueDate && getDaysRemaining(dependency.dueDate)}
            </p>
          </div>
          
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </div>
            <p className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(dependency.status)}`}>
                {dependency.status.charAt(0).toUpperCase() + dependency.status.slice(1)}
              </span>
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Description
          </div>
          <p className="mt-1 text-sm text-gray-900">
            {dependency.description || 'No description provided'}
          </p>
        </div>
        
        {riskAnalysis && (
          <div className="mt-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              SciML Risk Analysis
            </div>
            <div className="mt-2 bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700">Risk Factors</h4>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {riskAnalysis.riskFactors.map((factor, index) => (
                  <li key={index}>{factor}</li>
                ))}
              </ul>
              
              <h4 className="mt-3 text-sm font-medium text-gray-700">Optimization Recommendations</h4>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {riskAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="default" 
            onClick={() => dependency.id && onApplyOptimization(dependency.id)}
          >
            Apply Optimization
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
