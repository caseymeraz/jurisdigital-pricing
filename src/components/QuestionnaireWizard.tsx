'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PRACTICE_AREAS, BUDGET_RANGES, GROWTH_GOALS, URGENCY_OPTIONS, CURRENT_MARKETING_OPTIONS } from '@/lib/pricing-data'

interface MarketResult {
  id: string
  city: string
  state: string
  stateCode: string
  population: number
  msaName: string | null
  tier: string
  exclusivities: { practiceArea: string; clientName: string }[]
}

const STEPS = [
  'Practice Areas',
  'Firm Details',
  'Target Market',
  'Current Marketing',
  'Goals & Budget',
  'Contact Info',
]

export default function QuestionnaireWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])

  // Step 2
  const [firmName, setFirmName] = useState('')
  const [attorneyCount, setAttorneyCount] = useState('1')
  const [locationCount, setLocationCount] = useState('1')

  // Step 3
  const [marketSearch, setMarketSearch] = useState('')
  const [marketResults, setMarketResults] = useState<MarketResult[]>([])
  const [selectedMarket, setSelectedMarket] = useState<MarketResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Step 4
  const [currentMarketing, setCurrentMarketing] = useState<string[]>([])

  // Step 5
  const [growthGoal, setGrowthGoal] = useState('')
  const [competitorInfo, setCompetitorInfo] = useState('')
  const [urgency, setUrgency] = useState('')
  const [budgetRange, setBudgetRange] = useState('')

  // Step 6
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Market search with debounce
  const searchMarkets = useCallback(async (query: string) => {
    if (query.length < 2) {
      setMarketResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await fetch(`/api/markets/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setMarketResults(data)
    } catch {
      setMarketResults([])
    }
    setSearchLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchMarkets(marketSearch), 300)
    return () => clearTimeout(timer)
  }, [marketSearch, searchMarkets])

  const togglePracticeArea = (id: string) => {
    setPracticeAreas(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const toggleMarketing = (id: string) => {
    if (id === 'nothing') {
      setCurrentMarketing(['nothing'])
      return
    }
    setCurrentMarketing(prev => {
      const filtered = prev.filter(p => p !== 'nothing')
      return filtered.includes(id) ? filtered.filter(p => p !== id) : [...filtered, id]
    })
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return practiceAreas.length > 0
      case 1: return attorneyCount !== '' && locationCount !== ''
      case 2: return selectedMarket !== null
      case 3: return currentMarketing.length > 0
      case 4: return growthGoal !== '' && urgency !== '' && budgetRange !== ''
      case 5: return contactName !== '' && contactEmail !== ''
      default: return false
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceAreas,
          firmName,
          attorneyCount: parseInt(attorneyCount),
          locationCount: parseInt(locationCount),
          marketId: selectedMarket?.id,
          marketCity: selectedMarket?.city,
          marketState: selectedMarket?.stateCode,
          marketTier: selectedMarket?.tier,
          currentMarketing,
          growthGoal,
          competitorInfo,
          urgency,
          budgetRange,
          contactName,
          contactEmail,
          contactPhone,
        }),
      })
      const data = await res.json()
      if (data.accessToken) {
        router.push(`/results/${data.accessToken}`)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch {
      setError('Failed to submit. Please try again.')
    }
    setSubmitting(false)
  }

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      major: 'bg-red-100 text-red-800 border-red-200',
      mid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      small: 'bg-green-100 text-green-800 border-green-200',
    }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${colors[tier] || 'bg-gray-100 text-gray-600'}`}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Market
      </span>
    )
  }

  const exclusivityWarnings = selectedMarket?.exclusivities.filter(
    e => practiceAreas.includes(e.practiceArea)
  ) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-jd-navy via-jd-blue to-jd-navy">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Juris Digital</h1>
          <p className="text-jd-gold text-sm font-medium mt-1">Service Recommendation Tool</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={`text-xs ${i <= step ? 'text-jd-gold' : 'text-gray-500'} ${i === step ? 'font-bold' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-jd-gold rounded-full h-2 transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Step 0: Practice Areas */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">What practice areas does your firm handle?</h2>
              <p className="text-gray-500 mb-6">Select all that apply</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PRACTICE_AREAS.map(pa => (
                  <button
                    key={pa.id}
                    onClick={() => togglePracticeArea(pa.id)}
                    className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                      practiceAreas.includes(pa.id)
                        ? 'border-jd-accent bg-blue-50 text-jd-accent'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {pa.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Firm Details */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">Tell us about your firm</h2>
              <p className="text-gray-500 mb-6">This helps us size your package correctly</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name (optional)</label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent focus:border-transparent"
                    placeholder="Smith & Associates"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attorneys</label>
                  <select
                    value={attorneyCount}
                    onChange={e => setAttorneyCount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                  >
                    <option value="1">Solo practitioner</option>
                    <option value="2">2-5 attorneys</option>
                    <option value="6">6-15 attorneys</option>
                    <option value="16">16-50 attorneys</option>
                    <option value="51">50+ attorneys</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Office Locations</label>
                  <select
                    value={locationCount}
                    onChange={e => setLocationCount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                  >
                    <option value="1">1 location</option>
                    <option value="2">2-3 locations</option>
                    <option value="4">4-10 locations</option>
                    <option value="11">10+ locations</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Market */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">Where is your primary market?</h2>
              <p className="text-gray-500 mb-6">Search for your city — market size affects our recommendation</p>
              <div className="relative">
                <input
                  type="text"
                  value={marketSearch}
                  onChange={e => {
                    setMarketSearch(e.target.value)
                    if (selectedMarket) setSelectedMarket(null)
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-jd-accent focus:border-transparent text-lg"
                  placeholder="Start typing a city name..."
                />
                {searchLoading && (
                  <div className="absolute right-3 top-3.5 text-gray-400">Searching...</div>
                )}
                {marketResults.length > 0 && !selectedMarket && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {marketResults.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMarket(m)
                          setMarketSearch(`${m.city}, ${m.stateCode}`)
                          setMarketResults([])
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{m.city}, {m.stateCode}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              Pop. {m.population.toLocaleString()}
                            </span>
                          </div>
                          {tierBadge(m.tier)}
                        </div>
                        {m.msaName && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {m.msaName} Metro ({m.tier === 'major' ? '2M+' : m.tier === 'mid' ? '250k+' : '<250k'})
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedMarket && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{selectedMarket.city}, {selectedMarket.state}</p>
                      {selectedMarket.msaName && (
                        <p className="text-sm text-gray-500">{selectedMarket.msaName} Metro Area</p>
                      )}
                    </div>
                    {tierBadge(selectedMarket.tier)}
                  </div>

                  {exclusivityWarnings.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 font-medium text-sm">Exclusivity Notice</p>
                      {exclusivityWarnings.map((e, i) => (
                        <p key={i} className="text-red-600 text-sm mt-1">
                          {e.practiceArea} is locked by {e.clientName} in this market
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Current Marketing */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">What marketing are you currently doing?</h2>
              <p className="text-gray-500 mb-6">Select all that apply</p>
              <div className="space-y-3">
                {CURRENT_MARKETING_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleMarketing(opt.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
                      currentMarketing.includes(opt.id)
                        ? 'border-jd-accent bg-blue-50 text-jd-accent'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Goals & Budget */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">Goals, Timeline & Budget</h2>
              <p className="text-gray-500 mb-6">Help us understand what you&apos;re looking for</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What&apos;s your growth goal?</label>
                  <div className="space-y-2">
                    {GROWTH_GOALS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGrowthGoal(g.id)}
                        className={`w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                          growthGoal === g.id
                            ? 'border-jd-accent bg-blue-50 text-jd-accent'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Who are your top competitors? (optional)
                  </label>
                  <input
                    type="text"
                    value={competitorInfo}
                    onChange={e => setCompetitorInfo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                    placeholder="e.g., Morgan & Morgan, Cellino Law"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How urgently do you need results?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {URGENCY_OPTIONS.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setUrgency(u.id)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          urgency === u.id
                            ? 'border-jd-accent bg-blue-50 text-jd-accent'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly marketing budget range</label>
                  <div className="space-y-2">
                    {BUDGET_RANGES.map(b => (
                      <button
                        key={b.id}
                        onClick={() => setBudgetRange(b.id)}
                        className={`w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                          budgetRange === b.id
                            ? 'border-jd-accent bg-blue-50 text-jd-accent'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Contact Info */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-jd-navy mb-2">Almost done! How can we reach you?</h2>
              <p className="text-gray-500 mb-6">We&apos;ll send your personalized recommendation</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                    placeholder="john@smithlaw.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-jd-accent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canAdvance()}
                className="px-8 py-2 rounded-lg bg-jd-accent text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canAdvance() || submitting}
                className="px-8 py-2 rounded-lg bg-jd-gold text-jd-navy font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
              >
                {submitting ? 'Processing...' : 'Get My Recommendation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
