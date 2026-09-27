# @blue/orm-drizzle

> SQL-backed Drizzle ORM adapter for @blue/orm — production persistence via a libSQL data source with automatic table creation and an async entity manager for CRUD.

Drizzle ORM adapter for `@blue/orm`. Provides a SQL-backed data source and entity manager for production persistence: `DrizzleDataSource` (a libSQL-backed data source with automatic table creation) and `DrizzleEntityManager` (an async entity manager for CRUD operations).

## Installation

```bash
pnpm add @blue/orm-drizzle drizzle-orm @libsql/client
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Getting Started

```typescript
import { DrizzleDataSource, DrizzleEntityManager } from '@blue/orm-drizzle';
import { entity, primaryColumn, column } from '@blue/orm';

@Entity('users')
class User {
    @primaryColumn()
    id: number;

    @column()
    name: string;
}

const ds = new DrizzleDataSource({ url: 'file:./app.db' });
await ds.init([User]);
const em = new DrizzleEntityManager(ds);

await em.persist(new User('Alice'));
const found = await em.find(User, 1);
```

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc/README.md) for
how it fits with the rest of BlueJS.

## Development

```bash
pnpm --filter @blue/orm-drizzle build:lib
pnpm --filter @blue/orm-drizzle test
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
