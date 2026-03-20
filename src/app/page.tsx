import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jd-navy via-jd-blue to-jd-navy flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">Juris Digital</h1>
          <p className="text-jd-gold text-xl font-medium">Service Recommendation Tool</p>
        </div>

        <p className="text-gray-300 text-lg mb-10 leading-relaxed">
          Answer a few questions about your firm and we&apos;ll recommend the perfect
          legal marketing package tailored to your market, goals, and budget.
        </p>

        <div className="space-y-4">
          <Link
            href="/questionnaire"
            className="block w-full bg-jd-gold hover:bg-yellow-500 text-jd-navy font-bold text-lg py-4 px-8 rounded-lg transition-colors"
          >
            Get Your Recommendation
          </Link>

          <Link
            href="/admin"
            className="block w-full border border-gray-500 hover:border-gray-300 text-gray-300 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Admin Login
          </Link>
        </div>

        <p className="text-gray-500 text-sm mt-8">
          Takes about 2 minutes to complete
        </p>
      </div>
    </div>
  )
}
