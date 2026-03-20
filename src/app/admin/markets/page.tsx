'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Market {
  id: string
  city: string
  state: string
  stateCode: string
  population: number
  msaName: string | null
  msaPopulation: number | null
  computedTier: string
  adminTierOverride: string | null
  exclusivities: { practiceArea: string; clientName: string }[]
}

export default function AdminMarketsPage() {
  const router = useRouter()
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMarkets = async () => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    if (tierFilter) params.set('tier', tierFilter)

    const res = await fetch(`/api/admin/markets?${params}`)
    if (res.status === 401) { router.push('/admin'); return }
    const data = await res.json()
    setMarkets(data.markets)
    setTotalPages(data.pages)
    setLoading(false)
  }

  useEffect(() => { fetchMarkets() }, [page, tierFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchMarkets()
  }

  const updateTier = async (id: string, tierOverride: string | null) => {
    await fetch('/api/admin/markets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, adminTierOverride: tierOverride }),
    })
    setMarkets(prev => prev.map(m =>
      m.id === id ? { ...m, adminTierOverride: tierOverride } : m
    ))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Market Manager</h1>
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search cities..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
            />
            <button type="submit" className="bg-jd-accent text-white px-4 py-2 rounded-lg text-sm">
              Search
            </button>
          </form>
          <select
            value={tierFilter}
            onChange={e => { setTierFilter(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">All Tiers</option>
            <option value="major">Major</option>
            <option value="mid">Mid</option>
            <option value="small">Small</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">State</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Population</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">MSA</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Computed Tier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Override</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exclusivities</th>
              </tr>
            </thead>
            <tbody>
              {markets.map(m => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.city}</td>
                  <td className="px-4 py-3">{m.stateCode}</td>
                  <td className="px-4 py-3 font-mono">{m.population.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {m.msaName || '-'}
                    {m.msaPopulation && <span className="ml-1">({(m.msaPopulation / 1000000).toFixed(1)}M)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      m.computedTier === 'major' ? 'bg-red-100 text-red-700' :
                      m.computedTier === 'mid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>{m.computedTier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={m.adminTierOverride || ''}
                      onChange={e => updateTier(m.id, e.target.value || null)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs"
                    >
                      <option value="">Auto</option>
                      <option value="major">Major</option>
                      <option value="mid">Mid</option>
                      <option value="small">Small</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {m.exclusivities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.exclusivities.map((e, i) => (
                          <span key={i} className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs">
                            {e.practiceArea}: {e.clientName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white text-sm disabled:opacity-30"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-white text-sm disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
