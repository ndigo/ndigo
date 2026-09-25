/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  GenericApplicationContext,
  ProxiedGenericApplicationContext,
  ApplicationContextAwareProcessor,
} from "../src/context";
import { StaticContentSource, StaticThemeResolver } from "@blue/content";
import { MockEnvironment } from "../src/environment";
import { refreshScope } from "@blue/factory";
import { EntryRegistryProcessor } from "@blue/factory";

describe("GenericApplicationContext", () => {
  let context: GenericApplicationContext;

  beforeEach(() => {
    context = new GenericApplicationContext("test");
  });

  afterEach(() => {
    context.destroy();
    context = undefined as unknown as GenericApplicationContext;
  });

  test("it should have certain properties", () => {
    expect(context).toHaveProperty("name", "test");
    expect(context).toHaveProperty("createdTimestamp");
    expect(typeof context.createdTimestamp).toBe("number");
    expect(context).toHaveProperty("id");
    expect(typeof context.id).toBe("number");
    expect(context).toHaveProperty("parent", null);
    expect(context).toHaveProperty("root", context);
    expect(context).toHaveProperty("destroyed", false);
    expect(context).toHaveProperty("destroyedTimestamp", -1);
  });

  test("it should provide a path", () => {
    expect(context.path).toBe("test");

    const parentContext = new GenericApplicationContext("parent");

    context.setParent(parentContext);

    expect(context.path).toBe("parent/test");
  });

  test("it should manage child contexts", () => {
    const child = context.newChild("child") as GenericApplicationContext;

    expect(context.hasChild(child)).toBe(true);
    expect(child.parent).toBe(context);
    expect(child.path).toBe("test/child");
    expect(context.removeChild(child)).toBe(true);
    expect(context.hasChild(child)).toBe(false);
  });

  test("it should refresh and initialize constructor entries", () => {
    class TestValue {
      initialized = false;

      init(): void {
        this.initialized = true;
      }
    }

    context.setValue("testValue", TestValue);
    context.refresh();

    expect(context.isActive).toBe(true);
    expect(context.getValue<TestValue>("testValue").initialized).toBe(true);
  });

  test("it should refresh only once when already active", () => {
    const preparing = vi.fn();
    const refreshed = vi.fn();

    context.on("context:preparing", preparing);
    context.on("context:refresh", refreshed);

    context.refresh();
    context.refresh();

    expect(preparing).toHaveBeenCalledTimes(1);
    expect(refreshed).toHaveBeenCalledTimes(1);
    expect(context.isActive).toBe(true);
  });

  test("it should run registry processors during refresh", () => {
    const processor: EntryRegistryProcessor = {
      processEntryRegistry(registry): void {
        registry.setValue("fromProcessor", 123);
      },
    };

    context.addProcessor(processor);
    context.refresh();

    expect(context.getValue<number>("fromProcessor")).toBe(123);
  });

  test("it should bubble events up the context tree", () => {
    const parent = new GenericApplicationContext("parent");
    context.setParent(parent);

    const parentListener = vi.fn();
    const childListener = vi.fn();

    parent.on("test:event", parentListener);
    context.on("test:event", childListener);

    context.bubble("test:event", { hello: "world" });

    expect(childListener).toHaveBeenCalledTimes(1);
    expect(parentListener).toHaveBeenCalledTimes(1);
  });

  test("it should broadcast events down the context tree", () => {
    const child = context.newChild("child") as GenericApplicationContext;
    const parentListener = vi.fn();
    const childListener = vi.fn();

    context.on("broadcast:event", parentListener);
    child.on("broadcast:event", childListener);

    context.broadcast("broadcast:event", 1, 2, 3);

    expect(parentListener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);
  });

  test("it should close and cascade destruction to child contexts", () => {
    const child = context.newChild("child") as GenericApplicationContext;
    const destroyListener = vi.fn();

    child.on("context:destroy", destroyListener);
    context.refresh();
    context.close();

    expect(context.destroyed).toBe(true);
    expect(child.destroyed).toBe(true);
    expect(destroyListener).toHaveBeenCalledTimes(1);
  });

  test("it should close only once when already destroyed", () => {
    const onClose = vi.fn();
    const onDestroy = vi.fn();

    context.on("context:close", onClose);
    context.on("context:destroy", onDestroy);

    context.refresh();
    context.close();

    const destroyedTimestamp = context.destroyedTimestamp;

    context.close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDestroy).toHaveBeenCalledTimes(1);
    expect(context.destroyedTimestamp).toBe(destroyedTimestamp);
  });

  test("it should lazily initialize environment when accessed", () => {
    class TestContext extends GenericApplicationContext {
      created = 0;

      protected _createEnvironment() {
        this.created += 1;
        return super._createEnvironment();
      }
    }

    const local = new TestContext("local");

    expect(local.created).toBe(0);

    const first = local.environment;
    const second = local.environment;

    expect(first).toBe(second);
    expect(local.created).toBe(1);

    local.destroy();
  });

  test("it should emit lifecycle events during refresh and close", () => {
    const events: string[] = [];

    context.on("context:preparing", () => events.push("context:preparing"));
    context.on("context:refresh", () => events.push("context:refresh"));
    context.on("context:close", () => events.push("context:close"));
    context.on("context:destroy", () => events.push("context:destroy"));

    context.refresh();
    context.close();

    expect(events).toEqual([
      "context:preparing",
      "context:refresh",
      "context:close",
      "context:destroy",
    ]);
  });

  test("it should accept an initial property set", () => {
    context = new GenericApplicationContext("test", { foo: "bar" });
    expect(context.getValue("foo")).toBe("bar");
  });

  test("it should resolve content from local content source", () => {
    context.setContentSource(
      new StaticContentSource({
        greeting: {
          en: "Hello",
        },
      }),
    );

    expect(context.getContent("greeting", "en")).toBe("Hello");
  });

  test("it should resolve content from parent context fallback", () => {
    const parent = new GenericApplicationContext("parent");
    parent.setContentSource(
      new StaticContentSource({
        welcome: {
          en: "Welcome parent",
        },
      }),
    );

    context.setParent(parent);
    expect(context.getContent("welcome", "en")).toBe("Welcome parent");
  });

  test("it should support re-parenting and root recomputation", () => {
    const root1 = new GenericApplicationContext("root1");
    const root2 = new GenericApplicationContext("root2");

    context.setParent(root1);
    expect(root1.hasChild(context)).toBe(true);
    expect(
      (context as unknown as { root: GenericApplicationContext }).root,
    ).toBe(root1);

    context.setParent(root2);
    expect(root1.hasChild(context)).toBe(false);
    expect(root2.hasChild(context)).toBe(true);
    expect(
      (context as unknown as { root: GenericApplicationContext }).root,
    ).toBe(root2);
    expect(context.path).toBe("root2/test");

    root1.destroy();
    root2.destroy();
  });

  test("it should resolve theme from configured theme name", () => {
    context.setThemeName("night");
    const theme = context.getTheme();

    expect(theme.name).toBe("night");
  });

  test("it should resolve theme from custom theme resolver", () => {
    context.setThemeResolver(
      new StaticThemeResolver(
        [
          {
            name: "light",
            contentSource: new StaticContentSource(),
          },
        ],
        "light",
      ),
    );

    expect(context.getTheme().name).toBe("light");
  });
});

describe("GenericApplicationContext — propagation edge cases", () => {
  test("broadcast reaches grandchildren (depth > 1)", () => {
    const root = new GenericApplicationContext("root");
    const child = root.newChild("child") as GenericApplicationContext;
    const grandchild = child.newChild(
      "grandchild",
    ) as GenericApplicationContext;

    const rootListener = vi.fn();
    const childListener = vi.fn();
    const grandchildListener = vi.fn();

    root.on("deep:event", rootListener);
    child.on("deep:event", childListener);
    grandchild.on("deep:event", grandchildListener);

    root.broadcast("deep:event", 42);

    expect(rootListener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);
    expect(grandchildListener).toHaveBeenCalledTimes(1);

    root.destroy();
  });

  test("broadcast does not fire on sibling contexts", () => {
    const root = new GenericApplicationContext("root");
    const siblingA = root.newChild("siblingA") as GenericApplicationContext;
    const siblingB = root.newChild("siblingB") as GenericApplicationContext;

    const listenerA = vi.fn();
    const listenerB = vi.fn();

    siblingA.on("sibling:event", listenerA);
    siblingB.on("sibling:event", listenerB);

    siblingA.broadcast("sibling:event");

    expect(listenerA).toHaveBeenCalledTimes(1); // fires on broadcaster itself
    expect(listenerB).not.toHaveBeenCalled();

    root.destroy();
  });

  test("bubble reaches grandparent (depth > 1)", () => {
    const grandparent = new GenericApplicationContext("grandparent");
    const parent = grandparent.newChild("parent") as GenericApplicationContext;
    const child = parent.newChild("child") as GenericApplicationContext;

    const grandparentListener = vi.fn();
    const parentListener = vi.fn();
    const childListener = vi.fn();

    grandparent.on("up:event", grandparentListener);
    parent.on("up:event", parentListener);
    child.on("up:event", childListener);

    child.bubble("up:event", "data");

    expect(childListener).toHaveBeenCalledTimes(1);
    expect(parentListener).toHaveBeenCalledTimes(1);
    expect(grandparentListener).toHaveBeenCalledTimes(1);

    grandparent.destroy();
  });

  test("close propagates to grandchildren (depth > 1)", () => {
    const root = new GenericApplicationContext("root");
    const child = root.newChild("child") as GenericApplicationContext;
    const grandchild = child.newChild(
      "grandchild",
    ) as GenericApplicationContext;

    root.refresh();
    root.close();

    expect(root.destroyed).toBe(true);
    expect(child.destroyed).toBe(true);
    expect(grandchild.destroyed).toBe(true);
  });

  test("close removes the context from its parent children list", () => {
    const parent = new GenericApplicationContext("parent");
    const child = parent.newChild("child") as GenericApplicationContext;

    expect(parent.children).toHaveLength(1);
    child.close();

    expect(parent.children).toHaveLength(0);
    expect(child.destroyed).toBe(true);

    parent.destroy();
  });
});

describe("ProxiedGenericContext", () => {
  let context: ProxiedGenericApplicationContext;

  beforeEach(() => {
    context = new ProxiedGenericApplicationContext("test");
  });

  afterEach(() => {
    context.destroy();
    context = undefined as unknown as ProxiedGenericApplicationContext;
  });

  test("it should alias methods", () => {
    context.setValue("foo", 123);
    context.bar = 456;

    expect(context.getValue("foo")).toBe(123);
    expect(context.foo).toBe(123);
    expect(context.hasValue("foo")).toBe(true);
    expect("foo" in context).toBe(true);
    expect(context.getValue("bar")).toBe(456);
    expect(context.bar).toBe(456);
    expect(context.hasValue("bar")).toBe(true);
    expect("bar" in context).toBe(true);
  });

  test("it should support delete through proxy", () => {
    context.foo = 123;
    expect(context.hasValue("foo")).toBe(true);

    expect(delete context.foo).toBe(true);
    expect(context.hasValue("foo")).toBe(false);
  });
});

describe("ApplicationContextAwareProcessor", () => {
  class TestPrototype {
    isAware = true;
    destroy = vi.fn();
    init = vi.fn();
    setApplicationContext = vi.fn();
    setApplicationEventEmitter = vi.fn();
    setEnvironment = vi.fn();
    setContentSource = vi.fn();
    setResourceLoader = vi.fn();
  }

  let context: GenericApplicationContext;
  let env: MockEnvironment;
  let processor: ApplicationContextAwareProcessor;

  beforeEach(() => {
    env = new MockEnvironment();
    context = new GenericApplicationContext("test");
    processor = new ApplicationContextAwareProcessor(context);
    context.setEnvironment(env);
    context.addProcessor(processor);
  });

  afterEach(() => {
    context.destroy();
    context = undefined as unknown as GenericApplicationContext;
    env = undefined as unknown as MockEnvironment;
    processor = undefined as unknown as ApplicationContextAwareProcessor;
  });

  test("it should set context values on singletons", () => {
    context.setValue("test", TestPrototype);

    const test = context.getValue("test") as TestPrototype;
    expect(test.setApplicationContext).toHaveBeenCalledWith(context);
    expect(test.setApplicationEventEmitter).toHaveBeenCalledWith(context);
    expect(test.setEnvironment).toHaveBeenCalledWith(env);
    expect(test.setContentSource).toHaveBeenCalledWith(context);
    expect(test.setResourceLoader).toHaveBeenCalledWith(context);
  });

  test("it should set context values on instances", () => {
    context.setValue("test", TestPrototype);

    const test = context.getInstance("test") as TestPrototype;
    expect(test.setApplicationContext).toHaveBeenCalledWith(context);
    expect(test.setApplicationEventEmitter).toHaveBeenCalledWith(context);
    expect(test.setEnvironment).toHaveBeenCalledWith(env);
    expect(test.setContentSource).toHaveBeenCalledWith(context);
    expect(test.setResourceLoader).toHaveBeenCalledWith(context);
  });
});

describe("GenericApplicationContext — propagation edge cases", () => {
  test("broadcast reaches grandchildren (depth > 1)", () => {
    const root = new GenericApplicationContext("root");
    const child = root.newChild("child") as GenericApplicationContext;
    const grandchild = child.newChild(
      "grandchild",
    ) as GenericApplicationContext;

    const rootListener = vi.fn();
    const childListener = vi.fn();
    const grandchildListener = vi.fn();

    root.on("deep:event", rootListener);
    child.on("deep:event", childListener);
    grandchild.on("deep:event", grandchildListener);

    root.broadcast("deep:event", 42);

    expect(rootListener).toHaveBeenCalledTimes(1);
    expect(childListener).toHaveBeenCalledTimes(1);
    expect(grandchildListener).toHaveBeenCalledTimes(1);

    root.destroy();
  });

  test("broadcast does not fire on sibling contexts", () => {
    const root = new GenericApplicationContext("root");
    const siblingA = root.newChild("siblingA") as GenericApplicationContext;
    const siblingB = root.newChild("siblingB") as GenericApplicationContext;

    const listenerA = vi.fn();
    const listenerB = vi.fn();

    siblingA.on("sibling:event", listenerA);
    siblingB.on("sibling:event", listenerB);

    siblingA.broadcast("sibling:event");

    expect(listenerA).toHaveBeenCalledTimes(1); // fires on broadcaster itself
    expect(listenerB).not.toHaveBeenCalled();

    root.destroy();
  });

  test("bubble reaches grandparent (depth > 1)", () => {
    const grandparent = new GenericApplicationContext("grandparent");
    const parent = grandparent.newChild("parent") as GenericApplicationContext;
    const child = parent.newChild("child") as GenericApplicationContext;

    const grandparentListener = vi.fn();
    const parentListener = vi.fn();
    const childListener = vi.fn();

    grandparent.on("up:event", grandparentListener);
    parent.on("up:event", parentListener);
    child.on("up:event", childListener);

    child.bubble("up:event", "data");

    expect(childListener).toHaveBeenCalledTimes(1);
    expect(parentListener).toHaveBeenCalledTimes(1);
    expect(grandparentListener).toHaveBeenCalledTimes(1);

    grandparent.destroy();
  });

  test("close propagates to grandchildren (depth > 1)", () => {
    const root = new GenericApplicationContext("root");
    const child = root.newChild("child") as GenericApplicationContext;
    const grandchild = child.newChild(
      "grandchild",
    ) as GenericApplicationContext;

    root.refresh();
    root.close();

    expect(root.destroyed).toBe(true);
    expect(child.destroyed).toBe(true);
    expect(grandchild.destroyed).toBe(true);
  });

  test("close removes the context from its parent children list", () => {
    const parent = new GenericApplicationContext("parent");
    const child = parent.newChild("child") as GenericApplicationContext;

    expect(parent.children).toHaveLength(1);
    child.close();

    expect(parent.children).toHaveLength(0);
    expect(child.destroyed).toBe(true);

    parent.destroy();
  });
});
describe("refresh scope wiring (AD-29 D-2)", () => {
  @refreshScope
  class RefreshScoped {}

  test("refresh-scoped beans re-create when the environment refreshes", () => {
    const env = new MockEnvironment();
    const context = new GenericApplicationContext("test");
    context.setEnvironment(env);
    context.setValue("resh", RefreshScoped);

    const before = context.getValue("resh");
    const before2 = context.getValue("resh");

    expect(before).toBe(before2); // cached

    env.refresh(); // emits config:refresh → scope.clear()

    const after = context.getValue("resh");

    expect(after).not.toBe(before); // re-created from factory
    context.destroy();
  });

  test("unscoped (singleton) beans keep identity across refresh", () => {
    class PlainSingleton {}

    const env = new MockEnvironment();
    const context = new GenericApplicationContext("test");
    context.setEnvironment(env);
    context.setValue("plain", PlainSingleton);

    const before = context.getValue("plain");

    env.refresh();

    const after = context.getValue("plain");

    expect(after).toBe(before); // snapshot identity preserved
    context.destroy();
  });

  test("re-setting the environment rewires the refresh listener", () => {
    const env1 = new MockEnvironment();
    const env2 = new MockEnvironment();
    const context = new GenericApplicationContext("test");
    context.setEnvironment(env1);
    context.setValue("resh", RefreshScoped);
    const before = context.getValue("resh");

    // Re-assign to a new environment: the old listener must detach.
    context.setEnvironment(env2);
    env1.refresh();

    expect(context.getValue("resh")).toBe(before); // env1 no longer wired

    env2.refresh();

    expect(context.getValue("resh")).not.toBe(before); // env2 wired
    context.destroy();
  });
});
