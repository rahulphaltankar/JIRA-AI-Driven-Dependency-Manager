import { users, type User, type InsertUser, dependencies, type Dependency, type InsertDependency, jiraConfigs, type JiraConfig, type InsertJiraConfig, optimizationRecommendations, type OptimizationRecommendation, type InsertOptimizationRecommendation, mlModels, type MlModel, type InsertMlModel, notifications, type Notification, type InsertNotification } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface definition for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dependency operations
  getDependency(id: number): Promise<Dependency | undefined>;
  getDependencies(): Promise<Dependency[]>;
  getCriticalDependencies(): Promise<Dependency[]>;
  getCrossArtDependencies(): Promise<Dependency[]>;
  createDependency(dependency: InsertDependency): Promise<Dependency>;
  updateDependency(id: number, dependency: Partial<InsertDependency>): Promise<Dependency | undefined>;
  deleteDependency(id: number): Promise<boolean>;
  
  // Jira config operations
  getJiraConfig(): Promise<JiraConfig | undefined>;
  saveJiraConfig(config: InsertJiraConfig): Promise<JiraConfig>;
  
  // Recommendation operations
  getRecommendations(): Promise<OptimizationRecommendation[]>;
  getRecommendationsByDependency(dependencyId: number): Promise<OptimizationRecommendation[]>;
  createRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation>;
  applyRecommendation(id: number): Promise<OptimizationRecommendation | undefined>;
  
  // ML model operations
  getMlModels(): Promise<MlModel[]>;
  getMlModel(id: number): Promise<MlModel | undefined>;
  createMlModel(model: InsertMlModel): Promise<MlModel>;
  updateMlModel(id: number, model: Partial<InsertMlModel>): Promise<MlModel | undefined>;
  
  // Notification operations
  getNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }
  
  // Dependency operations
  async getDependency(id: number): Promise<Dependency | undefined> {
    const [dependency] = await db.select().from(dependencies).where(eq(dependencies.id, id));
    return dependency;
  }
  
  async getDependencies(): Promise<Dependency[]> {
    return await db.select().from(dependencies);
  }
  
  async getCriticalDependencies(): Promise<Dependency[]> {
    return await db.select()
      .from(dependencies)
      .where(
        eq(dependencies.status, 'at-risk')
      )
      .orderBy(dependencies.riskScore);
  }
  
  async getCrossArtDependencies(): Promise<Dependency[]> {
    return await db.select()
      .from(dependencies)
      .where(eq(dependencies.isCrossArt, true));
  }
  
  async createDependency(dependency: InsertDependency): Promise<Dependency> {
    const [newDependency] = await db
      .insert(dependencies)
      .values(dependency)
      .returning();
    return newDependency;
  }
  
  async updateDependency(id: number, dependency: Partial<InsertDependency>): Promise<Dependency | undefined> {
    const [updatedDependency] = await db
      .update(dependencies)
      .set(dependency)
      .where(eq(dependencies.id, id))
      .returning();
    return updatedDependency;
  }
  
  async deleteDependency(id: number): Promise<boolean> {
    const [deletedDependency] = await db
      .delete(dependencies)
      .where(eq(dependencies.id, id))
      .returning();
    return !!deletedDependency;
  }
  
  // Jira config operations
  async getJiraConfig(): Promise<JiraConfig | undefined> {
    const [config] = await db.select().from(jiraConfigs);
    return config;
  }
  
  async saveJiraConfig(config: InsertJiraConfig): Promise<JiraConfig> {
    const existingConfig = await this.getJiraConfig();
    
    if (existingConfig) {
      const [updatedConfig] = await db
        .update(jiraConfigs)
        .set(config)
        .where(eq(jiraConfigs.id, existingConfig.id))
        .returning();
      return updatedConfig;
    } else {
      const [newConfig] = await db
        .insert(jiraConfigs)
        .values(config)
        .returning();
      return newConfig;
    }
  }
  
  // Recommendation operations
  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    return await db.select().from(optimizationRecommendations);
  }
  
  async getRecommendationsByDependency(dependencyId: number): Promise<OptimizationRecommendation[]> {
    return await db
      .select()
      .from(optimizationRecommendations)
      .where(eq(optimizationRecommendations.dependencyId, dependencyId));
  }
  
  async createRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation> {
    const [newRecommendation] = await db
      .insert(optimizationRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }
  
  async applyRecommendation(id: number): Promise<OptimizationRecommendation | undefined> {
    const [updatedRecommendation] = await db
      .update(optimizationRecommendations)
      .set({ isApplied: true })
      .where(eq(optimizationRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }
  
  // ML model operations
  async getMlModels(): Promise<MlModel[]> {
    return await db.select().from(mlModels);
  }
  
  async getMlModel(id: number): Promise<MlModel | undefined> {
    const [model] = await db.select().from(mlModels).where(eq(mlModels.id, id));
    return model;
  }
  
  async createMlModel(model: InsertMlModel): Promise<MlModel> {
    const [newModel] = await db
      .insert(mlModels)
      .values(model)
      .returning();
    return newModel;
  }
  
  async updateMlModel(id: number, model: Partial<InsertMlModel>): Promise<MlModel | undefined> {
    const [updatedModel] = await db
      .update(mlModels)
      .set(model)
      .where(eq(mlModels.id, id))
      .returning();
    return updatedModel;
  }
}

// For fallback when no database is available
export class MemStorage implements IStorage {
  private users = new Map<number, User>();
  private dependencies = new Map<number, Dependency>();
  private jiraConfig: JiraConfig | undefined;
  private recommendations = new Map<number, OptimizationRecommendation>();
  private mlModels = new Map<number, MlModel>();
  
  private userCurrentId = 1;
  private dependencyCurrentId = 1;
  private recommendationCurrentId = 1;
  private mlModelCurrentId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create demo user
    this.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
      fullName: "Admin User",
      role: "admin"
    });
    
    // Create sample dependencies
    const sampleDependencies: InsertDependency[] = [
      {
        title: "Authentication API Updates",
        sourceTeam: "Security Team",
        sourceArt: "Security ART",
        targetTeam: "Mobile Team",
        targetArt: "Customer ART",
        dueDate: new Date("2023-06-15"),
        status: "blocked",
        riskScore: 85,
        jiraId: "JIRA-2345",
        description: "Mobile application requires updated authentication API to support new biometric authentication features",
        isCrossArt: true
      },
      {
        title: "Database Schema Migration",
        sourceTeam: "Data Team",
        sourceArt: "Platform ART",
        targetTeam: "Checkout Team",
        targetArt: "E-Commerce ART",
        dueDate: new Date("2023-06-22"),
        status: "at-risk",
        riskScore: 72,
        jiraId: "JIRA-1892",
        description: "Database schema changes needed for new product catalog features",
        isCrossArt: true
      },
      {
        title: "User Profile API",
        sourceTeam: "Backend Team",
        sourceArt: "Platform ART",
        targetTeam: "Frontend Team",
        targetArt: "Customer ART",
        dueDate: new Date("2023-06-30"),
        status: "in-progress",
        riskScore: 45,
        jiraId: "JIRA-2103",
        description: "New user profile API needed for account management features",
        isCrossArt: true
      }
    ];
    
    sampleDependencies.forEach(dep => this.createDependency(dep));
    
    // Create sample recommendations
    const sampleRecommendations: InsertOptimizationRecommendation[] = [
      {
        dependencyId: 1,
        type: "cycle",
        title: "Dependency Cycle Detected",
        description: "Epic \"Payment Gateway Integration\" has a circular dependency with \"User Authentication Flow\".",
        severity: "high",
        riskReduction: 30,
        implementationComplexity: "medium",
        isApplied: false
      },
      {
        dependencyId: 2,
        type: "team-pairing",
        title: "Team Pairing Opportunity",
        description: "Team Alpha and Team Omega have 5 interdependent tasks. Consider joint session.",
        severity: "medium",
        riskReduction: 20,
        implementationComplexity: "low",
        isApplied: false
      },
      {
        dependencyId: 3,
        type: "critical-path",
        title: "Critical Path Risk",
        description: "3 high-risk dependencies on the critical path for \"Customer Portal\" release.",
        severity: "high",
        riskReduction: 40,
        implementationComplexity: "high",
        isApplied: false
      }
    ];
    
    sampleRecommendations.forEach(rec => this.createRecommendation(rec));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Dependency operations
  async getDependency(id: number): Promise<Dependency | undefined> {
    return this.dependencies.get(id);
  }
  
  async getDependencies(): Promise<Dependency[]> {
    return Array.from(this.dependencies.values());
  }
  
  async getCriticalDependencies(): Promise<Dependency[]> {
    return Array.from(this.dependencies.values())
      .filter(dep => dep.status === 'at-risk' || dep.status === 'blocked')
      .sort((a, b) => b.riskScore - a.riskScore);
  }
  
  async getCrossArtDependencies(): Promise<Dependency[]> {
    return Array.from(this.dependencies.values())
      .filter(dep => dep.isCrossArt);
  }
  
  async createDependency(dependency: InsertDependency): Promise<Dependency> {
    const id = this.dependencyCurrentId++;
    const newDependency: Dependency = { 
      ...dependency, 
      id, 
      createdAt: new Date() 
    };
    this.dependencies.set(id, newDependency);
    return newDependency;
  }
  
  async updateDependency(id: number, dependency: Partial<InsertDependency>): Promise<Dependency | undefined> {
    const existingDependency = this.dependencies.get(id);
    if (!existingDependency) return undefined;
    
    const updatedDependency: Dependency = { 
      ...existingDependency, 
      ...dependency 
    };
    this.dependencies.set(id, updatedDependency);
    return updatedDependency;
  }
  
  async deleteDependency(id: number): Promise<boolean> {
    return this.dependencies.delete(id);
  }
  
  // Jira config operations
  async getJiraConfig(): Promise<JiraConfig | undefined> {
    return this.jiraConfig;
  }
  
  async saveJiraConfig(config: InsertJiraConfig): Promise<JiraConfig> {
    this.jiraConfig = { 
      ...config, 
      id: 1,
      userId: 1, 
      createdAt: new Date() 
    };
    return this.jiraConfig;
  }
  
  // Recommendation operations
  async getRecommendations(): Promise<OptimizationRecommendation[]> {
    return Array.from(this.recommendations.values());
  }
  
  async getRecommendationsByDependency(dependencyId: number): Promise<OptimizationRecommendation[]> {
    return Array.from(this.recommendations.values())
      .filter(rec => rec.dependencyId === dependencyId);
  }
  
  async createRecommendation(recommendation: InsertOptimizationRecommendation): Promise<OptimizationRecommendation> {
    const id = this.recommendationCurrentId++;
    const newRecommendation: OptimizationRecommendation = { 
      ...recommendation, 
      id, 
      createdAt: new Date() 
    };
    this.recommendations.set(id, newRecommendation);
    return newRecommendation;
  }
  
  async applyRecommendation(id: number): Promise<OptimizationRecommendation | undefined> {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) return undefined;
    
    const updatedRecommendation: OptimizationRecommendation = {
      ...recommendation,
      isApplied: true
    };
    this.recommendations.set(id, updatedRecommendation);
    
    // Update the associated dependency if any
    if (recommendation.dependencyId) {
      const dependency = this.dependencies.get(recommendation.dependencyId);
      if (dependency) {
        const riskReduction = recommendation.riskReduction || 0;
        const newRiskScore = Math.max(0, dependency.riskScore - riskReduction);
        this.updateDependency(dependency.id, { riskScore: newRiskScore });
      }
    }
    
    return updatedRecommendation;
  }
  
  // ML model operations
  async getMlModels(): Promise<MlModel[]> {
    return Array.from(this.mlModels.values());
  }
  
  async getMlModel(id: number): Promise<MlModel | undefined> {
    return this.mlModels.get(id);
  }
  
  async createMlModel(model: InsertMlModel): Promise<MlModel> {
    const id = this.mlModelCurrentId++;
    const newModel: MlModel = { 
      ...model, 
      id, 
      createdAt: new Date() 
    };
    this.mlModels.set(id, newModel);
    return newModel;
  }
  
  async updateMlModel(id: number, model: Partial<InsertMlModel>): Promise<MlModel | undefined> {
    const existingModel = this.mlModels.get(id);
    if (!existingModel) return undefined;
    
    const updatedModel: MlModel = { 
      ...existingModel, 
      ...model 
    };
    this.mlModels.set(id, updatedModel);
    return updatedModel;
  }
}

// Determine which storage implementation to use
let storageImplementation: IStorage;

try {
  // Try to use database storage
  storageImplementation = new DatabaseStorage();
  console.log('Using database storage');
} catch (error) {
  // Fall back to in-memory storage if database is not available
  console.warn('Database connection failed, using in-memory storage:', error);
  storageImplementation = new MemStorage();
}

export const storage = storageImplementation;
