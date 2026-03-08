# Blue Context

Blue Context provides application context, environment, configuration decorators, and resource/event infrastructure.

## Features

- `ApplicationContext` and `GenericApplicationContext` support
- TC39 decorators for configuration workflows
- Environment and property resolution APIs
- Event emitter support and context-aware mixins
- Content source integration with parent-context fallback
- Resource loading abstractions

## Installation

```bash
pnpm add @blue/context
```

## Usage

```typescript
import { GenericApplicationContext } from '@blue/context';
import { StaticContentSource } from '@blue/content';

const context = new GenericApplicationContext('app');
context.setValue('name', 'blue');
context.setContentSource(
    new StaticContentSource({
        greeting: {
            en: 'Hello',
        },
    })
);

context.getValue('name');
context.getContent('greeting', 'en');
```

## Development

```bash
pnpm --filter @blue/context build:lib
pnpm --filter @blue/context test
```
