import type { Metadata } from 'next'
import { NewRequestForm } from './_NewRequestForm'

export const metadata: Metadata = { title: 'New Request' }

export default function NewRequestPage() {
  return <NewRequestForm />
}
