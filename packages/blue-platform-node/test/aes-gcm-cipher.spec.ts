/**
 * AESGCMCipher behavioral + known-answer tests (AD-29 Wave 2, D-4).
 *
 * The NIST/Wycheproof vectors below are AES-256-GCM known-answer tests:
 * fixed key/IV/AAD → exact ciphertext + tag. They cross-check the cipher's
 * raw AES-GCM behavior (tamper rejection, AAD binding) against published
 * authoritative values independently of our own encrypt/decrypt pairing.
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, beforeEach } from "vitest";
import { randomBytes } from "node:crypto";
import { AESGCMCipher, BLUE_SECRET_KEY } from "../src/aes-gcm-cipher";
import { SecretSchemeRegistry } from "@blue/context";

const KEY_B64 = Buffer.from(randomBytes(32)).toString("base64"); // raw 32B key

/**
 * Builds a `{cipher:v1:<b64url(iv|tag|ct)>}` marker from hex parts, exactly
 * matching the cipher's on-wire format without using the cipher itself.
 */
const markerFrom = (ivHex: string, tagHex: string, ctHex: string): string => {
  const payload = Buffer.from(ivHex + tagHex + ctHex, "hex").toString(
    "base64url",
  );
  return `{cipher:v1:${payload}}`;
};

// Wycheproof (Google) AES-256-GCM known-answer vectors — key/iv/aad/msg →
// ct/tag, verified against node:crypto during development (each vector's
// ct/tag re-computed and matched). Both use empty AAD + 12-byte IVs: our
// cipher issues 12-byte random IVs and binds AAD as a utf8 key path, so only
// empty-AAD vectors reproduce byte-exact through the public seam (binary-AAD
// or non-12-byte-IV Wycheproof vectors cannot).
const KAT_VECTORS = [
  {
    key: "80ba3192c803ce965ea371d5ff073cf0f43b6a2ab576b208426e11409c09b9b0",
    iv: "4da5bf8dfd5852c1ea12379d",
    aad: "",
    msg: "",
    ct: "",
    tag: "4771a7c404a472966cea8f73c8bfe17a",
  },
  {
    key: "cc56b680552eb75008f5484b4cb803fa5063ebd6eab91f6ab6aef4916a766273",
    iv: "99e23ec48985bccdeeab60f1",
    aad: "",
    msg: "2a",
    ct: "06",
    tag: "633c1e9703ef744ffffb40edf9d14355",
  },
];

describe("AESGCMCipher (AD-29 D-4)", () => {
  let cipher: AESGCMCipher;

  beforeEach(() => {
    cipher = new AESGCMCipher(KEY_B64);
  });

  describe("key discipline", () => {
    it("rejects keys that are not exactly 32 bytes", () => {
      expect(() => new AESGCMCipher(Buffer.alloc(16))).toThrow(
        /exactly 32 bytes/,
      );
      expect(() => new AESGCMCipher(Buffer.alloc(0))).toThrow(
        /exactly 32 bytes/,
      );
      expect(() => new AESGCMCipher(Buffer.alloc(64))).toThrow(
        /exactly 32 bytes/,
      );
    });

    it("throws at construction with a malformed BLUE_SECRET_KEY", () => {
      expect(() => new AESGCMCipher("not-base64-!!!")).toThrow();
    });

    it("fromEnvironment reads BLUE_SECRET_KEY and fails loud when unset", () => {
      const env = { [BLUE_SECRET_KEY]: KEY_B64 };
      expect(AESGCMCipher.fromEnvironment(env)).toBeInstanceOf(AESGCMCipher);
      expect(() => AESGCMCipher.fromEnvironment({})).toThrow(
        new RegExp(BLUE_SECRET_KEY),
      );
    });
  });

  describe("known-answer tests (Wycheproof AES-256-GCM)", () => {
    for (const [index, vector] of KAT_VECTORS.entries()) {
      it(`decrypts vector ${index + 1} to the exact plaintext`, () => {
        const kat = new AESGCMCipher(Buffer.from(vector.key, "hex"));
        const marker = markerFrom(vector.iv, vector.tag, vector.ct);
        const plain = kat.decrypt(marker, "");
        expect(Buffer.from(plain, "utf8")).toEqual(
          Buffer.from(vector.msg, "hex"),
        );
      });
    }

    it("rejects a tampered tag (wrong/tampered bytes → auth failure)", () => {
      const vector = KAT_VECTORS[1];
      const kat = new AESGCMCipher(Buffer.from(vector.key, "hex"));
      const goodTag = vector.tag;
      const badTag = (BigInt(`0x${goodTag}`) ^ 1n)
        .toString(16)
        .padStart(32, "0");
      const marker = markerFrom(vector.iv, badTag, vector.ct);
      expect(() => kat.decrypt(marker, "")).toThrow(/authentication rejected/);
    });

    it("rejects ciphertext swapped under the same key/IV (integrity)", () => {
      const v1 = KAT_VECTORS[0];
      const v2 = KAT_VECTORS[1];
      const kat = new AESGCMCipher(Buffer.from(v1.key, "hex"));
      // v1's key, but tagged with v2's tag over v1's ct → tag mismatch
      const marker = markerFrom(v1.iv, v2.tag, v1.ct);
      expect(() => kat.decrypt(marker, "")).toThrow(/authentication rejected/);
    });
  });

  describe("encrypt → decrypt", () => {
    it("round-trips a plaintext value", () => {
      const marker = cipher.encrypt("s3cret-pass", "db.password");
      expect(cipher.decrypt(marker, "db.password")).toBe("s3cret-pass");
    });

    it("produces non-deterministic markers (fresh random IV per encryption)", () => {
      const a = cipher.encrypt("same-value", "a");
      const b = cipher.encrypt("same-value", "a");
      expect(a).not.toBe(b);
    });

    it("binds the AAD (key path): same ciphertext under another key path fails", () => {
      const marker = cipher.encrypt("s3cret-pass", "db.password");
      expect(() => cipher.decrypt(marker, "db.host")).toThrow(
        /authentication rejected/,
      );
    });

    it("rejects unknown marker versions without plaintext fallback", () => {
      const marker = cipher.encrypt("s3cret-pass", "db.password");
      const badVersion = marker.replace("{cipher:v1:", "{cipher:v2:");
      expect(() => cipher.decrypt(badVersion, "db.password")).toThrow(
        /version "v2"/,
      );
    });

    it("rejects malformed markers", () => {
      expect(() => cipher.decrypt("not-a-marker", "x")).toThrow(
        /expected \{scheme/,
      );
      expect(() => cipher.decrypt("{cipher:v1:}", "x")).toThrow(/too short/);
    });
  });
});

describe("SecretSchemeRegistry capability gate (AD-29 D-3)", () => {
  it("refuses to wire a cipher without AAD capability", () => {
    const registry = new SecretSchemeRegistry();
    const noAad = {
      scheme: "legacy",
      capabilities: { aad: false },
      encrypt: (_plain: string) => "x",
      decrypt: (marker: string) => marker,
    };
    expect(() => registry.register(noAad)).toThrow(
      /does not support AAD binding/,
    );
  });

  it("dispatches decryption by scheme", () => {
    const registry = new SecretSchemeRegistry();
    const cipher = new AESGCMCipher(
      Buffer.from(randomBytes(32)).toString("base64"),
    );
    registry.register(cipher);
    const marker = cipher.encrypt("v", "k");
    expect(registry.decrypt(marker, { key: "k" })).toBe("v");
  });

  it("fails loud on an unregistered scheme (never plaintext fallback)", () => {
    const registry = new SecretSchemeRegistry();
    expect(() =>
      registry.decrypt("{jwe:eyJhbGciOiIsImtdHlax}", { key: "x" }),
    ).toThrow(/unregistered scheme "jwe"/);
  });
});
