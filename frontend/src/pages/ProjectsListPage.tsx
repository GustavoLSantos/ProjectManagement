import { useCallback, useEffect, useMemo, useState } from 'react';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { deleteProject, getProjects } from '../services/projectsService';
import type { Project } from '../types/project';
import { ProjectStatus } from '../types/project';
import styles from './ProjectsListPage.module.css';

interface ProjectsListPageProps {
  onNewProject?: () => void;
  onViewDetails?: (project: Project) => void;
  onEdit?: (project: Project) => void;
}

const STATUS_META: Record<
  ProjectStatus,
  { dotColor: string; supportText: string }
> = {
  [ProjectStatus.EM_ANALISE]:   { dotColor: 'var(--c-gray)',   supportText: 'aguardando' },
  [ProjectStatus.APROVADO]:     { dotColor: 'var(--c-blue)',   supportText: 'prontos' },
  [ProjectStatus.EM_ANDAMENTO]: { dotColor: 'var(--c-green)',  supportText: 'ativos' },
  [ProjectStatus.ENCERRADO]:    { dotColor: 'var(--c-purple)', supportText: 'finalizados' },
  [ProjectStatus.CANCELADO]:    { dotColor: 'var(--c-red)',    supportText: 'cancelados' },
};

const STATUS_ORDER = [
  ProjectStatus.EM_ANALISE,
  ProjectStatus.APROVADO,
  ProjectStatus.EM_ANDAMENTO,
  ProjectStatus.ENCERRADO,
  ProjectStatus.CANCELADO,
];

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(s));

export function ProjectsListPage({ onNewProject, onViewDetails, onEdit }: ProjectsListPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchProjects(); }, [fetchProjects]);

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(
      STATUS_ORDER.map((s) => [s, 0]),
    ) as Record<ProjectStatus, number>;
    projects.forEach((p) => counts[p.status]++);
    return counts;
  }, [projects]);

  const filtered = useMemo(
    () =>
      search.trim()
        ? projects.filter((p) =>
            p.name.toLowerCase().includes(search.toLowerCase()),
          )
        : projects,
    [projects, search],
  );

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Deseja excluir "${project.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir projeto');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Projetos</h1>
          <p className={styles.subtitle}>Gerencie seus projetos com inteligência</p>
        </div>
        <button className={styles.btnNew} type="button" onClick={onNewProject}>
          <i className="ti ti-plus" aria-hidden="true" />
          Novo projeto
        </button>
      </div>

      {/* ── Status cards ── */}
      {!isLoading && !error && (
        <div className={styles.statusCards}>
          {STATUS_ORDER.map((status) => {
            const { dotColor, supportText } = STATUS_META[status];
            return (
              <div key={status} className={styles.statusCard}>
                <span className={styles.cardLabel}>{status}</span>
                <span className={styles.cardCount}>{statusCounts[status]}</span>
                <div className={styles.cardFooter}>
                  <span
                    className={styles.dot}
                    style={{ background: dotColor }}
                    aria-hidden="true"
                  />
                  <span className={styles.cardSupportText}>{supportText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className={styles.centered}>
          <div className={styles.spinner} role="status" aria-label="Carregando" />
          <span>Carregando projetos…</span>
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div className={styles.centered}>
          <p className={styles.errorText}>{error}</p>
          <button className={styles.btnRetry} type="button" onClick={fetchProjects}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Table ── */}
      {!isLoading && !error && (
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <span className={styles.tableTitle}>Todos os projetos</span>
            <div className={styles.searchWrapper}>
              <i className={`ti ti-search ${styles.searchIcon}`} aria-hidden="true" />
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Buscar projeto…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar projeto"
              />
            </div>
          </div>

          {projects.length === 0 ? (
            <div className={styles.centered}>
              <span className={styles.emptyIcon} aria-hidden="true">📋</span>
              <p>Nenhum projeto encontrado.</p>
              <button className={styles.btnNew} type="button" onClick={onNewProject}>
                <i className="ti ti-plus" aria-hidden="true" />
                Criar primeiro projeto
              </button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Risco</th>
                  <th>Orçamento</th>
                  <th>Data Início</th>
                  <th>Previsão de Término</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className={styles.centered} style={{ padding: '32px 0' }}>
                        <span>Nenhum projeto corresponde à busca.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((project) => (
                    <tr key={project.id}>
                      <td className={styles.nameCell}>{project.name}</td>
                      <td><StatusBadge status={project.status} /></td>
                      <td><RiskBadge risk={project.calculatedRisk} /></td>
                      <td className={styles.metaText}>{formatBRL(project.totalBudget)}</td>
                      <td className={styles.metaText}>{formatDate(project.startDate)}</td>
                      <td className={styles.metaText}>{formatDate(project.expectedEndDate)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.btnIcon}
                            type="button"
                            title="Ver detalhes"
                            onClick={() => onViewDetails?.(project)}
                          >
                            <i className="ti ti-eye" aria-hidden="true" />
                          </button>
                          <button
                            className={styles.btnIcon}
                            type="button"
                            title="Editar"
                            onClick={() => onEdit?.(project)}
                          >
                            <i className="ti ti-edit" aria-hidden="true" />
                          </button>
                          <button
                            className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                            type="button"
                            title="Excluir"
                            disabled={deletingId === project.id}
                            onClick={() => void handleDelete(project)}
                          >
                            <i className="ti ti-trash" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
