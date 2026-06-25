import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  fetchOnboardingCompleted,
  syncGuestOnboardingToDb,
} from '@/libs/onboarding/onboarding.server';
import { ONBOARDING_COOKIE_NAME, ONBOARDING_COOKIE_VALUE } from '@/public/consts/onboardingConsts';
import { isProtectedRoute } from '@/public/consts/protectedRoutes';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 구 /user/* URL → 신규 경로로 영구 리다이렉트
  if (pathname === '/user' || pathname.startsWith('/user/')) {
    const newPath = pathname === '/user' ? '/dashboard' : pathname.replace(/^\/user/, '');
    return NextResponse.redirect(new URL(newPath, req.url), 308);
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const onboardingCookie = req.cookies.get(ONBOARDING_COOKIE_NAME)?.value;

  const isLoggedIn = !!token?.id;
  const isOnboardingPath = pathname.startsWith('/onboarding');
  const hasGuestOnboardingCookie = onboardingCookie === ONBOARDING_COOKIE_VALUE;

  if (isLoggedIn && hasGuestOnboardingCookie && token?.id) {
    await syncGuestOnboardingToDb(token.id);
  }

  let hasCompletedOnboarding =
    token?.onboardingCompleted === true || (isLoggedIn && hasGuestOnboardingCookie);

  if (isLoggedIn && !hasCompletedOnboarding && token?.id) {
    hasCompletedOnboarding = await fetchOnboardingCompleted(token.id);
  }

  const respond = (response: NextResponse) => {
    if (isLoggedIn && hasGuestOnboardingCookie) {
      response.cookies.delete(ONBOARDING_COOKIE_NAME);
    }

    return response;
  };

  // 로그인 + 온보딩 완료 사용자는 온보딩 페이지 접근 불가
  if (hasCompletedOnboarding && isOnboardingPath && isLoggedIn) {
    return respond(NextResponse.redirect(new URL('/dashboard', req.url)));
  }

  if (isProtectedRoute(pathname)) {
    if (!isLoggedIn) {
      return respond(NextResponse.redirect(new URL('/login', req.url)));
    }

    if (!hasCompletedOnboarding) {
      return respond(NextResponse.redirect(new URL('/onboarding', req.url)));
    }
  }

  if (pathname === '/') {
    if (isLoggedIn && hasCompletedOnboarding) {
      return respond(NextResponse.redirect(new URL('/dashboard', req.url)));
    }

    if (!isLoggedIn && hasGuestOnboardingCookie) {
      return NextResponse.redirect(new URL('/demo', req.url));
    }

    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  if (pathname === '/onboarding') {
    if (isLoggedIn && hasCompletedOnboarding) {
      return respond(NextResponse.redirect(new URL('/dashboard', req.url)));
    }

    if (!isLoggedIn && hasGuestOnboardingCookie) {
      return NextResponse.redirect(new URL('/demo', req.url));
    }
  }

  if (pathname === '/login') {
    if (isLoggedIn) {
      const dest = hasCompletedOnboarding ? '/dashboard' : '/onboarding';
      return respond(NextResponse.redirect(new URL(dest, req.url)));
    }
  }

  return respond(NextResponse.next());
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/onboarding/:path*',
    '/user/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/feedback/:path*',
    '/follow/:path*',
    '/search/:path*',
    '/notifications/:path*',
  ],
};
