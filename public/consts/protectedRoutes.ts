/** 로그인 + 온보딩 완료가 필요한 앱 경로 prefix */
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/profile',
  '/feedback',
  '/follow',
  '/search',
  '/notifications',
] as const;

export const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
