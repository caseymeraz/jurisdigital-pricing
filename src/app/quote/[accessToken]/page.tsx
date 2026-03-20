import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

interface LineItem {
  name: string
  department: string
  description: string
  included: boolean
}

export default async function ClientQuotePage({
  params,
}: {
  params: Promise<{ accessToken: string }>
}) {
  const { accessToken } = await params
  const quote = await prisma.quote.findUnique({
    where: { accessToken },
  })

  if (!quote) notFound()

  const lineItems = (quote.lineItems as unknown as LineItem[]).filter(li => li.included)
  const hasAds = quote.adSpendTier && quote.adSpendTier > 0

  const tierColors: Record<string, string> = {
    LaunchPad: 'from-green-500 to-emerald-600',
    'Foundational SEO': 'from-blue-500 to-indigo-600',
    'Premium SEO': 'from-purple-500 to-violet-600',
    'Elite SEO': 'from-jd-gold to-yellow-600',
    Custom: 'from-jd-blue to-blue-700',
  }

  const packageDescriptions: Record<string, string> = {
    LaunchPad: 'Our entry-level package designed for solo practitioners and small firms looking to establish their online presence and start generating leads.',
    'Foundational SEO': 'A comprehensive SEO and marketing package that builds a strong digital foundation for growing firms ready to invest in long-term visibility.',
    'Premium SEO': 'An advanced marketing solution for established firms looking to dominate their local market with aggressive SEO, content, and advertising strategies.',
    'Elite SEO': 'Our top-tier package for firms seeking market dominance with full-service marketing, premium content, and maximum advertising reach.',
    Custom: 'A tailored marketing solution built specifically for your firm\'s unique needs, market, and growth goals.',
  }

  const gradientClass = tierColors[quote.packageName || 'Custom'] || 'from-jd-blue to-blue-700'
  const description = packageDescriptions[quote.packageName || 'Custom'] || packageDescriptions.Custom

  return (
    <div className="min-h-screen bg-gradient-to-br from-jd-navy via-jd-blue to-jd-navy">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Juris Digital</h1>
          <p className="text-jd-gold text-sm font-medium mt-1">Marketing Proposal</p>
        </div>

        {/* Package Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${gradientClass} px-8 py-6`}>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Your Package</p>
            <h2 className="text-3xl font-bold text-white mt-1">{quote.packageName || 'Custom Package'}</h2>
            {quote.contractLength && (
              <p className="text-white/90 mt-1">{quote.contractLength} commitment</p>
            )}
          </div>

          <div className="p-8">
            {/* Personalized greeting */}
            {(quote.firmName || quote.contactName) && (
              <p className="text-gray-500 mb-4 text-sm">
                Prepared for <span className="font-medium text-gray-700">{quote.firmName || quote.contactName}</span>
                {quote.marketCity && ` in ${quote.marketCity}, ${quote.marketState}`}
              </p>
            )}

            {/* Custom message from admin */}
            {quote.clientMessage && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{quote.clientMessage}</p>
              </div>
            )}

            <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

            {/* Included Services */}
            <h3 className="text-lg font-bold text-jd-navy mb-4">What&apos;s Included</h3>
            <div className="space-y-3 mb-8">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-jd-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Ad spend (no dollar amounts) */}
            {hasAds && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-8">
                <h4 className="font-bold text-jd-navy">Google Ads Management Included</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Professional PPC management for immediate lead generation while your organic presence grows.
                  Your strategist will discuss the recommended ad budget during your call.
                </p>
              </div>
            )}

            {/* Valid until */}
            {quote.validUntil && (
              <p className="text-xs text-gray-400 mb-6">
                This proposal is valid until {new Date(quote.validUntil).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            )}

            {/* CTA */}
            <div className="text-center pt-6 border-t">
              <h3 className="text-xl font-bold text-jd-navy mb-2">Ready to get started?</h3>
              <p className="text-gray-500 mb-6">
                Talk to a Juris Digital strategist to finalize your package and kick off your campaign.
              </p>
              <a
                href="https://jurisdigital.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-jd-gold hover:bg-yellow-500 text-jd-navy font-bold text-lg py-4 px-12 rounded-lg transition-colors"
              >
                Get Started
              </a>
              <p className="text-xs text-gray-400 mt-3">
                Or call us at (888) 401-4332
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs">Powered by Juris Digital</p>
        </div>
      </div>
    </div>
  )
}
