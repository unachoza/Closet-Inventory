import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabaseClient";
import { identify, resetIdentity } from "../lib/monitoring";
import { track } from "../lib/analytics";

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
    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (e) {
      // No Supabase env configured (CI / preview / unconfigured local). Surface
      // it as auth state instead of crashing the tree that mounts this provider.
      setError(e instanceof Error ? e.message : "Supabase is not configured");
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error: err }) => {
      if (err) setError(err.message);
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);

      // Analytics identity, gated on consent inside monitoring.ts.
      if (event === "SIGNED_OUT" || !s) {
        void resetIdentity();
        return;
      }
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        void identify(s.user.id, { email: s.user.email });
        // A brand-new account: user created within the last 2 minutes.
        const createdAt = s.user.created_at ? Date.parse(s.user.created_at) : NaN;
        const isNew = Number.isFinite(createdAt) && Date.now() - createdAt < 2 * 60 * 1000;
        track(event === "SIGNED_IN" && isNew ? "account_created" : "signed_in");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured");
      return;
    }
    const { error: err } = await supabase.auth.signInWithOAuth({
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
    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Supabase is not configured");
      return;
    }
    const { error: err } = await supabase.auth.signOut();
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
