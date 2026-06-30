import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectDetailModal } from './ProjectDetailModal'
import { getAiAnalysis, updateStatus } from '../services/projectsService'
import { ProjectStatus, RiskLevel } from '../types/project'
import type { AiAnalysis, Project } from '../types/project'

vi.mock('../services/projectsService', () => ({
  updateStatus: vi.fn(),
  getAiAnalysis: vi.fn(),
}))

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Projeto Teste Alpha',
  startDate: '2024-01-01',
  expectedEndDate: '2024-06-01',
  totalBudget: 100000,
  description: 'Descrição detalhada do projeto de teste.',
  status: ProjectStatus.EM_ANALISE,
  calculatedRisk: RiskLevel.BAIXO,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const makeAnalysis = (overrides: Partial<AiAnalysis> = {}): AiAnalysis => ({
  summary: 'Projeto em bom andamento.',
  attentionPoints: ['Prazo apertado', 'Orçamento no limite'],
  executiveRecommendation: 'Recomenda-se ampliar o time.',
  ...overrides,
})

describe('ProjectDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
  })

  it('renderiza os dados completos do projeto', () => {
    render(<ProjectDetailModal project={makeProject()} onClose={vi.fn()} />)

    expect(screen.getByText('Projeto Teste Alpha')).toBeInTheDocument()
    expect(screen.getByText('Em análise')).toBeInTheDocument()  // StatusBadge
    expect(screen.getByText('Baixo')).toBeInTheDocument()        // RiskBadge
    expect(screen.getByText('Descrição detalhada do projeto de teste.')).toBeInTheDocument()
    expect(screen.getByText('Orçamento Total')).toBeInTheDocument()
    expect(screen.getByText('Data de Início')).toBeInTheDocument()
    expect(screen.getByText('Previsão de Término')).toBeInTheDocument()
    expect(screen.getByText('Duração calculada')).toBeInTheDocument()
  })

  it('não exibe botão "Avançar status" quando status é Encerrado', () => {
    render(
      <ProjectDetailModal
        project={makeProject({ status: ProjectStatus.ENCERRADO })}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /avançar status/i })).not.toBeInTheDocument()
  })

  it('não exibe botão "Avançar status" quando status é Cancelado', () => {
    render(
      <ProjectDetailModal
        project={makeProject({ status: ProjectStatus.CANCELADO })}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /avançar status/i })).not.toBeInTheDocument()
  })

  it('não exibe botão "Cancelar projeto" quando status já é Encerrado', () => {
    render(
      <ProjectDetailModal
        project={makeProject({ status: ProjectStatus.ENCERRADO })}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /cancelar projeto/i })).not.toBeInTheDocument()
  })

  it('não exibe botão "Cancelar projeto" quando status já é Cancelado', () => {
    render(
      <ProjectDetailModal
        project={makeProject({ status: ProjectStatus.CANCELADO })}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: /cancelar projeto/i })).not.toBeInTheDocument()
  })

  it('chama getAiAnalysis e exibe summary, attentionPoints e executiveRecommendation', async () => {
    const user = userEvent.setup()
    const analysis = makeAnalysis()
    vi.mocked(getAiAnalysis).mockResolvedValue(analysis)

    render(<ProjectDetailModal project={makeProject()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /gerar análise/i }))

    expect(await screen.findByText('Projeto em bom andamento.')).toBeInTheDocument()
    expect(screen.getByText('Prazo apertado')).toBeInTheDocument()
    expect(screen.getByText('Orçamento no limite')).toBeInTheDocument()
    expect(screen.getByText('Recomenda-se ampliar o time.')).toBeInTheDocument()
    expect(vi.mocked(getAiAnalysis)).toHaveBeenCalledWith('proj-1')
  })

  it('exibe indicador de loading durante a chamada de análise de IA', async () => {
    const user = userEvent.setup()
    vi.mocked(getAiAnalysis).mockReturnValue(new Promise(() => {}))

    render(<ProjectDetailModal project={makeProject()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /gerar análise/i }))

    expect(await screen.findByText(/analisando projeto/i)).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando a análise de IA falha', async () => {
    const user = userEvent.setup()
    vi.mocked(getAiAnalysis).mockRejectedValue(new Error('Falha ao conectar ao serviço de IA'))

    render(<ProjectDetailModal project={makeProject()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /gerar análise/i }))

    expect(await screen.findByText('Falha ao conectar ao serviço de IA')).toBeInTheDocument()
  })
})

// suppress unused import warning — updateStatus is mocked but used only via component interactions
void updateStatus
