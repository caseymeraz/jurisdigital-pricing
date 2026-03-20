import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET redirect: creates a quote from a session and redirects to the editor
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const admin = await getSession()
  if (!admin) return NextResponse.redirect(new URL('/admin', req.url))

  const { sessionId } = await params
  const session = await prisma.questionnaireSession.findUnique({
    where: { id: sessionId },
  })
  if (!session) return NextResponse.redirect(new URL('/admin/sessions', req.url))

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
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return NextResponse.redirect(new URL(`/admin/quotes/${quote.id}`, req.url))
}
