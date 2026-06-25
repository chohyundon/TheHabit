'use client';

import { useEffect, useState } from 'react';

export const useModalAnimation = (isOpen: boolean) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const showTimer = setTimeout(() => setIsVisible(true), 0);
      const animTimer = setTimeout(() => setIsAnimating(true), 10);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(animTimer);
      };
    }

    const hideAnimTimer = setTimeout(() => setIsAnimating(false), 0);
    const hideTimer = setTimeout(() => setIsVisible(false), 300);
    return () => {
      clearTimeout(hideAnimTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  return { isVisible, isAnimating };
};
