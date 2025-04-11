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
  averageCycleTime?: number;
  cycleTimeChange?: string;
  networkDensity?: number;
  networkDensityChange?: string;
  implicitDependencies?: number;
  criticalPathLength?: number;
  deliveryRiskIndex?: number;
  conwayCompliance?: number;
}

export interface DependencyNode {
  id: string;
  name: string;
  group: number;
  type: 'team' | 'epic' | 'feature' | 'component' | 'service';
  status?: 'completed' | 'in-progress' | 'at-risk' | 'blocked';
  size?: number; // Size of the node for visualization
  centrality?: number; // Network centrality metric
  velocity?: number; // Team velocity
  capacity?: number; // Team capacity
  isOnCriticalPath?: boolean;
  clusterGroup?: string; // Used for community detection algorithms
  leadTime?: number; // Lead time in days
  cycleTime?: number; // Cycle time in days
  metadata?: Record<string, any>; // Additional metadata
  position?: { x: number; y: number }; // Fixed position if needed
}

export interface DependencyLink {
  source: string;
  target: string;
  value: number;
  type?: 'blocks' | 'implements' | 'relates' | 'depends-on' | 'implicit' | 'predicted';
  strength?: number; // 0-1 for relationship strength
  isOnCriticalPath?: boolean;
  riskScore?: number;
  leadTimeImpact?: number;
  metadata?: Record<string, any>; // Additional metadata
  isArtificial?: boolean; // For showing hypothetical scenarios
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
  useOAuth?: boolean;
  oauthClientId?: string;
  oauthSecret?: string;
  confluenceUrl?: string;
  confluenceToken?: string;
  bitbucketUrl?: string;
  bitbucketToken?: string;
  trelloKey?: string;
  trelloToken?: string;
  webhookEnabled?: boolean;
  webhookUrl?: string;
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
