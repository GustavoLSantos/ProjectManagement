import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: ProjectStatus, example: ProjectStatus.EM_ANDAMENTO })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
