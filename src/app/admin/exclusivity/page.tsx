'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PRACTICE_AREAS } from '@/lib/pricing-data'

interface Exclusivity {
  id: string
  marketId: string
  practiceArea: string
  clientName: string
  lockedBy: string | null
  notes: string | null
  lockedAt: string
  market: { city: string; state: string; stateCode: string }
}

interface MarketSearchResult {
  id: string
  city: string
  stateCode: string
}

export default function AdminExclusivityPage() {
  const router = useRouter()
  const [exclusivities, setExclusivities] = useState<Exclusivity[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [marketQuery, setMarketQuery] = useState('')
  const [marketResults, setMarketResults] = useState<MarketSearchResult[]>([])
  const [selectedMarketId, setSelectedMarketId] = useState('')
  const [selectedMarketLabel, setSelectedMarketLabel] = useState('')
  const [practiceArea, setPracticeArea] = useState('')
  const [clientName, setClientName] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch('/api/admin/exclusivity')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(data => {
        if (data) setExclusivities(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  useEffect(() => {
    if (marketQuery.length < 2) { setMarketResults([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/markets/search?q=${encodeURIComponent(marketQuery)}`)
      const data = await res.json()
      setMarketResults(data)
    }, 300)
    return () => clearTimeout(timer)
  }, [marketQuery])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/exclusivity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketId: selectedMarketId, practiceArea, clientName, notes }),
    })
    if (res.ok) {
      const exc = await res.json()
      setExclusivities(prev => [exc, ...prev])
      setShowForm(false)
      setMarketQuery('')
      setSelectedMarketId('')
      setSelectedMarketLabel('')
      setPracticeArea('')
      setClientName('')
      setNotes('')
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to create exclusivity')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this exclusivity lock?')) return
    const res = await fetch(`/api/admin/exclusivity?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setExclusivities(prev => prev.filter(e => e.id !== id))
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Exclusivity Manager</h1>
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">{exclusivities.length} active exclusivity locks</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-jd-accent text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Lock'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold mb-4">Add Exclusivity Lock</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Market</label>
                <input
                  type="text"
                  value={selectedMarketLabel || marketQuery}
                  onChange={e => {
                    setMarketQuery(e.target.value)
                    setSelectedMarketId('')
                    setSelectedMarketLabel('')
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Search city..."
                  required
                />
                {marketResults.length > 0 && !selectedMarketId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow max-h-48 overflow-y-auto">
                    {marketResults.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMarketId(m.id)
                          setSelectedMarketLabel(`${m.city}, ${m.stateCode}`)
                          setMarketResults([])
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {m.city}, {m.stateCode}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area</label>
                <select
                  value={practiceArea}
                  onChange={e => setPracticeArea(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select...</option>
                  {PRACTICE_AREAS.map(pa => (
                    <option key={pa.id} value={pa.id}>{pa.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="submit"
                  disabled={!selectedMarketId || !practiceArea || !clientName}
                  className="bg-jd-accent text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-30"
                >
                  Create Lock
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Market</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Practice Area</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Locked</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exclusivities.map(exc => (
                <tr key={exc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{exc.market.city}, {exc.market.stateCode}</td>
                  <td className="px-4 py-3">{PRACTICE_AREAS.find(p => p.id === exc.practiceArea)?.label || exc.practiceArea}</td>
                  <td className="px-4 py-3">{exc.clientName}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(exc.lockedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{exc.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(exc.id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {exclusivities.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No exclusivity locks</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
