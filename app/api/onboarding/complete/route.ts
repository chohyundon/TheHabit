import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getSupabaseAdmin } from '@/public/utils/supabase/server';
import {
  ONBOARDING_COOKIE_MAX_AGE,
  ONBOARDING_COOKIE_NAME,
  ONBOARDING_COOKIE_VALUE,
} from '@/public/consts/onboardingConsts';
import Toast from '@/app/_components/toasts/Toast';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('온보딩 완료 DB 저장 실패:', error);
      Toast.error('온보딩 완료 처리에 실패했습니다.');
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, redirectTo: '/user/dashboard' }, { status: 200 });
  }

  const response = NextResponse.json({ success: true, redirectTo: '/demo' });

  response.cookies.set(ONBOARDING_COOKIE_NAME, ONBOARDING_COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ONBOARDING_COOKIE_MAX_AGE,
    path: '/',
  });

  return response;
}
