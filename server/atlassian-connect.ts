import { Request, Response, NextFunction, Express } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { atlassianTenants, InsertAtlassianTenant } from '@shared/schema';
import fetch from 'node-fetch';
import { jiraClient } from './jira-client';

// Handle app installation
export async function handleInstalled(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientKey, sharedSecret, baseUrl } = req.body;
    
    // Store the tenant information
    const [tenant] = await db
      .insert(atlassianTenants)
      .values({
        clientKey,
        sharedSecret,
        baseUrl,
        productType: baseUrl.includes('jira-align') ? 'jira-align' : 'jira',
      })
      .onConflictDoUpdate({
        target: atlassianTenants.clientKey,
        set: { 
          sharedSecret, 
          baseUrl,
          updatedAt: new Date()
        }
      })
      .returning();
    
    // Initialize connection for this tenant
    jiraClient.initializeTenant(clientKey, baseUrl, sharedSecret);

    res.status(200).send('Installed');
  } catch (error) {
    console.error('Installation error:', error);
    next(error);
  }
}

// Handle app uninstallation
export async function handleUninstalled(req: Request, res: Response, next: NextFunction) {
  try {
    const { clientKey } = req.body;

    // Remove the tenant
    await db.delete(atlassianTenants).where({ clientKey });

    res.status(204).end();
  } catch (error) {
    console.error('Uninstallation error:', error);
    next(error);
  }
}

// JWT authentication middleware
export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.query.jwt as string;
  
  if (!token) {
    return res.status(401).send('Missing JWT token');
  }

  try {
    // The token is verified against the stored shared secret for the tenant
    const decoded = jwt.decode(token, { complete: true }) as any;
    const clientKey = decoded?.payload?.iss;
    
    if (!clientKey) {
      return res.status(401).send('Invalid JWT token');
    }

    // Set the tenant context for the request
    (req as any).clientKey = clientKey;
    
    next();
  } catch (error) {
    console.error('JWT auth error:', error);
    res.status(401).send('Authentication failed');
  }
}

// Register Atlassian Connect routes and middleware
export function registerAtlassianConnectRoutes(app: Express) {
  // Install/uninstall lifecycle handlers
  app.post('/api/atlassian/installed', handleInstalled);
  app.post('/api/atlassian/uninstalled', handleUninstalled);
  
  // Webhook handlers
  app.post('/api/webhooks/issue-created', jiraClient.processIssueCreateEvent.bind(jiraClient));
  app.post('/api/webhooks/issue-updated', jiraClient.processIssueUpdateEvent.bind(jiraClient));
  app.post('/api/webhooks/issue-deleted', jiraClient.processIssueDeleteEvent.bind(jiraClient));
  app.post('/api/webhooks/link-created', jiraClient.processIssueLinkCreateEvent.bind(jiraClient));
  app.post('/api/webhooks/link-deleted', jiraClient.processIssueLinkDeleteEvent.bind(jiraClient));
  
  // Protect app routes with JWT auth when accessed via iframe
  app.use('/app-entry', jwtAuth);
  app.use('/panels', jwtAuth);
  app.use('/setup', jwtAuth);
}

// API to get forecast of dependencies for the next 3/6/12 months
export async function getForecastDependencies(req: Request, res: Response, next: NextFunction) {
  try {
    const { months = 3 } = req.query;
    const clientKey = (req as any).clientKey;
    
    // Get dependencies from the tenant's Jira instance
    const dependencies = await jiraClient.getForecastDependenciesForTenant(
      clientKey, 
      parseInt(months as string)
    );
    
    res.json(dependencies);
  } catch (error) {
    console.error('Forecast error:', error);
    next(error);
  }
}