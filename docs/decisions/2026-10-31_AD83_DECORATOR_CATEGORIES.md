# AD-83: Decorator categories and their naming conventions

**Date:** 2026-10-31
**Status:** Accepted
**Deciders:** Framework owner (pre-1.0 API-freeze consistency review —
issue #8; the review was parked by AD-20 D8 and anchored to the behavior
family by AD-24 D1)

---

## Context

AD-20 D8 parked one deliberate naming review of the participatory decorator
family before the 1.0 freeze. By the time the review ran, the repository had
grown to ~45 decorators across configuration, conditions, HTTP mapping, ORM,
signals, resilience, jobs, and tooling — and a single global convention had
never described the practice: the `@when*` conditions and the `@*Mapping`
registrations each already ran their own form, deliberately.

The review therefore classified **every** decorator by the role its name
describes — what the annotated element _is_, _participates in_, is _active
when_, _registers_, _runs at_, _denotes_, or is _governed by_ — and fixed the
form per category. New decorators pick a category first; the form follows.

The review also surfaced a genuine adjacency: **`@profile`** (ndigo-context,
January 2026 — config registration, class + method) and **`@whenProfile`**
(ndigo-core, September 2026 — boot-time class registration) were one concept
wearing two costumes, evaluating the same predicate
(`environment.acceptsProfiles`) over the same grammar. The reference framework lived exactly
this arc: `@Profile` shipped standalone in 3.1 (2011), then was rewritten as
`@Conditional(ProfileCondition.class)` in 4.0 (2013) with its target expanded
to methods; Boot later added the `@ConditionalOn*` family without adding a
second profile annotation. ndigo was reproducing the pre-4.0 window; this
ADR takes the converged architecture.

## Decision

### D1 — Role-keyed taxonomy; the category fixes the form

Every decorator belongs to exactly one naming category (a decorator may belie
its category's mechanism — metadata vs wrapper is a documentation fact, not a
naming axis). The category determines the name's grammatical form:

| #   | Category                    | What the name describes               | Form                                        | Members                                                                                                                                                                                                                                                                          |
| :-- | :-------------------------- | :------------------------------------ | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Stereotypes**             | What the unit _is_                    | noun                                        | `@service`, `@entity`, `@configuration`, `@configurationProperties`, `@jobHandler`, `@scope`, `@entry`, `@environment`, `@propertySource`, `@sharedDependency`                                                                                                                   |
| 2   | **Participatory behaviors** | What it _participates in_             | past participle / adjective                 | `@scheduled`, `@authenticated`, `@authorized`, `@transactional`, `@cached`, `@traced`, `@counted`                                                                                                                                                                                |
| 3   | **Conditions**              | _When_ it is active                   | `@when*`                                    | `@whenFeature`, `@whenProperty`, `@whenProfile`, `@whenNode`, `@whenBrowser`, `@whenMissingEntry`                                                                                                                                                                                |
| 4   | **Registrations**           | What it _registers_                   | `<qualifier>Mapping`                        | `@routeMapping`, `@socketMapping`, `@stompMapping`, `@getMapping`, `@postMapping`, `@putMapping`, `@deleteMapping`, `@patchMapping`, `@queryMapping`                                                                                                                             |
| 5   | **Lifecycle hooks**         | _When_ in a lifecycle it runs         | `@pre*` / `@post*` + event                  | `@prePersist`, `@preUpdate`, `@postLoad`, `@postRemove`                                                                                                                                                                                                                          |
| 6   | **Member descriptors**      | What a member _denotes_               | established term of art (noun or adjective) | ORM: `@column`, `@primaryColumn`, `@generatedColumn`, `@oneToMany`, `@manyToOne`, `@manyToMany`, `@oneToOne`; config fields: `@property`, `@defaultValue`, `@nestedConfig`; signals: `@signal`, `@computed`, `@effect`, `@reactive`; proxy: `@annotationOf`, `@methodAnnotation` |
| 7   | **Policies**                | _How_ behavior is governed            | noun = the policy name                      | `@retry`, `@circuitBreaker`, `@rateLimit`                                                                                                                                                                                                                                        |
| 8   | **Annotations**             | What a declaration _binds_ or exposes | noun                                        | `@parameters` (argument binding), `@apiDocs` (tooling)                                                                                                                                                                                                                           |

**Admission procedure** (also condensed into STYLE_GUIDE §3.17):

1. Determine the category from the annotated element's role — not from the
   mechanism. "When" phrasing → condition; "registers a …" → registration;
   a noun for what something _is_ → stereotype; a verb root + `-ed` for what
   it participates in → behavior.
2. Take the category's form. Do not invent a new morphology for a single
   decorator.
3. If a decorator genuinely straddles categories, prefer the one matching the
   annotated element's role, and record the deviation in this ADR's exception
   list (with rationale) rather than bending the category.

### D2 — Renames applied (pre-1.0, no aliases)

- **`@generated` → `@generatedColumn`** (`@ndigo/orm`). Reclassified: it is a
  member descriptor, not a behavior — its siblings are the noun descriptors
  `@column`/`@primaryColumn`, and bare "generated" collides with the
  repository's heavy code-generation vocabulary ("generated trees", the doc
  pipeline). The pair reads exactly as it behaves:
  `@primaryColumn() @generatedColumn() id!: number`. The internal metadata key
  moved with it (`orm:generated` → `orm:generatedColumn`,
  `generatedColumnMetadataKey` — `src/_constants.ts`, zero external readers).
- **`@shared` → `@sharedDependency`** (`@ndigo/core`). AD-62's own vocabulary
  is "shell-managed shared dependency"; the stereotype-noun form now matches
  the contract's name. Metadata helpers keep the concept noun
  (`isShared`, `getSharedOptions`, `SharedOptions`, `SHARED_KEY`).
- **`@nested` → `@nestedConfig`** (`@ndigo/context`). Joins the config-field
  descriptor family (`@property`, `@defaultValue`, `@propertySource`) as a
  noun phrase; bare "nested" read as a mood rather than a member property.
  The metadata namespace (`config:nested[:<field>]`, `NESTED_KEY`) is
  unchanged.

### D3 — Rejections recorded (the "rejected with rationale" arm of AD-20 D8)

- **Signal family** (`@signal`, `@computed`, `@effect`, `@reactive`) — keeps
  its names. It _is_ the ecosystem vocabulary (Vue/Solid/Preact); member
  descriptors explicitly admit terms of art, and any conforming substitute
  would desynchronize from what users know.
- **Policies** (`@retry`, `@circuitBreaker`, `@rateLimit`) — keep their
  names. Participial forms would misdescribe semantics ("retried" names a
  past outcome; the decorator declares "on failure, retry"), and the names
  are the ecosystem's policy vocabulary (retry libraries, Resilience4j). The
  policy category legitimately takes noun forms; this supersedes any
  `@rateLimited`-style musing from the review discussion.
- **The six reviewed as one set** (issue #8): `@scheduled`, `@authenticated`,
  `@authorized`, `@transactional`, `@cached` conform to the
  participatory-behavior form; `@traced`/`@counted` are recognized as the
  same family (they already conform). `@generated` was the lone norm-breaker
  and is renamed in D2.

### D4 — Profile unification: `@whenProfile` is the single profile gate

- **Capabilities added to `@whenProfile`** (`packages/ndigo-core/src/conditional.ts`):
    - Method-level form — accepted on entry methods, writing
      `boot:whenProfile:<methodName>` (the shape the config gate already
      handled for `@profile`).
    - `string | ProfileTerm` arguments (AD-34 D5 builder ergonomics).
    - Variadic **either-of**, folded at decoration time into **one canonical
      expression** via `Profile.or(...)`; single expressions are validated and
      stored trimmed. The old per-entry OR loop is deleted — every reader
      evaluates exactly one expression.
- **Deleted**: `@profile`, the `config:profile` metadata family
  (`CONFIG_PROFILE`), its readers, and `ConfigurationProcessor._isActiveProfile`.
  No shims (pre-1.0).
- **Re-homed**: `profile-expression.ts` (grammar) and `profile.ts`
  (`Profile`/`ProfileTerm` builder) moved `@ndigo/context` → `@ndigo/core`.
  The dependency graph forces this: the decorator lives in core, core cannot
  depend on context, and both the decorator and `environment.acceptsProfiles`
  consume the same grammar. Profile concepts now live with the condition
  family; context consumes them.
- **Latent bug fixed**: class-level gating was a no-op in the old
  implementation — the `getInstanceMetadata(target) || getMetadata(target)`
  composition returned `{}` for class targets (always truthy), so the
  class-level branch never read metadata (verified empirically during the
  review). The unified reader `getProfileCondition(target, methodName?)`
  gates classes and entry methods correctly, and boot's `isActive` gates
  class registration as before.
- **Scope boundary**: method-level gating is _not_ generalized to the other
  `@when*` conditions — that would be a capability change per condition, not
  a naming/convergence fix.

Migration (mechanical, applied across the tree): `@profile('x')` →
`@whenProfile('x')`; `@profile('a', 'b')` → `@whenProfile('a', 'b')` (or
`'a | b'`); `@profile(Profile.and(…))` → `@whenProfile(Profile.and(…))`.
Comma-separated strings (`'dev,test'`) are rejected at decoration time — use
`'dev | test'` or the variadic form.

### D5 — Deliberate divergences (recorded so they are not re-litigated)

- **No expression language** — authorization and conditions never use a
  SpEL-style evaluator; profile expressions are a small fixed grammar,
  parsed, never eval'd (P0 D8). That ceiling is by design.
- **Interface-first lifecycle** — `SmartLifecycle` and the aware-interface
  family remain the supported lifecycle path. Annotation-based lifecycle
  hooks (the `@PostConstruct`/`@PreDestroy` lifecycle arc) are a possible future
  _addition_ beside it — a feature conversation, not a naming oversight.
- **Field binding for `@configurationProperties`** — constructor binding
  maps poorly to TC39 decorators (constructor parameters cannot be
  decorated); the field-decorator mode is the supported form and the
  divergence is intentional.

### D6 — Documentation home

STYLE_GUIDE §3.17 ("Decorator Categories & Naming") carries the condensed
taxonomy table and the admission procedure for daily use; this ADR is the
durable record. AGENTS.md points at §3.17 from the pre-coding checklist.

## Consequences

- All three renames merged pre-1.0 without aliases; API trees regenerated;
  guides, package READMEs, and the environment reference updated.
- `@whenProfile` is the model profile gate everywhere (config entries and
  class registration); `@profile` no longer exists.
- The taxonomy + exception list is the review criterion for every future
  decorator; deviations must land here.
- Cross-links: AD-14 (profile expressions), AD-15 D3 (nested binding),
  AD-20 D8 (review parked → closed), AD-24 D1 (behavior-family anchor),
  AD-34 D5 (`Profile` builder), AD-62 (shared-dependency contract),
  AD-82 (`@when*` family, `@whenFeature`).

## References

- Issue #8 — "deliberate naming review of the participatory decorator family"
  (closed by the implementing PR).
- `ARCHITECTURE.md` roadmap — API-freeze consistency review (completed).
- A 3.1→4.0 `@Profile` → `@Conditional(ProfileCondition)` arc
  and the `@ConditionalOn*` family (industry precedent for the
  profile unification).
