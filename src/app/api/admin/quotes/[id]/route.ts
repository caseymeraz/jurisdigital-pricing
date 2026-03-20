import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Get single quote
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(quote)
}

// Update quote
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Recalculate totals from line items
  interface LineItem {
    included: boolean
    monthlyCost: number
    setupFee: number
  }
  const lineItems = (body.lineItems || []) as LineItem[]
  const includedItems = lineItems.filter((li: LineItem) => li.included)
  const totalMRC = includedItems.reduce((sum: number, li: LineItem) => sum + (li.monthlyCost || 0), 0) + (body.adSpendFee || 0)
  const totalSetup = includedItems.reduce((sum: number, li: LineItem) => sum + (li.setupFee || 0), 0)

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      title: body.title,
      firmName: body.firmName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      marketCity: body.marketCity,
      marketState: body.marketState,
      marketTier: body.marketTier,
      packageName: body.packageName,
      contractLength: body.contractLength,
      lineItems: body.lineItems,
      adSpendTier: body.adSpendTier ?? null,
      adSpendMonthly: body.adSpendMonthly ?? null,
      adSpendFee: body.adSpendFee ?? null,
      notes: body.notes,
      clientMessage: body.clientMessage,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      status: body.status,
      totalMRC,
      totalSetup,
    },
  })

  return NextResponse.json(quote)
}

// Delete quote
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.quote.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
