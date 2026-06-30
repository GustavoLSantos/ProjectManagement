import type { CSSProperties } from 'react';
import { RiskLevel } from '../types/project';

interface RiskBadgeProps {
  risk: RiskLevel;
}

const CONFIG: Record<RiskLevel, { bg: string; color: string; border: string }> = {
  [RiskLevel.BAIXO]: { bg: 'var(--c-green-bg)',  color: 'var(--c-green)',  border: '0.5px solid var(--c-green-border)' },
  [RiskLevel.MEDIO]: { bg: 'var(--c-amber-bg)',  color: 'var(--c-amber)',  border: '0.5px solid var(--c-amber-border)' },
  [RiskLevel.ALTO]:  { bg: 'var(--c-red-bg)',    color: 'var(--c-red)',    border: '0.5px solid var(--c-red-border)' },
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

export function RiskBadge({ risk }: RiskBadgeProps) {
  const { bg, color, border } = CONFIG[risk];
  return (
    <span style={{ ...BASE, background: bg, color, border }}>{risk}</span>
  );
}
