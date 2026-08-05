import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabaseClient";
import { identify, resetIdentity } from "../lib/monitoring";
import { track } from "../lib/analytics";
import { ensureUserBootstrap } from "../services/profileService";

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

    supabase.auth
      .getSession()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setSession(data.session);
        setIsLoading(false);
      })
      .catch((e: unknown) => {
        // A rejected getSession (offline, Supabase unreachable) previously left
        // isLoading true forever, which renders auth-gated views permanently
        // blank. Resolve to signed-out-with-an-error so the UI can explain.
        setError(e instanceof Error ? e.message : "Could not check your sign-in status.");
        setSession(null);
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
        // Repair accounts missing their profile/closet/membership rows (e.g.
        // signups that predate the handle_new_user trigger). No-op for everyone
        // else, and deliberately non-blocking: a failure here must not stop a
        // sign-in that otherwise succeeded.
        void ensureUserBootstrap().then((r) => {
          if (!r.ok) console.error("ensureUserBootstrap failed:", r.error);
        });

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
    // No `scopes` here on purpose. Account sign-in used to request
    // gmail.readonly, but nothing ever read the resulting provider_token —
    // Gmail import runs its own independent GIS token flow (useGmailAuth).
    // The dead scope made Google's unverified-app screen ask for full inbox
    // read at first sign-in, which our own consent primer doesn't promise.
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
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
    // Vestigial: sign-in no longer requests any Google API scope, so
    // provider_token carries no usable Gmail grant and this is effectively
    // always null. Kept only to avoid churning consumers/mocks before beta —
    // remove post-beta along with the field on SupabaseAuthState.
    gmailAccessToken: session?.provider_token ?? null,
    isAuthenticated: session !== null,
    isLoading,
    error,
    signIn,
    signOut,
  };
}
