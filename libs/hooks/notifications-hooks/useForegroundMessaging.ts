import { useEffect } from 'react';
import { getMessaging, onMessage, type MessagePayload } from 'firebase/messaging';
import { firebaseApp } from '@/firebase';
import { showForegroundPushToast } from '@/app/_components/notifications/ForegroundPushToast';

const showForegroundNotification = (payload: MessagePayload) => {
  showForegroundPushToast(payload);
};

/** 앱이 포그라운드일 때 FCM 메시지 수신 — 알림 권한이 허용된 경우 전역에서 리스닝 */
export const useForegroundMessaging = () => {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const setup = async () => {
      try {
        const messaging = getMessaging(firebaseApp);
        if (!messaging || cancelled) {
          return;
        }

        unsubscribe = onMessage(messaging, payload => {
          console.log('FCM foreground 수신:', payload);
          showForegroundNotification(payload);
        });
      } catch (error) {
        console.error('FCM foreground 리스너 등록 실패:', error);
      }
    };

    setup();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);
};
