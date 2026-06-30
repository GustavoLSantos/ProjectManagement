import { useEffect, useMemo, useRef, useState } from 'react';
import { getAiAnalysis, updateStatus } from '../services/projectsService';
import type { AiAnalysis, Project } from '../types/project';
import { ProjectStatus } from '../types/project';
import { RiskBadge } from './RiskBadge';
import { StatusBadge } from './StatusBadge';
import styles from './ProjectDetailModal.module.css';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated?: (project: Project) => void;
}

const NEXT_STATUS: Partial<Record<ProjectStatus, ProjectStatus>> = {
  [ProjectStatus.EM_ANALISE]:   ProjectStatus.APROVADO,
  [ProjectStatus.APROVADO]:     ProjectStatus.EM_ANDAMENTO,
  [ProjectStatus.EM_ANDAMENTO]: ProjectStatus.ENCERRADO,
};

const TERMINAL = new Set([ProjectStatus.ENCERRADO, ProjectStatus.CANCELADO]);

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(s));

function calcDuration(start: string, end: string): string {
  const days = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000,
  );
  const m = Math.floor(days / 30);
  const d = days % 30;
  if (m === 0) return `${days} dias`;
  if (d === 0) return `${m} ${m === 1 ? 'mês' : 'meses'}`;
  return `${m} ${m === 1 ? 'mês' : 'meses'} e ${d} dias`;
}

export function ProjectDetailModal({
  project: initial,
  onClose,
  onProjectUpdated,
}: ProjectDetailModalProps) {
  const [project, setProject]         = useState<Project>(initial);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [analysis, setAnalysis]       = useState<AiAnalysis | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const applyStatus = async (next: ProjectStatus) => {
    setActionError(null);
    try {
      const updated = await updateStatus(project.id, next);
      setProject(updated);
      onProjectUpdated?.(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erro ao atualizar status');
    }
  };

  const handleAdvance = async () => {
    const next = NEXT_STATUS[project.status];
    if (!next) return;
    setIsAdvancing(true);
    await applyStatus(next);
    setIsAdvancing(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Deseja cancelar este projeto?')) return;
    setIsCancelling(true);
    await applyStatus(ProjectStatus.CANCELADO);
    setIsCancelling(false);
  };

  const handleAnalyse = async () => {
    setIsAnalysing(true);
    setAnalysisError(null);
    try {
      setAnalysis(await getAiAnalysis(project.id));
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Erro ao gerar análise');
    } finally {
      setIsAnalysing(false);
    }
  };

  const nextStatus  = NEXT_STATUS[project.status];
  const canCancel   = !TERMINAL.has(project.status);
  const isBusy      = isAdvancing || isCancelling;
  const duration    = useMemo(
    () => calcDuration(project.startDate, project.expectedEndDate),
    [project.startDate, project.expectedEndDate],
  );

  const showAiBlock = isAnalysing || analysis !== null || analysisError !== null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dm-title"
      >
        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 id="dm-title" className={styles.modalTitle}>{project.name}</h2>
            <div className={styles.headerBadges}>
              <StatusBadge status={project.status} />
              <RiskBadge risk={project.calculatedRisk} />
            </div>
          </div>
          <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Fechar">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.modalBody}>
          {/* Info cards 2×2 */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Orçamento Total</span>
              <span className={styles.infoValue}>{formatBRL(project.totalBudget)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Duração calculada</span>
              <span className={styles.infoValue}>{duration}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Data de Início</span>
              <span className={styles.infoValue}>{formatDate(project.startDate)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Previsão de Término</span>
              <span className={styles.infoValue}>{formatDate(project.expectedEndDate)}</span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.descBlock}>
            <p className={styles.sectionLabel}>Descrição</p>
            <p className={styles.description}>{project.description}</p>
          </div>

          {/* AI Analysis block */}
          {showAiBlock && (
            <div className={styles.aiBlock}>
              <div className={styles.aiBlockHeader}>
                <i className="ti ti-sparkles" aria-hidden="true" />
                Análise de IA
              </div>

              {isAnalysing && (
                <div className={styles.aiLoading}>
                  <div className={styles.aiSpinner} role="status" aria-label="Analisando" />
                  <span>Analisando projeto…</span>
                </div>
              )}

              {analysisError && !isAnalysing && (
                <div className={styles.aiError}>
                  <i className="ti ti-alert-circle" aria-hidden="true" />
                  <span>{analysisError}</span>
                </div>
              )}

              {analysis && !isAnalysing && (
                <div className={styles.aiSections}>
                  <div className={styles.aiSection}>
                    <p className={styles.aiSectionLabel}>Resumo</p>
                    <p className={styles.aiSectionText}>{analysis.summary}</p>
                  </div>
                  <div className={styles.aiSection}>
                    <p className={styles.aiSectionLabel}>Pontos de Atenção</p>
                    <ul className={styles.aiList}>
                      {analysis.attentionPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.aiSection}>
                    <p className={styles.aiSectionLabel}>Recomendação Executiva</p>
                    <p className={styles.aiSectionText}>{analysis.executiveRecommendation}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            {nextStatus && (
              <button
                className={styles.btnPrimary}
                type="button"
                disabled={isBusy}
                onClick={() => void handleAdvance()}
              >
                {isAdvancing ? (
                  'Avançando…'
                ) : (
                  <>
                    <i className="ti ti-arrow-right" aria-hidden="true" />
                    Avançar status
                  </>
                )}
              </button>
            )}

            <button
              className={styles.btnOutlineBlue}
              type="button"
              disabled={isAnalysing}
              onClick={() => void handleAnalyse()}
            >
              <i className="ti ti-sparkles" aria-hidden="true" />
              {analysis ? 'Regenerar análise' : 'Gerar análise'}
            </button>

            {actionError && (
              <span className={styles.actionError}>{actionError}</span>
            )}
          </div>

          <div className={styles.footerRight}>
            {canCancel && (
              <button
                className={styles.btnOutlineRed}
                type="button"
                disabled={isBusy}
                onClick={() => void handleCancel()}
              >
                {isCancelling ? 'Cancelando…' : 'Cancelar projeto'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
