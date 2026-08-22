# @blue/orm-drizzle

Drizzle ORM adapter for @blue/orm. Provides a SQL-backed data source and entity manager for production persistence.

## Installation

```bash
pnpm add @blue/orm-drizzle drizzle-orm @libsql/client
```

## Usage

```typescript
import { DrizzleDataSource, DrizzleEntityManager } from '@blue/orm-drizzle';
import { entity, primaryColumn, column } from '@blue/orm';

@entity('users')
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

## Exports

- `DrizzleDataSource` — libSQL-backed data source with automatic table creation
- `DrizzleEntityManager` — async entity manager for CRUD operations