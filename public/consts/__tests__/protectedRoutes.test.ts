import { describe, expect, it } from 'vitest';
import { isProtectedRoute, PROTECTED_ROUTE_PREFIXES } from '@/public/consts/protectedRoutes';

describe('isProtectedRoute', () => {
  it.each(PROTECTED_ROUTE_PREFIXES)('protects %s and nested paths', (prefix) => {
    expect(isProtectedRoute(prefix)).toBe(true);
    expect(isProtectedRoute(`${prefix}/nickname`)).toBe(true);
    expect(isProtectedRoute(`${prefix}/a/b`)).toBe(true);
  });

  it('does not protect public routes', () => {
    const publicPaths = ['/login', '/signup', '/onboarding', '/demo', '/demo/feedback', '/api/users'];
    for (const path of publicPaths) {
      expect(isProtectedRoute(path)).toBe(false);
    }
  });

  it('does not false-positive on similar prefixes', () => {
    expect(isProtectedRoute('/dashboards/foo')).toBe(false);
    expect(isProtectedRoute('/profiles/foo')).toBe(false);
    expect(isProtectedRoute('/user/dashboard')).toBe(false);
  });
});

describe('legacy /user path mapping', () => {
  const mapLegacyPath = (pathname: string): string => {
    if (pathname === '/user') return '/dashboard';
    if (pathname.startsWith('/user/')) return pathname.replace(/^\/user/, '');
    return pathname;
  };

  it.each([
    ['/user', '/dashboard'],
    ['/user/dashboard', '/dashboard'],
    ['/user/dashboard/foo', '/dashboard/foo'],
    ['/user/profile/edit/nick', '/profile/edit/nick'],
    ['/user/feedback/nick/1', '/feedback/nick/1'],
    ['/user/notifications', '/notifications'],
    ['/dashboard', '/dashboard'],
  ])('maps %s → %s', (input, expected) => {
    expect(mapLegacyPath(input)).toBe(expected);
  });
});
