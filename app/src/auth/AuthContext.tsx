import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PublicClientApplication, { MSALAccount } from 'react-native-msal';
import { isMsalConfigured, MSAL_AUTHORITY, MSAL_CLIENT_ID, MSAL_SCOPES } from './msalConfig';

export type AuthStatus = 'unconfigured' | 'checking' | 'signed-out' | 'signing-in' | 'signed-in' | 'error';

type AuthContextValue = {
  status: AuthStatus;
  account: MSALAccount | null;
  accessToken: string | null;
  errorMessage: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isMsalConfigured();
  const [status, setStatus] = useState<AuthStatus>(configured ? 'checking' : 'unconfigured');
  const [account, setAccount] = useState<MSALAccount | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pca = useMemo(() => {
    if (!configured) return null;
    return new PublicClientApplication({ auth: { clientId: MSAL_CLIENT_ID, authority: MSAL_AUTHORITY } });
  }, [configured]);

  // On launch: try the same thing Teams/Outlook/Copilot do — a silent,
  // broker-backed token acquisition. If the device is already signed in via
  // Company Portal/Authenticator, this succeeds with no UI at all. If not,
  // fall through to 'signed-out' and wait for the rep to tap "Sign in".
  useEffect(() => {
    if (!pca) return;
    let cancelled = false;

    (async () => {
      try {
        await pca.init();
        const accounts = await pca.getAccounts();
        if (accounts.length === 0) {
          if (!cancelled) setStatus('signed-out');
          return;
        }
        const result = await pca.acquireTokenSilent({ account: accounts[0], scopes: MSAL_SCOPES });
        if (cancelled) return;
        if (result) {
          setAccount(result.account);
          setAccessToken(result.accessToken);
          setStatus('signed-in');
        } else {
          setStatus('signed-out');
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMessage(err?.message ?? String(err));
          setStatus('signed-out');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pca]);

  async function signIn() {
    if (!pca) return;
    setStatus('signing-in');
    setErrorMessage(null);
    try {
      const result = await pca.acquireToken({ scopes: MSAL_SCOPES });
      if (result) {
        setAccount(result.account);
        setAccessToken(result.accessToken);
        setStatus('signed-in');
      } else {
        setStatus('signed-out');
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? String(err));
      setStatus('signed-out');
    }
  }

  async function signOut() {
    if (!pca || !account) {
      setAccount(null);
      setAccessToken(null);
      setStatus('signed-out');
      return;
    }
    try {
      await pca.signOut({ account });
    } finally {
      setAccount(null);
      setAccessToken(null);
      setStatus('signed-out');
    }
  }

  return (
    <AuthContext.Provider value={{ status, account, accessToken, errorMessage, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
