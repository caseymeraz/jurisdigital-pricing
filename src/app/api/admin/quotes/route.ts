import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// List all quotes
export async function GET(req: NextRequest) {
  const admin = await getSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.quote.count(),
  ])

  return NextResponse.json({ quotes, total, page, pages: Math.ceil(total / limit) })
}

// Create new quote (blank or from session)
export async function POST(req: NextRequest) {
  const admin = await getSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // If creating from a session, pull data
  if (body.fromSessionId) {
    const session = await prisma.questionnaireSession.findUnique({
      where: { id: body.fromSessionId },
    })
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

    interface RecService {
      name: string
      department: string
      monthlyCost: number
      setupFee: number
      description: string
      isRequired: boolean
    }

    interface RecData {
      packageName: string
      contractLength: string
      services: RecService[]
      adSpend: { tier: number; monthlySpend: number; managementFee: number } | null
      totalMRC: number
      totalSetup: number
    }

    const rec = session.recommendation as unknown as RecData | null
    const lineItems = rec?.services?.map((s: RecService) => ({
      name: s.name,
      department: s.department,
      monthlyCost: s.monthlyCost,
      setupFee: s.setupFee,
      description: s.description,
      included: true,
    })) || []

    const quote = await prisma.quote.create({
      data: {
        title: `Proposal for ${session.firmName || session.contactName || 'New Client'}`,
        firmName: session.firmName,
        contactName: session.contactName,
        contactEmail: session.contactEmail,
        contactPhone: session.contactPhone,
        marketCity: session.marketCity,
        marketState: session.marketState,
        marketTier: session.marketTier,
        packageName: rec?.packageName || null,
        contractLength: rec?.contractLength || null,
        lineItems: lineItems as object[],
        adSpendTier: rec?.adSpend?.tier || null,
        adSpendMonthly: rec?.adSpend?.monthlySpend || null,
        adSpendFee: rec?.adSpend?.managementFee || null,
        totalMRC: rec?.totalMRC || 0,
        totalSetup: rec?.totalSetup || 0,
        sessionId: session.id,
        createdBy: admin,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    return NextResponse.json(quote)
  }

  // Create blank quote
  const quote = await prisma.quote.create({
    data: {
      title: body.title || 'New Proposal',
      firmName: body.firmName || null,
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      lineItems: [],
      createdBy: admin,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.json(quote)
}
