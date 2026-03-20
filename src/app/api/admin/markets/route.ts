import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const search = req.nextUrl.searchParams.get('search') || ''
  const tier = req.nextUrl.searchParams.get('tier') || ''
  const state = req.nextUrl.searchParams.get('state') || ''
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = 50
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { city: { contains: search, mode: 'insensitive' } },
      { state: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (tier) where.computedTier = tier
  if (state) where.stateCode = state

  const [markets, total] = await Promise.all([
    prisma.market.findMany({
      where,
      orderBy: { population: 'desc' },
      take: limit,
      skip,
      include: { exclusivities: true },
    }),
    prisma.market.count({ where }),
  ])

  return NextResponse.json({ markets, total, page, pages: Math.ceil(total / limit) })
}

export async function PATCH(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, adminTierOverride } = body

  const market = await prisma.market.update({
    where: { id },
    data: { adminTierOverride },
  })

  return NextResponse.json(market)
}
