import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectsListPage } from './ProjectsListPage'
import { deleteProject, getProjects } from '../services/projectsService'
import { ProjectStatus, RiskLevel } from '../types/project'
import type { Project } from '../types/project'

vi.mock('../services/projectsService', () => ({
  getProjects: vi.fn(),
  deleteProject: vi.fn(),
}))

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Projeto Alpha',
  startDate: '2024-01-01',
  expectedEndDate: '2024-06-01',
  totalBudget: 100000,
  description: 'Descrição do projeto alpha.',
  status: ProjectStatus.EM_ANALISE,
  calculatedRisk: RiskLevel.BAIXO,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

describe('ProjectsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockReturnValue(false)
  })

  it('exibe spinner enquanto os projetos estão sendo carregados', () => {
    vi.mocked(getProjects).mockReturnValue(new Promise(() => {}))
    render(<ProjectsListPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('exibe mensagem de estado vazio quando não há projetos', async () => {
    vi.mocked(getProjects).mockResolvedValue([])
    render(<ProjectsListPage />)
    expect(await screen.findByText(/nenhum projeto encontrado/i)).toBeInTheDocument()
  })

  it('exibe mensagem de erro e botão de retry quando o fetch falha', async () => {
    vi.mocked(getProjects).mockRejectedValue(new Error('Falha de rede'))
    render(<ProjectsListPage />)
    expect(await screen.findByText('Falha de rede')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
  })

  it('renderiza a lista de projetos com nome, status e risco visíveis', async () => {
    const projects = [
      makeProject({ id: '1', name: 'Projeto Alpha', status: ProjectStatus.EM_ANALISE, calculatedRisk: RiskLevel.BAIXO }),
      makeProject({ id: '2', name: 'Projeto Beta', status: ProjectStatus.APROVADO, calculatedRisk: RiskLevel.ALTO }),
    ]
    vi.mocked(getProjects).mockResolvedValue(projects)
    render(<ProjectsListPage />)

    expect(await screen.findByText('Projeto Alpha')).toBeInTheDocument()
    expect(screen.getByText('Projeto Beta')).toBeInTheDocument()
    // Status badge in table (may also appear in status cards at top)
    expect(screen.getAllByText('Em análise').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Aprovado').length).toBeGreaterThan(0)
    // Risk badges
    expect(screen.getByText('Baixo')).toBeInTheDocument()
    expect(screen.getByText('Alto')).toBeInTheDocument()
  })

  it('chama deleteProject com o ID correto ao excluir um projeto', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(getProjects).mockResolvedValue([makeProject({ id: 'proj-42', name: 'Projeto Para Deletar' })])
    vi.mocked(deleteProject).mockResolvedValue(undefined)

    render(<ProjectsListPage />)
    await screen.findByText('Projeto Para Deletar')
    await user.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(window.confirm).toHaveBeenCalled()
    await waitFor(() => {
      expect(vi.mocked(deleteProject)).toHaveBeenCalledWith('proj-42')
    })
    await waitFor(() => {
      expect(screen.queryByText('Projeto Para Deletar')).not.toBeInTheDocument()
    })
  })

  it('chama onNewProject ao clicar no botão "Novo projeto"', async () => {
    const user = userEvent.setup()
    const onNewProject = vi.fn()
    vi.mocked(getProjects).mockResolvedValue([])
    render(<ProjectsListPage onNewProject={onNewProject} />)
    await user.click(screen.getByRole('button', { name: /novo projeto/i }))
    expect(onNewProject).toHaveBeenCalled()
  })
})
