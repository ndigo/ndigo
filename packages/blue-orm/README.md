# Blue ORM

Blue ORM provides repository and data mapper persistence abstractions for BlueJS.

## Installation

```bash
pnpm add @blue/orm
```

## API Overview

- Decorators: `@entity`, `@column`, `@primaryColumn`, `@generated`
- Interfaces: `DataSource`, `EntityManager`, `Repository`, `UnitOfWork`
- In-memory implementations: `InMemoryDataSource`, `InMemoryEntityManager`, `InMemoryRepository`,
  `InMemoryUnitOfWork`
- Zod schema derivation (AD-7): `schemaForEntity`, `insertSchemaForEntity`,
  `schemaForColumn`, `baseSchemaForType`, `validateEntity`

## Entity-derived validation schemas

Column metadata — including an optional `@column({ schema })` constraint —
derives Zod schemas. `insertSchemaForEntity` yields the *writable* shape
(primary/generated columns omitted; nullable/untyped optional) for request
body validation:

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

Unvalidated create bodies are rejected with a 422 problem document carrying
the structured issues; the same schema family drives Drizzle table + select
schemas via `@blue/orm-drizzle`. Guide:
[`docs/guides/02-request-validation.md`](../../docs/guides/02-request-validation.md).

## Usage

```typescript
import {
    AbstractRepository,
    InMemoryDataSource,
    InMemoryEntityManager,
    entity,
    column,
    generated,
    primaryColumn,
} from '@blue/orm';

@entity('users')
class User {
    @primaryColumn()
    @generated()
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

## Notes

Blue ORM currently includes an in-memory adapter intended for development and testing workflows.
