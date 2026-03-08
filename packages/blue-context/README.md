# Blue Context

Blue Context provides application context, environment, configuration decorators, and resource/event infrastructure.

## Features

- `ApplicationContext` and `GenericApplicationContext` support
- TC39 decorators for configuration workflows
- Environment and property resolution APIs
- Event emitter support and context-aware mixins
- Resource loading abstractions

## Installation

```bash
pnpm add @blue/context
```

## Usage

```typescript
import { GenericApplicationContext } from '@blue/context';

const context = new GenericApplicationContext('app');
context.setValue('name', 'blue');

context.getValue('name');
```

## Development

```bash
pnpm --filter @blue/context build:lib
pnpm --filter @blue/context test
```
