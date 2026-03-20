import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || ''
  if (query.length < 2) {
    return NextResponse.json([])
  }

  const markets = await prisma.market.findMany({
    where: {
      OR: [
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { population: 'desc' },
    take: 20,
    include: {
      exclusivities: {
        select: { practiceArea: true, clientName: true },
      },
    },
  })

  return NextResponse.json(
    markets.map((m) => ({
      id: m.id,
      city: m.city,
      state: m.state,
      stateCode: m.stateCode,
      population: m.population,
      msaName: m.msaName,
      msaPopulation: m.msaPopulation,
      tier: m.adminTierOverride || m.computedTier,
      exclusivities: m.exclusivities,
    }))
  )
}
