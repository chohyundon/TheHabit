import { describe, expect, it } from 'vitest';
import {
  createUserDashboardRoute,
  createUserEditRoute,
  createUserFeedbackRoute,
  createUserFollowRoute,
  createUserProfileRoute,
  createUserSearchRoute,
  createFeedbackRoute,
} from '@/public/utils/routeUtils';

describe('routeUtils (no /user prefix)', () => {
  const nick = 'tester';

  it.each([
    [createUserDashboardRoute, `/dashboard/${nick}`],
    [createUserProfileRoute, `/profile/${nick}`],
    [createUserFeedbackRoute, `/feedback/${nick}`],
    [createUserSearchRoute, `/search/${nick}`],
    [createUserFollowRoute, `/follow/${nick}`],
    [createUserEditRoute, `/profile/edit/${nick}`],
    [(n: string) => createFeedbackRoute(n, '42'), `/feedback/${nick}/42`],
  ])('generates flat path', (fn, expected) => {
    expect(fn(nick)).toBe(expected);
  });

  it('does not include /user in generated paths', () => {
    const fns = [
      createUserDashboardRoute,
      createUserProfileRoute,
      createUserFeedbackRoute,
      createUserSearchRoute,
      createUserFollowRoute,
      createUserEditRoute,
    ];
    for (const fn of fns) {
      expect(fn('x')).not.toContain('/user/');
    }
  });
});
