// Shared types between frontend and backend

export interface DependencyMetrics {
  totalDependencies: number;
  totalDependenciesChange: string;
  atRiskDependencies: number;
  atRiskDependenciesChange: string;
  blockedWorkItems: number;
  blockedItemsChange: string;
  optimizationScore: string;
  optimizationScoreChange: string;
}

export interface DependencyNode {
  id: string;
  name: string;
  group: number;
  type: 'team' | 'epic';
  status?: 'completed' | 'in-progress' | 'at-risk' | 'blocked';
}

export interface DependencyLink {
  source: string;
  target: string;
  value: number;
}

export interface DependencyNetwork {
  nodes: DependencyNode[];
  links: DependencyLink[];
}

export interface Recommendation {
  id: number;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  dependencyId?: number;
}

export interface CrossArtDependency {
  id: number;
  title: string;
  sourceArt: string;
  targetArt: string;
  riskLevel: 'Low Risk' | 'Medium' | 'High Risk';
  status: 'completed' | 'in-progress' | 'at-risk' | 'blocked';
}

export interface RiskAnalysis {
  riskFactors: string[];
  recommendations: string[];
}

export interface OptimizationScenario {
  id: number;
  name: string;
  description: string;
  riskReduction: number;
  timelineReduction: number;
  complexityScore: number;
}

export interface JiraConfig {
  jiraUrl: string;
  jiraEmail: string;
  jiraToken: string;
  jiraAlignUrl?: string;
  jiraAlignToken?: string;
}

export interface MlConfig {
  modelType: string;
  parameters: Record<string, any>;
  trainingStatus: string;
  accuracy?: number;
}

export interface WebSocketMessage {
  type: 'dependencyUpdate' | 'recommendationUpdate' | 'modelTrainingUpdate';
  data: any;
}
