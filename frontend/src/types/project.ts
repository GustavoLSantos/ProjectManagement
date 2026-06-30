export enum ProjectStatus {
  EM_ANALISE = 'Em análise',
  APROVADO = 'Aprovado',
  EM_ANDAMENTO = 'Em andamento',
  ENCERRADO = 'Encerrado',
  CANCELADO = 'Cancelado',
}

export enum RiskLevel {
  BAIXO = 'Baixo',
  MEDIO = 'Médio',
  ALTO = 'Alto',
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  expectedEndDate: string;
  totalBudget: number;
  description: string;
  status: ProjectStatus;
  calculatedRisk: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  startDate: string;
  expectedEndDate: string;
  totalBudget: number;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  startDate?: string;
  expectedEndDate?: string;
  totalBudget?: number;
  description?: string;
}

export interface AiAnalysis {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}
