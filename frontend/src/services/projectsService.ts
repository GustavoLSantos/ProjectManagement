import type {
  AiAnalysis,
  CreateProjectData,
  Project,
  ProjectStatus,
  UpdateProjectData,
} from '../types/project';
import api from './api';

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>('/projects');
  return data;
}

export async function getProjectById(id: string): Promise<Project> {
  const { data } = await api.get<Project>(`/projects/${id}`);
  return data;
}

export async function createProject(payload: CreateProjectData): Promise<Project> {
  const { data } = await api.post<Project>('/projects', payload);
  return data;
}

export async function updateProject(id: string, payload: UpdateProjectData): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}`, payload);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

export async function updateStatus(id: string, status: ProjectStatus): Promise<Project> {
  const { data } = await api.patch<Project>(`/projects/${id}/status`, { status });
  return data;
}

export async function getAiAnalysis(id: string): Promise<AiAnalysis> {
  const { data } = await api.get<AiAnalysis>(`/projects/${id}/ai-analysis`);
  return data;
}
