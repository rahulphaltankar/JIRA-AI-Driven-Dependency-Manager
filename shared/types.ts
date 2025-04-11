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
  rootCauses?: string[];
  mitigationOptions?: Array<{
    title: string;
    description: string;
    impact: number;
    feasibility: number;
  }>;
  probabilityDistribution?: Array<{
    date: string;
    probability: number;
  }>;
  criticalPathImpact?: number;
  confidenceScore?: number;
}

export interface OptimizationScenario {
  id: number;
  name: string;
  description: string;
  riskReduction: number;
  timelineReduction: number;
  complexityScore: number;
  modelType?: string;
  parameters?: Record<string, any>;
  results?: SimulationResults;
  appliedConstraints?: string[];
  teamReallocation?: Record<string, number>;
  dependencyChanges?: Array<{
    id: number;
    action: 'add' | 'remove' | 'modify';
    details: Record<string, any>;
  }>;
}

export interface DifferentialEquationModel {
  type: 'ODE' | 'PDE';
  name: string;
  formula: string;
  parameters: Record<string, number>;
  initialConditions: Record<string, number>;
  boundaryConditions?: Record<string, any>;
  timeRange?: [number, number];
  stepSize?: number;
}

export interface BrooksLawModel extends DifferentialEquationModel {
  productivityDecayFactor: number;
  trainingOverhead: number;
  nominalProductivity: number;
  teamSize: number;
}

export interface CriticalChainModel extends DifferentialEquationModel {
  bufferSizeImpact: number;
  resourceConstraintFactor: number;
  multitaskingPenalty: number;
  studentSyndromeFactor: number;
}

export interface SimulationResults {
  trajectories: Array<{
    variable: string;
    values: number[];
    timePoints: number[];
  }>;
  statistics: {
    mean: Record<string, number>;
    variance: Record<string, number>;
    quantiles: Record<string, number[]>;
  };
  convergence: {
    status: 'converged' | 'diverged' | 'oscillating';
    iterations: number;
    residualError: number;
  };
}

export interface PhysicsInformedLoss {
  dataLoss: number;
  physicsLoss: number;
  boundaryLoss: number;
  totalLoss: number;
  gradients?: Record<string, number[]>;
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
  f1Score?: number;
  physicsCompliance?: number;
  trainingTime?: number;
  epochCount?: number;
  lossHistory?: Array<{
    epoch: number;
    trainingLoss: number;
    validationLoss: number;
    physicsLoss?: number;
  }>;
  hyperparameters?: Record<string, any>;
  architecture?: Array<{
    layerType: string;
    units?: number;
    activation?: string;
    dropout?: number;
  }>;
  featureImportance?: Record<string, number>;
}

export interface PinnConfig extends MlConfig {
  equationType: 'ODE' | 'PDE';
  equationFormula: string;
  boundaryConditions: Record<string, any>;
  initialConditions: Record<string, any>;
  domainConstraints: Record<string, [number, number]>;
  physicsLossWeight: number;
  dataLossWeight: number;
  boundaryLossWeight: number;
}

export interface NlpConfig extends MlConfig {
  vectorDimension: number;
  vocabularySize: number;
  contextWindow: number;
  sentimentAnalysis: boolean;
  entityRecognition: boolean;
  dependencyExtraction: boolean;
  maxSequenceLength: number;
}

export interface WebSocketMessage {
  type: 'dependencyUpdate' | 'recommendationUpdate' | 'modelTrainingUpdate' | 'simulationProgress' | 'collaborationUpdate' | 'systemAlert' | 'integrationEvent';
  data: any;
  timestamp: string;
  userId?: number;
  sessionId?: number;
}

export interface CollaborationSession {
  id: number;
  name: string;
  creator: {
    id: number;
    username: string;
  };
  participants: Array<{
    id: number;
    username: string;
    role: 'viewer' | 'editor' | 'admin';
    joinedAt: string;
  }>;
  analysisType: string;
  entity: {
    id: number;
    type: string;
    name: string;
  };
  annotations: Array<{
    id: number;
    content: string;
    position: Record<string, any>;
    author: {
      id: number;
      username: string;
    };
    createdAt: string;
  }>;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
