import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProjectStatus {
  EM_ANALISE = 'Em análise',
  APROVADO = 'Aprovado',
  EM_ANDAMENTO = 'Em andamento',
  ENCERRADO = 'Encerrado',
  CANCELADO = 'Cancelado',
}

export enum RiskLevel {
  BAIXO = 'Baixo',
  MEDIO = 'Médio',
  ALTO = 'Alto',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  expectedEndDate: Date;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  totalBudget: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus })
  status: ProjectStatus;

  @Column({ type: 'enum', enum: RiskLevel })
  calculatedRisk: RiskLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
