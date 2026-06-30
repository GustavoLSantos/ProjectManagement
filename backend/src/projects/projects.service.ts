import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Project, ProjectStatus, RiskLevel } from './entities/project.entity';
import { ProjectRepository } from './projects.repository';

const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.EM_ANALISE]: [ProjectStatus.APROVADO, ProjectStatus.CANCELADO],
  [ProjectStatus.APROVADO]: [ProjectStatus.EM_ANDAMENTO, ProjectStatus.CANCELADO],
  [ProjectStatus.EM_ANDAMENTO]: [ProjectStatus.ENCERRADO, ProjectStatus.CANCELADO],
  [ProjectStatus.ENCERRADO]: [],
  [ProjectStatus.CANCELADO]: [],
};

@Injectable()
export class ProjectsService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async findById(id: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Projeto com id '${id}' não encontrado`);
    }
    return project;
  }

  create(dto: CreateProjectDto): Promise<Project> {
    const startDate = new Date(dto.startDate);
    const expectedEndDate = new Date(dto.expectedEndDate);
    const calculatedRisk = this.calculateRisk(dto.totalBudget, startDate, expectedEndDate);

    return this.projectRepository.create({
      ...dto,
      startDate,
      expectedEndDate,
      status: ProjectStatus.EM_ANALISE,
      calculatedRisk,
    });
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await this.findById(id);

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const expectedEndDate = dto.expectedEndDate
      ? new Date(dto.expectedEndDate)
      : existing.expectedEndDate;
    const totalBudget = dto.totalBudget ?? Number(existing.totalBudget);

    const payload: Partial<Project> = { ...dto, startDate, expectedEndDate };

    if (dto.startDate || dto.expectedEndDate || dto.totalBudget !== undefined) {
      payload.calculatedRisk = this.calculateRisk(totalBudget, startDate, expectedEndDate);
    }

    return (await this.projectRepository.update(id, payload)) as Project;
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Project> {
    const project = await this.findById(id);

    if (dto.status !== ProjectStatus.CANCELADO) {
      const allowed = ALLOWED_TRANSITIONS[project.status] ?? [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Transição de status inválida: '${project.status}' → '${dto.status}'`,
        );
      }
    }

    return (await this.projectRepository.update(id, { status: dto.status })) as Project;
  }

  async delete(id: string): Promise<void> {
    const project = await this.findById(id);

    if (
      project.status === ProjectStatus.EM_ANDAMENTO ||
      project.status === ProjectStatus.ENCERRADO
    ) {
      throw new BadRequestException(
        `Projetos com status '${project.status}' não podem ser excluídos`,
      );
    }

    await this.projectRepository.delete(id);
  }

  private calculateRisk(budget: number, startDate: Date, expectedEndDate: Date): RiskLevel {
    const totalBudget = Number(budget);
    const months = this.diffInMonths(startDate, expectedEndDate);

    const isHigh = totalBudget > 500000 || months > 6;
    if (isHigh) {
      return RiskLevel.ALTO;
    }

    const isMedium = (totalBudget > 100000 && totalBudget <= 500000) || (months > 3 && months <= 6);
    if (isMedium) {
      return RiskLevel.MEDIO;
    }

    return RiskLevel.BAIXO;
  }

  private diffInMonths(startDate: Date, expectedEndDate: Date): number {
    return (
      (expectedEndDate.getFullYear() - startDate.getFullYear()) * 12 +
      (expectedEndDate.getMonth() - startDate.getMonth())
    );
  }
}
