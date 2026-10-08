'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '@/lib/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        // Check the real custom claims from the ID token instead of
        // assuming every signed-in user is an admin. The token must be
        // refreshed (sign out/in) after the claim is granted for it to appear.
        try {
          const tokenResult = await user.getIdTokenResult();
          setIsAdmin(tokenResult.claims.admin === true);
          // Editors get content access (posts) but not settings/newsletter/etc.
          // An admin is implicitly also allowed everywhere an editor is.
          setIsEditor(tokenResult.claims.editor === true || tokenResult.claims.admin === true);
        } catch {
          setIsAdmin(false);
          setIsEditor(false);
        }
      } else {
        setIsAdmin(false);
        setIsEditor(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin, isEditor };
}
