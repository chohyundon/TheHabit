# 온보딩 · 로그인 라우팅 가이드

TheHabit 앱의 온보딩 완료 상태 관리 및 로그인 후 리다이렉트 동작을 정리한 문서입니다.

## 개요

온보딩 완료 상태는 **두 가지 경로**로 관리됩니다.

| 사용자 유형 | 완료 상태 저장 위치 | 완료 후 이동 |
|------------|-------------------|-------------|
| 로그인 사용자 | DB `users.onboarding_completed` + JWT `onboardingCompleted` | `/user/dashboard` |
| 비로그인(게스트) | httpOnly 쿠키 `onboarding=done` | `/demo` |

로그인 사용자가 게스트 온보딩을 이미 마친 경우, 쿠키를 DB/JWT에 동기화한 뒤 온보딩을 다시 보여주지 않습니다.

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `proxy.ts` | 경로별 접근 제어 및 리다이렉트 |
| `app/api/onboarding/complete/route.ts` | 온보딩 완료 처리 (로그인/게스트 분기) |
| `app/api/onboarding/sync-guest/route.ts` | 게스트 쿠키 → DB 동기화 + 쿠키 삭제 |
| `app/onboarding/_components/OnBoardingStep.tsx` | 온보딩 UI 및 완료 후 이동 |
| `app/login/_components/LoginForm.tsx` | 이메일 로그인 후 dashboard 이동 |
| `libs/onboarding/onboarding.server.ts` | 온보딩 DB 조회·게스트 sync 공통 서버 유틸 |
| `public/consts/onboardingConsts.ts` | 쿠키 이름·값 상수 |

### 쿠키 상수

```ts
ONBOARDING_COOKIE_NAME  = 'onboarding'
ONBOARDING_COOKIE_VALUE = 'done'
```

쿠키는 `httpOnly: true`로 설정되므로 **클라이언트 JavaScript로 삭제할 수 없습니다.** 서버 API 또는 proxy 응답에서만 처리합니다.

---

## proxy 라우팅 로직

### 판단 변수

```ts
const isLoggedIn = !!token?.id;
const onboardingDone = token?.onboardingCompleted === true;
const hasGuestOnboardingCookie = onboardingCookie === ONBOARDING_COOKIE_VALUE;

// 핵심: DB/JWT 완료 OR (로그인 + 게스트 쿠키)
const hasCompletedOnboarding =
  onboardingDone || (isLoggedIn && hasGuestOnboardingCookie);
```

### 경로별 동작

| 경로 | 조건 | 리다이렉트 |
|------|------|-----------|
| `/user/*` | 미로그인 | `/login` |
| `/user/*` | 로그인 + 미완료 | `/onboarding` |
| `/user/*` | 로그인 + 완료 | 통과 |
| `/onboarding` | 로그인 + 완료 | `/user/dashboard` |
| `/onboarding` | 비로그인 + 게스트 쿠키 | `/demo` |
| `/login` | 로그인 + 완료 | `/user/dashboard` |
| `/login` | 로그인 + 미완료 | `/onboarding` |
| `/` | 로그인 + 완료 | `/user/dashboard` |
| `/` | 비로그인 + 게스트 쿠키 | `/demo` |
| `/` | 그 외 | `/onboarding` |

> proxy는 **라우팅 + 게스트 sync + 쿠키 삭제**를 담당합니다. 로그인 사용자가 게스트 쿠키를 들고 보호 경로에 진입하면 DB sync 후 쿠키를 제거합니다.

### proxy 처리 순서 (로그인 사용자)

1. 게스트 쿠키 있으면 → `syncGuestOnboardingToDb()` (DB 저장)
2. `hasCompletedOnboarding` 판단 (JWT / 게스트 쿠키 / DB 조회)
3. 응답 시 게스트 쿠키 삭제

---

## API

### `POST /api/onboarding/complete`

온보딩 마지막 단계 "시작하기" 클릭 시 호출됩니다.

#### 로그인 사용자

1. Supabase `users.onboarding_completed = true` 저장
2. `{ success: true, redirectTo: '/user/dashboard' }` 반환

#### 비로그인 사용자

1. DB 저장 없음
2. `onboarding=done` httpOnly 쿠키 설정
3. `{ success: true, redirectTo: '/demo' }` 반환

---

### `POST /api/onboarding/sync-guest`

게스트 온보딩 후 로그인했을 때 **쿠키 상태를 DB/JWT에 영구 반영**합니다.

#### 요청 조건

- 로그인 세션 필수
- `onboarding=done` 쿠키 존재

#### 처리 순서

1. `users.onboarding_completed = true` DB 업데이트
2. `onboarding` 쿠키 삭제
3. `{ success: true, synced: true }` 반환

#### 쿠키가 없을 때

- `{ success: true, synced: false }` — 아무 작업 없음 (멱등)

### `POST /api/onboarding/sync-guest`

게스트 온보딩 쿠키를 DB에 반영하는 API입니다. **주 처리는 proxy에서 수행**하며, 이 API는 필요 시 수동 호출용으로 유지합니다.

#### 요청 조건

- 로그인 세션 필수
- `onboarding=done` 쿠키 존재

#### 처리 순서

1. `users.onboarding_completed = true` DB 업데이트
2. `onboarding` 쿠키 삭제
3. `{ success: true, synced: true }` 반환

#### 호출 위치

| 경로 | 처리 주체 |
|------|----------|
| 이메일/Google 로그인 후 | **proxy** — `/user/dashboard` 등 보호 경로 진입 시 자동 sync |
| 수동 호출 | `POST /api/onboarding/sync-guest` (선택) |

> 전역 `GuestOnboardingSync` 클라이언트 컴포넌트는 제거했습니다. 앱 전체에 `'use client'` + `useEffect`를 두지 않고, **proxy(서버)** 에서 sync·쿠키 삭제·라우팅을 처리합니다.

---

## 시나리오별 흐름

### 1. 로그인 → 온보딩 → dashboard

```
로그인 (onboardingCompleted=false)
  → proxy: /onboarding
  → "시작하기" → POST /api/onboarding/complete
  → DB 저장 + redirectTo: /user/dashboard
  → dashboard
```

### 2. 비로그인 → 온보딩 → demo

```
온보딩 완료
  → POST /api/onboarding/complete
  → 쿠키 onboarding=done + redirectTo: /demo
  → demo (미리보기 모드)
```

### 3. 비로그인 온보딩 → demo → 로그인

```
온보딩 완료 (쿠키 보유)
  → demo
  → 로그인
  → proxy: hasCompletedOnboarding=true → /user/dashboard (온보딩 스킵)
  → proxy: DB sync + 쿠키 삭제
  → 이후 요청: DB 조회로 완료 상태 유지 (JWT 갱신 전에도)
```

```mermaid
flowchart TD
    A[비로그인 온보딩 완료] --> B["쿠키 onboarding=done"]
    B --> C[demo]
    C --> D[로그인]
    D --> E["proxy: hasCompletedOnboarding=true"]
    E --> F[/user/dashboard]
    D --> G["proxy: sync DB + 쿠키 삭제"]
    G --> H["DB onboarding_completed=true"]
```

---

## 컴포넌트 변경 요약

### `OnBoardingStep.tsx`

```ts
router.replace(data.redirectTo ?? (session?.user ? '/user/dashboard' : '/demo'));
```

API `redirectTo` 우선, 없을 때만 세션 기준 fallback.

### `LoginForm.tsx`

```ts
router.replace('/user/dashboard');
```

로그인 성공 후 dashboard로 이동합니다. 게스트 쿠키 sync·삭제는 **proxy**가 처리합니다.

---

## 설계 원칙

| 역할 | 담당 |
|------|------|
| 즉시 라우팅 (온보딩 화면 숨김) | proxy — 게스트 쿠키 포함 판단 |
| 영구 저장 + 쿠키 정리 | proxy — 보호 경로 진입 시 sync |
| JWT 미반영 구간 보완 | proxy — DB `fetchOnboardingCompleted` 조회 |
| 공통 DB 로직 | `libs/onboarding/onboarding.server.ts` |

전역 `'use client'` sync 컴포넌트 없이 **서버 proxy만**으로 게스트→로그인 시나리오를 처리합니다.

---

## 주의사항

- `LoginForm`에서 `cookies()` from `next/headers` 사용 불가 (`'use client'` + httpOnly)
- Google 로그인은 `SocialLogin`의 `callbackUrl: '/user/dashboard'` — 진입 시 proxy가 sync 처리
- proxy matcher: `'/', '/user/:path*', '/onboarding/:path*', '/login'` — `/demo`는 proxy 대상 아님
