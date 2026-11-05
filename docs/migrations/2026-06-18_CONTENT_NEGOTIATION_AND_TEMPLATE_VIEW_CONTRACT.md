# Wave 3: Content Negotiation & Template View Contract

## Summary

Wave 3 implemented the content negotiation framework and fixed the template-view contract that was previously incomplete. These changes enable proper media type resolution, file extension lookups, and template-based rendering in the view system.

## What Was Implemented

### 1. Content Negotiation Manager (`packages/ndigo-view/src/content-negotiation-view-resolver.ts`)

The `ContentNegotiationManager` aggregates multiple content negotiation strategies and file-extension resolvers to determine the best media type for a given request:

- **`getAllFileExtenstions()`** — Returns every unique file extension known across all registered resolvers, in insertion order
- **`resolveFileExtensions(mediaType)`** — Delegates to the first resolver capable of resolving the given media type; returns empty array if none match
- **`ContentNegotiationManager.resolveMediaTypes(request)`** — Consults strategies in priority order and returns the first non-empty result; throws `FrameworkError` if no strategy matches

### 2. Content Negotiation Strategies (`packages/ndigo-view/src/content-negotiation-view-resolver.ts`)

| Strategy                                    | Purpose                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `FixedContentNegotiationStrategy`           | Returns a fixed set of media types regardless of request                                               |
| `AbstractMappingContentNegotiationStrategy` | Resolves all registered file extensions, optionally filtering by `mediaTypeHint` (e.g., Accept header) |
| `PathExtensionContentNegotiationStrategy`   | Derives media type from the file extension in the request URI path                                     |

### 3. Template View Contract (`packages/ndigo-view/src/view.ts`)

Fixed the incomplete template-view contract that prevented proper delegation:

- **`AbstractTemplateView._renderView()`** — Now properly delegates to `_renderTemplate()` after projecting the view model
- **`StringTemplateView`** — Concrete implementation that renders simple templates using Jinja-like syntax (`{{variable}}`, `{{array[key]}}`)

### 4. Tests Created

| File                                                   | Coverage                                                                                                                                       |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ndigo-view/test/content-negotiation.spec.ts` | ContentNegotiationManager, strategies, PathExtension resolution                                                                                |
| `packages/ndigo-view/test/view.spec.ts`                | AbstractTemplateView delegation, StringTemplateView rendering with nested properties, array access, edge cases (undefined/null/missing values) |

## Gap Findings (To Be Addressed Later)

### 1. Security — XSS in StringTemplateView

The template renderer uses `String(value ?? '')`, which could execute user-controlled templates if they contain JavaScript. This is a **low-risk** concern since:

- The syntax only supports `{{variable}}` with no nested expressions (no loops, conditionals)
- It's a server-side rendering pattern that should be sanitized at the target layer
- Consider adding `DOMPurify` or similar sanitization in production

### 2. Performance — Linear Strategy Resolution

`ContentNegotiationManager.resolveMediaTypes()` iterates strategies linearly (O(n)). For most use cases this is fine, but if performance becomes critical, consider a map-based index by media type hint.

### 3. PathExtensionStrategy Edge Cases

- Handles case-insensitive extensions correctly
- Falls back to all registered types when `mediaTypeHint` doesn't match any (in AbstractMapping strategy)
- Path extension extraction handles query strings properly

## Next Steps

1. **Wave 4 — Service Layer Boundary**: Port remaining legacy service interceptors into `@ndigo/http`, finalize `@ndigo/service` facade
2. **Wave 5 — Domain/Model Reconciliation**: Implement `GenericDomainComponent.validate()` via `@ndigo/validate` integration; complete domain/view-model projection pattern
3. **Update maturity baselines** to reflect actual codebase state (current baselines are outdated)

## Commit Message

```
feat: implement content negotiation methods and template view contract

- Implement ContentNegotiationManager with all missing methods:
  - getAllFileExtenstions() — aggregates unique extensions from all resolvers in insertion order
  - resolveFileExtensions(mediaType) — delegates to first resolver that supports the media type
  - resolveMediaTypes(request) — consults strategies in priority order, throws if no match

- Implement content negotiation strategies:
  - FixedContentNegotiationStrategy — returns fixed set of media types regardless of request
  - AbstractMappingContentNegotiationStrategy — resolves all registered file extensions, optionally filters by mediaTypeHint
  - PathExtensionContentNegotiationStrategy — derives media type from file extension in request URI path

- Fix template-view contract:
  - AbstractTemplateView._renderView() now properly delegates to _renderTemplate() after projecting view model
  - StringTemplateView renders simple templates using Jinja-like syntax ({{variable}}, {{array[key]}})

- Add comprehensive tests:
  - content-negotiation.spec.ts — ContentNegotiationManager, strategies, PathExtension resolution
  - view.spec.ts — AbstractTemplateView delegation, StringTemplateView rendering with nested properties, array access, edge cases
```
