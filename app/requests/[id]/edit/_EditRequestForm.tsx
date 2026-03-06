'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RequestWithRelations } from '@/types'
import {
  FormData,
  FieldErrors,
  validate,
  RequestFormFields,
} from '@/app/requests/_shared/form-helpers'

interface Props {
  request: RequestWithRelations
}

function toFormData(request: RequestWithRelations): FormData {
  return {
    title: request.title,
    description: request.description ?? '',
    department: request.department,
    category: request.category,
    businessJustification: request.businessJustification,
    estimatedCost: request.estimatedCost != null ? String(request.estimatedCost) : '',
    targetStartDate: request.targetStartDate
      ? new Date(request.targetStartDate).toISOString().slice(0, 10)
      : '',
    targetEndDate: request.targetEndDate
      ? new Date(request.targetEndDate).toISOString().slice(0, 10)
      : '',
    priority: request.priority ?? '',
    impact: request.impact ?? '',
  }
}

export function EditRequestForm({ request }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(() => toFormData(request))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  async function patch() {
    const res = await fetch(`/api/requests/${request.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null,
        targetStartDate: form.targetStartDate || null,
        targetEndDate: form.targetEndDate || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to save.')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setServerError('')
    try {
      await patch()
      router.push(`/requests/${request.id}`)
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setSubmitting(true)
    setServerError('')
    try {
      await patch()
      const res = await fetch(`/api/requests/${request.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit.')
      router.push(`/requests/${request.id}`)
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const errorCount = Object.keys(fieldErrors).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Draft</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {request.requestNumber} — update your draft before submitting.
        </p>
      </div>

      {errorCount > 0 && (
        <div
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 p-4"
        >
          <p className="text-sm font-medium text-destructive mb-1">
            Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before submitting:
          </p>
          <ul className="list-disc list-inside text-sm text-destructive space-y-0.5">
            {Object.values(fieldErrors).map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form className="space-y-5" noValidate>
        <RequestFormFields form={form} fieldErrors={fieldErrors} set={set} />

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-5 gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">* Required fields</p>
          <div className="flex gap-3">
            <Link
              href={`/requests/${request.id}`}
              className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
