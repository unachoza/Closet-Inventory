import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session, User } from "@supabase/supabase-js";

type AuthChangeCallback = (event: string, session: Session | null) => void;

// ── hoisted mock state (safe to reference inside vi.mock factory) ──────────────
const {
  mockSignInWithOAuth,
  mockSignOut,
  mockGetSession,
  mockUnsubscribe,
  getMockSession,
  setMockSession,
  getAuthChangeCallback,
  setAuthChangeCallback,
} = vi.hoisted(() => {
  let _session: Session | null = null;
  let _cb: AuthChangeCallback | null = null;
  return {
    mockSignInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    mockSignOut: vi.fn().mockResolvedValue({ error: null }),
    mockGetSession: vi.fn().mockImplementation(() =>
      Promise.resolve({ data: { session: _session }, error: null })
    ),
    mockUnsubscribe: vi.fn(),
    getMockSession: () => _session,
    setMockSession: (s: Session | null) => { _session = s; },
    getAuthChangeCallback: () => _cb,
    setAuthChangeCallback: (cb: AuthChangeCallback | null) => { _cb = cb; },
  };
});

vi.mock("../../lib/supabaseClient", () => ({
  getSupabase: () => ({
    auth: {
      getSession: mockGetSession,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: (cb: AuthChangeCallback) => {
        setAuthChangeCallback(cb);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    },
  }),
}));

import { useSupabaseAuth } from "../useSupabaseAuth";

// ── helpers ────────────────────────────────────────────────────────────────────
function makeSession(providerToken: string | null = null): Session {
  return {
    access_token: "supabase-jwt",
    refresh_token: "refresh",
    expires_in: 3600,
    token_type: "bearer",
    provider_token: providerToken,
    user: { id: "user-1", email: "test@example.com" } as User,
  } as Session;
}

describe("useSupabaseAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockSession(null);
    setAuthChangeCallback(null);
    mockGetSession.mockImplementation(() =>
      Promise.resolve({ data: { session: getMockSession() }, error: null })
    );
  });

  it("starts in loading state with no session", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.session).toBeNull();
  });

  it("resolves to unauthenticated after getSession returns null", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.gmailAccessToken).toBeNull();
  });

  it("exposes gmailAccessToken from provider_token when session exists", async () => {
    setMockSession(makeSession("google-access-token-xyz"));
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.gmailAccessToken).toBe("google-access-token-xyz");
    expect(result.current.user?.id).toBe("user-1");
  });

  it("gmailAccessToken is null when provider_token is absent", async () => {
    setMockSession(makeSession(null));
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.gmailAccessToken).toBeNull();
  });

  it("signIn calls signInWithOAuth with google provider and a redirect", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    await act(async () => { await result.current.signIn(); });
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: expect.objectContaining({
        redirectTo: expect.any(String),
      }),
    });
  });

  // Guard: plain account sign-in must NOT request any Gmail scope. Nothing reads
  // the resulting provider_token (Gmail import runs its own GIS flow), so the
  // scope only added a full-inbox-read ask to Google's unverified-app screen that
  // our consent primer never promises. Re-adding `scopes` flips this red.
  it("signIn does not request gmail.readonly", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    await act(async () => { await result.current.signIn(); });
    const options = mockSignInWithOAuth.mock.calls[0]?.[0]?.options ?? {};
    expect(options).not.toHaveProperty("scopes");
    expect(JSON.stringify(options)).not.toContain("gmail");
  });

  it("signOut calls supabase.auth.signOut", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    await act(async () => { await result.current.signOut(); });
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("updates session when onAuthStateChange fires", async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    const newSession = makeSession("new-token");
    act(() => { getAuthChangeCallback()?.("SIGNED_IN", newSession); });
    expect(result.current.session).toEqual(newSession);
    expect(result.current.gmailAccessToken).toBe("new-token");
  });

  it("clears session when onAuthStateChange fires with null", async () => {
    setMockSession(makeSession("token"));
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    act(() => { getAuthChangeCallback()?.("SIGNED_OUT", null); });
    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("surfaces error when signInWithOAuth fails", async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: "OAuth failed" } });
    const { result } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    await act(async () => { await result.current.signIn(); });
    expect(result.current.error).toBe("OAuth failed");
  });

  it("unsubscribes from auth listener on unmount", async () => {
    const { unmount } = renderHook(() => useSupabaseAuth());
    await act(async () => {});
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
