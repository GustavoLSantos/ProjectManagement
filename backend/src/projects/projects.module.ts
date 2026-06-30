import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Project } from './entities/project.entity';
import { ProjectsController } from './projects.controller';
import { ProjectRepository } from './projects.repository';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), AiModule],
  controllers: [ProjectsController],
  providers: [ProjectRepository, ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
