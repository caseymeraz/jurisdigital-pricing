'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface LineItem {
  name: string
  department: string
  monthlyCost: number
  setupFee: number
  description: string
  included: boolean
}

interface QuoteData {
  id: string
  accessToken: string
  status: string
  title: string
  firmName: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  marketCity: string | null
  marketState: string | null
  marketTier: string | null
  packageName: string | null
  contractLength: string | null
  lineItems: LineItem[]
  adSpendTier: number | null
  adSpendMonthly: number | null
  adSpendFee: number | null
  notes: string | null
  clientMessage: string | null
  validUntil: string | null
  totalMRC: number
  totalSetup: number
  sessionId: string | null
}

const AD_SPEND_TIERS = [
  { tier: 0, name: 'None', spend: 0, fee: 0, pct: 0 },
  { tier: 1, name: 'Starter', spend: 3000, fee: 750, pct: 25 },
  { tier: 2, name: 'Growth', spend: 7000, fee: 1400, pct: 20 },
  { tier: 3, name: 'Accelerate', spend: 10000, fee: 1800, pct: 18 },
  { tier: 4, name: 'Scale', spend: 21000, fee: 3150, pct: 15 },
  { tier: 5, name: 'Dominate', spend: 29000, fee: 4060, pct: 14 },
  { tier: 6, name: 'Enterprise', spend: 40000, fee: 5200, pct: 13 },
  { tier: 7, name: 'Market Leader', spend: 54000, fee: 6480, pct: 12 },
]

const SERVICE_CATALOG = [
  { name: 'Account Management', department: 'Admin', monthlyCost: 250, setupFee: 0, description: 'Dedicated account manager' },
  { name: 'CallRail Call Tracking', department: 'Admin', monthlyCost: 65, setupFee: 0, description: 'Call tracking and recording' },
  { name: 'Website Hosting', department: 'Web/Dev', monthlyCost: 50, setupFee: 0, description: 'Managed hosting with SSL/CDN' },
  { name: 'LaunchPad SEO', department: 'SEO', monthlyCost: 1200, setupFee: 0, description: 'Entry-level SEO, 2yr commitment' },
  { name: 'Foundational SEO', department: 'SEO', monthlyCost: 2000, setupFee: 2500, description: 'Core SEO with content and links' },
  { name: 'Premium SEO', department: 'SEO', monthlyCost: 4000, setupFee: 2500, description: 'Advanced SEO for competitive markets' },
  { name: 'Elite SEO', department: 'SEO', monthlyCost: 8000, setupFee: 2500, description: 'Full-service SEO domination' },
  { name: 'JDX Website', department: 'Web/Dev', monthlyCost: 0, setupFee: 5000, description: 'Professional law firm website' },
  { name: 'StoryBrand Website', department: 'Design', monthlyCost: 0, setupFee: 15000, description: 'Custom StoryBrand framework website' },
  { name: 'Local Services Ads', department: 'Advertising', monthlyCost: 300, setupFee: 500, description: 'Google Guaranteed badge' },
  { name: 'Branded Search PPC', department: 'Advertising', monthlyCost: 500, setupFee: 500, description: 'Brand protection campaigns' },
  { name: 'Content Marketing - Standard', department: 'Content', monthlyCost: 1000, setupFee: 0, description: 'Monthly blog posts and pages' },
  { name: 'Content Marketing - Premium', department: 'Content', monthlyCost: 2000, setupFee: 0, description: 'Extended content strategy' },
  { name: 'New Location Launch', department: 'SEO', monthlyCost: 0, setupFee: 2500, description: 'SEO setup for new locations' },
  { name: 'Logo & Brand Identity', department: 'Design', monthlyCost: 0, setupFee: 3000, description: 'Logo design and brand guide' },
]

const PACKAGE_OPTIONS = ['LaunchPad', 'Foundational SEO', 'Premium SEO', 'Elite SEO', 'Custom']
const CONTRACT_OPTIONS = ['1 year', '2 years', '6 months', 'Month-to-month']

export default function QuoteBuilderPage() {
  const router = useRouter()
  const params = useParams()
  const quoteId = params.id as string

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customItem, setCustomItem] = useState<LineItem>({
    name: '', department: 'Other', monthlyCost: 0, setupFee: 0, description: '', included: true,
  })

  useEffect(() => {
    fetch(`/api/admin/quotes/${quoteId}`)
      .then(r => {
        if (r.status === 401) { router.push('/admin'); return null }
        if (r.status === 404) { router.push('/admin/quotes'); return null }
        return r.json()
      })
      .then(data => {
        if (data) setQuote(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [quoteId, router])

  const save = useCallback(async (data: QuoteData) => {
    setSaving(true)
    const res = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const updated = await res.json()
      setQuote(updated)
      setLastSaved(new Date().toLocaleTimeString())
    }
    setSaving(false)
  }, [quoteId])

  if (loading || !quote) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>

  const lineItems = (quote.lineItems || []) as LineItem[]
  const includedItems = lineItems.filter(li => li.included)
  const serviceMRC = includedItems.reduce((sum, li) => sum + li.monthlyCost, 0)
  const adFee = quote.adSpendFee || 0
  const totalMRC = serviceMRC + adFee
  const totalSetup = includedItems.reduce((sum, li) => sum + li.setupFee, 0)
  const margins = {
    labor: Math.round(totalMRC * 0.4),
    admin: Math.round(totalMRC * 0.2),
    expenses: Math.round(totalMRC * 0.05),
    profit: Math.round(totalMRC * 0.35),
  }

  const fmt = (n: number) => `$${n.toLocaleString()}`

  const updateField = (field: string, value: unknown) => {
    setQuote(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: unknown) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    updateField('lineItems', updated)
  }

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index)
    updateField('lineItems', updated)
  }

  const addFromCatalog = (item: typeof SERVICE_CATALOG[0]) => {
    const exists = lineItems.find(li => li.name === item.name)
    if (exists) return
    const newItem: LineItem = { ...item, included: true }
    updateField('lineItems', [...lineItems, newItem])
    setShowCatalog(false)
  }

  const addCustomItem = () => {
    if (!customItem.name) return
    updateField('lineItems', [...lineItems, { ...customItem }])
    setCustomItem({ name: '', department: 'Other', monthlyCost: 0, setupFee: 0, description: '', included: true })
    setShowCustom(false)
  }

  const setAdTier = (tierNum: number) => {
    const tier = AD_SPEND_TIERS[tierNum]
    updateField('adSpendTier', tier.tier || null)
    updateField('adSpendMonthly', tier.spend || null)
    updateField('adSpendFee', tier.fee || null)
  }

  const clientUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/quote/${quote.accessToken}`

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-jd-navy text-white px-6 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/admin/quotes" className="text-gray-400 hover:text-white text-sm">&larr; Quotes</a>
            <input
              type="text"
              value={quote.title}
              onChange={e => updateField('title', e.target.value)}
              className="bg-transparent border-b border-gray-600 text-lg font-bold focus:border-jd-gold outline-none px-1 py-0.5"
            />
            <select
              value={quote.status}
              onChange={e => updateField('status', e.target.value)}
              className="bg-jd-navy border border-gray-600 rounded px-2 py-1 text-xs"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && <span className="text-gray-500 text-xs">Saved {lastSaved}</span>}
            <button
              onClick={() => save(quote)}
              disabled={saving}
              className="px-4 py-1.5 bg-jd-gold text-jd-navy rounded font-medium text-sm hover:bg-yellow-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(clientUrl); alert('Client link copied!') }}
              className="px-3 py-1.5 border border-gray-500 rounded text-xs hover:border-gray-300"
            >
              Copy Client Link
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Client Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Client Info</h3>
              <div className="space-y-2">
                <input placeholder="Firm Name" value={quote.firmName || ''} onChange={e => updateField('firmName', e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm" />
                <input placeholder="Contact Name" value={quote.contactName || ''} onChange={e => updateField('contactName', e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm" />
                <input placeholder="Email" type="email" value={quote.contactEmail || ''} onChange={e => updateField('contactEmail', e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm" />
                <input placeholder="Phone" value={quote.contactPhone || ''} onChange={e => updateField('contactPhone', e.target.value)}
                  className="w-full border rounded px-3 py-1.5 text-sm" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Package</h3>
              <select value={quote.packageName || ''} onChange={e => updateField('packageName', e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm mb-2">
                <option value="">Select package...</option>
                {PACKAGE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={quote.contractLength || ''} onChange={e => updateField('contractLength', e.target.value)}
                className="w-full border rounded px-3 py-1.5 text-sm mb-2">
                <option value="">Contract length...</option>
                {CONTRACT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <input placeholder="City" value={quote.marketCity || ''} onChange={e => updateField('marketCity', e.target.value)}
                  className="flex-1 border rounded px-3 py-1.5 text-sm" />
                <input placeholder="ST" value={quote.marketState || ''} onChange={e => updateField('marketState', e.target.value)}
                  className="w-14 border rounded px-2 py-1.5 text-sm" maxLength={2} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Ad Spend</h3>
              <select
                value={AD_SPEND_TIERS.findIndex(t => t.tier === (quote.adSpendTier || 0))}
                onChange={e => setAdTier(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-1.5 text-sm mb-2"
              >
                {AD_SPEND_TIERS.map((t, i) => (
                  <option key={i} value={i}>
                    {t.tier === 0 ? 'No Ads' : `Tier ${t.tier}: ${t.name} ($${t.spend.toLocaleString()} spend)`}
                  </option>
                ))}
              </select>
              {quote.adSpendTier && quote.adSpendTier > 0 && (
                <div className="text-xs text-gray-500 space-y-1 mt-2">
                  <div className="flex justify-between"><span>Ad Budget:</span><span className="font-mono">{fmt(quote.adSpendMonthly || 0)}/mo</span></div>
                  <div className="flex justify-between"><span>Mgmt Fee:</span><span className="font-mono">{fmt(quote.adSpendFee || 0)}/mo</span></div>
                  <div className="mt-2">
                    <label className="text-gray-500">Custom spend:</label>
                    <input type="number" value={quote.adSpendMonthly || ''} onChange={e => updateField('adSpendMonthly', parseInt(e.target.value) || 0)}
                      className="w-full border rounded px-2 py-1 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-gray-500">Custom fee:</label>
                    <input type="number" value={quote.adSpendFee || ''} onChange={e => updateField('adSpendFee', parseInt(e.target.value) || 0)}
                      className="w-full border rounded px-2 py-1 text-sm mt-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Internal Notes</h3>
              <textarea value={quote.notes || ''} onChange={e => updateField('notes', e.target.value)}
                rows={3} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Notes (not shown to client)..." />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Client Message</h3>
              <textarea value={quote.clientMessage || ''} onChange={e => updateField('clientMessage', e.target.value)}
                rows={3} className="w-full border rounded px-3 py-1.5 text-sm" placeholder="Message shown on client quote page..." />
            </div>
          </div>

          {/* Main: Line Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">Line Items</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowCatalog(!showCatalog)}
                    className="px-3 py-1 bg-jd-accent text-white rounded text-xs hover:bg-blue-700">
                    + From Catalog
                  </button>
                  <button onClick={() => setShowCustom(!showCustom)}
                    className="px-3 py-1 border border-gray-300 rounded text-xs hover:bg-gray-50">
                    + Custom
                  </button>
                </div>
              </div>

              {/* Catalog picker */}
              {showCatalog && (
                <div className="px-4 py-3 bg-blue-50 border-b">
                  <p className="text-xs text-gray-500 mb-2">Click to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_CATALOG.filter(s => !lineItems.find(li => li.name === s.name)).map(s => (
                      <button key={s.name} onClick={() => addFromCatalog(s)}
                        className="px-3 py-1.5 bg-white border rounded text-xs hover:bg-gray-50 text-left">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-gray-400 ml-1">
                          {s.monthlyCost > 0 ? `${fmt(s.monthlyCost)}/mo` : ''}{s.setupFee > 0 ? ` +${fmt(s.setupFee)} setup` : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom item form */}
              {showCustom && (
                <div className="px-4 py-3 bg-yellow-50 border-b">
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Service Name</label>
                      <input value={customItem.name} onChange={e => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border rounded px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Dept</label>
                      <input value={customItem.department} onChange={e => setCustomItem(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full border rounded px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Monthly</label>
                      <input type="number" value={customItem.monthlyCost || ''} onChange={e => setCustomItem(prev => ({ ...prev, monthlyCost: parseInt(e.target.value) || 0 }))}
                        className="w-full border rounded px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Setup</label>
                      <input type="number" value={customItem.setupFee || ''} onChange={e => setCustomItem(prev => ({ ...prev, setupFee: parseInt(e.target.value) || 0 }))}
                        className="w-full border rounded px-2 py-1.5 text-sm" />
                    </div>
                    <button onClick={addCustomItem}
                      className="px-3 py-1.5 bg-jd-accent text-white rounded text-sm">Add</button>
                  </div>
                </div>
              )}

              {/* Line item table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs border-b">
                    <th className="px-4 py-2 w-8"></th>
                    <th className="px-2 py-2">Service</th>
                    <th className="px-2 py-2 w-20">Dept</th>
                    <th className="px-2 py-2 w-28 text-right">Monthly</th>
                    <th className="px-2 py-2 w-28 text-right">Setup</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i} className={`border-b border-gray-50 ${!li.included ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-2">
                        <input type="checkbox" checked={li.included}
                          onChange={e => updateLineItem(i, 'included', e.target.checked)}
                          className="rounded" />
                      </td>
                      <td className="px-2 py-2">
                        <input value={li.name} onChange={e => updateLineItem(i, 'name', e.target.value)}
                          className="w-full bg-transparent font-medium text-sm border-b border-transparent hover:border-gray-200 focus:border-jd-accent outline-none py-0.5" />
                        <input value={li.description} onChange={e => updateLineItem(i, 'description', e.target.value)}
                          className="w-full bg-transparent text-gray-400 text-xs border-b border-transparent hover:border-gray-200 focus:border-jd-accent outline-none" />
                      </td>
                      <td className="px-2 py-2">
                        <input value={li.department} onChange={e => updateLineItem(i, 'department', e.target.value)}
                          className="w-full bg-transparent text-gray-500 text-xs border-b border-transparent hover:border-gray-200 focus:border-jd-accent outline-none" />
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-400 text-xs">$</span>
                          <input type="number" value={li.monthlyCost || ''} onChange={e => updateLineItem(i, 'monthlyCost', parseInt(e.target.value) || 0)}
                            className="w-20 text-right bg-transparent font-mono text-sm border-b border-transparent hover:border-gray-200 focus:border-jd-accent outline-none" />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-400 text-xs">$</span>
                          <input type="number" value={li.setupFee || ''} onChange={e => updateLineItem(i, 'setupFee', parseInt(e.target.value) || 0)}
                            className="w-20 text-right bg-transparent font-mono text-sm border-b border-transparent hover:border-gray-200 focus:border-jd-accent outline-none" />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <button onClick={() => removeLineItem(i)} className="text-gray-300 hover:text-red-500 text-xs">x</button>
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No line items yet. Add from the service catalog or create a custom item.
                    </td></tr>
                  )}
                </tbody>
              </table>

              {/* Totals row */}
              {lineItems.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-700">
                    {includedItems.length} of {lineItems.length} items included
                  </span>
                  <div className="text-right text-sm">
                    <span className="text-gray-500 mr-4">Services: <span className="font-mono font-bold">{fmt(serviceMRC)}/mo</span></span>
                    {adFee > 0 && <span className="text-gray-500 mr-4">+ Ad Mgmt: <span className="font-mono font-bold">{fmt(adFee)}/mo</span></span>}
                    <span className="text-gray-500">Setup: <span className="font-mono font-bold">{fmt(totalSetup)}</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Totals + Margins */}
          <div className="space-y-4">
            {/* Totals Card */}
            <div className="bg-white rounded-lg shadow p-4 border-2 border-jd-accent">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Quote Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-500 text-sm">Services MRC</span>
                  <span className="font-mono font-bold text-lg">{fmt(serviceMRC)}</span>
                </div>
                {adFee > 0 && (
                  <>
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-500 text-sm">Ad Management</span>
                      <span className="font-mono font-bold">{fmt(adFee)}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs text-gray-400">
                      <span>Ad Budget (client pays)</span>
                      <span className="font-mono">{fmt(quote.adSpendMonthly || 0)}</span>
                    </div>
                  </>
                )}
                <div className="border-t pt-2 flex justify-between items-baseline">
                  <span className="font-bold">Total MRC</span>
                  <span className="font-mono font-bold text-2xl text-jd-navy">{fmt(totalMRC)}</span>
                </div>
                {totalSetup > 0 && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-gray-500 text-sm">One-time Setup</span>
                    <span className="font-mono font-bold">{fmt(totalSetup)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Margin Breakdown */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Margin Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-600">Labor (40%)</span>
                  <span className="font-mono">{fmt(margins.labor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">Admin (20%)</span>
                  <span className="font-mono">{fmt(margins.admin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Expenses (5%)</span>
                  <span className="font-mono">{fmt(margins.expenses)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-green-600 font-bold">Profit (35%)</span>
                  <span className="font-mono font-bold text-green-600">{fmt(margins.profit)}</span>
                </div>
              </div>
              {/* Margin bar */}
              <div className="mt-3 h-3 rounded-full overflow-hidden flex">
                <div className="bg-red-400" style={{ width: '40%' }} />
                <div className="bg-orange-400" style={{ width: '20%' }} />
                <div className="bg-yellow-400" style={{ width: '5%' }} />
                <div className="bg-green-400" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Actions</h3>
              <div className="space-y-2">
                <a href={`/quote/${quote.accessToken}`} target="_blank"
                  className="block w-full text-center px-3 py-2 bg-jd-gold text-jd-navy rounded font-medium text-sm hover:bg-yellow-500">
                  Preview Client View
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clientUrl)
                    alert('Link copied!')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Copy Client Link
                </button>
                {quote.sessionId && (
                  <a href={`/internal/${quote.sessionId}`}
                    className="block w-full text-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    View Original Session
                  </a>
                )}
              </div>
            </div>

            {/* Client Link */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Client Link:</p>
              <code className="text-xs break-all text-jd-accent">{clientUrl}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
