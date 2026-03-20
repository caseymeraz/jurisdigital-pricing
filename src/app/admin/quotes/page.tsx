'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Quote {
  id: string
  accessToken: string
  status: string
  title: string
  firmName: string | null
  contactName: string | null
  totalMRC: number
  totalSetup: number
  updatedAt: string
  createdAt: string
}

export default function AdminQuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch('/api/admin/quotes')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(data => {
        if (data) setQuotes(data.quotes)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const createBlank = async () => {
    setCreating(true)
    const res = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      const quote = await res.json()
      router.push(`/admin/quotes/${quote.id}`)
    }
    setCreating(false)
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Quotes</h1>
          <div className="flex gap-3">
            <button
              onClick={createBlank}
              disabled={creating}
              className="px-4 py-2 bg-jd-gold text-jd-navy rounded font-medium text-sm hover:bg-yellow-500 disabled:opacity-50"
            >
              {creating ? 'Creating...' : '+ New Quote'}
            </button>
            <a href="/admin" className="px-4 py-2 border border-gray-500 rounded text-sm hover:border-gray-300">
              Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">MRC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Setup</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{q.title}</td>
                  <td className="px-4 py-3">
                    <p>{q.firmName || q.contactName || '-'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColors[q.status] || statusColors.draft}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">${q.totalMRC.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">${q.totalSetup.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(q.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a href={`/admin/quotes/${q.id}`} className="text-jd-accent hover:underline text-xs">Edit</a>
                      <a href={`/quote/${q.accessToken}`} target="_blank" className="text-gray-500 hover:underline text-xs">Client View</a>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No quotes yet. Click &quot;+ New Quote&quot; to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
