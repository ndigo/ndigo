# @blue/proxy

> Optional container-managed method interception for BlueJS, built on the native JavaScript `Proxy`.

Metadata-only method annotations plus an interceptor chain, applied to the
entries a container creates. An annotation decorator describes a method
without replacing it; an interceptor selects the methods it applies to at
weave time and wraps every call; the weaver replaces only entries with at
least one match with a single `Proxy`, so unadvised entries keep their
identity and pay nothing per call.

## Installation

```bash
pnpm add @blue/proxy
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```ts
import { DefaultFactory } from '@blue/factory';
import { interception, methodAnnotation, type MethodInterceptor } from '@blue/proxy';

const audited = methodAnnotation<{ action: string }>('audited');

const audit: MethodInterceptor = {
    matches: (method) => method.annotation(audited) !== undefined,
    invoke: (invocation, next) => {
        console.log(invocation.annotation(audited)?.action);
        return next();
    },
};

class OrderService {
    @audited({ action: 'order.place' })
    place(order: string): string {
        return `ok:${order}`;
    }
}

const factory = new DefaultFactory();
factory.addProcessor(interception([audit]));
factory.setValue('orders', OrderService);

factory.getValue<OrderService>('orders').place('a'); // logs "order.place", returns "ok:a"
```

Register the processor before entries are created: `interception(...)` weaves
each entry at initialization, and the factory caches the woven proxy like any
other singleton.

## Usage

### Annotations

`methodAnnotation<T>(name)` returns an `AnnotationKey<T>`: a stable key plus a
decorator factory. Values are stored in the TC39 `Symbol.metadata` record
under `proxy:<name>:<methodName>`, and the decorator returns the method
unchanged. Read the value back through `annotationOf(target, key, methodName)`
or a descriptor's `annotation(key)`; both walk the class hierarchy, nearest
declaration winning.

### Interceptors

A `MethodInterceptor` separates selection from execution:

- `matches(method)` runs **once per managed method at weave time**, not per
  call. It receives the `MethodDescriptor`: `entryName`, `targetType`,
  `methodName`, and `annotation(key)`.
- `invoke(invocation, next)` runs on every intercepted call. `invocation` adds
  `target` (the real instance, never the proxy, so `#private` fields keep
  working) and `args`. Return `next()` to continue the chain, or a value to
  short-circuit.
- `order` (optional, default `0`) sorts interceptors: lower runs closer to the
  caller (outermost), and ties keep registration order via a stable sort.

`next()` is re-entrant: each call starts a fresh advance from the caller's
position, so around-advice may invoke it multiple times — that is the retry
pattern [`@blue/resilience`](../blue-resilience/README.md) builds on.

### Weaving

- **Container entries** — `interception(interceptors)` returns an
  `InitializationAwareProcessor`; register it with `factory.addProcessor(...)`
  or `builder.processors(...)`. Matched entries are replaced by one proxy;
  entries with no match are returned unchanged. Re-processing an already-woven
  instance by the _same_ processor is idempotent; a _different_
  `interception(...)` processor meeting an already-woven instance throws — a
  container may register exactly one interception processor, so combine all
  advice in that single call.
- **Hand-constructed objects** (service clients, test doubles) —
  `interceptMethods(instance, interceptors)` weaves any object, describing it
  under its class name. `collectMethodSpecs(...)`, `weaveMethodProxy(...)` and
  `isIntercepted(instance)` are exported for hand-built chains.

Inside the proxy, methods are target-bound (the real instance is always the
receiver), wrappers are cached per method so `proxy.method === proxy.method`
holds for callers that capture method references, and direct property reads
(getters, fields, symbols) are forwarded to the target.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/proxy build:lib
pnpm --filter @blue/proxy test
```

## See Also

- [Guide 15 — Method Interception & Resilience](../../docs/guides/15-method-interception.md)
- [@blue/resilience](../blue-resilience/README.md) — retry and circuit-breaker interceptors on this contract

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
