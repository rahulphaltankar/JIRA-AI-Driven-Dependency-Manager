import fetch from 'node-fetch';
import { storage } from './storage';
import { InsertDependency } from '@shared/schema';
import { juliaBridge } from './julia-bridge';
import { WebSocketServer } from 'ws';
import { Server } from 'http';

interface JiraApiOptions {
  method: string;
  url: string;
  body?: any;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: string;
    issuetype: {
      name: string;
    };
    status: {
      name: string;
    };
    duedate?: string;
    assignee?: {
      displayName: string;
    };
    customfield_10007?: string; // Epic Link
    customfield_10010?: string; // Team field (example)
    customfield_10011?: string; // ART field (example)
    issuelinks?: JiraIssueLink[]; // Issue links
  };
}

interface JiraIssueLink {
  id: string;
  type: {
    name: string;
    inward: string;
    outward: string;
  };
  inwardIssue?: JiraIssue;
  outwardIssue?: JiraIssue;
}

interface JiraTeam {
  id: string;
  name: string;
  members: number;
  art?: string;
}

interface AtlassianIntegrationConfig {
  useOAuth: boolean;
  oauthClientId?: string;
  oauthSecret?: string;
  webhookEnabled: boolean;
  webhookUrl?: string;
}

class JiraClient {
  private tenants: Map<string, {
    jiraUrl: string;
    jiraToken?: string;
    jiraEmail?: string;
    sharedSecret: string;
    jiraAlignUrl?: string;
    jiraAlignToken?: string;
    webhookSecret?: string;
  }> = new Map();
  
  // Legacy properties for backward compatibility
  private jiraUrl: string | null = null;
  private jiraEmail: string | null = null;
  private jiraToken: string | null = null;
  private jiraAlignUrl: string | null = null;
  private jiraAlignToken: string | null = null;
  private confluenceUrl: string | null = null;
  private confluenceToken: string | null = null;
  private bitbucketUrl: string | null = null;
  private bitbucketToken: string | null = null;
  private trelloKey: string | null = null;
  private trelloToken: string | null = null;
  private useOAuth: boolean = false;
  private oauthClientId: string | null = null;
  private oauthSecret: string | null = null;
  private webhookEnabled: boolean = false;
  private webhookUrl: string | null = null;
  private webhookServer: WebSocketServer | null = null;
  private useDemoMode: boolean = false;
  
  // Initialize a new tenant connection
  public initializeTenant(clientKey: string, baseUrl: string, sharedSecret: string) {
    this.tenants.set(clientKey, {
      jiraUrl: baseUrl,
      sharedSecret
    });
    console.log(`Initialized tenant: ${clientKey} with URL: ${baseUrl}`);
  }
  
  constructor() {
    this.loadConfig();
  }
  
  async loadConfig() {
    try {
      const config = await storage.getJiraConfig();
      if (config) {
        this.jiraUrl = config.jiraUrl;
        this.jiraEmail = config.jiraEmail;
        this.jiraToken = config.jiraToken;
        this.jiraAlignUrl = config.jiraAlignUrl || null;
        this.jiraAlignToken = config.jiraAlignToken || null;
        this.confluenceUrl = config.confluenceUrl || null;
        this.confluenceToken = config.confluenceToken || null;
        this.bitbucketUrl = config.bitbucketUrl || null;
        this.bitbucketToken = config.bitbucketToken || null;
        this.trelloKey = config.trelloKey || null;
        this.trelloToken = config.trelloToken || null;
        this.useOAuth = config.useOAuth || false;
        this.oauthClientId = config.oauthClientId || null;
        this.oauthSecret = config.oauthSecret || null;
        this.webhookEnabled = config.webhookEnabled || false;
        this.webhookUrl = config.webhookUrl || null;
      }
    } catch (error) {
      console.error("Error loading Jira configuration:", error);
    }
  }
  
  setupWebhookServer(server: Server) {
    if (this.webhookEnabled && this.webhookUrl) {
      try {
        this.webhookServer = new WebSocketServer({
          server,
          path: '/jira-webhook'
        });
        
        this.webhookServer.on('connection', (ws) => {
          console.log('Jira webhook client connected');
          
          ws.on('message', async (message) => {
            try {
              const data = JSON.parse(message.toString());
              console.log('Received webhook event:', data.webhookEvent);
              
              // Process different webhook events
              if (data.webhookEvent === 'jira:issue_updated') {
                await this.processIssueUpdateEvent(data);
              } else if (data.webhookEvent === 'jira:issue_created') {
                await this.processIssueCreateEvent(data);
              } else if (data.webhookEvent === 'jira:issue_deleted') {
                await this.processIssueDeleteEvent(data);
              }
            } catch (error) {
              console.error('Error processing webhook message:', error);
            }
          });
          
          ws.on('close', () => {
            console.log('Jira webhook client disconnected');
          });
        });
        
        console.log('Jira webhook server set up successfully');
      } catch (error) {
        console.error('Error setting up Jira webhook server:', error);
      }
    }
  }
  
  async processIssueUpdateEvent(data: any) {
    // Extract the issue key
    const issueKey = data.issue?.key;
    if (!issueKey) return;
    
    // Fetch the full issue data to get linked issues
    const issue = await this.getIssue(issueKey);
    
    // Check if this issue has dependencies that need updating
    const dependencies = await storage.getDependencies();
    const affectedDependencies = dependencies.filter(d => d.jiraId === issueKey);
    
    for (const dependency of affectedDependencies) {
      // Update dependency status based on the issue status
      const status = this.mapJiraStatusToDependencyStatus(issue.fields.status.name);
      
      // Update risk score
      let riskScore = dependency.riskScore;
      if (issue.fields.issuelinks && issue.fields.issuelinks.length > 0) {
        for (const link of issue.fields.issuelinks) {
          if (link.inwardIssue) {
            const linkedIssue = await this.getIssue(link.inwardIssue.key);
            riskScore = await this.calculateRiskScore(issue, linkedIssue);
            break;
          }
        }
      }
      
      // Update the dependency
      await storage.updateDependency(dependency.id, {
        status,
        riskScore,
        description: `Updated from Jira webhook: ${issue.fields.description || 'No description'}`
      });
    }
  }
  
  async processIssueCreateEvent(data: any) {
    // Handle new issue creation - check if it creates new dependencies
    const issueKey = data.issue?.key;
    if (!issueKey) return;
    
    // Fetch the full issue data
    const issue = await this.getIssue(issueKey);
    
    // Check for issue links that indicate dependencies
    if (issue.fields.issuelinks && issue.fields.issuelinks.length > 0) {
      for (const link of issue.fields.issuelinks) {
        if (['blocks', 'depends on', 'is blocked by'].includes(link.type.name) && link.inwardIssue) {
          const linkedIssue = await this.getIssue(link.inwardIssue.key);
          
          // Create a new dependency
          const dependency: InsertDependency = {
            title: `${issue.fields.summary} → ${linkedIssue.fields.summary}`,
            sourceTeam: issue.fields.customfield_10010 || 'Unknown Team',
            sourceArt: issue.fields.customfield_10011 || 'Unknown ART',
            targetTeam: linkedIssue.fields.customfield_10010 || 'Unknown Team',
            targetArt: linkedIssue.fields.customfield_10011 || 'Unknown ART',
            dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : null,
            status: this.mapJiraStatusToDependencyStatus(issue.fields.status.name),
            riskScore: await this.calculateRiskScore(issue, linkedIssue),
            jiraId: issue.key,
            description: `Dependency between ${issue.key} and ${linkedIssue.key}: ${issue.fields.description || 'No description'}`,
            isCrossArt: issue.fields.customfield_10011 !== linkedIssue.fields.customfield_10011
          };
          
          await storage.createDependency(dependency);
        }
      }
    }
  }
  
  async processIssueDeleteEvent(data: any) {
    // Handle issue deletion
    const issueKey = data.issue?.key;
    if (!issueKey) return;
    
    // Find any dependencies related to this issue
    const dependencies = await storage.getDependencies();
    const affectedDependencies = dependencies.filter(d => d.jiraId === issueKey);
    
    // Delete or mark them as completed
    for (const dependency of affectedDependencies) {
      await storage.updateDependency(dependency.id, {
        status: 'completed',
        description: `Issue ${issueKey} was deleted in Jira`
      });
    }
  }
  
  // Methods for link webhook events
  async processIssueLinkCreateEvent(data: any) {
    const sourceIssueKey = data.issueLink?.sourceIssueKey;
    const targetIssueKey = data.issueLink?.targetIssueKey;
    const linkType = data.issueLink?.type?.name;
    
    if (!sourceIssueKey || !targetIssueKey || !linkType) return;
    
    // Only process dependency-related links
    if (!['blocks', 'depends on', 'is blocked by'].includes(linkType)) return;
    
    const sourceIssue = await this.getIssue(sourceIssueKey);
    const targetIssue = await this.getIssue(targetIssueKey);
    
    // Create a new dependency
    const dependency: InsertDependency = {
      title: `${sourceIssue.fields.summary} → ${targetIssue.fields.summary}`,
      sourceTeam: sourceIssue.fields.customfield_10010 || 'Unknown Team',
      sourceArt: sourceIssue.fields.customfield_10011 || 'Unknown ART',
      targetTeam: targetIssue.fields.customfield_10010 || 'Unknown Team',
      targetArt: targetIssue.fields.customfield_10011 || 'Unknown ART',
      dueDate: sourceIssue.fields.duedate ? new Date(sourceIssue.fields.duedate) : null,
      status: this.mapJiraStatusToDependencyStatus(sourceIssue.fields.status.name),
      riskScore: await this.calculateRiskScore(sourceIssue, targetIssue),
      jiraId: sourceIssue.key,
      description: `Dependency between ${sourceIssue.key} and ${targetIssue.key}: ${sourceIssue.fields.description || 'No description'}`,
      isCrossArt: sourceIssue.fields.customfield_10011 !== targetIssue.fields.customfield_10011
    };
    
    await storage.createDependency(dependency);
  }
  
  async processIssueLinkDeleteEvent(data: any) {
    const sourceIssueKey = data.issueLink?.sourceIssueKey;
    const targetIssueKey = data.issueLink?.targetIssueKey;
    
    if (!sourceIssueKey || !targetIssueKey) return;
    
    // Find dependencies related to these issues
    const dependencies = await storage.getDependencies();
    const affectedDependencies = dependencies.filter(d => 
      d.jiraId === sourceIssueKey && 
      d.description?.includes(targetIssueKey)
    );
    
    // Mark dependencies as resolved
    for (const dependency of affectedDependencies) {
      await storage.updateDependency(dependency.id, {
        status: 'completed',
        description: `Link between ${sourceIssueKey} and ${targetIssueKey} was removed in Jira`
      });
    }
  }
  
  // Method for forecasting dependencies
  async getForecastDependenciesForTenant(clientKey: string, months: number = 3): Promise<any> {
    // Get tenant configuration
    const tenant = this.tenants.get(clientKey);
    if (!tenant) {
      throw new Error(`Tenant ${clientKey} not found`);
    }
    
    // Legacy fallback for development
    const jiraUrlToUse = tenant.jiraUrl || this.jiraUrl;
    const jiraTokenToUse = tenant.jiraToken || this.jiraToken;
    const jiraEmailToUse = tenant.jiraEmail || this.jiraEmail;
    
    if (!jiraUrlToUse) {
      throw new Error("No Jira URL configured for this tenant");
    }
    
    // Save current context
    const originalUrl = this.jiraUrl;
    const originalToken = this.jiraToken;
    const originalEmail = this.jiraEmail;
    
    try {
      // Set context to the tenant
      this.jiraUrl = jiraUrlToUse;
      this.jiraToken = jiraTokenToUse;
      this.jiraEmail = jiraEmailToUse;
      
      // Get existing dependencies
      const currentDependencies = await this.importDependencies();
      
      // Generate forecasted dependencies using ML models
      const pinnModelId = 1; // Use default PINN model
      const mlModel = await storage.getMlModel(pinnModelId);
      
      if (!mlModel) {
        throw new Error("No ML model found for dependency forecasting");
      }
      
      // Use the model to forecast future dependencies
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      
      // The actual forecast would use Julia and PINN models
      // For now, we're simulating forecast results
      const forecast = currentDependencies.map(dependency => {
        // Create a forecasted version of each dependency
        return {
          ...dependency,
          forecastDate: endDate,
          forecastedRiskScore: dependency.riskScore * (1 + (Math.random() * 0.5 - 0.25)),
          confidenceLevel: 0.7 + Math.random() * 0.3,
          forecastType: 'pinn-model'
        };
      });
      
      return {
        forecast,
        timeHorizon: `${months} months`,
        generatedAt: new Date()
      };
    } finally {
      // Restore original context
      this.jiraUrl = originalUrl;
      this.jiraToken = originalToken;
      this.jiraEmail = originalEmail;
    }
  }
  
  private async makeJiraRequest({ method, url, body }: JiraApiOptions) {
    if (!this.jiraUrl || !this.jiraEmail || !this.jiraToken) {
      throw new Error("Jira configuration is not set");
    }
    
    const auth = Buffer.from(`${this.jiraEmail}:${this.jiraToken}`).toString('base64');
    
    const headers: Record<string, string> = {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    const options: RequestInit = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(`${this.jiraUrl}${url}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jira API Error (${response.status}): ${errorText}`);
      }
      
      if (response.status === 204) {
        return null; // No content
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`Error making Jira request to ${url}:`, error);
      throw error;
    }
  }
  
  private async makeJiraAlignRequest({ method, url, body }: JiraApiOptions) {
    if (!this.jiraAlignUrl || !this.jiraAlignToken) {
      throw new Error("Jira Align configuration is not set");
    }
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.jiraAlignToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    const options: RequestInit = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(`${this.jiraAlignUrl}${url}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jira Align API Error (${response.status}): ${errorText}`);
      }
      
      if (response.status === 204) {
        return null; // No content
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`Error making Jira Align request to ${url}:`, error);
      throw error;
    }
  }
  
  async testConnection(config: any) {
    try {
      // Check if demo mode is enabled
      if (config.useDemoMode) {
        console.log('Demo mode enabled, skipping actual API connection');
        return { success: true, message: 'Demo Mode activated successfully' };
      }
      
      // Save the config temporarily
      const originalUrl = this.jiraUrl;
      const originalEmail = this.jiraEmail;
      const originalToken = this.jiraToken;
      
      this.jiraUrl = config.jiraUrl;
      this.jiraEmail = config.jiraEmail;
      this.jiraToken = config.jiraToken;
      
      // Try to get user information to test the connection
      await this.makeJiraRequest({
        method: 'GET',
        url: '/rest/api/3/myself'
      });
      
      // If Jira Align config is provided, test that connection too
      if (config.jiraAlignUrl && config.jiraAlignToken) {
        const originalAlignUrl = this.jiraAlignUrl;
        const originalAlignToken = this.jiraAlignToken;
        
        this.jiraAlignUrl = config.jiraAlignUrl;
        this.jiraAlignToken = config.jiraAlignToken;
        
        try {
          // Test endpoint depends on Jira Align API structure
          await this.makeJiraAlignRequest({
            method: 'GET',
            url: '/api/team/list' // Example endpoint
          });
        } catch (alignError: any) {
          // Restore original values
          this.jiraUrl = originalUrl;
          this.jiraEmail = originalEmail;
          this.jiraToken = originalToken;
          this.jiraAlignUrl = originalAlignUrl;
          this.jiraAlignToken = originalAlignToken;
          
          return { 
            success: false, 
            message: `Jira connection successful, but Jira Align connection failed: ${alignError.message}` 
          };
        }
      }
      
      // Restore original values
      this.jiraUrl = originalUrl;
      this.jiraEmail = originalEmail;
      this.jiraToken = originalToken;
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Connection failed: ${error.message}` 
      };
    }
  }
  
  async getProjects(): Promise<JiraProject[]> {
    await this.loadConfig();
    
    const response = await this.makeJiraRequest({
      method: 'GET',
      url: '/rest/api/3/project'
    }) as any[];
    
    return response.map((project: any) => ({
      id: project.id,
      key: project.key,
      name: project.name
    }));
  }
  
  async getIssue(issueKey: string): Promise<JiraIssue> {
    await this.loadConfig();
    
    const issue = await this.makeJiraRequest({
      method: 'GET',
      url: `/rest/api/3/issue/${issueKey}`
    }) as JiraIssue;
    
    return issue;
  }
  
  async getIssueLinks(issueKey: string): Promise<JiraIssueLink[]> {
    await this.loadConfig();
    
    const issue = await this.getIssue(issueKey);
    return issue.fields.issuelinks || [];
  }
  
  async generateDemoData() {
    // Generate sample ART names
    const artNames = ['Security ART', 'Frontend ART', 'Backend ART', 'DevOps ART', 'Mobile ART'];
    
    // Generate sample team names
    const teamNames = [
      'Alpha Team', 'Beta Team', 'Gamma Team', 'Delta Team', 'Epsilon Team',
      'Omega Team', 'Sigma Team', 'Zeta Team', 'Theta Team', 'Phi Team'
    ];
    
    // Generate sample issue types
    const issueTypes = ['Epic', 'Story', 'Task', 'Bug', 'Feature'];
    
    // Generate sample statuses
    const statuses = ['In Progress', 'Ready for Review', 'Blocked', 'Done', 'To Do'];
    
    // Generate sample dependencies
    const dependencies: InsertDependency[] = [];
    
    for (let i = 1; i <= 25; i++) {
      // Randomly select source and target teams/ARTs
      const sourceArt = artNames[Math.floor(Math.random() * artNames.length)];
      const targetArt = Math.random() > 0.3 ? sourceArt : artNames[Math.floor(Math.random() * artNames.length)];
      const sourceTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
      const targetTeam = Math.random() > 0.5 ? sourceTeam : teamNames[Math.floor(Math.random() * teamNames.length)];
      
      // Generate due date (random date in the next 90 days)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 90));
      
      // Select issue type and status
      const issueType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Calculate risk score (higher for cross-ART dependencies)
      const isCrossArt = sourceArt !== targetArt;
      let riskScore = Math.floor(Math.random() * 70) + 15; // Base between 15-85
      
      if (isCrossArt) {
        riskScore += 15; // Add risk for cross-ART
      }
      
      if (status === 'Blocked') {
        riskScore += 20; // Add risk for blocked status
      }
      
      // Cap at 100
      riskScore = Math.min(100, riskScore);
      
      // Create dependency object
      dependencies.push({
        title: `DEMO-${i}: ${issueType} dependency between ${sourceTeam} and ${targetTeam}`,
        sourceTeam,
        sourceArt,
        targetTeam,
        targetArt,
        dueDate,
        status: this.mapJiraStatusToDependencyStatus(status),
        riskScore,
        jiraId: `DEMO-${i}`,
        description: `This is a demo dependency between ${sourceTeam} (${sourceArt}) and ${targetTeam} (${targetArt})`,
        isCrossArt
      });
    }
    
    return dependencies;
  }

  async importDependencies() {
    await this.loadConfig();
    
    try {
      // Check if we're in demo mode
      const configs = await storage.getJiraConfig();
      if (configs && configs.useDemoMode) {
        console.log('Using demo mode for dependency import');
        
        // Generate and save demo dependencies
        const demoDependencies = await this.generateDemoData();
        let importedCount = 0;
        
        for (const dependency of demoDependencies) {
          await storage.createDependency(dependency);
          importedCount++;
        }
        
        return { 
          success: true, 
          count: importedCount,
          message: `Successfully imported ${importedCount} demo dependencies` 
        };
      }
      
      // Real Jira integration code
      // Get all dependencies by querying for issues with links
      const response = await this.makeJiraRequest({
        method: 'POST',
        url: '/rest/api/3/search',
        body: {
          jql: 'issuelinks IS NOT EMPTY',
          maxResults: 100,
          fields: [
            'summary',
            'description',
            'issuetype',
            'status',
            'duedate',
            'issuelinks',
            'customfield_10010', // Team field (example)
            'customfield_10011'  // ART field (example)
          ]
        }
      }) as { issues?: JiraIssue[] };
      
      if (!response || !response.issues || !Array.isArray(response.issues)) {
        return { success: false, message: 'No issues found with dependencies' };
      }
      
      // Process each issue and its links
      let importedCount = 0;
      
      for (const issue of response.issues) {
        // Only process issues with outward links
        if (!issue.fields.issuelinks) continue;
        
        for (const link of issue.fields.issuelinks) {
          // Only process certain link types that indicate dependencies
          if (['blocks', 'depends on', 'is blocked by'].includes(link.type.name) && link.inwardIssue) {
            // Get the linked issue details if only has a reference
            const linkedIssue = link.inwardIssue.fields ? 
              link.inwardIssue : 
              await this.getIssue(link.inwardIssue.key);
            
            // Create dependency object
            const dependency: InsertDependency = {
              title: `${issue.fields.summary} → ${linkedIssue.fields.summary}`,
              sourceTeam: issue.fields.customfield_10010 || 'Unknown Team',
              sourceArt: issue.fields.customfield_10011 || 'Unknown ART',
              targetTeam: linkedIssue.fields.customfield_10010 || 'Unknown Team',
              targetArt: linkedIssue.fields.customfield_10011 || 'Unknown ART',
              dueDate: issue.fields.duedate ? new Date(issue.fields.duedate) : null,
              status: this.mapJiraStatusToDependencyStatus(issue.fields.status.name),
              riskScore: await this.calculateRiskScore(issue, linkedIssue),
              jiraId: issue.key,
              description: `Dependency between ${issue.key} and ${linkedIssue.key}: ${issue.fields.description || 'No description'}`,
              isCrossArt: issue.fields.customfield_10011 !== linkedIssue.fields.customfield_10011
            };
            
            // Store in the database
            await storage.createDependency(dependency);
            importedCount++;
          }
        }
      }
      
      return { 
        success: true, 
        count: importedCount,
        message: `Successfully imported ${importedCount} dependencies` 
      };
    } catch (error: any) {
      console.error('Error importing dependencies:', error);
      return { 
        success: false, 
        count: 0,
        message: `Error importing dependencies: ${error.message}` 
      };
    }
  }
  
  private mapJiraStatusToDependencyStatus(jiraStatus: string): string {
    const lowerStatus = jiraStatus.toLowerCase();
    
    if (lowerStatus.includes('done') || lowerStatus.includes('complete') || lowerStatus.includes('resolved')) {
      return 'completed';
    } else if (lowerStatus.includes('block')) {
      return 'blocked';
    } else if (lowerStatus.includes('risk') || lowerStatus.includes('impediment')) {
      return 'at-risk';
    } else {
      return 'in-progress';
    }
  }
  
  private async calculateRiskScore(sourceIssue: JiraIssue, targetIssue: JiraIssue): Promise<number> {
    // Use the Julia bridge to calculate risk based on ML model
    try {
      const riskFactors = {
        sourceStatus: sourceIssue.fields.status.name,
        targetStatus: targetIssue.fields.status.name,
        dueDate: sourceIssue.fields.duedate,
        isCrossArt: sourceIssue.fields.customfield_10011 !== targetIssue.fields.customfield_10011,
        issueType: sourceIssue.fields.issuetype.name,
      };
      
      const result = await juliaBridge.calculateRisk(riskFactors);
      return result.riskScore;
    } catch (error) {
      console.error('Error calculating risk score:', error);
      
      // Fallback calculation if ML fails
      let score = 50; // Base score
      
      // Adjust based on status
      if (targetIssue.fields.status.name.toLowerCase().includes('block')) {
        score += 30;
      }
      
      // Adjust based on due date
      if (sourceIssue.fields.duedate) {
        const dueDate = new Date(sourceIssue.fields.duedate);
        const today = new Date();
        const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
          score += 20; // Overdue
        } else if (daysLeft < 7) {
          score += 10; // Due soon
        }
      }
      
      // Adjust based on cross-ART
      if (sourceIssue.fields.customfield_10011 !== targetIssue.fields.customfield_10011) {
        score += 15; // Cross-ART dependencies are riskier
      }
      
      return Math.min(100, Math.max(0, score));
    }
  }
}

export const jiraClient = new JiraClient();
