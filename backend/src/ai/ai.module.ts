import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiAnalysisService } from './ai-analysis.service';
import { AiClient } from './ai.client';
import { ProjectAnalysisPromptBuilder } from './project-analysis-prompt-builder';

@Module({
  imports: [ConfigModule],
  providers: [AiClient, ProjectAnalysisPromptBuilder, AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiModule {}
