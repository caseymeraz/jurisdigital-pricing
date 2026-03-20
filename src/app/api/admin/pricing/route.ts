import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configs = await prisma.pricingConfig.findMany({
    where: { isActive: true },
    orderBy: [{ department: 'asc' }, { sortOrder: 'asc' }],
  })

  return NextResponse.json(configs)
}

export async function PUT(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, ...data } = body

  const config = await prisma.pricingConfig.update({
    where: { id },
    data,
  })

  return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const config = await prisma.pricingConfig.create({
    data: body,
  })

  return NextResponse.json(config)
}
