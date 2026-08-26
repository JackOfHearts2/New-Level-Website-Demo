import "server-only";

/** Confirms actual file bytes match a supported image format (JPEG/PNG/WebP)
 *  rather than trusting a client-declared File.type or a stored blob's
 *  claimed type. Returns the correct content-type for the detected format,
 *  or null if unrecognized. Used both when an image is first uploaded and
 *  again when an approved pending upload is copied into the live store —
 *  never trust stored bytes just because they passed the check once. */
export function sniffImageType(bytes: ArrayBuffer): string | null {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "image/png";
  }
  const ascii = String.fromCharCode(...b);
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") return "image/webp";
  return null;
}
