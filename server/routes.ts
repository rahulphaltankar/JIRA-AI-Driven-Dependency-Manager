import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { db } from "./db";
import { jiraClient } from "./jira-client";
import { juliaBridge } from "./julia-bridge";
import { 
  dependencies, 
  users, 
  jiraConfigs, 
  optimizationRecommendations, 
  mlModels,
  pinnModels,
  insertDependencySchema,
  insertOptimizationRecommendationSchema,
  insertMlModelSchema,
  insertJiraConfigSchema,
  insertPinnModelSchema
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { ValidationError, fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log('Received message:', parsedMessage);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast function for sending updates to all connected clients
  const broadcast = (type: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  };
  
  // API Routes
  
  // User routes
  app.get('/api/users', async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Error fetching user' });
    }
  });
  
  // Dashboard metrics
  app.get('/api/metrics', async (req, res) => {
    try {
      const allDependencies = await db.select().from(dependencies);
      
      const atRiskDependencies = allDependencies.filter(d => d.status === 'at-risk').length;
      const blockedDependencies = allDependencies.filter(d => d.status === 'blocked').length;
      
      // Calculate optimization score based on risk scores and status
      const avgRiskScore = allDependencies.reduce((sum, dep) => sum + (dep.riskScore || 0), 0) / Math.max(1, allDependencies.length);
      const optimizationScore = Math.max(0, 100 - avgRiskScore);
      
      res.json({
        totalDependencies: allDependencies.length,
        totalDependenciesChange: `+${Math.floor(allDependencies.length * 0.1)} from last PI`,
        atRiskDependencies,
        atRiskDependenciesChange: `+${Math.floor(atRiskDependencies * 0.2)} from last week`,
        blockedWorkItems: blockedDependencies,
        blockedItemsChange: `+${Math.floor(blockedDependencies * 0.15)} from yesterday`,
        optimizationScore: `${Math.floor(optimizationScore)}%`,
        optimizationScoreChange: `+${Math.floor(optimizationScore * 0.05)}% from last PI`,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ message: 'Error fetching metrics' });
    }
  });
  
  // Dependencies routes
  app.get('/api/dependencies', async (req, res) => {
    try {
      const allDependencies = await db.select().from(dependencies);
      res.json(allDependencies);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      res.status(500).json({ message: 'Error fetching dependencies' });
    }
  });
  
  app.get('/api/dependencies/critical', async (req, res) => {
    try {
      // Get dependencies with high risk score or blocked status
      const criticalDependencies = await db.select()
        .from(dependencies)
        .where(
          eq(dependencies.status, 'blocked')
          // Previously used z.any() from zod which causes type issues with drizzle
        );
      
      res.json(criticalDependencies);
    } catch (error) {
      console.error('Error fetching critical dependencies:', error);
      res.status(500).json({ message: 'Error fetching critical dependencies' });
    }
  });
  
  app.get('/api/dependencies/cross-art', async (req, res) => {
    try {
      const crossArtDependencies = await db.select()
        .from(dependencies)
        .where(eq(dependencies.isCrossArt, true));
      
      // Map DB structure to API structure
      const mappedDependencies = crossArtDependencies.map(dep => ({
        id: dep.id,
        title: dep.title,
        sourceArt: dep.sourceArt,
        targetArt: dep.targetArt,
        riskLevel: dep.riskScore > 70 ? 'High Risk' : dep.riskScore > 40 ? 'Medium' : 'Low Risk',
        status: dep.status
      }));
      
      res.json(mappedDependencies);
    } catch (error) {
      console.error('Error fetching cross-ART dependencies:', error);
      res.status(500).json({ message: 'Error fetching cross-ART dependencies' });
    }
  });
  
  app.get('/api/dependencies/network', async (req, res) => {
    try {
      const allDependencies = await db.select().from(dependencies);
      
      // Collect unique teams and ARTs
      const teams = new Set<string>();
      const arts = new Set<string>();
      
      allDependencies.forEach(dep => {
        teams.add(dep.sourceTeam);
        teams.add(dep.targetTeam);
        arts.add(dep.sourceArt);
        arts.add(dep.targetArt);
      });
      
      // Create network nodes
      const nodes: Array<{id: string; name: string; group: number; type: string; status?: string}> = [];
      let nodeId = 1;
      
      // Team nodes
      teams.forEach(team => {
        nodes.push({
          id: `team${nodeId}`,
          name: team,
          group: 1,
          type: 'team'
        });
        nodeId++;
      });
      
      // Epic nodes (represented by dependencies)
      allDependencies.forEach(dep => {
        nodes.push({
          id: `epic${dep.id}`,
          name: dep.title,
          group: 2,
          type: 'epic',
          status: dep.status
        });
      });
      
      // Create links
      const links = [];
      
      // Connect teams to epics
      allDependencies.forEach(dep => {
        const sourceTeamNode = nodes.find(n => n.type === 'team' && n.name === dep.sourceTeam);
        const targetTeamNode = nodes.find(n => n.type === 'team' && n.name === dep.targetTeam);
        const epicNode = nodes.find(n => n.id === `epic${dep.id}`);
        
        if (sourceTeamNode && epicNode) {
          links.push({
            source: sourceTeamNode.id,
            target: epicNode.id,
            value: 1
          });
        }
        
        if (targetTeamNode && epicNode) {
          links.push({
            source: epicNode.id,
            target: targetTeamNode.id,
            value: 1
          });
        }
      });
      
      // Add some artificial links between epics to show dependencies
      for (let i = 0; i < allDependencies.length - 1; i++) {
        const epic1 = nodes.find(n => n.id === `epic${allDependencies[i].id}`);
        const epic2 = nodes.find(n => n.id === `epic${allDependencies[i + 1].id}`);
        
        if (epic1 && epic2) {
          links.push({
            source: epic1.id,
            target: epic2.id,
            value: 2
          });
        }
      }
      
      res.json({ nodes, links });
    } catch (error) {
      console.error('Error generating dependency network:', error);
      res.status(500).json({ message: 'Error generating dependency network' });
    }
  });
  
  app.get('/api/dependencies/:id', async (req, res) => {
    try {
      const dependencyId = parseInt(req.params.id);
      const [dependency] = await db.select()
        .from(dependencies)
        .where(eq(dependencies.id, dependencyId));
      
      if (!dependency) {
        res.status(404).json({ message: 'Dependency not found' });
        return;
      }
      
      res.json(dependency);
    } catch (error) {
      console.error('Error fetching dependency:', error);
      res.status(500).json({ message: 'Error fetching dependency' });
    }
  });
  
  app.get('/api/dependencies/risk-analysis/:id', async (req, res) => {
    try {
      const dependencyId = parseInt(req.params.id);
      const [dependency] = await db.select()
        .from(dependencies)
        .where(eq(dependencies.id, dependencyId));
      
      if (!dependency) {
        res.status(404).json({ message: 'Dependency not found' });
        return;
      }
      
      // Get risk analysis from Julia SciML model
      const riskAnalysis = await juliaBridge.analyzeRisk(dependency);
      
      res.json(riskAnalysis);
    } catch (error) {
      console.error('Error generating risk analysis:', error);
      res.status(500).json({ message: 'Error generating risk analysis' });
    }
  });
  
  app.post('/api/dependencies', async (req, res) => {
    try {
      const validatedData = insertDependencySchema.parse(req.body);
      
      const [dependency] = await db.insert(dependencies)
        .values(validatedData)
        .returning();
      
      // Notify connected clients
      broadcast('dependencyUpdate', { action: 'created', dependency });
      
      res.status(201).json(dependency);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: 'Invalid dependency data', errors: validationError.details });
      } else {
        console.error('Error creating dependency:', error);
        res.status(500).json({ message: 'Error creating dependency' });
      }
    }
  });
  
  // Recommendations routes
  app.get('/api/recommendations', async (req, res) => {
    try {
      const recommendations = await db.select().from(optimizationRecommendations);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: 'Error fetching recommendations' });
    }
  });
  
  app.post('/api/recommendations/apply/:id', async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      
      const [recommendation] = await db.select()
        .from(optimizationRecommendations)
        .where(eq(optimizationRecommendations.id, recommendationId));
      
      if (!recommendation) {
        res.status(404).json({ message: 'Recommendation not found' });
        return;
      }
      
      // Apply the recommendation
      const [updatedRecommendation] = await db.update(optimizationRecommendations)
        .set({ isApplied: true })
        .where(eq(optimizationRecommendations.id, recommendationId))
        .returning();
      
      // Update the associated dependency if needed
      if (recommendation.dependencyId) {
        // For simplicity, just reduce the risk score
        const [updatedDependency] = await db.update(dependencies)
          .set({ 
            riskScore: sql`GREATEST(0, ${dependencies.riskScore} - ${recommendation.riskReduction})` 
          })
          .where(eq(dependencies.id, recommendation.dependencyId))
          .returning();
        
        // Notify clients of the changes
        broadcast('dependencyUpdate', { action: 'updated', dependency: updatedDependency });
      }
      
      broadcast('recommendationUpdate', { action: 'applied', recommendation: updatedRecommendation });
      
      res.json({ 
        success: true, 
        message: 'Recommendation applied successfully',
        recommendation: updatedRecommendation
      });
    } catch (error) {
      console.error('Error applying recommendation:', error);
      res.status(500).json({ message: 'Error applying recommendation' });
    }
  });
  
  // Optimization routes
  app.get('/api/optimization/scenarios', async (req, res) => {
    try {
      // Generate optimization scenarios using Julia SciML
      const scenarios = await juliaBridge.generateOptimizationScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error('Error generating optimization scenarios:', error);
      res.status(500).json({ message: 'Error generating optimization scenarios' });
    }
  });
  
  // Jira integration routes
  app.get('/api/integrations/jira', async (req, res) => {
    try {
      const [config] = await db.select().from(jiraConfigs);
      
      // Mask token values for security
      if (config) {
        const maskedConfig = {
          ...config,
          jiraToken: config.jiraToken ? '•••••••••••' : '',
          jiraAlignToken: config.jiraAlignToken ? '•••••••••••' : ''
        };
        
        res.json(maskedConfig);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Error fetching Jira configuration:', error);
      res.status(500).json({ message: 'Error fetching Jira configuration' });
    }
  });
  
  app.post('/api/integrations/jira', async (req, res) => {
    try {
      const validatedData = insertJiraConfigSchema.parse(req.body);
      
      // Check if config already exists and update it
      const existingConfig = await db.select().from(jiraConfigs);
      
      if (existingConfig.length > 0) {
        const [updatedConfig] = await db.update(jiraConfigs)
          .set(validatedData)
          .where(eq(jiraConfigs.id, existingConfig[0].id))
          .returning();
        
        res.json(updatedConfig);
      } else {
        // Create new config
        const [newConfig] = await db.insert(jiraConfigs)
          .values({
            ...validatedData,
            userId: 1 // Default to first user for now
          })
          .returning();
        
        res.status(201).json(newConfig);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: 'Invalid Jira configuration data', errors: validationError.details });
      } else {
        console.error('Error saving Jira configuration:', error);
        res.status(500).json({ message: 'Error saving Jira configuration' });
      }
    }
  });
  
  app.post('/api/integrations/jira/test', async (req, res) => {
    try {
      const config = req.body;
      
      // Test the Jira connection
      const connectionResult = await jiraClient.testConnection(config);
      
      if (connectionResult.success) {
        res.json({ success: true, message: 'Successfully connected to Jira API' });
      } else {
        res.status(400).json({ success: false, message: connectionResult.message });
      }
    } catch (error) {
      console.error('Error testing Jira connection:', error);
      res.status(500).json({ success: false, message: 'Error testing Jira connection' });
    }
  });
  
  // Jira data routes
  app.get('/api/jira/projects', async (req, res) => {
    try {
      const projects = await jiraClient.getProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching Jira projects:', error);
      res.status(500).json({ message: 'Error fetching Jira projects' });
    }
  });
  
  app.post('/api/jira/import/dependencies', async (req, res) => {
    try {
      const result = await jiraClient.importDependencies();
      
      if (result.success) {
        broadcast('dependencyUpdate', { action: 'imported', count: result.count });
        res.json({ success: true, count: result.count });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error('Error importing Jira dependencies:', error);
      res.status(500).json({ success: false, message: 'Error importing Jira dependencies' });
    }
  });
  
  // ML configuration routes
  app.get('/api/ml/config', async (req, res) => {
    try {
      const config = await juliaBridge.getConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching ML configuration:', error);
      res.status(500).json({ message: 'Error fetching ML configuration' });
    }
  });
  
  app.post('/api/ml/config', async (req, res) => {
    try {
      const config = req.body;
      await juliaBridge.saveConfig(config);
      res.json({ success: true, message: 'ML configuration saved successfully' });
    } catch (error) {
      console.error('Error saving ML configuration:', error);
      res.status(500).json({ message: 'Error saving ML configuration' });
    }
  });
  
  app.get('/api/ml/models', async (req, res) => {
    try {
      const models = await db.select().from(mlModels);
      res.json(models);
    } catch (error) {
      console.error('Error fetching ML models:', error);
      res.status(500).json({ message: 'Error fetching ML models' });
    }
  });
  
  app.post('/api/ml/train', async (req, res) => {
    try {
      const modelConfig = req.body;
      
      // Validate input
      if (!modelConfig.name || !modelConfig.modelType) {
        return res.status(400).json({ 
          message: 'Invalid model configuration. Name and modelType are required.' 
        });
      }
      
      try {
        // Create a model record
        const [model] = await db.insert(mlModels)
          .values({
            name: modelConfig.name,
            description: modelConfig.description || '',
            modelType: modelConfig.modelType,
            parameters: modelConfig.parameters || {},
            trainingStatus: 'training',
            userId: 1 // Default to first user for now
          })
          .returning();
        
        // Start training in the background
        juliaBridge.trainModel(model.id, modelConfig)
          .then((result) => {
            // Update model status and notify clients when done
            // Convert accuracy to integer percentage (0-100) for database storage
            const accuracyValue = result.accuracy 
              ? Math.round(result.accuracy * 100) 
              : null;
              
            db.update(mlModels)
              .set({ 
                trainingStatus: result.success ? 'completed' : 'failed',
                accuracy: accuracyValue
              })
              .where(eq(mlModels.id, model.id))
              .then((result) => {
                // Assuming result has a returned item in an array
                const updatedModel = Array.isArray(result) && result.length > 0 ? result[0] : null;
                // Use the model ID and training result data rather than depending on the DB query result
                broadcast('modelTrainingUpdate', { 
                  modelId: model.id, 
                  status: updatedModel?.trainingStatus || 'unknown',
                  accuracy: updatedModel?.accuracy || null
                });
              })
              .catch(err => console.error('Error updating model status:', err));
          })
          .catch(err => {
            console.error('Error training model:', err);
            
            // Update model status to failed
            db.update(mlModels)
              .set({ trainingStatus: 'failed' })
              .where(eq(mlModels.id, model.id))
              .catch(updateErr => console.error('Error updating model status:', updateErr));
              
            broadcast('modelTrainingUpdate', { 
              modelId: model.id, 
              status: 'failed'
            });
          });
        
        return res.status(202).json({ 
          success: true, 
          message: 'Model training started',
          modelId: model.id
        });
      } catch (dbError: any) {
        // Handle specific database errors
        if (dbError.code === '23503') { // Foreign key constraint violation
          console.error('Database constraint error:', dbError.detail);
          return res.status(500).json({ 
            message: 'Database error: Required reference not found. Please try again later.' 
          });
        }
        // Re-throw for outer catch block
        throw dbError;
      }
    } catch (error: any) {
      console.error('Error starting model training:', error);
      const errorMessage = error.message || 'Error starting model training';
      return res.status(500).json({ 
        message: `Error starting model training: ${errorMessage}`
      });
    }
  });

  // PINN (Physics Informed Neural Network) routes
  app.get('/api/pinn/config', async (req, res) => {
    try {
      const config = await juliaBridge.getPinnConfig();
      res.json(config);
    } catch (error) {
      console.error('Error fetching PINN configuration:', error);
      res.status(500).json({ message: 'Error fetching PINN configuration' });
    }
  });

  app.get('/api/pinn/models', async (req, res) => {
    try {
      const models = await db.select().from(pinnModels);
      res.json(models);
    } catch (error) {
      console.error('Error fetching PINN models:', error);
      res.status(500).json({ message: 'Error fetching PINN models' });
    }
  });

  app.post('/api/pinn/train', async (req, res) => {
    try {
      const modelConfig = req.body;
      
      // Validate model config
      if (!modelConfig.name || !modelConfig.equationType) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid model configuration: name and equationType are required' 
        });
      }
      
      try {
        // Create model record in database
        const [model] = await db.insert(pinnModels)
          .values({
            name: modelConfig.name,
            description: modelConfig.description || '',
            modelType: 'pinn',
            equationFormula: modelConfig.equationFormula || 'du/dt = f(u,t)',
            equationType: modelConfig.equationType,
            parameters: modelConfig.parameters || {},
            physicsLossWeight: modelConfig.physicsLossWeight || 0.5,
            dataLossWeight: modelConfig.dataLossWeight || 0.3,
            boundaryLossWeight: modelConfig.boundaryLossWeight || 0.2,
            trainingStatus: 'training',
            userId: 1 // Default to first user for now
          })
          .returning();
        
        // Train in the background
        Promise.resolve().then(async () => {
          try {
            // Start the training process
            broadcast('modelTrainingUpdate', { 
              modelId: model.id, 
              status: 'training',
              type: 'pinn'
            });
            
            const result = await juliaBridge.trainPinnModel(model);
            
            // Update the model record with training results
            if (result.success) {
              const accuracyValue = result.accuracy ? parseFloat(result.accuracy.toFixed(4)) : null;
              
              db.update(pinnModels)
                .set({ 
                  trainingStatus: 'completed',
                  accuracy: accuracyValue,
                  physicsLoss: result.physicsLoss ? result.physicsLoss.physicsLoss : null,
                  dataLoss: result.physicsLoss ? result.physicsLoss.dataLoss : null,
                  boundaryLoss: result.physicsLoss ? result.physicsLoss.boundaryLoss : null,
                  totalLoss: result.physicsLoss ? result.physicsLoss.totalLoss : null
                })
                .where(eq(pinnModels.id, model.id))
                .then(() => {
                  // Use the model ID and training result data
                  broadcast('modelTrainingUpdate', { 
                    modelId: model.id, 
                    status: 'completed',
                    type: 'pinn',
                    accuracy: accuracyValue,
                    physicsLoss: result.physicsLoss ? result.physicsLoss.physicsLoss : null
                  });
                })
                .catch(updateErr => console.error('Error updating PINN model status:', updateErr));
            } else {
              db.update(pinnModels)
                .set({ trainingStatus: 'failed' })
                .where(eq(pinnModels.id, model.id))
                .catch(updateErr => console.error('Error updating PINN model status:', updateErr));
                
              broadcast('modelTrainingUpdate', { 
                modelId: model.id, 
                status: 'failed',
                type: 'pinn'
              });
            }
          } catch (trainingErrorRaw) {
            const trainingError = trainingErrorRaw as Error;
            console.error('Error in PINN model training process:', trainingError);
            
            db.update(pinnModels)
              .set({ trainingStatus: 'failed' })
              .where(eq(pinnModels.id, model.id))
              .catch(updateErr => console.error('Error updating PINN model status:', updateErr));
            
            broadcast('modelTrainingUpdate', { 
              modelId: model.id, 
              status: 'failed',
              type: 'pinn',
              error: trainingError.message || 'Unknown error during training'
            });
          }
        });
        
        return res.status(202).json({ 
          success: true, 
          message: 'PINN model training started',
          modelId: model.id
        });
      } catch (dbErrorRaw) {
        const dbError = dbErrorRaw as Error;
        console.error('Database error:', dbError);
        return res.status(500).json({ 
          success: false, 
          message: `Database error: ${dbError.message || 'Unknown database error'}` 
        });
      }
    } catch (error) {
      console.error('Error starting PINN model training:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        message: `Error starting PINN model training: ${errorMessage}`
      });
    }
  });

  // Differential equation simulation routes
  app.post('/api/simulation/diff-eq', async (req, res) => {
    try {
      const model = req.body;
      
      // Validate the model
      if (!model.type || !model.parameters || !model.initialConditions) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid model: type, parameters, and initialConditions are required' 
        });
      }
      
      // Solve the differential equation
      const results = await juliaBridge.solveDifferentialEquation(model);
      
      return res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error solving differential equation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        message: `Error solving differential equation: ${errorMessage}`
      });
    }
  });

  // Brooks Law model simulation
  app.post('/api/simulation/brooks-law', async (req, res) => {
    try {
      const model = req.body;
      
      // Validate the model
      if (!model.parameters || !model.initialConditions) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Brooks Law model: parameters and initialConditions are required' 
        });
      }
      
      // Ensure required Brooks Law parameters
      if (!model.productivityDecayFactor || !model.trainingOverhead || 
          !model.nominalProductivity || !model.teamSize) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Brooks Law model: specific Brooks Law parameters are required' 
        });
      }
      
      // Solve the Brooks Law model
      const results = await juliaBridge.solveBrooksLawModel(model);
      
      return res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error solving Brooks Law model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        message: `Error solving Brooks Law model: ${errorMessage}`
      });
    }
  });

  // Critical Chain model simulation
  app.post('/api/simulation/critical-chain', async (req, res) => {
    try {
      const model = req.body;
      
      // Validate the model
      if (!model.parameters || !model.initialConditions) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Critical Chain model: parameters and initialConditions are required' 
        });
      }
      
      // Ensure required Critical Chain parameters
      if (!model.bufferSizeImpact || !model.resourceConstraintFactor || 
          !model.multitaskingPenalty || !model.studentSyndromeFactor) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Critical Chain model: specific Critical Chain parameters are required' 
        });
      }
      
      // Solve the Critical Chain model
      const results = await juliaBridge.solveCriticalChainModel(model);
      
      return res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error solving Critical Chain model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        success: false, 
        message: `Error solving Critical Chain model: ${errorMessage}`
      });
    }
  });

  // One-click guide - Forecast data 
  app.get('/api/forecast/dependencies', async (req, res) => {
    try {
      // Get forecast months from query param or default to 3
      const months = parseInt(req.query.months as string) || 3;
      
      // Get dependencies forecast based on PINN models
      const forecastData = await jiraClient.getForecastDependenciesForTenant('default', months);
      
      res.json(forecastData);
    } catch (error) {
      console.error('Error fetching dependency forecast:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching dependency forecast' 
      });
    }
  });

  return httpServer;
}
