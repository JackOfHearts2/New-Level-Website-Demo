/* =========================================================================
   Shared image storage for the New Level demo.

   GET  /api/images              → { keys: [...], version } (public)
   GET  /api/images?key=photo:00 → the image bytes         (public)
   PUT  /api/images              → save an image           (admin token)
   DELETE /api/images?key=…      → remove one, or ?all=1   (admin token)

   Storage is Netlify Blobs (built in, no external account).
   Writes require the ADMIN_TOKEN environment variable — if it isn't set,
   writes are refused so a public link can't be defaced.
   ========================================================================= */
import { getStore } from "@netlify/blobs";

const STORE = "site-images";
const MANIFEST = "__manifest";

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

/* Only allow the image slots the site actually renders. */
const KEY_OK = (k) =>
  typeof k === "string" &&
  k.length <= 40 &&
  /^(logo|brand-hero|floorplan|photo:\d{2}|team:\d{1,2}|other:\d{1,2}|event:\d{1,2})$/.test(k);

const authed = (req) => {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return { ok: false, why: "ADMIN_TOKEN is not set on this site — uploads are disabled." };
  const got = req.headers.get("x-admin-token");
  if (!got || got !== expected) return { ok: false, why: "Wrong or missing admin token." };
  return { ok: true };
};

async function readManifest(store) {
  const m = await store.get(MANIFEST, { type: "json" });
  return m && typeof m === "object" ? m : { keys: [], version: 0 };
}

export default async (req) => {
  let store;
  try {
    store = getStore(STORE);
  } catch {
    return json({ error: "Blob storage unavailable." }, 503);
  }

  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  /* ---------- read ---------- */
  if (req.method === "GET") {
    if (!key) return json(await readManifest(store));
    if (!KEY_OK(key)) return json({ error: "Bad key" }, 400);

    const blob = await store.get(key, { type: "arrayBuffer" });
    if (!blob) return json({ error: "Not found" }, 404);
    const meta = await store.getMetadata(key).catch(() => null);
    return new Response(blob, {
      headers: {
        "content-type": (meta && meta.metadata && meta.metadata.type) || "image/jpeg",
        // short cache: replacements should show up quickly, but not re-fetch per view
        "cache-control": "public, max-age=60, stale-while-revalidate=300",
      },
    });
  }

  /* ---------- write ---------- */
  if (req.method === "PUT") {
    const gate = authed(req);
    if (!gate.ok) return json({ error: gate.why }, 401);

    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
    const { key: k, dataUrl } = body || {};
    if (!KEY_OK(k)) return json({ error: "Bad key" }, 400);
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return json({ error: "Expected an image data URL" }, 400);
    }

    const comma = dataUrl.indexOf(",");
    const type = dataUrl.slice(5, dataUrl.indexOf(";"));
    const bytes = Buffer.from(dataUrl.slice(comma + 1), "base64");
    if (bytes.length > 4_000_000) return json({ error: "Image too large (4MB max)" }, 413);

    await store.set(k, bytes, { metadata: { type } });

    const man = await readManifest(store);
    if (!man.keys.includes(k)) man.keys.push(k);
    man.version = Date.now();
    await store.setJSON(MANIFEST, man);

    return json({ ok: true, key: k, version: man.version });
  }

  /* ---------- delete ---------- */
  if (req.method === "DELETE") {
    const gate = authed(req);
    if (!gate.ok) return json({ error: gate.why }, 401);

    const man = await readManifest(store);
    if (url.searchParams.get("all") === "1") {
      await Promise.all(man.keys.map((k) => store.delete(k).catch(() => {})));
      man.keys = [];
    } else {
      if (!KEY_OK(key)) return json({ error: "Bad key" }, 400);
      await store.delete(key).catch(() => {});
      man.keys = man.keys.filter((k) => k !== key);
    }
    man.version = Date.now();
    await store.setJSON(MANIFEST, man);
    return json({ ok: true, version: man.version });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/images" };
