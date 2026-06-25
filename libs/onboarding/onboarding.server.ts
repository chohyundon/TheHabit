import { getSupabaseAdmin } from '@/public/utils/supabase/server';

export async function fetchOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('온보딩 상태 조회 실패:', error);
      return false;
    }

    return data?.onboarding_completed === true;
  } catch (error) {
    console.error('Supabase 온보딩 상태 조회 중 오류:', error);
    return false;
  }
}

export async function syncGuestOnboardingToDb(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('users')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('게스트 온보딩 DB 동기화 실패:', error);
    return false;
  }

  return true;
}
