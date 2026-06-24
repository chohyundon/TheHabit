import { firebaseApp } from '@/firebase';
import { getMessaging, getToken } from 'firebase/messaging';

const FCM_SW_PATH = '/firebase-messaging-sw.js';

// Service Worker 등록
const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  const registration = await navigator.serviceWorker.register(FCM_SW_PATH);
  return registration;
};

// FCM 토큰 등록
export const registerFcmToken = async (): Promise<string | null> => {
  const messaging = getMessaging(firebaseApp);

  if (!messaging) {
    return null;
  }

  const vapidKey =
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidKey) {
    throw new Error(
      'NEXT_PUBLIC_FIREBASE_VAPID_KEY가 없습니다. Firebase Console Web Push 인증서 키를 설정하세요.'
    );
  }

  try {
    const registration = await getServiceWorkerRegistration();

    return await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes('token-subscribe-failed') ||
      message.includes('authentication credential')
    ) {
      throw new Error(
        'FCM 토큰 발급 실패: Firebase Console의 Web Push VAPID 키와 API 설정을 확인하세요. (NEXT_PUBLIC_FIREBASE_VAPID_KEY)'
      );
    }

    throw error;
  }
};
