"use client";

import Loader from '@/components/global/Loader';
import { SignUp, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  if (isSignedIn) {
    return <Loader text="Redirecting" />;
  }

  return (
    <main className='flex items-center justify-center w-full min-h-screen bg-primary'>
      <SignUp afterSignUpUrl="/" />
    </main>
  );
}