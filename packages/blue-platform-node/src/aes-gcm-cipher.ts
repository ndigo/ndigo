/**
 * AES-256-GCM cipher backend for at-rest config secrets (AD-29 D-4).
 *
 * Marker format: `{cipher:v1:<base64url(iv | tag | ct)>}` — 12-byte IV,
 * 16-byte tag, plaintext ciphertext, AES-256-GCM. The three binary segments
 * are concatenated and base64url-encoded (no padding) as one payload.
 *
 * Key discipline:
 * - `BLUE_SECRET_KEY` is base64 of EXACTLY 32 bytes (AES-256). Malformed or
 *   wrong-length keys fail at construction (startup), never at first decrypt.
 * - Passphrases are rejected outright — no KDF footgun; a raw 256-bit key is
 *   the only accepted shape.
 * - Missing key: `fromEnvironment()` throws (fail-loud wiring); the *first*
 *   `{cipher:` value encountered at lookup throws naming the env var (no
 *   silent plaintext passthrough).
 *
 * Security properties:
 * - AEAD: GCM authenticates the ciphertext + AAD; tamper or wrong key →
 *   `IllegalStateError`, never plaintext.
 * - Key-path AAD binding: the resolver passes the property key (`db.password`)
 *   as additional authenticated data — ciphertext moved between key paths
 *   fails auth at lookup (AD-29 D-4).
 * - Fresh random 96-bit nonce per encryption; no nonce reuse in a key
 *   lifetime (random nonce collision bound p ≈ n²/2⁹⁷ — negligible at
 *   config-file scale, documented).
 *
 * The version segment (`v1`) is the rotation/migration seam: a v2 keystore,
 * a KMS envelope, or a JWE backend can coexist behind the same marker.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from "@blue/core";
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCM,
  type DecipherGCM,
} from "node:crypto";
import { parseSecretMarker, SecretCipher } from "@blue/context";

/**
 * The environment variable carrying the raw AES-256 key (base64, 32 bytes).
 */
export const BLUE_SECRET_KEY = "BLUE_SECRET_KEY";

const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const VERSION = "v1";
const SCHEME = "cipher";

const base64url = (bytes: Buffer): string =>
  Buffer.from(bytes).toString("base64url");

/** The three binary slices decoded out of one base64url payload. */
interface DecodedPayload {
  iv: Buffer;
  tag: Buffer;
  ciphertext: Buffer;
}

/**
 * Decodes `<iv><tag><ciphertext>` from a single base64url payload.
 *
 * `Buffer.from(..., 'base64url')` accepts padding or no padding; the fixed
 * iv/tag byte prefixes are sliced off, remainder = ciphertext.
 */
const decodePayload = (payload: string): DecodedPayload => {
  const raw = Buffer.from(payload, "base64url");
  if (raw.length < IV_BYTES + TAG_BYTES) {
    throw new IllegalStateError(
      `Secret payload too short (${raw.length} bytes); expected iv+tag+ciphertext`,
    );
  }
  return {
    iv: raw.subarray(0, IV_BYTES),
    tag: raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES),
    ciphertext: raw.subarray(IV_BYTES + TAG_BYTES),
  };
};

/**
 * AES-256-GCM {@link SecretCipher} implementation (AD-29 rung 1).
 *
 * The reference backend for at-rest config secrets: zero dependencies
 * (platform-standard `node:crypto`), versioned marker, key-path AAD binding.
 */
export class AESGCMCipher implements SecretCipher {
  /**
   * The scheme id dispatched on markers: `cipher`.
   */
  readonly scheme = SCHEME;

  /**
   * Capabilities: AAD-binding supported (required by the wiring gate).
   */
  readonly capabilities = Object.freeze({ aad: true });

  #key: Buffer;

  /**
   * Creates a cipher over the given raw key.
   *
   * @param key - Base64 encoding of exactly 32 bytes, or the raw 32-byte
   * buffer/array. Any other length or non-base64 input fails loudly here.
   * @throws {IllegalStateError} When the key is not exactly 32 bytes.
   */
  constructor(key: string | Buffer | Uint8Array) {
    const raw =
      typeof key === "string"
        ? Buffer.from(key, "base64url")
        : Buffer.from(key);
    if (raw.length !== KEY_BYTES) {
      throw new IllegalStateError(
        `${BLUE_SECRET_KEY} must be base64 of exactly ${KEY_BYTES} bytes (AES-256); got ${raw.length} bytes. ` +
          "Use a raw random key, never a passphrase.",
      );
    }
    this.#key = raw;
  }

  /**
   * Creates a cipher from `BLUE_SECRET_KEY` in the environment.
   *
   * @param environment - The environment to read the key from (defaults to
   * `process.env`).
   * @returns The configured cipher.
   * @throws {IllegalStateError} When `BLUE_SECRET_KEY` is missing or malformed.
   */
  static fromEnvironment(
    environment: Record<string, string | undefined> = process.env,
  ): AESGCMCipher {
    const encoded = environment?.[BLUE_SECRET_KEY];
    if (!encoded) {
      throw new IllegalStateError(
        `${BLUE_SECRET_KEY} is not set — encrypted config values cannot be decrypted. ` +
          "Set it to base64 of exactly 32 bytes, or remove the {cipher:...} values.",
      );
    }
    return new AESGCMCipher(encoded);
  }

  /**
   * Encrypts a plaintext value into a `{cipher:v1:...}` marker.
   *
   * @param plain - The plaintext value.
   * @param aad - Additional authenticated data (the key path).
   * @returns The secret marker to store in configuration.
   */
  encrypt(plain: string, aad?: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = this.#cipherFor(iv);
    if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));
    const ciphertext = Buffer.concat([
      cipher.update(Buffer.from(plain, "utf8")),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `{${SCHEME}:${VERSION}:${base64url(Buffer.concat([iv, tag, ciphertext]))}}`;
  }

  /**
   * Decrypts a `{cipher:v1:...}` marker back to plaintext.
   *
   * @param marker - The stored marker.
   * @param aad - The additional authenticated data the value was bound to
   * (the key path). A mismatch fails auth.
   * @returns The plaintext value.
   * @throws {IllegalStateError} On tamper, wrong key, wrong AAD, or an
   * unsupported scheme/version.
   */
  decrypt(marker: string, aad?: string): string {
    const parsed = parseSecretMarker(marker);
    if (!parsed) {
      throw new IllegalStateError(
        `Malformed secret marker: expected {scheme[:version]:payload}`,
      );
    }
    const { scheme, version, payload } = parsed;
    if (scheme !== SCHEME) {
      throw new IllegalStateError(
        `Not a ${SCHEME} marker (scheme "${scheme}")`,
      );
    }
    if (version !== VERSION) {
      throw new IllegalStateError(
        `Unsupported ${SCHEME} marker version "${version ?? "(none)"}" — only ${VERSION} is supported. ` +
          "The version prefix is the migration seam; unknown versions never fall back to plaintext.",
      );
    }
    const { iv, tag, ciphertext } = decodePayload(payload);
    const decipher: DecipherGCM = createDecipheriv(
      "aes-256-gcm",
      this.#key,
      iv,
    );
    if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(tag);
    try {
      return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      throw new IllegalStateError(
        "Secret decryption failed: authentication rejected (tampered value, wrong key, or wrong key path)",
      );
    }
  }

  #cipherFor(iv: Buffer): CipherGCM {
    return createCipheriv("aes-256-gcm", this.#key, iv);
  }
}
