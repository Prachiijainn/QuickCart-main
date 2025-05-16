'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

/**
 * A hook that redirects to sign-in if the user is not authenticated
 * @param {boolean} redirectToSignIn Whether to redirect to sign-in (default: true)
 * @returns {Object} User object if authenticated
 */
export default function useRequireAuth(redirectToSignIn = true) {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (isLoaded && !user && redirectToSignIn) {
      openSignIn();
    }
  }, [isLoaded, user, openSignIn, redirectToSignIn]);

  return { user, isLoaded };
} 