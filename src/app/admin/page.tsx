'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      setAuthenticated(true)
    } else {
      setError('Invalid credentials')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuthenticated(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-jd-navy flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-jd-navy mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-jd-accent text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Juris Digital Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Logged in as admin</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => router.push('/admin/sessions')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-jd-navy">Sessions</h3>
            <p className="text-gray-500 text-sm mt-1">View questionnaire submissions and recommendations</p>
          </button>

          <button
            onClick={() => router.push('/admin/pricing')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-jd-navy">Pricing Editor</h3>
            <p className="text-gray-500 text-sm mt-1">Edit service pricing and package configurations</p>
          </button>

          <button
            onClick={() => router.push('/admin/markets')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-jd-navy">Market Manager</h3>
            <p className="text-gray-500 text-sm mt-1">Search cities, override tiers, manage market data</p>
          </button>

          <button
            onClick={() => router.push('/admin/exclusivity')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg text-jd-navy">Exclusivity</h3>
            <p className="text-gray-500 text-sm mt-1">Lock/unlock markets by practice area and client</p>
          </button>
        </div>
      </div>
    </div>
  )
}
