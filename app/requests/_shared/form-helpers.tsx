import { DEPARTMENTS, CATEGORIES } from '@/types'

export interface FormData {
  title: string
  description: string
  department: string
  category: string
  businessJustification: string
  estimatedCost: string
  targetStartDate: string
  targetEndDate: string
  priority: string
  impact: string
}

export interface FieldErrors {
  title?: string
  department?: string
  category?: string
  businessJustification?: string
}

export const INITIAL: FormData = {
  title: '',
  description: '',
  department: '',
  category: '',
  businessJustification: '',
  estimatedCost: '',
  targetStartDate: '',
  targetEndDate: '',
  priority: '',
  impact: '',
}

export function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!data.title.trim()) errors.title = 'Title is required'
  else if (data.title.length > 200) errors.title = 'Title must be 200 characters or fewer'
  if (!data.department) errors.department = 'Department is required'
  if (!data.category) errors.category = 'Category is required'
  if (!data.businessJustification.trim()) errors.businessJustification = 'Business justification is required'
  else if (data.businessJustification.length > 5000) errors.businessJustification = 'Business justification must be 5000 characters or fewer'
  return errors
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="bg-muted/50 px-5 py-3 border-b">
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

export function inputClass(hasError: boolean) {
  return `w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
    hasError ? 'border-destructive focus:ring-destructive/30' : 'border-input'
  }`
}

export function Field({
  label,
  required,
  fieldId,
  error,
  children,
}: {
  label: string
  required?: boolean
  fieldId: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="text-sm font-medium">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${fieldId}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export function RequestFormFields({
  form,
  fieldErrors,
  set,
}: {
  form: FormData
  fieldErrors: FieldErrors
  set: (key: keyof FormData, value: string) => void
}) {
  return (
    <>
      <FormSection title="Basic Information" description="Describe what you're requesting.">
        <Field label="Title" required fieldId="field-title" error={fieldErrors.title}>
          <input
            id="field-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Short, descriptive title"
            aria-required="true"
            aria-describedby={fieldErrors.title ? 'field-title-error' : undefined}
            className={inputClass(!!fieldErrors.title)}
          />
        </Field>

        <Field label="Description" fieldId="field-description">
          <textarea
            id="field-description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional additional context"
            rows={3}
            className={`${inputClass(false)} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department" required fieldId="field-department" error={fieldErrors.department}>
            <select
              id="field-department"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              aria-required="true"
              aria-describedby={fieldErrors.department ? 'field-department-error' : undefined}
              className={inputClass(!!fieldErrors.department)}
            >
              <option value="">Select…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="Category" required fieldId="field-category" error={fieldErrors.category}>
            <select
              id="field-category"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              aria-required="true"
              aria-describedby={fieldErrors.category ? 'field-category-error' : undefined}
              className={inputClass(!!fieldErrors.category)}
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Details" description="Cost, priority, and timeline.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated Cost" fieldId="field-cost">
            <input
              id="field-cost"
              type="number"
              value={form.estimatedCost}
              onChange={(e) => set('estimatedCost', e.target.value)}
              placeholder="0"
              min="0"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Priority" fieldId="field-priority">
            <select
              id="field-priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
              className={inputClass(false)}
            >
              <option value="">None</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Target Start Date" fieldId="field-start-date">
            <input
              id="field-start-date"
              type="date"
              value={form.targetStartDate}
              onChange={(e) => set('targetStartDate', e.target.value)}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Target End Date" fieldId="field-end-date">
            <input
              id="field-end-date"
              type="date"
              value={form.targetEndDate}
              onChange={(e) => set('targetEndDate', e.target.value)}
              className={inputClass(false)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Justification" description="Explain the need and expected impact.">
        <Field label="Business Justification" required fieldId="field-justification" error={fieldErrors.businessJustification}>
          <textarea
            id="field-justification"
            value={form.businessJustification}
            onChange={(e) => set('businessJustification', e.target.value)}
            placeholder="Why is this request needed? What problem does it solve?"
            rows={4}
            aria-required="true"
            aria-describedby={fieldErrors.businessJustification ? 'field-justification-error' : undefined}
            className={`${inputClass(!!fieldErrors.businessJustification)} resize-none`}
          />
        </Field>

        <Field label="Impact" fieldId="field-impact">
          <textarea
            id="field-impact"
            value={form.impact}
            onChange={(e) => set('impact', e.target.value)}
            placeholder="Who or what will this impact?"
            rows={2}
            className={`${inputClass(false)} resize-none`}
          />
        </Field>
      </FormSection>
    </>
  )
}
