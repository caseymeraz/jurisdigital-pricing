'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Session {
  id: string
  accessToken: string
  status: string
  contactName: string | null
  contactEmail: string | null
  firmName: string | null
  marketCity: string | null
  marketState: string | null
  marketTier: string | null
  createdAt: string
  recommendation: {
    packageName: string
    totalMRC: number
  } | null
}

export default function AdminSessionsPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetch(`/api/admin/sessions?page=${page}`)
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setSessions(data.sessions)
          setTotalPages(data.pages)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, router])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Sessions</h1>
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Firm</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Market</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Package</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">MRC</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.contactName || '-'}</p>
                    <p className="text-gray-400 text-xs">{s.contactEmail || ''}</p>
                  </td>
                  <td className="px-4 py-3">{s.firmName || '-'}</td>
                  <td className="px-4 py-3">
                    {s.marketCity ? `${s.marketCity}, ${s.marketState}` : '-'}
                    {s.marketTier && (
                      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                        s.marketTier === 'major' ? 'bg-red-100 text-red-700' :
                        s.marketTier === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>{s.marketTier}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{s.recommendation?.packageName || '-'}</td>
                  <td className="px-4 py-3 font-mono">{s.recommendation ? `$${s.recommendation.totalMRC.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a
                        href={`/internal/${s.id}`}
                        className="text-jd-accent hover:underline text-xs"
                      >
                        Internal
                      </a>
                      <a
                        href={`/results/${s.accessToken}`}
                        target="_blank"
                        className="text-gray-500 hover:underline text-xs"
                      >
                        Client
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sessions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  page === i + 1 ? 'bg-jd-accent text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
