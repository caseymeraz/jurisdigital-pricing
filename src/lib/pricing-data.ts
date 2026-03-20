// Default pricing configuration to seed the database
export const DEFAULT_PRICING_CONFIGS = [
  // Advertising - PPC Management Tiers
  {
    department: 'Advertising',
    serviceName: 'PPC Management',
    serviceType: 'tiered',
    pricing: {
      tiers: [
        { tier: 1, name: 'Starter', adSpend: 3000, fee: 750, percentage: 25 },
        { tier: 2, name: 'Growth', adSpend: 7000, fee: 1400, percentage: 20 },
        { tier: 3, name: 'Accelerate', adSpend: 10000, fee: 1800, percentage: 18 },
        { tier: 4, name: 'Scale', adSpend: 21000, fee: 3150, percentage: 15 },
        { tier: 5, name: 'Dominate', adSpend: 29000, fee: 4060, percentage: 14 },
        { tier: 6, name: 'Enterprise', adSpend: 40000, fee: 5200, percentage: 13 },
        { tier: 7, name: 'Market Leader', adSpend: 54000, fee: 6480, percentage: 12 },
      ],
    },
    description: 'Google Ads management with tiered pricing based on ad spend',
    sortOrder: 1,
  },
  {
    department: 'Advertising',
    serviceName: 'Local Services Ads (LSA)',
    serviceType: 'flat',
    pricing: { monthly: 300, setup: 500 },
    description: 'Google Guaranteed badge and local services ad management',
    sortOrder: 2,
  },
  {
    department: 'Advertising',
    serviceName: 'Branded Search PPC',
    serviceType: 'flat',
    pricing: { monthly: 500, setup: 500 },
    description: 'Brand protection campaigns in search results',
    sortOrder: 3,
  },

  // SEO
  {
    department: 'SEO',
    serviceName: 'LaunchPad SEO',
    serviceType: 'package',
    pricing: { monthly: 1200, setup: 0, contractMonths: 24 },
    description: 'Entry-level SEO package for small/solo firms, 2-year commitment',
    sortOrder: 1,
  },
  {
    department: 'SEO',
    serviceName: 'Foundational SEO',
    serviceType: 'package',
    pricing: { monthly: 2000, setup: 2500, maxMonthly: 4000, contractMonths: 12 },
    description: 'Core SEO package with on-page, content, and link building',
    sortOrder: 2,
  },
  {
    department: 'SEO',
    serviceName: 'Premium SEO',
    serviceType: 'package',
    pricing: { monthly: 4000, setup: 2500, maxMonthly: 10000, contractMonths: 12 },
    description: 'Advanced SEO with aggressive content and link strategies',
    sortOrder: 3,
  },
  {
    department: 'SEO',
    serviceName: 'Elite SEO',
    serviceType: 'package',
    pricing: { monthly: 8000, setup: 2500, maxMonthly: 50000, contractMonths: 12 },
    description: 'Full-service SEO domination for competitive markets',
    sortOrder: 4,
  },
  {
    department: 'SEO',
    serviceName: 'New Location Launch',
    serviceType: 'flat',
    pricing: { monthly: 0, setup: 2500 },
    description: 'SEO setup for additional office locations',
    sortOrder: 5,
  },

  // Web/Dev
  {
    department: 'Web/Dev',
    serviceName: 'JDX Website',
    serviceType: 'flat',
    pricing: { monthly: 0, setup: 5000 },
    description: 'Professional law firm website on the JDX platform',
    sortOrder: 1,
  },
  {
    department: 'Web/Dev',
    serviceName: 'Website Hosting',
    serviceType: 'flat',
    pricing: { monthly: 50, setup: 0 },
    description: 'Managed hosting with SSL, CDN, and daily backups',
    sortOrder: 2,
  },

  // Design
  {
    department: 'Design',
    serviceName: 'StoryBrand Website Design',
    serviceType: 'flat',
    pricing: { monthly: 0, setup: 15000 },
    description: 'Custom StoryBrand framework website',
    sortOrder: 1,
  },
  {
    department: 'Design',
    serviceName: 'Logo & Brand Identity',
    serviceType: 'flat',
    pricing: { monthly: 0, setup: 3000 },
    description: 'Logo design and brand style guide',
    sortOrder: 2,
  },

  // Content
  {
    department: 'Content',
    serviceName: 'Content Marketing - Standard',
    serviceType: 'flat',
    pricing: { monthly: 1000, setup: 0 },
    description: 'Monthly blog posts and practice area content',
    sortOrder: 1,
  },
  {
    department: 'Content',
    serviceName: 'Content Marketing - Premium',
    serviceType: 'flat',
    pricing: { monthly: 2000, setup: 0 },
    description: 'Extended content strategy with thought leadership',
    sortOrder: 2,
  },

  // Admin
  {
    department: 'Admin',
    serviceName: 'Account Management',
    serviceType: 'flat',
    pricing: { monthly: 250, setup: 0 },
    description: 'Dedicated account manager for strategy and reporting',
    sortOrder: 1,
  },
  {
    department: 'Admin',
    serviceName: 'CallRail Call Tracking',
    serviceType: 'flat',
    pricing: { monthly: 65, setup: 0 },
    description: 'Call tracking and recording for lead attribution',
    sortOrder: 2,
  },
]

export const PRACTICE_AREAS = [
  { id: 'personal-injury', label: 'Personal Injury', icon: '⚖️' },
  { id: 'family-law', label: 'Family Law', icon: '👨‍👩‍👧' },
  { id: 'criminal-defense', label: 'Criminal Defense', icon: '🛡️' },
  { id: 'immigration', label: 'Immigration', icon: '🌍' },
  { id: 'estate-planning', label: 'Estate Planning', icon: '📋' },
  { id: 'business-law', label: 'Business/Corporate Law', icon: '🏢' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'employment-law', label: 'Employment Law', icon: '💼' },
  { id: 'bankruptcy', label: 'Bankruptcy', icon: '📊' },
  { id: 'intellectual-property', label: 'Intellectual Property', icon: '💡' },
  { id: 'medical-malpractice', label: 'Medical Malpractice', icon: '🏥' },
  { id: 'tax-law', label: 'Tax Law', icon: '📑' },
  { id: 'social-security', label: 'Social Security/Disability', icon: '🤝' },
  { id: 'workers-comp', label: "Workers' Compensation", icon: '⚒️' },
  { id: 'other', label: 'Other', icon: '📝' },
]

export const BUDGET_RANGES = [
  { id: '1500-3000', label: '$1,500 - $3,000/mo' },
  { id: '3000-5000', label: '$3,000 - $5,000/mo' },
  { id: '5000-10000', label: '$5,000 - $10,000/mo' },
  { id: '10000+', label: '$10,000+/mo' },
  { id: 'unsure', label: "Not sure yet" },
]

export const GROWTH_GOALS = [
  { id: 'steady', label: 'Steady, sustainable growth' },
  { id: 'aggressive', label: 'Aggressive growth — I want more cases fast' },
  { id: 'dominate', label: 'Dominate my market — become #1' },
  { id: 'maintain', label: 'Maintain current caseload, improve quality' },
]

export const URGENCY_OPTIONS = [
  { id: 'asap', label: 'ASAP — I need results now' },
  { id: '3-months', label: 'Within 3 months' },
  { id: '6-months', label: 'Within 6 months' },
  { id: 'no-rush', label: 'No rush — building for long term' },
]

export const CURRENT_MARKETING_OPTIONS = [
  { id: 'current-agency', label: 'Currently working with another agency' },
  { id: 'google-ads', label: 'Running Google Ads' },
  { id: 'has-website', label: 'Have a professional website' },
  { id: 'no-website', label: 'Need a new website' },
  { id: 'seo', label: 'Doing some SEO' },
  { id: 'social-media', label: 'Active on social media' },
  { id: 'nothing', label: 'Not doing any marketing yet' },
]
