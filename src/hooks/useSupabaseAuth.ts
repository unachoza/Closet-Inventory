import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabaseClient";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export interface SupabaseAuthState {
  session: Session | null;
  user: User | null;
  gmailAccessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data, error: err }) => {
      if (err) setError(err.message);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: GMAIL_SCOPE,
        redirectTo: window.location.origin,
      },
    });
    if (err) setError(err.message);
  };

  const signOut = async () => {
    setError(null);
    const { error: err } = await getSupabase().auth.signOut();
    if (err) setError(err.message);
  };

  return {
    session,
    user: session?.user ?? null,
    // provider_token is the Google access token — present immediately after
    // sign-in redirect but NOT persisted across hard reloads by Supabase.
    // E1-1.3 will handle refresh via provider_refresh_token + a server-side edge fn.
    gmailAccessToken: session?.provider_token ?? null,
    isAuthenticated: session !== null,
    isLoading,
    error,
    signIn,
    signOut,
  };
}
