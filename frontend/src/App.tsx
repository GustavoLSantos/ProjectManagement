import { useEffect, useState } from 'react';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectForm } from './components/ProjectForm';
import { ProjectsListPage } from './pages/ProjectsListPage';
import type { Project } from './types/project';

// ── View state machine ────────────────────────────────────────────────────────
type View =
  | { kind: 'list' }
  | { kind: 'new-project' }
  | { kind: 'edit-project'; project: Project }
  | { kind: 'view-project'; project: Project };

// ── Thin modal wrapper used only for create / edit forms ─────────────────────
function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 24,
        boxSizing: 'border-box',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-h)' }}
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              color: 'var(--text)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '20px 24px 24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState<View>({ kind: 'list' });
  // Incrementing this key remounts ProjectsListPage, triggering a fresh fetch.
  const [listKey, setListKey] = useState(0);

  const goToList = () => setView({ kind: 'list' });

  const refreshList = () => {
    setListKey((k) => k + 1);
    setView({ kind: 'list' });
  };

  const isFormOpen = view.kind === 'new-project' || view.kind === 'edit-project';

  return (
    <>
      <ProjectsListPage
        key={listKey}
        onNewProject={() => setView({ kind: 'new-project' })}
        onViewDetails={(project) => setView({ kind: 'view-project', project })}
        onEdit={(project) => setView({ kind: 'edit-project', project })}
      />

      {isFormOpen && (
        <FormModal
          title={view.kind === 'new-project' ? 'Novo Projeto' : 'Editar Projeto'}
          onClose={goToList}
        >
          <ProjectForm
            project={view.kind === 'edit-project' ? view.project : undefined}
            onSuccess={refreshList}
            onCancel={goToList}
          />
        </FormModal>
      )}

      {view.kind === 'view-project' && (
        <ProjectDetailModal
          project={view.project}
          // Refresh the list on close so any status change is reflected.
          onClose={refreshList}
          // Keep the modal in sync while it's still open.
          onProjectUpdated={(updated) =>
            setView({ kind: 'view-project', project: updated })
          }
        />
      )}
    </>
  );
}

export default App;
