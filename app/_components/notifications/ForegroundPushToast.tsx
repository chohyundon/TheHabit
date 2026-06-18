'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast, type ToastContentProps } from 'react-toastify';
import type { MessagePayload } from 'firebase/messaging';

const TOAST_DURATION_MS = 5000;
const PUSH_TOAST_ID = 'foreground-push';

type PushType = 'follow' | 'routine_alert' | 'routine_completion' | 'default';

type PushTypeConfig = {
  label: string;
  badgeClass: string;
  iconSrc: string;
};

const PUSH_TYPE_CONFIG: Record<PushType, PushTypeConfig> = {
  follow: {
    label: '팔로우',
    badgeClass: 'bg-blue-50 text-blue-600',
    iconSrc: '/icons/user.svg',
  },
  routine_alert: {
    label: '알림',
    badgeClass: 'bg-amber-50 text-amber-700',
    iconSrc: '/icons/alarm.svg',
  },
  routine_completion: {
    label: '루틴',
    badgeClass: 'bg-lime-50 text-lime-700',
    iconSrc: '/icons/completed.svg',
  },
  default: {
    label: '알림',
    badgeClass: 'bg-gray-100 text-gray-600',
    iconSrc: '/icons/activeAlarm.svg',
  },
};

const resolvePushType = (type?: string): PushType => {
  if (type === 'follow' || type === 'routine_alert' || type === 'routine_completion') {
    return type;
  }
  return 'default';
};

type ForegroundPushToastProps = ToastContentProps & {
  title: string;
  body: string;
  type: PushType;
  redirectUrl: string;
};

const ForegroundPushToast = ({
  title,
  body,
  type,
  redirectUrl,
  closeToast,
}: ForegroundPushToastProps) => {
  const router = useRouter();
  const config = PUSH_TYPE_CONFIG[type];
  const initial = title.trim().charAt(0) || 'T';

  const handleNavigate = () => {
    closeToast?.();
    router.push(redirectUrl);
  };

  const handleClose = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    closeToast?.();
  };

  return (
    <div role='alert' className='push-toast-enter pointer-events-auto w-[min(100vw-2rem,20rem)]'>
      <div className='relative rounded-2xl border border-gray-100 bg-white shadow-md'>
        <button
          type='button'
          aria-label='알림 확인'
          onClick={handleNavigate}
          className='flex w-full items-start gap-3 p-4 pr-10 text-left transition-colors hover:bg-gray-50/80'
        >
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100'>
            {type === 'follow' ? (
              <span className='text-sm font-bold text-gray-500'>{initial}</span>
            ) : (
              <Image src={config.iconSrc} alt='' width={20} height={20} aria-hidden />
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${config.badgeClass}`}
              >
                {config.label}
              </span>
              <span className='h-1.5 w-1.5 rounded-full bg-primary' />
            </div>
            <p className='mt-1 truncate text-sm font-semibold text-gray-900'>{title}</p>
            <p className='mt-0.5 line-clamp-2 text-sm text-gray-600'>{body}</p>
          </div>
        </button>

        <button
          type='button'
          aria-label='닫기'
          onClick={handleClose}
          className='absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const showForegroundPushToast = (payload: MessagePayload) => {
  const title = payload.notification?.title ?? payload.data?.title ?? 'TheHabit';
  const body = payload.notification?.body ?? payload.data?.body ?? '새 알림이 도착했습니다.';
  const redirectUrl = payload.data?.url ?? '/user/notifications';
  const type = resolvePushType(payload.data?.type);

  toast(
    props => (
      <ForegroundPushToast
        {...props}
        title={title}
        body={body}
        type={type}
        redirectUrl={redirectUrl}
      />
    ),
    {
      toastId: PUSH_TOAST_ID,
      position: 'top-right',
      autoClose: TOAST_DURATION_MS,
      hideProgressBar: true,
      closeButton: false,
      icon: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      className: 'push-toast-container',
    }
  );
};
