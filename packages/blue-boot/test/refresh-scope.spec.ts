/**
 * Live-rebind specs for AD-29 Wave 1: `@refreshScope` on
 * `@configurationProperties` classes re-binds on environment `refresh()`;
 * unmarked classes keep the boot-time snapshot.
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from "vitest";
import { ApplicationBuilder, configurationProperties } from "../src/index";
import {
  property,
  defaultValue,
  configuration,
  refreshScope,
} from "@blue/context";
import type { ConfigurableEnvironment } from "@blue/context";

@configurationProperties("server")
@refreshScope
class RefreshableServerConfig {
  @property("port", Number) @defaultValue("8080") port!: number;
  @property("host", String) @defaultValue("localhost") host!: string;
}

@configurationProperties("plain")
class PlainServerConfig {
  @property("port", Number) @defaultValue("7000") port!: number;
}

describe("@refreshScope live rebind (AD-29 D-1/D-2)", () => {
  test("rebinds @refreshScope config classes with fresh values on refresh()", async () => {
    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.properties({ server: { port: "9090", host: "blue.dev" } });

    const context = await app.run();
    const environment = context.environment as ConfigurableEnvironment;

    const before = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    expect(before.port).toBe(9090);

    // Change the winning source, then refresh the environment.
    environment
      .getPropertySources()
      .replace("boot", { server: { port: "7070", host: "new.dev" } });
    environment.refresh();

    const after = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    expect(after).not.toBe(before); // fresh bound instance
    expect(after.port).toBe(7070);
    expect(after.host).toBe("new.dev");
  });

  test("does NOT rebind unmarked config classes (snapshot identity)", async () => {
    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, PlainServerConfig]);
    app.properties({ plain: { port: "1111" } });

    const context = await app.run();
    const environment = context.environment as ConfigurableEnvironment;

    const before = context.getValue<PlainServerConfig>("plainServerConfig");
    expect(before.port).toBe(1111);

    environment
      .getPropertySources()
      .replace("boot", { plain: { port: "2222" } });
    environment.refresh();

    const after = context.getValue<PlainServerConfig>("plainServerConfig");
    expect(after).toBe(before); // same instance — boot-time snapshot
    expect(after.port).toBe(1111);
  });

  test("refresh() with no source change leaves bound values intact", async () => {
    @configuration
    class BootConfig {}
    const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
    app.properties({ server: { port: "9090" } });

    const context = await app.run();
    const environment = context.environment as ConfigurableEnvironment;

    const before = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    environment.refresh();

    const after = context.getValue<RefreshableServerConfig>(
      "refreshableServerConfig",
    );
    expect(after).not.toBe(before); // re-bound (refresh always re-binds)
    expect(after.port).toBe(9090); // but values unchanged
  });
});
