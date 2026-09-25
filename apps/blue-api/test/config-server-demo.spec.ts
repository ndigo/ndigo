/**
 * Config-server demo gate (AD-29 Wave 3): the self-served `/api/config.json`
 * document + `/api/config/remote` live-value endpoint, exercised through the
 * full `poll load → replace → refresh → rebind` loop against a wired
 * `configServer` source (stub-fetched — the poll scheduler itself is proven
 * by the blue-boot spec; this proves the served surface and live
 * observability).
 *
 * Production stance: point BLUE_CONFIG_SERVER_URL at a real config server;
 * the demo endpoints exist so the surface runs with zero external infra.
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from "vitest";
import { ApplicationBuilder } from "@blue/boot";
import { ManagementAutoConfiguration } from "@blue/management";
import { NodeAutoConfiguration } from "@blue/platform-node";
import { MockHTTP } from "@blue/test";
import type { NodeDispatcher } from "@blue/platform-node";
import { NodeAppConfiguration } from "../src/node-app-configuration";
import { ServerConfig } from "../src/server-config";
import { initAuth } from "../src/auth-store";

describe("blue-api config-server demo (AD-29 Wave 3)", () => {
  let context: Awaited<ReturnType<ApplicationBuilder["run"]>>;
  let mockMVC: MockHTTP;
  let app: ApplicationBuilder;
  let currentDocument: string;

  beforeAll(async () => {
    initAuth();
    currentDocument = JSON.stringify({
      api: { message: "hello from remote config" },
    });

    app = new ApplicationBuilder([
      NodeAutoConfiguration,
      ManagementAutoConfiguration,
      ServerConfig,
      NodeAppConfiguration,
    ]);
    app.profiles("dev");
    app.properties({ "server.port": "3013", "server.name": "blue-api-demo" });
    app.configServer({
      url: "https://config.demo/app.json",
      fetch: async () => ({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => currentDocument,
      }),
    });

    context = await app.run();
    const dispatcher = context.getValue<NodeDispatcher>("dispatcher");
    mockMVC = new MockHTTP({ dispatcher });
  });

  afterAll(() => {
    context.close();
  });

  test("boot applies the remote document to the environment", () => {
    expect(context.environment.getProperty("api.message")).toBe(
      "hello from remote config",
    );
  });

  test("/api/config/remote reflects the live resolved value", async () => {
    const res = await mockMVC.get("/api/config/remote").exec();
    expect(res.response.status).toBe(200);
    expect((res.json() as { message?: string }).message).toBe(
      "hello from remote config",
    );
  });

  test("a remote change re-applied through the source reflects immediately", async () => {
    // What the poll scheduler does on change: fetch the new document,
    // apply (replace + refresh). Drive it through the wired source.
    currentDocument = JSON.stringify({ api: { message: "updated remotely" } });
    const source = app.configServerSource;
    expect(source).not.toBeNull();
    if (!source) throw new Error("expected configServerSource to be wired");
    expect(await source.load()).toBe(true);

    // The live endpoint reads the environment → rebind is observable.
    expect(context.environment.getProperty("api.message")).toBe(
      "updated remotely",
    );
    const res = await mockMVC.get("/api/config/remote").exec();
    expect((res.json() as { message?: string }).message).toBe(
      "updated remotely",
    );
  });
});
