import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const exclusivities = await prisma.marketExclusivity.findMany({
    include: { market: { select: { city: true, state: true, stateCode: true } } },
    orderBy: { lockedAt: 'desc' },
  })

  return NextResponse.json(exclusivities)
}

export async function POST(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { marketId, practiceArea, clientName, notes } = body

  const exclusivity = await prisma.marketExclusivity.create({
    data: {
      marketId,
      practiceArea,
      clientName,
      lockedBy: admin,
      notes,
    },
    include: { market: { select: { city: true, state: true, stateCode: true } } },
  })

  return NextResponse.json(exclusivity)
}

export async function DELETE(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  await prisma.marketExclusivity.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
