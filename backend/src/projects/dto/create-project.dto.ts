import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Sistema de Gestão Financeira' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2025-01-15', description: 'Data no formato ISO 8601' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-12-31', description: 'Data no formato ISO 8601' })
  @IsDateString()
  expectedEndDate: string;

  @ApiProperty({ example: 150000.0, description: 'Orçamento total em reais' })
  @IsNumber()
  @Min(0.01)
  totalBudget: number;

  @ApiProperty({ example: 'Modernização do sistema legado de finanças.' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
