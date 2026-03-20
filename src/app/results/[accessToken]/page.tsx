import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Recommendation {
  packageName: string
  packageTier: string
  contractLength: string
  monthlyRange: string
  services: {
    name: string
    department: string
    description: string
    isRequired: boolean
  }[]
  adSpend: {
    tierName: string
  } | null
  reasoning: string[]
}

export default async function ExternalResultsPage({
  params,
}: {
  params: Promise<{ accessToken: string }>
}) {
  const { accessToken } = await params
  const session = await prisma.questionnaireSession.findUnique({
    where: { accessToken },
  })

  if (!session || !session.recommendation) {
    notFound()
  }

  const rec = session.recommendation as unknown as Recommendation

  const packageDescriptions: Record<string, string> = {
    launchpad: 'Our entry-level package designed for solo practitioners and small firms looking to establish their online presence and start generating leads.',
    foundational: 'A comprehensive SEO and marketing package that builds a strong digital foundation for growing firms ready to invest in long-term visibility.',
    premium: 'An advanced marketing solution for established firms looking to dominate their local market with aggressive SEO, content, and advertising strategies.',
    elite: 'Our top-tier package for firms seeking market dominance with full-service marketing, premium content, and maximum advertising reach.',
  }

  const tierColors: Record<string, string> = {
    launchpad: 'from-green-500 to-emerald-600',
    foundational: 'from-blue-500 to-indigo-600',
    premium: 'from-purple-500 to-violet-600',
    elite: 'from-jd-gold to-yellow-600',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jd-navy via-jd-blue to-jd-navy">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Juris Digital</h1>
          <p className="text-jd-gold text-sm font-medium mt-1">Your Personalized Recommendation</p>
        </div>

        {/* Package Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${tierColors[rec.packageTier] || 'from-blue-500 to-indigo-600'} px-8 py-6`}>
            <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Recommended Package</p>
            <h2 className="text-3xl font-bold text-white mt-1">{rec.packageName}</h2>
            <p className="text-white/90 mt-1">{rec.contractLength} commitment</p>
          </div>

          <div className="p-8">
            <p className="text-gray-600 leading-relaxed mb-6">
              {packageDescriptions[rec.packageTier] || ''}
            </p>

            {session.firmName && (
              <p className="text-sm text-gray-500 mb-6">
                Customized for <span className="font-medium text-gray-700">{session.firmName}</span>
                {session.marketCity && ` in ${session.marketCity}, ${session.marketState}`}
              </p>
            )}

            {/* Included Services */}
            <h3 className="text-lg font-bold text-jd-navy mb-4">What&apos;s Included</h3>
            <div className="space-y-3 mb-8">
              {rec.services.map((service, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-jd-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {rec.adSpend && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-8">
                <h4 className="font-bold text-jd-navy">Recommended: Google Ads ({rec.adSpend.tierName} Tier)</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Paid advertising for immediate lead generation while your organic presence grows.
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="text-center pt-4 border-t">
              <h3 className="text-xl font-bold text-jd-navy mb-2">Ready to get started?</h3>
              <p className="text-gray-500 mb-6">
                Talk to a Juris Digital strategist to finalize your custom package and pricing.
              </p>
              <a
                href="https://jurisdigital.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-jd-gold hover:bg-yellow-500 text-jd-navy font-bold text-lg py-4 px-12 rounded-lg transition-colors"
              >
                Get a Quote
              </a>
              <p className="text-xs text-gray-400 mt-3">
                Or call us at (888) 401-4332
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/questionnaire" className="text-gray-400 hover:text-gray-300 text-sm">
            Start Over
          </Link>
        </div>
      </div>
    </div>
  )
}
