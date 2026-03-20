import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const admin = await getSession()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const [sessions, total] = await Promise.all([
    prisma.questionnaireSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.questionnaireSession.count(),
  ])

  return NextResponse.json({ sessions, total, page, pages: Math.ceil(total / limit) })
}
