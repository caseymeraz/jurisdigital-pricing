import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateRecommendation, QuestionnaireAnswers } from '@/lib/recommendation-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const answers: QuestionnaireAnswers = {
      practiceAreas: body.practiceAreas || [],
      firmName: body.firmName || '',
      attorneyCount: parseInt(body.attorneyCount) || 1,
      locationCount: parseInt(body.locationCount) || 1,
      marketCity: body.marketCity || '',
      marketState: body.marketState || '',
      marketTier: body.marketTier || 'small',
      currentMarketing: body.currentMarketing || [],
      growthGoal: body.growthGoal || 'steady',
      competitorInfo: body.competitorInfo || '',
      urgency: body.urgency || 'no-rush',
      budgetRange: body.budgetRange || 'unsure',
    }

    const { recommendation, marginBreakdown } = generateRecommendation(answers)

    const session = await prisma.questionnaireSession.create({
      data: {
        status: 'completed',
        practiceAreas: answers.practiceAreas,
        firmName: answers.firmName,
        attorneyCount: answers.attorneyCount,
        locationCount: answers.locationCount,
        marketId: body.marketId || null,
        marketCity: answers.marketCity,
        marketState: answers.marketState,
        marketTier: answers.marketTier,
        currentMarketing: answers.currentMarketing,
        growthGoal: answers.growthGoal,
        competitorInfo: answers.competitorInfo,
        urgency: answers.urgency,
        budgetRange: answers.budgetRange,
        contactName: body.contactName || null,
        contactEmail: body.contactEmail || null,
        contactPhone: body.contactPhone || null,
        recommendation: recommendation as object,
        marginBreakdown: marginBreakdown as object,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      accessToken: session.accessToken,
    })
  } catch (error) {
    console.error('Questionnaire submission error:', error)
    return NextResponse.json({ error: 'Failed to process questionnaire' }, { status: 500 })
  }
}
