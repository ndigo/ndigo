---
name: blue-demo
description: Blue demo app patterns including shell composition, routing, context tokens, and multi-view-engine architecture.
---

# Blue Demo

Use this skill when working with the `apps/blue-demo/` application.

## Architecture Overview

The demo app is a single-page application that demonstrates three features:

- **Todo** – WebComponent-based view (`WebComponentView`)
- **Account** – WebComponent-based view (`WebComponentView`)
- **Notes** – Wicket-based view (`WicketView`)

Both view engines coexist because `BrowserDispatcher.render()` calls `view.render(model, route, viewTarget)` directly — it doesn't go through `ViewEngine.render()`.

## Key Files

| File                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `src/index.ts`             | Entry point, bootstraps app                  |
| `src/todo-context.ts`      | `@configuration` class registering all beans |
| `src/context-tokens.ts`    | `ContextToken` definitions                   |
| `src/shell-composition.ts` | Shell context, routing, feature mounts       |
| `src/todo-app-view.ts`     | Todo feature WebComponent view               |
| `src/account-app-view.ts`  | Account feature WebComponent view            |
| `src/notes-controller.ts`  | Notes controller returning WicketView        |
| `src/notes-service.ts`     | In-memory CRUD for notes                     |
| `src/notes-page.ts`        | Wicket Page for notes                        |
| `src/notes-list-panel.ts`  | Panel with ListView for note list            |
| `src/notes-form-panel.ts`  | Panel with Form for creating notes           |

## Shell Composition Pattern

```typescript
// Route prefixes
export const TODO_ROUTE_PREFIX = '/todo';
export const ACCOUNT_ROUTE_PREFIX = '/account';
export const NOTES_ROUTE_PREFIX = '/notes';

// Route helpers
export const toTodoShellRoute = (featureRoute: string): string =>
    restorePartitionPrefix(featureRoute, TODO_ROUTE_PREFIX);
```

Each feature registers with `featureMountManager` and `featureRoutingRegistry`.

## Context Token Pattern

```typescript
export const NOTES_SERVICE = new ContextToken<NotesService>('NOTES_SERVICE');
```

## Configuration Registration

In `todo-context.ts`, use `@configuration` and `@entry`:

```typescript
@entry({ token: NOTES_SERVICE, value: () => new NotesService() })
```

## Adding a New Feature

1. Create service + controller + view files in `src/`
2. Add `ContextToken` to `context-tokens.ts`
3. Register in `todo-context.ts` via `@entry` decorators
4. Add route prefix + helpers to `shell-composition.ts`
5. Register feature mount + routing in `composeTodoRuntime()`
6. Add nav links to existing app views

## Vite Config

The demo uses Vite with esbuild TC39 decorator support:

```typescript
esbuild: {
    target: 'es2022',
    tsconfigRaw: {
        compilerOptions: {
            target: 'ES2022',
            experimentalDecorators: false,
        },
    },
},
```

## Testing

- Service tests: Direct unit tests (`notes-service.spec.ts`)
- Controller tests: Test `handleRequest()` output with mocked dependencies
- Run: `pnpm vitest run apps/blue-demo/test/`
