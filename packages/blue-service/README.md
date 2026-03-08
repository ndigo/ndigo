# Blue Service

Blue Service defines service-layer abstractions used by BlueJS applications.

## Features

- Service composition foundations
- Integration patterns with factory/core/http packages
- ESM package scaffold for service-level modules

## Installation

```bash
pnpm add @blue/service
```

## Usage

`@blue/service` currently provides framework-level service packaging and is generally consumed as part of higher-level
BlueJS module wiring.

## Development

```bash
pnpm --filter @blue/service build:lib
pnpm --filter @blue/service test
```
