import React from 'react';
import { useGetUserInfo } from '@/libs/hooks/user-hooks/useGetUserInfo';

export const NicknameComponent = () => {
  const { userInfo } = useGetUserInfo();
  const nickname = userInfo?.nickname || '';

  return (
    <div className='flex flex-col w-[180px] relative'>
      <span className='text-[12px] text-[#2A2A2A80] '>닉네임</span>
      <div className='mb-5 z-[99999]'>
        <p className='font-semibold mb-5 text-[18px] text-[#CCC] text-left'>{nickname}</p>
      </div>
    </div>
  );
};
