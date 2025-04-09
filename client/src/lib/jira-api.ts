import { apiRequest } from "./queryClient";
import { Dependency, JiraConfig } from "@shared/schema";

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  status: string;
  assignee?: string;
  dueDate?: string;
  priority?: string;
  labels: string[];
  links: JiraIssueLink[];
}

export interface JiraIssueLink {
  id: string;
  type: string;
  inwardIssue?: {
    id: string;
    key: string;
    summary: string;
  };
  outwardIssue?: {
    id: string;
    key: string;
    summary: string;
  };
}

export interface JiraTeam {
  id: string;
  name: string;
  members: number;
  art?: string;
}

export interface JiraArt {
  id: string;
  name: string;
  teams: JiraTeam[];
  dependencies: number;
}

// Functions for communicating with the server-side Jira API

export async function getJiraConfig(): Promise<JiraConfig> {
  const response = await apiRequest('GET', '/api/integrations/jira', undefined);
  return response.json();
}

export async function saveJiraConfig(config: Partial<JiraConfig>): Promise<JiraConfig> {
  const response = await apiRequest('POST', '/api/integrations/jira', config);
  return response.json();
}

export async function testJiraConnection(config: Partial<JiraConfig>): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest('POST', '/api/integrations/jira/test', config);
  return response.json();
}

export async function getJiraProjects(): Promise<JiraProject[]> {
  const response = await apiRequest('GET', '/api/jira/projects', undefined);
  return response.json();
}

export async function getJiraIssues(projectKey: string): Promise<JiraIssue[]> {
  const response = await apiRequest('GET', `/api/jira/issues?project=${projectKey}`, undefined);
  return response.json();
}

export async function getJiraIssueLinks(issueKey: string): Promise<JiraIssueLink[]> {
  const response = await apiRequest('GET', `/api/jira/issues/${issueKey}/links`, undefined);
  return response.json();
}

export async function getJiraTeams(): Promise<JiraTeam[]> {
  const response = await apiRequest('GET', '/api/jira/teams', undefined);
  return response.json();
}

export async function getJiraArts(): Promise<JiraArt[]> {
  const response = await apiRequest('GET', '/api/jira/arts', undefined);
  return response.json();
}

export async function importJiraDependencies(): Promise<{ success: boolean; count: number }> {
  const response = await apiRequest('POST', '/api/jira/import/dependencies', undefined);
  return response.json();
}

export async function importJiraAlignDependencies(): Promise<{ success: boolean; count: number }> {
  const response = await apiRequest('POST', '/api/jira/import/align-dependencies', undefined);
  return response.json();
}

export async function importCrossArtDependencies(): Promise<{ success: boolean; count: number }> {
  const response = await apiRequest('POST', '/api/jira/import/cross-art-dependencies', undefined);
  return response.json();
}

export async function convertJiraIssueToDependency(issueLink: JiraIssueLink): Promise<Dependency> {
  const response = await apiRequest('POST', '/api/jira/convert-dependency', issueLink);
  return response.json();
}
