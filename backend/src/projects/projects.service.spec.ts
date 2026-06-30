import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Project, ProjectStatus, RiskLevel } from './entities/project.entity';
import { ProjectRepository } from './projects.repository';
import { ProjectsService } from './projects.service';

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Projeto de teste',
    startDate: new Date('2025-01-15'),
    expectedEndDate: new Date('2025-03-15'),
    totalBudget: 50000,
    description: 'Descrição de teste',
    status: ProjectStatus.EM_ANALISE,
    calculatedRisk: RiskLevel.BAIXO,
    createdAt: new Date('2025-01-10T10:00:00.000Z'),
    updatedAt: new Date('2025-01-10T10:00:00.000Z'),
    ...overrides,
  };
}

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    projectRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ProjectRepository>;

    service = new ProjectsService(projectRepository);
  });

  describe('Cálculo de Risco', () => {
    describe('Dado um projeto com orçamento até R$100.000 e prazo de até 3 meses', () => {
      it('deve classificar como Baixo risco', async () => {
        const created = buildProject({ calculatedRisk: RiskLevel.BAIXO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto pequeno',
          startDate: '2025-01-15',
          expectedEndDate: '2025-03-15',
          totalBudget: 80000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.BAIXO }),
        );
      });
    });

    describe('Dado um projeto com orçamento entre R$100.001 e R$500.000', () => {
      it('deve classificar como Médio risco', async () => {
        const created = buildProject({ calculatedRisk: RiskLevel.MEDIO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto médio',
          startDate: '2025-01-15',
          expectedEndDate: '2025-03-15',
          totalBudget: 300000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.MEDIO }),
        );
      });
    });

    describe('Dado um projeto com prazo maior que 3 e menor ou igual a 6 meses', () => {
      it('deve classificar como Médio risco', async () => {
        const created = buildProject({ calculatedRisk: RiskLevel.MEDIO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto com prazo médio',
          startDate: '2025-01-15',
          expectedEndDate: '2025-06-15',
          totalBudget: 50000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.MEDIO }),
        );
      });
    });

    describe('Dado um projeto com orçamento acima de R$500.000', () => {
      it('deve classificar como Alto risco', async () => {
        const created = buildProject({ calculatedRisk: RiskLevel.ALTO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto caro',
          startDate: '2025-01-15',
          expectedEndDate: '2025-03-15',
          totalBudget: 600000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.ALTO }),
        );
      });
    });

    describe('Dado um projeto com prazo superior a 6 meses', () => {
      it('deve classificar como Alto risco', async () => {
        const created = buildProject({ calculatedRisk: RiskLevel.ALTO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto longo',
          startDate: '2025-01-15',
          expectedEndDate: '2025-09-15',
          totalBudget: 50000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.ALTO }),
        );
      });
    });

    describe('Dado um projeto onde mais de uma regra se aplica', () => {
      it('deve prevalecer o maior risco', async () => {
        // Orçamento se qualificaria como Médio isoladamente, mas o prazo (8 meses) é Alto.
        const created = buildProject({ calculatedRisk: RiskLevel.ALTO });
        projectRepository.create.mockResolvedValue(created);

        await service.create({
          name: 'Projeto com regras conflitantes',
          startDate: '2025-01-15',
          expectedEndDate: '2025-09-15',
          totalBudget: 300000,
          description: 'Descrição',
        });

        expect(projectRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ calculatedRisk: RiskLevel.ALTO }),
        );
      });
    });
  });

  describe('Transição de Status', () => {
    it('deve permitir: Em análise → Aprovado', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANALISE });
      projectRepository.findById.mockResolvedValue(existing);
      projectRepository.update.mockResolvedValue(
        buildProject({ status: ProjectStatus.APROVADO }),
      );

      await service.updateStatus(existing.id, { status: ProjectStatus.APROVADO });

      expect(projectRepository.update).toHaveBeenCalledWith(existing.id, {
        status: ProjectStatus.APROVADO,
      });
    });

    it('deve permitir: Aprovado → Em andamento', async () => {
      const existing = buildProject({ status: ProjectStatus.APROVADO });
      projectRepository.findById.mockResolvedValue(existing);
      projectRepository.update.mockResolvedValue(
        buildProject({ status: ProjectStatus.EM_ANDAMENTO }),
      );

      await service.updateStatus(existing.id, { status: ProjectStatus.EM_ANDAMENTO });

      expect(projectRepository.update).toHaveBeenCalledWith(existing.id, {
        status: ProjectStatus.EM_ANDAMENTO,
      });
    });

    it('deve permitir: Em andamento → Encerrado', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANDAMENTO });
      projectRepository.findById.mockResolvedValue(existing);
      projectRepository.update.mockResolvedValue(
        buildProject({ status: ProjectStatus.ENCERRADO }),
      );

      await service.updateStatus(existing.id, { status: ProjectStatus.ENCERRADO });

      expect(projectRepository.update).toHaveBeenCalledWith(existing.id, {
        status: ProjectStatus.ENCERRADO,
      });
    });

    it('deve permitir: qualquer status → Cancelado', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANDAMENTO });
      projectRepository.findById.mockResolvedValue(existing);
      projectRepository.update.mockResolvedValue(
        buildProject({ status: ProjectStatus.CANCELADO }),
      );

      await service.updateStatus(existing.id, { status: ProjectStatus.CANCELADO });

      expect(projectRepository.update).toHaveBeenCalledWith(existing.id, {
        status: ProjectStatus.CANCELADO,
      });
    });

    it('deve bloquear: Em análise → Em andamento', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANALISE });
      projectRepository.findById.mockResolvedValue(existing);

      await expect(
        service.updateStatus(existing.id, { status: ProjectStatus.EM_ANDAMENTO }),
      ).rejects.toThrow(BadRequestException);
      expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it('deve bloquear: Em análise → Encerrado', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANALISE });
      projectRepository.findById.mockResolvedValue(existing);

      await expect(
        service.updateStatus(existing.id, { status: ProjectStatus.ENCERRADO }),
      ).rejects.toThrow(BadRequestException);
      expect(projectRepository.update).not.toHaveBeenCalled();
    });

    it('deve bloquear: Aprovado → Encerrado', async () => {
      const existing = buildProject({ status: ProjectStatus.APROVADO });
      projectRepository.findById.mockResolvedValue(existing);

      await expect(
        service.updateStatus(existing.id, { status: ProjectStatus.ENCERRADO }),
      ).rejects.toThrow(BadRequestException);
      expect(projectRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Exclusão de Projetos', () => {
    it('deve permitir excluir projeto Em análise', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANALISE });
      projectRepository.findById.mockResolvedValue(existing);

      await service.delete(existing.id);

      expect(projectRepository.delete).toHaveBeenCalledWith(existing.id);
    });

    it('deve permitir excluir projeto Aprovado', async () => {
      const existing = buildProject({ status: ProjectStatus.APROVADO });
      projectRepository.findById.mockResolvedValue(existing);

      await service.delete(existing.id);

      expect(projectRepository.delete).toHaveBeenCalledWith(existing.id);
    });

    it('deve permitir excluir projeto Cancelado', async () => {
      const existing = buildProject({ status: ProjectStatus.CANCELADO });
      projectRepository.findById.mockResolvedValue(existing);

      await service.delete(existing.id);

      expect(projectRepository.delete).toHaveBeenCalledWith(existing.id);
    });

    it('deve bloquear exclusão de projeto Em andamento', async () => {
      const existing = buildProject({ status: ProjectStatus.EM_ANDAMENTO });
      projectRepository.findById.mockResolvedValue(existing);

      await expect(service.delete(existing.id)).rejects.toThrow(BadRequestException);
      expect(projectRepository.delete).not.toHaveBeenCalled();
    });

    it('deve bloquear exclusão de projeto Encerrado', async () => {
      const existing = buildProject({ status: ProjectStatus.ENCERRADO });
      projectRepository.findById.mockResolvedValue(existing);

      await expect(service.delete(existing.id)).rejects.toThrow(BadRequestException);
      expect(projectRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deve lançar NotFoundException quando o projeto não existe', async () => {
      projectRepository.findById.mockResolvedValue(null);

      await expect(service.findById('id-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
