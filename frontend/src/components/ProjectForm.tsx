import { useState } from 'react';
import { createProject, updateProject } from '../services/projectsService';
import type { Project } from '../types/project';
import styles from './ProjectForm.module.css';

interface ProjectFormProps {
  project?: Project;
  onSuccess: (project: Project) => void;
  onCancel?: () => void;
}

interface FormValues {
  name: string;
  startDate: string;
  expectedEndDate: string;
  totalBudget: string;
  description: string;
}

interface FormErrors {
  name?: string;
  startDate?: string;
  expectedEndDate?: string;
  totalBudget?: string;
  description?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim())
    errors.name = 'Nome é obrigatório';
  if (!values.startDate)
    errors.startDate = 'Data de início é obrigatória';
  if (!values.expectedEndDate)
    errors.expectedEndDate = 'Previsão de término é obrigatória';
  else if (values.startDate && values.expectedEndDate <= values.startDate)
    errors.expectedEndDate = 'A data de término deve ser posterior à data de início';
  const budget = parseFloat(values.totalBudget);
  if (!values.totalBudget)
    errors.totalBudget = 'Orçamento é obrigatório';
  else if (isNaN(budget) || budget <= 0)
    errors.totalBudget = 'Orçamento deve ser maior que zero';
  if (!values.description.trim())
    errors.description = 'Descrição é obrigatória';
  return errors;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const isEdit = Boolean(project);

  const [values, setValues] = useState<FormValues>(() => ({
    name:            project?.name ?? '',
    startDate:       project?.startDate ?? '',
    expectedEndDate: project?.expectedEndDate ?? '',
    totalBudget:     project ? String(Number(project.totalBudget)) : '',
    description:     project?.description ?? '',
  }));
  const [errors, setErrors]         = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name:            values.name.trim(),
        startDate:       values.startDate,
        expectedEndDate: values.expectedEndDate,
        totalBudget:     parseFloat(values.totalBudget),
        description:     values.description.trim(),
      };
      const result = isEdit && project
        ? await updateProject(project.id, payload)
        : await createProject(payload);
      onSuccess(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar projeto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ic = (f: keyof FormErrors) =>
    `${styles.input}${errors[f] ? ` ${styles.inputError}` : ''}`;

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)} noValidate>
      {/* Nome */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="pf-name">
          Nome do projeto <span className={styles.required}>*</span>
        </label>
        <input
          id="pf-name" type="text" className={ic('name')}
          value={values.name} onChange={set('name')}
          placeholder="Nome do projeto" disabled={isSubmitting}
        />
        {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
      </div>

      {/* Datas */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-start">
            Data de início <span className={styles.required}>*</span>
          </label>
          <input
            id="pf-start" type="date" className={ic('startDate')}
            value={values.startDate} onChange={set('startDate')}
            disabled={isSubmitting}
          />
          {errors.startDate && <p className={styles.fieldError}>{errors.startDate}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pf-end">
            Previsão de término <span className={styles.required}>*</span>
          </label>
          <input
            id="pf-end" type="date" className={ic('expectedEndDate')}
            value={values.expectedEndDate} onChange={set('expectedEndDate')}
            min={values.startDate || undefined} disabled={isSubmitting}
          />
          {errors.expectedEndDate && <p className={styles.fieldError}>{errors.expectedEndDate}</p>}
        </div>
      </div>

      {/* Orçamento */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="pf-budget">
          Orçamento total (R$) <span className={styles.required}>*</span>
        </label>
        <input
          id="pf-budget" type="number" className={ic('totalBudget')}
          value={values.totalBudget} onChange={set('totalBudget')}
          placeholder="0,00" min="0.01" step="0.01" disabled={isSubmitting}
        />
        {errors.totalBudget && <p className={styles.fieldError}>{errors.totalBudget}</p>}
      </div>

      {/* Descrição */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="pf-desc">
          Descrição <span className={styles.required}>*</span>
        </label>
        <textarea
          id="pf-desc"
          className={`${styles.textarea}${errors.description ? ` ${styles.inputError}` : ''}`}
          value={values.description} onChange={set('description')}
          rows={3} placeholder="Descreva o objetivo e escopo do projeto"
          disabled={isSubmitting}
        />
        {errors.description && <p className={styles.fieldError}>{errors.description}</p>}
      </div>

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <div className={styles.footer}>
        {onCancel && (
          <button type="button" className={styles.btnGhost} onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
          {isSubmitting && <span className={styles.spinner} aria-hidden="true" />}
          {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
        </button>
      </div>
    </form>
  );
}
