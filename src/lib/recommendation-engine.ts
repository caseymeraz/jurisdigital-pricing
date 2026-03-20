export interface QuestionnaireAnswers {
  practiceAreas: string[]
  firmName: string
  attorneyCount: number
  locationCount: number
  marketCity: string
  marketState: string
  marketTier: string
  currentMarketing: string[]
  growthGoal: string
  competitorInfo: string
  urgency: string
  budgetRange: string
}

export interface ServiceLineItem {
  name: string
  department: string
  monthlyCost: number
  setupFee: number
  description: string
  isRequired: boolean
}

export interface AdSpendRecommendation {
  tier: number
  tierName: string
  monthlySpend: number
  managementFee: number
  managementPercentage: number
}

export interface Recommendation {
  packageName: string
  packageTier: string
  contractLength: string
  monthlyRange: string
  services: ServiceLineItem[]
  adSpend: AdSpendRecommendation | null
  totalMRC: number
  totalSetup: number
  reasoning: string[]
}

export interface MarginBreakdown {
  totalMRC: number
  labor: number       // 40%
  admin: number       // 20%
  expenses: number    // 5%
  profit: number      // 35%
}

const PACKAGES = {
  launchpad: {
    name: 'LaunchPad',
    tier: 'launchpad',
    contractLength: '2 years',
    monthlyRange: '$1,500-$2,500/mo',
    basePrice: 1500,
    maxPrice: 2500,
  },
  foundational: {
    name: 'Foundational SEO',
    tier: 'foundational',
    contractLength: '1 year',
    monthlyRange: '$2,000-$4,000/mo',
    basePrice: 2000,
    maxPrice: 4000,
  },
  premium: {
    name: 'Premium SEO',
    tier: 'premium',
    contractLength: '1 year',
    monthlyRange: '$4,000-$10,000/mo',
    basePrice: 4000,
    maxPrice: 10000,
  },
  elite: {
    name: 'Elite SEO',
    tier: 'elite',
    contractLength: '1 year',
    monthlyRange: '$15,000+/mo',
    basePrice: 15000,
    maxPrice: 50000,
  },
}

const AD_SPEND_TIERS = [
  { tier: 1, name: 'Starter', spend: 3000, fee: 750, pct: 25 },
  { tier: 2, name: 'Growth', spend: 7000, fee: 1400, pct: 20 },
  { tier: 3, name: 'Accelerate', spend: 10000, fee: 1800, pct: 18 },
  { tier: 4, name: 'Scale', spend: 21000, fee: 3150, pct: 15 },
  { tier: 5, name: 'Dominate', spend: 29000, fee: 4060, pct: 14 },
  { tier: 6, name: 'Enterprise', spend: 40000, fee: 5200, pct: 13 },
  { tier: 7, name: 'Market Leader', spend: 54000, fee: 6480, pct: 12 },
]

const BASE_SERVICES: ServiceLineItem[] = [
  { name: 'Account Management', department: 'Admin', monthlyCost: 250, setupFee: 0, description: 'Dedicated account manager for strategy and reporting', isRequired: true },
  { name: 'CallRail Call Tracking', department: 'Admin', monthlyCost: 65, setupFee: 0, description: 'Track and record all leads from marketing campaigns', isRequired: true },
  { name: 'Website Hosting', department: 'Web/Dev', monthlyCost: 50, setupFee: 0, description: 'Managed hosting with SSL, CDN, and daily backups', isRequired: true },
]

function selectPackage(answers: QuestionnaireAnswers): typeof PACKAGES[keyof typeof PACKAGES] {
  const budget = answers.budgetRange
  const attorneys = answers.attorneyCount
  const tier = answers.marketTier
  const isCompetitive = answers.practiceAreas.some(pa =>
    ['personal-injury', 'criminal-defense', 'family-law'].includes(pa)
  )

  let pkg: keyof typeof PACKAGES = 'launchpad'

  // Budget-based selection
  if (budget === '10k+' || budget === '10000+') {
    pkg = 'elite'
  } else if (budget === '5k-10k' || budget === '5000-10000') {
    pkg = 'premium'
  } else if (budget === '3k-5k' || budget === '3000-5000') {
    pkg = 'foundational'
  } else {
    pkg = 'launchpad'
  }

  // Firm size + market override
  if (attorneys >= 16 && tier === 'major') {
    pkg = maxPackage(pkg, 'elite')
  } else if (attorneys >= 6 && tier === 'major') {
    pkg = maxPackage(pkg, 'premium')
  } else if (attorneys >= 2 && tier === 'mid') {
    pkg = maxPackage(pkg, 'foundational')
  }

  // Competitive/major market bump
  if ((isCompetitive || tier === 'major') && pkg !== 'elite') {
    const tiers: (keyof typeof PACKAGES)[] = ['launchpad', 'foundational', 'premium', 'elite']
    const idx = tiers.indexOf(pkg)
    if (idx < tiers.length - 1) {
      pkg = tiers[idx + 1]
    }
  }

  return PACKAGES[pkg]
}

function maxPackage(a: keyof typeof PACKAGES, b: keyof typeof PACKAGES): keyof typeof PACKAGES {
  const order: (keyof typeof PACKAGES)[] = ['launchpad', 'foundational', 'premium', 'elite']
  return order.indexOf(a) >= order.indexOf(b) ? a : b
}

function selectAdSpend(answers: QuestionnaireAnswers): AdSpendRecommendation | null {
  if (!answers.currentMarketing.includes('google-ads') && answers.urgency !== 'asap') {
    // Still recommend if they have budget
    if (answers.budgetRange === '1500-3000' || answers.budgetRange === '0-1500') {
      return null
    }
  }

  const tier = answers.marketTier
  const isPI = answers.practiceAreas.includes('personal-injury')

  let minTier: number, maxTier: number

  if (tier === 'major' && isPI) {
    minTier = 5; maxTier = 7
  } else if (tier === 'major') {
    minTier = 3; maxTier = 5
  } else if (tier === 'mid' && isPI) {
    minTier = 2; maxTier = 4
  } else if (tier === 'mid') {
    minTier = 1; maxTier = 3
  } else {
    minTier = 1; maxTier = 2
  }

  // Pick middle of range
  const selectedTier = Math.min(Math.round((minTier + maxTier) / 2), AD_SPEND_TIERS.length)
  const adTier = AD_SPEND_TIERS[selectedTier - 1]

  return {
    tier: adTier.tier,
    tierName: adTier.name,
    monthlySpend: adTier.spend,
    managementFee: adTier.fee,
    managementPercentage: adTier.pct,
  }
}

function buildServiceBundle(answers: QuestionnaireAnswers, packageTier: string): ServiceLineItem[] {
  const services = [...BASE_SERVICES]

  // No website → add website build
  if (answers.currentMarketing.includes('no-website') || !answers.currentMarketing.includes('has-website')) {
    if (packageTier === 'elite' || packageTier === 'premium') {
      services.push({
        name: 'StoryBrand Website Design',
        department: 'Design',
        monthlyCost: 0,
        setupFee: 15000,
        description: 'Custom StoryBrand framework website designed to convert visitors into leads',
        isRequired: false,
      })
    } else {
      services.push({
        name: 'JDX Website',
        department: 'Web/Dev',
        monthlyCost: 0,
        setupFee: 5000,
        description: 'Professional law firm website built on the JDX platform',
        isRequired: false,
      })
    }
  }

  // SEO is included in all packages
  const seoPrice = packageTier === 'elite' ? 8000 :
    packageTier === 'premium' ? 4000 :
    packageTier === 'foundational' ? 2000 : 1200

  services.push({
    name: 'Search Engine Optimization',
    department: 'SEO',
    monthlyCost: seoPrice,
    setupFee: packageTier === 'launchpad' ? 0 : 2500,
    description: 'On-page optimization, content strategy, link building, and local SEO',
    isRequired: true,
  })

  // PI/Criminal in major market → Branded Search PPC
  if (answers.marketTier === 'major' &&
    answers.practiceAreas.some(pa => ['personal-injury', 'criminal-defense'].includes(pa))) {
    services.push({
      name: 'Branded Search PPC',
      department: 'Advertising',
      monthlyCost: 500,
      setupFee: 500,
      description: 'Protect your brand name in search results from competitor ads',
      isRequired: false,
    })
  }

  // Multiple locations → LSA + New Location Launch
  if (answers.locationCount > 1) {
    services.push({
      name: 'Local Services Ads (LSA)',
      department: 'Advertising',
      monthlyCost: 300,
      setupFee: 500,
      description: 'Google Guaranteed badge and top-of-page placement for local searches',
      isRequired: false,
    })
    services.push({
      name: 'New Location Launch',
      department: 'SEO',
      monthlyCost: 0,
      setupFee: 2500,
      description: 'SEO setup and local presence for additional office locations',
      isRequired: false,
    })
  }

  // ASAP urgency → prioritize ads
  if (answers.urgency === 'asap') {
    if (!services.find(s => s.name === 'Local Services Ads (LSA)')) {
      services.push({
        name: 'Local Services Ads (LSA)',
        department: 'Advertising',
        monthlyCost: 300,
        setupFee: 500,
        description: 'Google Guaranteed badge and top-of-page placement for local searches',
        isRequired: false,
      })
    }
  }

  // Content marketing for premium+
  if (packageTier === 'premium' || packageTier === 'elite') {
    services.push({
      name: 'Content Marketing',
      department: 'Content',
      monthlyCost: packageTier === 'elite' ? 2000 : 1000,
      setupFee: 0,
      description: 'Monthly blog posts, practice area pages, and thought leadership content',
      isRequired: false,
    })
  }

  return services
}

function calculateMargins(totalMRC: number): MarginBreakdown {
  return {
    totalMRC,
    labor: Math.round(totalMRC * 0.40),
    admin: Math.round(totalMRC * 0.20),
    expenses: Math.round(totalMRC * 0.05),
    profit: Math.round(totalMRC * 0.35),
  }
}

export function generateRecommendation(answers: QuestionnaireAnswers): {
  recommendation: Recommendation
  marginBreakdown: MarginBreakdown
} {
  const pkg = selectPackage(answers)
  const adSpend = selectAdSpend(answers)
  const services = buildServiceBundle(answers, pkg.tier)
  const reasoning: string[] = []

  // Build reasoning
  reasoning.push(`Based on ${answers.attorneyCount} attorney(s) in a ${answers.marketTier} market (${answers.marketCity}, ${answers.marketState})`)

  if (answers.budgetRange) {
    reasoning.push(`Budget range: $${answers.budgetRange}/mo`)
  }

  if (answers.practiceAreas.length > 0) {
    reasoning.push(`Practice areas: ${answers.practiceAreas.join(', ')}`)
  }

  if (answers.urgency === 'asap') {
    reasoning.push('Urgent timeline — prioritizing paid advertising for immediate results')
  }

  const serviceMRC = services.reduce((sum, s) => sum + s.monthlyCost, 0)
  const adManagementFee = adSpend?.managementFee || 0
  const totalMRC = serviceMRC + adManagementFee
  const totalSetup = services.reduce((sum, s) => sum + s.setupFee, 0)

  const recommendation: Recommendation = {
    packageName: pkg.name,
    packageTier: pkg.tier,
    contractLength: pkg.contractLength,
    monthlyRange: pkg.monthlyRange,
    services,
    adSpend,
    totalMRC,
    totalSetup,
    reasoning,
  }

  const marginBreakdown = calculateMargins(totalMRC)

  return { recommendation, marginBreakdown }
}
