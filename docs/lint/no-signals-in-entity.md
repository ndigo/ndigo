---
rule: '@ndigo/no-signals-in-entity'
severity: error
recommended: true
since: 0.0.1
---

# no-signals-in-entity

A source file declares an `@entity` class and imports `@ndigo/signals`.

## What it reports

`signalsInEntity` — reported on the `@ndigo/signals` import:

```ts
import { signal } from '@ndigo/signals';
import { column, entity } from '@ndigo/orm';

@entity('notes')
export class Note {
    @column()
    title = signal('');
}
```

## Why

Entities are **persistence descriptors**. The ORM reads their columns, builds
SQL, and hydrates instances from rows; a signal in a column breaks that
contract, and a hydrated entity would carry reactivity that no consumer asked
for. Reactivity belongs to the view model, component, or service that reads the
entity.

The rule is filename-and-declaration based: it only looks at files under
`src/` that declare an `@entity` class, so a service that happens to import
signals is unaffected.

## How to fix

Keep the entity plain and put the signal in the layer that renders it:

```ts
@entity('notes')
export class Note {
    @column()
    title = '';
}

export class NoteEditor {
    readonly title = signal('');
}
```

## Options

None.

## When to disable

Do not. If an entity field genuinely needs derived state, compute it in a
`get` method on the entity or in the view model — both keep the persisted shape
plain. A suppression here usually means the reactive state is in the wrong
class.
