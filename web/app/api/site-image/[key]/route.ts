import { imageBlobStore } from "@/lib/site-content";

const KEY_OK = /^(logo|hero-bg|team-\d+|testimonial-\d+|avatar-[0-9a-f-]{36})$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  if (!KEY_OK.test(key)) {
    return new Response("Not found", { status: 404 });
  }

  const store = imageBlobStore();
  if (!store) return new Response("Not found", { status: 404 });

  const result = await store
    .getWithMetadata(`image:${key}`, { type: "arrayBuffer" })
    .catch(() => null);
  if (!result) return new Response("Not found", { status: 404 });

  const contentType =
    (result.metadata as { type?: string } | undefined)?.type ?? "image/jpeg";

  return new Response(result.data, {
    headers: {
      "content-type": contentType,
      // Safe to cache forever per-URL: the URL itself changes (?v=) on every upload.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
