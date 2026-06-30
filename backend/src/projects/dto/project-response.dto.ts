import { ApiProperty } from '@nestjs/swagger';
import { RiskLevel, ProjectStatus } from '../entities/project.entity';

export class ProjectResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'Sistema de Gestão Financeira' })
  name: string;

  @ApiProperty({ example: '2025-01-15' })
  startDate: Date;

  @ApiProperty({ example: '2025-12-31' })
  expectedEndDate: Date;

  @ApiProperty({ example: 150000.0 })
  totalBudget: number;

  @ApiProperty({ example: 'Modernização do sistema legado de finanças.' })
  description: string;

  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.EM_ANDAMENTO })
  status: ProjectStatus;

  @ApiProperty({ enum: RiskLevel, example: RiskLevel.MEDIO })
  calculatedRisk: RiskLevel;

  @ApiProperty({ example: '2025-01-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-01T08:30:00.000Z' })
  updatedAt: Date;
}
