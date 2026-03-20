import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

interface Recommendation {
  packageName: string
  packageTier: string
  contractLength: string
  monthlyRange: string
  services: {
    name: string
    department: string
    monthlyCost: number
    setupFee: number
    description: string
    isRequired: boolean
  }[]
  adSpend: {
    tier: number
    tierName: string
    monthlySpend: number
    managementFee: number
    managementPercentage: number
  } | null
  totalMRC: number
  totalSetup: number
  reasoning: string[]
}

interface MarginBreakdown {
  totalMRC: number
  labor: number
  admin: number
  expenses: number
  profit: number
}

export default async function InternalResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const admin = await getSession()
  if (!admin) {
    redirect('/admin')
  }

  const { sessionId } = await params
  const session = await prisma.questionnaireSession.findUnique({
    where: { id: sessionId },
  })

  if (!session || !session.recommendation) {
    notFound()
  }

  const rec = session.recommendation as unknown as Recommendation
  const margins = session.marginBreakdown as unknown as MarginBreakdown
  const practiceAreas = (session.practiceAreas as string[]) || []
  const currentMarketing = (session.currentMarketing as string[]) || []

  const fmt = (n: number) => `$${n.toLocaleString()}`

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-jd-navy text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Internal View</h1>
            <p className="text-gray-400 text-sm">Session: {session.id}</p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/api/admin/quotes/from-session/${session.id}`}
              className="px-4 py-2 bg-jd-gold text-jd-navy rounded font-medium text-sm hover:bg-yellow-500"
            >
              Build Quote
            </a>
            <a
              href={`/results/${session.accessToken}`}
              target="_blank"
              className="px-4 py-2 border border-gray-500 rounded text-sm hover:border-gray-300"
            >
              View Client Link
            </a>
            <a
              href="/admin/sessions"
              className="px-4 py-2 border border-gray-500 rounded text-sm hover:border-gray-300"
            >
              All Sessions
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Session Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Contact Info</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{session.contactName || 'Not provided'}</dd></div>
                <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{session.contactEmail || 'Not provided'}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{session.contactPhone || 'Not provided'}</dd></div>
                <div><dt className="text-gray-500">Firm</dt><dd className="font-medium">{session.firmName || 'Not provided'}</dd></div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Questionnaire Answers</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Practice Areas</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {practiceAreas.map(pa => (
                      <span key={pa} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{pa}</span>
                    ))}
                  </dd>
                </div>
                <div><dt className="text-gray-500">Attorneys</dt><dd className="font-medium">{session.attorneyCount}</dd></div>
                <div><dt className="text-gray-500">Locations</dt><dd className="font-medium">{session.locationCount}</dd></div>
                <div>
                  <dt className="text-gray-500">Market</dt>
                  <dd className="font-medium">{session.marketCity}, {session.marketState}
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      session.marketTier === 'major' ? 'bg-red-100 text-red-800' :
                      session.marketTier === 'mid' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>{session.marketTier}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Current Marketing</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {currentMarketing.map(cm => (
                      <span key={cm} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{cm}</span>
                    ))}
                  </dd>
                </div>
                <div><dt className="text-gray-500">Goal</dt><dd className="font-medium">{session.growthGoal}</dd></div>
                <div><dt className="text-gray-500">Urgency</dt><dd className="font-medium">{session.urgency}</dd></div>
                <div><dt className="text-gray-500">Budget</dt><dd className="font-medium">${session.budgetRange}/mo</dd></div>
                {session.competitorInfo && (
                  <div><dt className="text-gray-500">Competitors</dt><dd className="font-medium">{session.competitorInfo}</dd></div>
                )}
              </dl>
            </div>
          </div>

          {/* Right Column - Recommendation + Pricing */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-jd-navy">{rec.packageName}</h2>
                  <p className="text-gray-500">{rec.contractLength} | {rec.monthlyRange}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-jd-navy">{fmt(rec.totalMRC)}<span className="text-base font-normal text-gray-500">/mo</span></p>
                  {rec.totalSetup > 0 && (
                    <p className="text-sm text-gray-500">+ {fmt(rec.totalSetup)} setup</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                {rec.reasoning.map((r, i) => (
                  <p key={i}>{r}</p>
                ))}
              </div>
            </div>

            {/* Service Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Service Line Items</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Dept</th>
                    <th className="pb-2 text-right">Monthly</th>
                    <th className="pb-2 text-right">Setup</th>
                  </tr>
                </thead>
                <tbody>
                  {rec.services.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-gray-400 text-xs">{s.description}</p>
                      </td>
                      <td className="py-2 text-gray-500">{s.department}</td>
                      <td className="py-2 text-right font-mono">{s.monthlyCost > 0 ? fmt(s.monthlyCost) : '-'}</td>
                      <td className="py-2 text-right font-mono">{s.setupFee > 0 ? fmt(s.setupFee) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="pt-3" colSpan={2}>Services Subtotal</td>
                    <td className="pt-3 text-right font-mono">{fmt(rec.services.reduce((s, svc) => s + svc.monthlyCost, 0))}</td>
                    <td className="pt-3 text-right font-mono">{fmt(rec.totalSetup)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Ad Spend */}
            {rec.adSpend && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4">Recommended Ad Spend</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs uppercase">Tier</p>
                    <p className="text-xl font-bold text-jd-navy">{rec.adSpend.tierName}</p>
                    <p className="text-gray-500 text-xs">Tier {rec.adSpend.tier}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs uppercase">Monthly Spend</p>
                    <p className="text-xl font-bold text-jd-navy">{fmt(rec.adSpend.monthlySpend)}</p>
                    <p className="text-gray-500 text-xs">ad budget</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs uppercase">Management Fee</p>
                    <p className="text-xl font-bold text-jd-navy">{fmt(rec.adSpend.managementFee)}</p>
                    <p className="text-gray-500 text-xs">{rec.adSpend.managementPercentage}% of spend</p>
                  </div>
                </div>
              </div>
            )}

            {/* Margin Breakdown */}
            {margins && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg mb-4">Margin Breakdown</h3>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Total MRC</p>
                    <p className="text-lg font-bold">{fmt(margins.totalMRC)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Labor (40%)</p>
                    <p className="text-lg font-bold text-red-700">{fmt(margins.labor)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Admin (20%)</p>
                    <p className="text-lg font-bold text-orange-700">{fmt(margins.admin)}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Expenses (5%)</p>
                    <p className="text-lg font-bold text-yellow-700">{fmt(margins.expenses)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs uppercase">Profit (35%)</p>
                    <p className="text-lg font-bold text-green-700">{fmt(margins.profit)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-2">Admin Notes</h3>
              <p className="text-gray-500 text-sm">{session.adminNotes || 'No notes yet. Edit in session detail view.'}</p>
              <p className="text-xs text-gray-400 mt-2">
                Client link: <code className="bg-gray-100 px-1 rounded">/results/{session.accessToken}</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
