'use client';

import React from 'react';
import { useModalAnimation } from '@/libs/hooks/useModalAnimation';

interface ToastModalProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const ToastModal: React.FC<ToastModalProps> = ({ children, isOpen = false, onClose }) => {
  const { isVisible, isAnimating } = useModalAnimation(isOpen);

  if (!isVisible) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 모달 컨테이너 - mobile-wrapper와 동일한 width 제약 적용 */}
      <div
        className={`relative w-full max-w-[480px] bg-white rounded-t-2xl shadow-lg mx-auto transition-all duration-300 ease-in-out ${
          isAnimating
            ? 'transform translate-y-0 opacity-100'
            : 'transform translate-y-full opacity-0'
        }`}
      >
        {/* 상단 핸들 바 */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1 bg-primary rounded-full' />
        </div>

        {/* 모달 내용 */}
        <div className='px-6 pb-6 w-full'>{children}</div>
      </div>
    </div>
  );
};

export default ToastModal;
