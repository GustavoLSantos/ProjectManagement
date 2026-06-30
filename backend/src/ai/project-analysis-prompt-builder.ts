import { Injectable } from '@nestjs/common';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class ProjectAnalysisPromptBuilder {
  buildPrompt(project: Project): string {
    const budget = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(project.totalBudget));

    const fmt = (d: Date | string) =>
      new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(d));

    return `Você é um consultor sênior de gestão de projetos. Analise o projeto abaixo e retorne APENAS um objeto JSON válido, sem texto adicional, markdown ou explicações.

O JSON deve ter exatamente estas três chaves:
- "summary": string — resumo executivo de 2 a 3 frases sobre os principais riscos do projeto.
- "attentionPoints": array de strings — cada item descreve um ponto de atenção específico e objetivo.
- "executiveRecommendation": string — uma recomendação direta de ação imediata para a liderança do projeto.

Dados do projeto:
Nome: ${project.name}
Status: ${project.status}
Risco calculado: ${project.calculatedRisk}
Orçamento total: ${budget}
Data de início: ${fmt(project.startDate)}
Previsão de término: ${fmt(project.expectedEndDate)}
Descrição: ${project.description}

Responda SOMENTE com o JSON.`;
  }
}
