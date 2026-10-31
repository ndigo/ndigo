# Blue ORM

> Repository and data mapper persistence abstractions for BlueJS — entities, columns, and Zod schema derivation backed by in-memory or SQL adapters.

Blue ORM provides repository and data mapper persistence abstractions for BlueJS. Entities map through `@entity`, `@column`, `@primaryColumn`, and `@generatedColumn` to a `DataSource`/`EntityManager`/`Repository`/`UnitOfWork` object graph, backed by in-memory implementations (`InMemoryDataSource`, `InMemoryEntityManager`, `InMemoryRepository`, `InMemoryUnitOfWork`) intended for development and testing workflows.

## Installation

```bash
pnpm add @blue/orm
```

Prerequisites for every BlueJS package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```typescript
import {
    AbstractRepository,
    InMemoryDataSource,
    InMemoryEntityManager,
    entity,
    column,
    generatedColumn,
    primaryColumn,
} from '@blue/orm';

@entity('users')
class User {
    @primaryColumn()
    @generatedColumn()
    id?: number;

    @column()
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class UserRepository extends AbstractRepository<User, number> {
    constructor(entityManager: InMemoryEntityManager) {
        super(User, entityManager);
    }
}

const dataSource = new InMemoryDataSource();
dataSource.init();

const entityManager = new InMemoryEntityManager(dataSource);
const users = new UserRepository(entityManager);

const user = users.save(new User('Ada Lovelace'));
const loaded = users.findById(user.id as number);
```

## Usage

Column metadata — including an optional `@column({ schema })` constraint — derives Zod schemas. `insertSchemaForEntity` yields the _writable_ shape (primary/generated columns omitted; nullable/untyped optional) for request body validation:

```typescript
import { entity, column } from '@blue/orm';
import { z } from 'zod';

@entity('notes')
export class Note {
    @column({ type: 'varchar', schema: z.string().min(1) })
    title!: string;
}
```

```typescript
import { insertSchemaForEntity } from '@blue/orm';
import { validatedBody } from '@blue/dispatcher';

// @parameters({ data: validatedBody(insertSchemaForEntity(Note)) })
```

Unvalidated create bodies are rejected with a 422 problem document carrying the structured issues; the same schema family drives Drizzle table + select schemas via `@blue/orm-drizzle`. Guide: [`docs/guides/02-request-validation.md`](../../docs/guides/02-request-validation.md).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../api/README.md) for
how it fits with the rest of BlueJS.

### Asynchronous repository consumers

`AsyncRepository<T, ID>` exposes Promise-based save, lookup, relation loading,
pagination, deletion, count, and existence operations. Missing entities resolve
to `undefined`; operation errors reject.

Use `toAsyncRepository(repository)` to consume a synchronous in-memory repository
through this contract. The adapter preserves the repository receiver and turns
synchronous exceptions into rejected promises. There is no async-to-sync adapter.
`DrizzleRepository` implements the same contract directly, without changing SQL
ordering or relation-loading semantics.

## Development

```bash
pnpm --filter @blue/orm build:lib
pnpm --filter @blue/orm test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
