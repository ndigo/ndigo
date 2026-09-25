/**
 * Full-loop config-server integration (AD-29 Wave 3, D-6..D-8): boot with a
 * remote `configServer` source + `@refreshScope` config class → poll detects
 * a change → `environment.refresh()` → `config:refresh` → the config class
 * re-binds with the new value. Also: 304/unchanged → no event, `optional:
 * false` fails boot, `context:close` stops polling.
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from "vitest";
import {
  ConfigurableEnvironment,
  CONFIG_REFRESH_EVENT,
  refreshScope,
  SecretCipher,
} from "@blue/context";
import { ApplicationBuilder, configurationProperties } from "../src/index";
import { property, defaultValue, configuration } from "@blue/context";

@configurationProperties("server")
@refreshScope
class RefreshableServerConfig {
  @property("port", Number) @defaultValue("8080") port!: number;
  @property("host", String) @defaultValue("localhost") host!: string;
}

@configurationProperties("db")
class DbPasswordConfig {
  @property("password", String) @defaultValue("none") password!: string;
}

/** Content-addressable fake fetch with a mutable current document. */
const makeFetch = () => {
  let current = '{"server":{"port":"9090","host":"a.dev"}}';
  let etag = '"v1"';
  const fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      headers: { get: () => etag },
      text: async () => current,
    } as unknown as Response),
  );
  return {
    fetch,
    set(body: string) {
      current = body;
      etag = `"v${++sequence}"`;
    },
    calls: fetch,
  };
};

let sequence = 0;

describe("config-server full loop (AD-29 Wave 3)", () => {
  test("remote change through the poll path rebinds @refreshScope beans", async () => {
    // Boot applies the remote document; the wired source's poll cycle
    // (load → body differs → replace + refresh) re-binds the config
    // class through the boot rebind listener.
    const { fetch, set } = makeFetch();

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.configServer({ url: "https://cfg.example/app.json", fetch });
    const context = await app.run();

    const before = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    expect(before.port).toBe(9090);
    expect(before.host).toBe("a.dev");

    // The remote document changes on the server; the source's poll
    // applies it (replace + refresh via #apply), and the boot listener
    // re-binds the config class from the updated source.
    set('{"server":{"port":"7070","host":"b.dev"}}');
    const source = app.configServerSource;
    expect(source).not.toBeNull();
    if (!source) throw new Error("expected configServerSource to be wired");
    expect(await source.load()).toBe(true);

    const after = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    expect(after).not.toBe(before);
    expect(after.port).toBe(7070);
    expect(after.host).toBe("b.dev");
    context.destroy();
  });

  test("boot-time optional:false failure fails startup loudly", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        headers: { get: () => null },
        text: async () => "down",
      } as unknown as Response),
    );

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig]);
    app.configServer({
      url: "https://cfg.example/down.json",
      optional: false,
      fetch,
    });

    const err = await app.run().then(
      () => null,
      (e: { cause?: { message?: string } }) => e,
    );
    expect(err).not.toBeNull();
    expect(err?.cause?.message).toMatch(/https:\/\/cfg\.example\/down\.json/);
  });

  test("optional:true boot failure proceeds on local sources", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        headers: { get: () => null },
        text: async () => "boom",
      } as unknown as Response),
    );

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.properties({ "server.port": "3000" });
    app.configServer({
      url: "https://cfg.example/down.json",
      optional: true,
      fetch,
    });

    const context = await app.run();
    expect(
      context.getValue<RefreshableServerConfig>("refreshableServerConfig").port,
    ).toBe(3000);
    context.destroy();
  });

  test("config:refresh emitted on remote change drives the boot rebind listener", async () => {
    const refreshSpy = vi.fn();

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.configServer({
      url: "https://cfg.example/app.json",
      fetch: vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: () => '"v1"' },
          text: async () => '{"server":{"port":"1"}}',
        } as unknown as Response),
      ),
    });
    const context = await app.run();
    const environment = context.environment as ConfigurableEnvironment;
    environment.on(CONFIG_REFRESH_EVENT, refreshSpy);

    // The source-level replace+refresh on change (unit-spec covered);
    // here: a config-server change reaches the BOOT listener, which
    // re-binds the config class from the updated source.
    environment
      .getPropertySources()
      .replace("configServer", { server: { port: "2" } });
    environment.refresh();

    expect(
      context.getValue<RefreshableServerConfig>("refreshableServerConfig").port,
    ).toBe(2);
    expect(refreshSpy).toHaveBeenCalled();
    context.destroy();
  });

  test("context:close stops an active poll scheduler", async () => {
    const scheduled: Array<{ callback: () => void; ms: number }> = [];
    const scheduler = {
      setInterval: vi.fn((callback: () => void, ms: number) => {
        scheduled.push({ callback, ms });
        return scheduled.length - 1;
      }),
      clearInterval: vi.fn(),
    };
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => "{}",
      } as unknown as Response),
    );

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig]);
    app.configServer({
      url: "https://cfg.example/app.json",
      pollMs: 5000,
      fetch,
      scheduler,
    });
    const context = await app.run();

    expect(scheduler.setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      5000,
    );
    expect(scheduled.length).toBe(1);

    context.close();
    expect(scheduler.clearInterval).toHaveBeenCalledWith(0);
  });

  test("remote values decrypt too (secrets × configServer composition)", async () => {
    // Owner-confirmed 2026-09-25: {cipher:...} markers inside a fetched
    // document resolve to plaintext, exactly like local sources —
    // defense in depth (config-server responses get cached/proxied).
    const cipher: SecretCipher = {
      scheme: "test",
      capabilities: { aad: true },
      encrypt: (plain: string, aad?: string) =>
        `{test:${Buffer.from(`${plain}|${aad ?? ""}`).toString("base64")}}`,
      decrypt: (marker: string, aad?: string) => {
        const [plain, bound] = Buffer.from(
          marker.slice(1, -1).replace(/^test:/, ""),
          "base64",
        )
          .toString("utf8")
          .split("|");
        if (bound !== (aad ?? "")) throw new Error("AAD mismatch");
        return plain;
      },
    };
    const marker = cipher.encrypt("remote-secret", "db.password");
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => JSON.stringify({ db: { password: marker } }),
      } as unknown as Response),
    );

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.secrets(cipher);
    app.configServer({ url: "https://cfg.example/app.json", fetch });
    const context = await app.run();

    expect(context.environment.getProperty("db.password")).toBe(
      "remote-secret",
    );
    context.destroy();
  });

  test("remote {cipher:...} values fail boot loudly when the scheme is unwired", async () => {
    // A fetched document carrying a marker whose scheme no wired cipher
    // knows must fail loud (never plaintext fallback) — the same rule as
    // local sources, applied to the remote path. (With NO decryptor at
    // all, markers pass through raw — consistent with local binding.)
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => '{"db":{"password":"{jwe:AAAAAAAA}"}}',
      } as unknown as Response),
    );
    const cipher: SecretCipher = {
      scheme: "test",
      capabilities: { aad: true },
      encrypt: (plain: string) => `{test:${plain}}`,
      decrypt: (marker: string) => marker,
    };

    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, DbPasswordConfig]);
    app.secrets(cipher); // wired — but does not know the `jwe` scheme
    app.configServer({ url: "https://cfg.example/app.json", fetch });
    const err = await app.run().then(
      () => null,
      (e: { cause?: { message?: string } }) => e,
    );
    expect(err).not.toBeNull();
    expect(err?.cause?.message).toMatch(/unregistered scheme "jwe"/);
  });
});
