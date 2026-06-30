// E1-4.2 / Block 0 G0.2 — RLS second-account isolation test.
//
// Creates two real, throwaway Supabase auth users via the admin (service_role)
// API, signs in as each independently, and proves user B cannot read/write/
// delete user A's rows or Storage objects. Cleans up both users on exit
// (cascades delete their profile/closet/items via FK).
//
// Requires SUPABASE_SECRET_KEY (service_role) — never run this against a
// project you don't own, and never commit real output containing user IDs
// from a project with real users in it.
//
// Run:  node --env-file=.env scripts/test-rls-isolation.mjs

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import ws from "ws";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !anonKey || !serviceKey) {
	console.error("Missing required env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SECRET_KEY");
	process.exit(1);
}

// realtime client needs a WebSocket impl on Node < 22; we never use realtime here.
const noPersist = { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws } };
const admin = createClient(url, serviceKey, noPersist);

const PASSWORD = `Rls-Test-${randomUUID()}`;
const runId = Date.now();
const userAEmail = `rls-test-a-${runId}@example.com`;
const userBEmail = `rls-test-b-${runId}@example.com`;

const results = [];
let allPassed = true;

function record(name, ok, detail) {
	results.push({ name, ok, detail });
	if (!ok) allPassed = false;
}

async function main() {
	const { data: userA, error: errA } = await admin.auth.admin.createUser({
		email: userAEmail,
		password: PASSWORD,
		email_confirm: true,
	});
	const { data: userB, error: errB } = await admin.auth.admin.createUser({
		email: userBEmail,
		password: PASSWORD,
		email_confirm: true,
	});
	if (errA || errB) {
		throw new Error(`Test user creation failed: ${errA?.message ?? ""} ${errB?.message ?? ""}`);
	}

	try {
		const clientA = createClient(url, anonKey, noPersist);
		const clientB = createClient(url, anonKey, noPersist);

		const { error: signInAErr } = await clientA.auth.signInWithPassword({ email: userAEmail, password: PASSWORD });
		const { error: signInBErr } = await clientB.auth.signInWithPassword({ email: userBEmail, password: PASSWORD });
		if (signInAErr || signInBErr) {
			throw new Error(
				`Sign-in failed (is email/password auth enabled on this project?): ${signInAErr?.message ?? ""} ${signInBErr?.message ?? ""}`,
			);
		}

		const { data: closetsA } = await clientA.from("closet_members").select("closet_id").eq("user_id", userA.user.id);
		const { data: closetsB } = await clientB.from("closet_members").select("closet_id").eq("user_id", userB.user.id);
		record("handle_new_user trigger gave user A a closet", (closetsA?.length ?? 0) > 0, JSON.stringify(closetsA));
		record("handle_new_user trigger gave user B a closet", (closetsB?.length ?? 0) > 0, JSON.stringify(closetsB));

		const closetIdA = closetsA?.[0]?.closet_id;
		if (!closetIdA) throw new Error("User A has no closet — cannot continue isolation test");

		const { data: insertedItem, error: insertErr } = await clientA
			.from("items")
			.insert({ closet_id: closetIdA, name: "RLS test item — safe to delete", category: "test" })
			.select()
			.single();
		record("Sanity: user A can insert into their own closet", !insertErr && !!insertedItem, insertErr?.message);

		const itemId = insertedItem?.id;

		const { data: bReadsAItems, error: bReadErr } = await clientB.from("items").select("*").eq("closet_id", closetIdA);
		record(
			"User B CANNOT read user A's items",
			(bReadsAItems?.length ?? 0) === 0,
			`rows returned: ${bReadsAItems?.length ?? 0}${bReadErr ? `, error: ${bReadErr.message}` : ""}`,
		);

		if (itemId) {
			const { data: bUpdateResult } = await clientB
				.from("items")
				.update({ name: "HACKED BY USER B" })
				.eq("id", itemId)
				.select();
			record("User B CANNOT update user A's item", (bUpdateResult?.length ?? 0) === 0, `rows affected: ${bUpdateResult?.length ?? 0}`);

			const { data: bDeleteResult } = await clientB.from("items").delete().eq("id", itemId).select();
			record("User B CANNOT delete user A's item", (bDeleteResult?.length ?? 0) === 0, `rows affected: ${bDeleteResult?.length ?? 0}`);
		}

		const { data: bReadsAMembership } = await clientB.from("closet_members").select("*").eq("closet_id", closetIdA);
		record(
			"User B CANNOT read user A's closet_members row",
			(bReadsAMembership?.length ?? 0) === 0,
			`rows returned: ${bReadsAMembership?.length ?? 0}`,
		);

		// Storage isolation
		// item-photos bucket only accepts image MIME types (20260629000001_storage_validation.sql),
		// so the test object must be a tiny real image, not a text blob.
		const onePxPng = Uint8Array.from(
			atob(
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
			),
			(c) => c.charCodeAt(0),
		);
		const path = `${userA.user.id}/rls-test-${runId}.png`;
		const { error: uploadErr } = await clientA.storage
			.from("item-photos")
			.upload(path, new Blob([onePxPng], { type: "image/png" }), { contentType: "image/png" });
		record("Sanity: user A can upload to their own Storage path", !uploadErr, uploadErr?.message);

		const { data: bDownload, error: bDownloadErr } = await clientB.storage.from("item-photos").download(path);
		record("User B CANNOT download user A's Storage object", !bDownload, bDownloadErr?.message ?? "unexpectedly succeeded");

		const { data: bSignedUrl, error: bSignedUrlErr } = await clientB.storage.from("item-photos").createSignedUrl(path, 60);
		record(
			"User B CANNOT create a signed URL for user A's Storage object",
			!bSignedUrl?.signedUrl,
			bSignedUrlErr?.message ?? "unexpectedly succeeded",
		);

		await clientB.storage.from("item-photos").remove([path]);
		const { data: stillThere } = await admin.storage.from("item-photos").list(userA.user.id);
		const survived = stillThere?.some((f) => path.endsWith(f.name));
		record("User B's delete attempt did NOT actually remove user A's Storage object", survived === true, `file still present: ${survived}`);

		await admin.storage.from("item-photos").remove([path]).catch(() => {});
	} finally {
		await admin.auth.admin.deleteUser(userA.user.id).catch(() => {});
		await admin.auth.admin.deleteUser(userB.user.id).catch(() => {});
	}

	console.log("\n=== RLS Isolation Test Results (E1-4.2 / Block 0 G0.2) ===\n");
	for (const r of results) {
		console.log(`${r.ok ? "✅ PASS" : "❌ FAIL"} — ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
	}
	console.log(`\n${allPassed ? "✅ ALL CHECKS PASSED — RLS isolation holds" : "❌ ISOLATION FAILURE DETECTED — see FAIL lines above"}\n`);
	process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
	console.error("Test script crashed before completing:", err);
	process.exit(1);
});
