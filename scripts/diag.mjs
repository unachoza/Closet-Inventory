import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { randomUUID } from "node:crypto";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY;
const opts = { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } };
const admin = createClient(url, serviceKey, opts);

const email = `rls-diag-${Date.now()}@example.com`;
const password = `Diag-${randomUUID()}`;
const { data: user, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
console.log("createUser error:", createErr);
console.log("created user id:", user?.user?.id);

await new Promise((r) => setTimeout(r, 1500));

const client = createClient(url, anonKey, opts);
const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({ email, password });
console.log("signIn error:", signInErr);
console.log("signed in as (authenticated user id):", signInData?.user?.id);
console.log("session present:", !!signInData?.session);

const { data: ownProfile, error: ownProfileErr } = await client.from("profiles").select("*").eq("id", user.user.id);
console.log("\n[as authenticated self] profiles select:", ownProfile, "ERROR:", ownProfileErr);

const { data: ownMembership, error: ownMembershipErr } = await client.from("closet_members").select("*").eq("user_id", user.user.id);
console.log("[as authenticated self] closet_members select:", ownMembership, "ERROR:", ownMembershipErr);

const { data: ownItems, error: ownItemsErr } = await client.from("items").select("*");
console.log("[as authenticated self] items select:", ownItems, "ERROR:", ownItemsErr);

await admin.auth.admin.deleteUser(user.user.id);
console.log("\ncleaned up test user");
