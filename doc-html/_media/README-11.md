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
