'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PricingConfig {
  id: string
  department: string
  serviceName: string
  serviceType: string
  pricing: Record<string, unknown>
  description: string
  isActive: boolean
  sortOrder: number
}

export default function AdminPricingPage() {
  const router = useRouter()
  const [configs, setConfigs] = useState<PricingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/pricing')
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        return r.json()
      })
      .then(data => {
        if (data) setConfigs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const startEdit = (config: PricingConfig) => {
    setEditing(config.id)
    setEditValue(JSON.stringify(config.pricing, null, 2))
  }

  const saveEdit = async (config: PricingConfig) => {
    setSaving(true)
    try {
      const pricing = JSON.parse(editValue)
      const res = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: config.id, pricing }),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfigs(prev => prev.map(c => c.id === config.id ? updated : c))
        setEditing(null)
      }
    } catch {
      alert('Invalid JSON')
    }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  const departments = [...new Set(configs.map(c => c.department))]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Pricing Editor</h1>
          <a href="/admin" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {departments.map(dept => (
          <div key={dept} className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">{dept}</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Pricing</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.filter(c => c.department === dept).map(config => (
                    <tr key={config.id} className="border-t">
                      <td className="px-4 py-3">
                        <p className="font-medium">{config.serviceName}</p>
                        <p className="text-gray-400 text-xs">{config.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{config.serviceType}</span>
                      </td>
                      <td className="px-4 py-3">
                        {editing === config.id ? (
                          <textarea
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="w-full border rounded p-2 font-mono text-xs"
                            rows={6}
                          />
                        ) : (
                          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32 font-mono">
                            {JSON.stringify(config.pricing, null, 2)}
                          </pre>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing === config.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => saveEdit(config)}
                              disabled={saving}
                              className="text-green-600 hover:underline text-xs"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditing(null)}
                              className="text-gray-500 hover:underline text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(config)}
                            className="text-jd-accent hover:underline text-xs"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
