# Annotation, Advice & Transformer

A **decorator** is standard JavaScript syntax for attaching a function to a
class, method, accessor, or field. The function receives the decorated target
and a context object, and it may replace the target. For the language details,
see the [TC39 decorators proposal](https://github.com/tc39/proposal-decorators).

Ndigo decorators do three different jobs, and the framework keeps them
separate:

- An **annotation** records a fact about the member and returns it unchanged.
  It runs nothing by itself. That is the main difference from a typical
  decorator, which wraps or replaces the member it decorates: an annotation is
  inert until another part of the framework reads the declaration.
- **Advice** is code that runs around a call — before, after, or instead of the
  original method. It is the [aspect-oriented programming][aop] idea: behaviour
  that belongs outside the method body, selected by a rule rather than written
  into the method.
- A **member transformer** replaces the member at definition time. It is the
  closest to a conventional decorator: code that uses the class sees the
  replacement from the start.

| Mechanism              | What it does                                  | When it takes effect                  |
| :--------------------- | :-------------------------------------------- | :------------------------------------ |
| **Annotation**         | Records a fact about the member; runs nothing | When a consumer reads the declaration |
| **Advice**             | Runs code around the call                     | On each call, when a rule matches     |
| **Member transformer** | Replaces the member                           | When the class is defined             |

The model is declaration-first: the class declares, and the application — not
the decorator — decides what runs. Keeping the three separate means a policy
can be configured, ordered, or removed without editing the method, and a
declaration can be read without executing anything. Every capability reachable
through a container is also reachable by hand; [Running With or Without a
Container](#running-with-or-without-a-container) is the proof.

## How Each Mechanism Works

### Annotation

An annotation writes a value into the class's [`Symbol.metadata`][decorator-metadata]
record and returns the target unchanged. It never runs, wraps, or reorders
anything. A member with annotations but no reader behaves exactly like a member
with no annotations at all.

```ts
import { annotationOf, methodAnnotation } from '@ndigo/core';

export const audited = methodAnnotation<{ action: string }>('orders:audited');

class OrderService {
    @audited({ action: 'order.submit' })
    submit(): void {}
}

annotationOf(OrderService, audited, 'submit'); // { action: 'order.submit' }
```

The key is `<namespace>:<name>`, and the namespace names the package that
declares the annotation, not the package that reads it. A member key adds the
member name (`orders:audited:submit`); `annotationOf` walks the class hierarchy
and returns the nearest declaration. Values are arbitrary data — a boolean, a
string, or a normalized spec object — and validation belongs to the reader.

Use an annotation alone when another package reads a fact about the member:
routing, ORM mapping, authentication. The decorator is the declaration; the
reader is a separate concern.

### Advice

Advice is a wrapper installed around a matched method. It is not part of the
class definition: the class declares, and the application supplies the
behaviour. Interception happens on each call, so the same method can be advised
differently in two applications — or not at all in a unit test.

A rule pairs a matcher with an interceptor and an optional position:

```ts
import { AdviceOrder, hasAnnotation } from '@ndigo/advice';
import { RetryInterceptor, retry } from '@ndigo/resilience';

const retryPolicy = {
    when: hasAnnotation(retry),
    use: new RetryInterceptor(),
    order: AdviceOrder.Resilience,
};
```

`when` is a `Matchable` predicate — the same contract the router uses for
paths. `hasAnnotation(retry)` matches methods that carry `@retry` (or whose
class does); omit `when` to advise every method on the instance. `use` is the
advice implementation. `order` is the position.

`AdviceOrder` names the bands so independently authored rules interleave
predictably. Lower runs closer to the caller:

| Band            | Position                | Rationale                                                          |
| :-------------- | :---------------------- | :----------------------------------------------------------------- |
| `Observability` | outermost               | Traces and metrics must see retries and their failures             |
| `Resilience`    | outside the transaction | A retry re-runs the whole transaction, not one statement inside it |
| `Transaction`   | inside resilience       | The boundary is the unit that retries                              |
| `Application`   | default                 | User policy with no stronger ordering requirement                  |
| `Innermost`     | closest to the body     | Work that must observe the final, already-decided call             |

Only the relative order of the bands is contractual. A capability declares its
natural band on the interceptor, so the safe arrangement is what an application
gets without naming numbers; a rule's own `order` still has the last word.

Use advice for central policy that must be configured, ordered, replaced, or
disabled per application — retries, transactions, caching, tracing, audit.

### Member Transformer

A member transformer returns a replacement for the decorated member — or, for a
class-level decorator, a replacement class. It runs at class definition time,
has no selection step, and needs no runtime to work.

```ts
export function logged<This, Args extends unknown[], R>(
    target: (this: This, ...args: Args) => R,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => R>
): (this: This, ...args: Args) => R {
    return function (this: This, ...args: Args): R {
        console.log(String(context.name), args);
        return target.apply(this, args);
    };
}
```

The replacement must preserve `this` by applying the original with the caller's
receiver: `target.apply(this, args)`. A transformer may also write metadata,
but the returned replacement is what defines it.

Use a member transformer when the behaviour is opt-in per member and must run
with no context, no registry, and no preset — a plain object in a unit test —
and when the wrapper genuinely has nothing to compose or reorder. Use advice
instead when the behaviour must be enabled, disabled, configured, or reordered
per application, or must apply to classes the method's author does not own.

### Choosing a Mechanism

| Situation                                                              | Use                                         |
| :--------------------------------------------------------------------- | :------------------------------------------ |
| Another package reads a fact about the member (routing, ORM, auth)     | **Annotation alone**                        |
| Central policy that must be configured, ordered, replaced, or disabled | **Annotation + advice**                     |
| Opt-in per member, must work with no container and no runtime wiring   | **Member transformer** (or a plain wrapper) |
| Behaviour around a whole request, not one method                       | A pipeline interceptor — not method advice  |

The shipped decorators map cleanly onto the three mechanisms:

| What you write      | What runs                             | Examples                                                                     |
| :------------------ | :------------------------------------ | :--------------------------------------------------------------------------- |
| Annotation only     | A reader, when it looks               | `@getMapping`, `@entity`, `@authenticated`                                   |
| Annotation + advice | An interceptor around each call       | `@retry` + `RetryInterceptor`, `@transactional` + `TransactionalInterceptor` |
| Member transformer  | The replacement, from definition time | `@reactive`; a custom `@logged`                                              |

The [Decorators](./decorators.md) page is the full catalog by concern.

## Running With or Without a Container

The model works both ways. The container wires one weaver for every entry;
the same plan can be applied by hand. The programmatic path is a first-class
primitive, not a compatibility shim.

```ts
import { interceptMethods } from '@ndigo/advice';

const service = interceptMethods(new OrderService(), [retryPolicy]);

await service.submit();
```

For ordinary class instances, `interceptMethods(instance, rules)` returns the
same object with the advised methods installed; the prototype is untouched.
`createIntercepted(OrderService, rules)` constructs and advises in one step.

`MethodInterceptor` is a plain interface, so an object literal is enough — no
framework, no decorator, no container:

```ts
import type { MethodInterceptor } from '@ndigo/advice';

const audit: MethodInterceptor = {
    invoke(invocation, next) {
        console.log(invocation.methodName, invocation.args);
        return next();
    },
};

const auditedService = interceptMethods(new OrderService(), [{ use: audit }]);
```

## Coming from Spring, Angular, or Express

| Idea in the ecosystem                          | Ndigo equivalent                               | Divergence                                                                 |
| :--------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------- |
| [Spring AOP][spring-aop] `@Aspect` + `@Around` | A `MethodInterceptorRule` with an interceptor  | No aspect class; rules are values, not annotated classes                   |
| Spring pointcut expression                     | `Matchable<MethodDescriptor>`                  | Predicates are code; no expression parser                                  |
| [Spring `@Transactional`][spring-tx]           | `@transactional` + `TransactionalInterceptor`  | Joins an open transaction instead of nesting                               |
| Spring `@Order` / `Ordered`                    | `order` on the rule + `AdviceOrder` bands      | Ordering belongs to the composition, not the advice class                  |
| [Angular HTTP interceptor][angular-http]       | `HTTPInterceptor`                              | Same idea; phase hooks instead of a single `intercept(req, next)`          |
| Angular DI-provided interceptor                | Rule with `use` resolved from the context      | Interceptors are context citizens, not module providers by default         |
| Express/Koa middleware                         | `RouteHandlerInterceptor` or `HTTPInterceptor` | Middleware chains are a pipeline concern; they do not advise class methods |
| NestJS `@UseInterceptors`                      | Rule registration scoped by `when`             | No per-route decorator array; selection is centralized                     |
| Java `InvocationHandler`                       | `MethodInterceptor`                            | Same shape; `next` is explicit instead of a reflective `Method.invoke`     |

What is deliberately **not** adopted: pointcut languages, introductions
(inter-type declarations), constructor interception, property get/set
interception, and compile-time weaving.

## Where to Go Next

- [Decorators](./decorators.md) — the catalog by concern, the metadata model,
  and custom decorators.
- [Resilience & Retries](../guides/method-interception-and-resilience.md)
  — advice in practice: retry, circuit breaking, and ordering.
- [Telemetry](../guides/telemetry.md) — tracing and metrics as
  advice.
- [ORM & Migrations](../guides/orm-and-migrations.md) —
  `@transactional` and entity declarations.

[aop]: https://en.wikipedia.org/wiki/Aspect-oriented_programming
[angular-http]: https://angular.dev/guide/http/interceptors
[decorator-metadata]: https://github.com/tc39/proposal-decorator-metadata
[spring-aop]: https://docs.spring.io/spring-framework/reference/core/aop.html
[spring-tx]: https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html
