import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Project } from '../projects/entities/project.entity';
import { AiClient } from './ai.client';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt-builder';

export interface ProjectAnalysis {
  summary: string;
  attentionPoints: string[];
  executiveRecommendation: string;
}

@Injectable()
export class AiAnalysisService {
  constructor(
    private readonly aiClient: AiClient,
    private readonly promptBuilder: ProjectAnalysisPromptBuilder,
  ) {}

  async analyzeProject(project: Project): Promise<ProjectAnalysis> {
    const prompt = this.promptBuilder.buildPrompt(project);
    const raw = await this.aiClient.generateAnalysis(prompt);

    try {
      // Strip markdown code fences if the model wraps the JSON despite instructions
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleaned) as ProjectAnalysis;
    } catch {
      throw new InternalServerErrorException('Falha ao processar a resposta da análise de IA');
    }
  }
}
