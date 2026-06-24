import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { syncGuestOnboardingToDb } from '@/libs/onboarding/onboarding.server';
import { ONBOARDING_COOKIE_NAME, ONBOARDING_COOKIE_VALUE } from '@/public/consts/onboardingConsts';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const guestCookie = req.cookies.get(ONBOARDING_COOKIE_NAME)?.value;
  if (guestCookie !== ONBOARDING_COOKIE_VALUE) {
    return NextResponse.json({ success: true, synced: false });
  }

  const synced = await syncGuestOnboardingToDb(session.user.id);
  if (!synced) {
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }

  const response = NextResponse.json({ success: true, synced: true });
  response.cookies.delete(ONBOARDING_COOKIE_NAME);

  return response;
}
