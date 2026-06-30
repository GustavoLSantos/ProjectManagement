import type { CSSProperties } from 'react';
import { ProjectStatus } from '../types/project';

interface StatusBadgeProps {
  status: ProjectStatus;
}

const CONFIG: Record<ProjectStatus, { bg: string; color: string; border: string }> = {
  [ProjectStatus.EM_ANALISE]:   { bg: 'var(--c-gray-bg)',   color: 'var(--c-gray)',   border: '0.5px solid var(--c-gray-border)' },
  [ProjectStatus.APROVADO]:     { bg: 'var(--c-blue-bg)',   color: 'var(--c-blue)',   border: '0.5px solid var(--c-blue-border)' },
  [ProjectStatus.EM_ANDAMENTO]: { bg: 'var(--c-green-bg)',  color: 'var(--c-green)',  border: '0.5px solid var(--c-green-border)' },
  [ProjectStatus.ENCERRADO]:    { bg: 'var(--c-purple-bg)', color: 'var(--c-purple)', border: '0.5px solid var(--c-purple-border)' },
  [ProjectStatus.CANCELADO]:    { bg: 'var(--c-red-bg)',    color: 'var(--c-red)',    border: '0.5px solid var(--c-red-border)' },
};

const BASE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: 99,
  padding: '3px 10px',
  fontSize: 12,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  lineHeight: 1.5,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, color, border } = CONFIG[status];
  return (
    <span style={{ ...BASE, background: bg, color, border }}>{status}</span>
  );
}
