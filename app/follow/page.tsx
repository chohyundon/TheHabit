'use client';
import { Suspense } from 'react';
import { FollowPageContent } from '@/app/follow/components/FollowPageContent';
import { LoadingSpinner } from '@/app/_components/loading/LoadingSpinner';

const FollowPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <FollowPageContent />
    </Suspense>
  );
};

export default FollowPage;
