import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiAnalysisService } from '../ai/ai-analysis.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos' })
  @ApiResponse({ status: 200, description: 'Lista de projetos', type: [ProjectResponseDto] })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado', type: ProjectResponseDto })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover projeto' })
  @ApiResponse({ status: 204, description: 'Projeto removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Projeto não pode ser removido no status atual' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  delete(@Param('id') id: string) {
    return this.projectsService.delete(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar o status do projeto' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso', type: ProjectResponseDto })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.projectsService.updateStatus(id, dto);
  }

  @Get(':id/ai-analysis')
  @ApiOperation({ summary: 'Análise de risco do projeto via IA' })
  @ApiResponse({ status: 200, description: 'Análise gerada com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({ status: 500, description: 'Falha ao gerar análise via IA' })
  async aiAnalysis(@Param('id') id: string) {
    const project = await this.projectsService.findById(id);
    return this.aiAnalysisService.analyzeProject(project);
  }
}
