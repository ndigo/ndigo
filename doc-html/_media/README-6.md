# Blue Domain

Blue Domain contains domain-centric component abstractions for BlueJS applications.

## Features

- Domain component base contracts
- Generic domain component implementation
- Domain-focused error types
- Component-and-view integration helpers
- Interoperability with context/dispatcher/model packages

## Installation

```bash
pnpm add @blue/domain
```

## Usage

```typescript
import { GenericDomainComponent } from '@blue/domain';

class UserComponent extends GenericDomainComponent {
    constructor() {
        super();
        this.init('user');
    }
}

new UserComponent();
```

## Development

```bash
pnpm --filter @blue/domain build:lib
pnpm --filter @blue/domain test
```
