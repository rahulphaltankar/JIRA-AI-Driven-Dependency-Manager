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
