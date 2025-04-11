import { pgTable, text, serial, integer, boolean, timestamp, json, uniqueIndex, jsonb, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jiraConfigs = pgTable("jira_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  jiraUrl: text("jira_url").notNull(),
  jiraToken: text("jira_token").notNull(),
  jiraEmail: text("jira_email").notNull(),
  jiraAlignUrl: text("jira_align_url"),
  jiraAlignToken: text("jira_align_token"),
  useOAuth: boolean("use_oauth").default(false),
  oauthClientId: text("oauth_client_id"),
  oauthSecret: text("oauth_secret"),
  confluenceUrl: text("confluence_url"),
  confluenceToken: text("confluence_token"),
  bitbucketUrl: text("bitbucket_url"),
  bitbucketToken: text("bitbucket_token"),
  trelloKey: text("trello_key"),
  trelloToken: text("trello_token"),
  webhookEnabled: boolean("webhook_enabled").default(false),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dependencies = pgTable("dependencies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sourceTeam: text("source_team").notNull(),
  sourceArt: text("source_art").notNull(),
  targetTeam: text("target_team").notNull(),
  targetArt: text("target_art").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("in-progress"),
  riskScore: integer("risk_score").default(0),
  jiraId: text("jira_id"),
  description: text("description"),
  isCrossArt: boolean("is_cross_art").default(false),
  isImplicit: boolean("is_implicit").default(false), // Detected via NLP
  complexity: integer("complexity").default(50), // 0-100 scale
  impactLevel: text("impact_level").default("medium"), // low, medium, high
  cycleTime: integer("cycle_time"), // In days
  blockerCount: integer("blocker_count").default(0),
  criticalPathPosition: integer("critical_path_position"), // Position in critical path (if applicable)
  networkCentrality: real("network_centrality"), // Graph metric for dependency importance
  sentimentScore: real("sentiment_score"), // From NLP analysis
  leadTimeImpact: integer("lead_time_impact").default(0), // Estimated impact on lead time in days
  embeddings: jsonb("embeddings"), // Vector embeddings for semantic search
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dependencyComments = pgTable("dependency_comments", {
  id: serial("id").primaryKey(),
  dependencyId: integer("dependency_id").references(() => dependencies.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  sentiment: text("sentiment"),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const optimizationRecommendations = pgTable("optimization_recommendations", {
  id: serial("id").primaryKey(),
  dependencyId: integer("dependency_id").references(() => dependencies.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull().default("medium"),
  riskReduction: integer("risk_reduction").default(0),
  implementationComplexity: text("implementation_complexity").default("medium"),
  isApplied: boolean("is_applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mlModels = pgTable("ml_models", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  modelType: text("model_type").notNull(),
  parameters: json("parameters"),
  trainingStatus: text("training_status").default("pending"),
  accuracy: integer("accuracy"),
  f1Score: real("f1_score"),
  physicsCompliance: real("physics_compliance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pinnModels = pgTable("pinn_models", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  modelType: text("model_type").notNull(), // brooks_law, critical_chain, dependency_propagation, team_dynamics
  equationType: text("equation_type").notNull(), // ode, pde
  equationFormula: text("equation_formula").notNull(),
  parameters: jsonb("parameters").notNull(),
  trainingData: jsonb("training_data"),
  trainingStatus: text("training_status").default("pending"),
  accuracy: real("accuracy"),
  physicsCompliance: real("physics_compliance"),
  physicsLoss: real("physics_loss"),
  dataLoss: real("data_loss"),
  boundaryLoss: real("boundary_loss"),
  totalLoss: real("total_loss"),
  physicsLossWeight: real("physics_loss_weight").default(0.5),
  dataLossWeight: real("data_loss_weight").default(0.3),
  boundaryLossWeight: real("boundary_loss_weight").default(0.2),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const simulationScenarios = pgTable("simulation_scenarios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  pinnModelId: integer("pinn_model_id").references(() => pinnModels.id),
  parameters: jsonb("parameters").notNull(),
  results: jsonb("results"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const causalAnalyses = pgTable("causal_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  dependencyId: integer("dependency_id").references(() => dependencies.id),
  rootCauses: jsonb("root_causes"),
  interventions: jsonb("interventions"),
  counterfactuals: jsonb("counterfactuals"),
  confidence: real("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaborative features
export const sharedSessions = pgTable("shared_sessions", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  analysisType: text("analysis_type").notNull(), // 'dependency', 'risk', 'causal'
  entityId: integer("entity_id"), // ID of the entity being analyzed
  sessionData: jsonb("session_data"),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessionParticipants = pgTable("session_participants", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sharedSessions.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  role: text("role").default("viewer"), // 'viewer', 'editor', 'admin'
});

export const sessionAnnotations = pgTable("session_annotations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sharedSessions.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  position: jsonb("position"), // coordinates or reference point in the visualization
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'dependency_change', 'risk_alert', 'recommendation', etc.
  referenceId: integer("reference_id"), // ID of the related entity
  referenceType: text("reference_type"), // Type of the related entity
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security and audit
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Integration with messaging platforms
export const integrationConnections = pgTable("integration_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  platform: text("platform").notNull(), // 'slack', 'teams', etc.
  connectionData: jsonb("connection_data"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertJiraConfigSchema = createInsertSchema(jiraConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertDependencySchema = createInsertSchema(dependencies).omit({
  id: true,
  createdAt: true,
});

export const insertOptimizationRecommendationSchema = createInsertSchema(optimizationRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertMlModelSchema = createInsertSchema(mlModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPinnModelSchema = createInsertSchema(pinnModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSimulationScenarioSchema = createInsertSchema(simulationScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertCausalAnalysisSchema = createInsertSchema(causalAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertDependencyCommentSchema = createInsertSchema(dependencyComments).omit({
  id: true,
  createdAt: true,
});

export const insertSharedSessionSchema = createInsertSchema(sharedSessions).omit({
  id: true,
  createdAt: true,
});

export const insertSessionParticipantSchema = createInsertSchema(sessionParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertSessionAnnotationSchema = createInsertSchema(sessionAnnotations).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertIntegrationConnectionSchema = createInsertSchema(integrationConnections).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type JiraConfig = typeof jiraConfigs.$inferSelect;
export type InsertJiraConfig = z.infer<typeof insertJiraConfigSchema>;

export type Dependency = typeof dependencies.$inferSelect;
export type InsertDependency = z.infer<typeof insertDependencySchema>;

export type OptimizationRecommendation = typeof optimizationRecommendations.$inferSelect;
export type InsertOptimizationRecommendation = z.infer<typeof insertOptimizationRecommendationSchema>;

export type MlModel = typeof mlModels.$inferSelect;
export type InsertMlModel = z.infer<typeof insertMlModelSchema>;

export type PinnModel = typeof pinnModels.$inferSelect;
export type InsertPinnModel = z.infer<typeof insertPinnModelSchema>;

export type SimulationScenario = typeof simulationScenarios.$inferSelect;
export type InsertSimulationScenario = z.infer<typeof insertSimulationScenarioSchema>;

export type CausalAnalysis = typeof causalAnalyses.$inferSelect;
export type InsertCausalAnalysis = z.infer<typeof insertCausalAnalysisSchema>;

export type DependencyComment = typeof dependencyComments.$inferSelect;
export type InsertDependencyComment = z.infer<typeof insertDependencyCommentSchema>;

export type SharedSession = typeof sharedSessions.$inferSelect;
export type InsertSharedSession = z.infer<typeof insertSharedSessionSchema>;

export type SessionParticipant = typeof sessionParticipants.$inferSelect;
export type InsertSessionParticipant = z.infer<typeof insertSessionParticipantSchema>;

export type SessionAnnotation = typeof sessionAnnotations.$inferSelect;
export type InsertSessionAnnotation = z.infer<typeof insertSessionAnnotationSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type IntegrationConnection = typeof integrationConnections.$inferSelect;
export type InsertIntegrationConnection = z.infer<typeof insertIntegrationConnectionSchema>;
