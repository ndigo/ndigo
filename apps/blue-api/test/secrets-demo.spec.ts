/**
 * At-rest secrets demo gate (AD-29 Wave 2): with BLUE_SECRET_KEY set and a
 * `{cipher:...}` value in the property source, the bound
 * `@configurationProperties` instance carries the plaintext and the
 * `/api/config/secrets` endpoint serves it. Also proves the two-channel
 * posture: without the key the raw marker binds (no false plaintext).
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from "vitest";
import { randomBytes } from "node:crypto";
import { ApplicationBuilder } from "@blue/boot";
import { ManagementAutoConfiguration } from "@blue/management";
import { AESGCMCipher, NodeAutoConfiguration } from "@blue/platform-node";
import { MockHTTP } from "@blue/test";
import type { NodeDispatcher } from "@blue/platform-node";
import { NodeAppConfiguration } from "../src/node-app-configuration";
import { ServerConfig, SecretsConfig } from "../src/server-config";
import { initAuth } from "../src/auth-store";

const KEY_B64 = Buffer.from(randomBytes(32)).toString("base64");
const cipher = new AESGCMCipher(KEY_B64);
const TOKEN_MARKER = cipher.encrypt("demo-secret-token", "api.secretToken");

describe("blue-api secrets demo (AD-29 Wave 2)", () => {
  let context: Awaited<ReturnType<ApplicationBuilder["run"]>>;
  let mockMVC: MockHTTP;

  beforeAll(async () => {
    initAuth();
    context = await new ApplicationBuilder([
      NodeAutoConfiguration,
      ManagementAutoConfiguration,
      ServerConfig,
      SecretsConfig,
      NodeAppConfiguration,
    ])
      .profiles("dev")
      .properties({ "server.port": "3011", "api.secretToken": TOKEN_MARKER })
      .secrets(cipher)
      .run();

    const dispatcher = context.getValue<NodeDispatcher>("dispatcher");
    mockMVC = new MockHTTP({ dispatcher });
  });

  afterAll(() => {
    context.close();
  });

  test("bound SecretsConfig carries the decrypted plaintext", () => {
    const secrets = context.getValue<SecretsConfig>("secretsConfig");
    expect(secrets.secretToken).toBe("demo-secret-token");
  });

  test("GET /api/config/secrets serves the decrypted value", async () => {
    const res = await mockMVC.get("/api/config/secrets").exec();

    expect(res.response.status).toBe(200);
    expect((res.json() as { secretToken?: string }).secretToken).toBe(
      "demo-secret-token",
    );
  });

  test("raw marker (no secrets wiring) binds without false plaintext", async () => {
    initAuth();
    const plain = await new ApplicationBuilder([
      NodeAutoConfiguration,
      ManagementAutoConfiguration,
      ServerConfig,
      SecretsConfig,
      NodeAppConfiguration,
    ])
      .profiles("dev")
      .properties({ "server.port": "3012", "api.secretToken": TOKEN_MARKER })
      .run();

    const secrets = plain.getValue<SecretsConfig>("secretsConfig");
    // No cipher wired → the marker binds raw; boot still succeeds
    // (the two-channel posture is deployer-driven, not enforced).
    expect(secrets.secretToken).toBe(TOKEN_MARKER);
    plain.close();
  });
});

// Guard: the cipher used above and the key are session-local to the spec.
