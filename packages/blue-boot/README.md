# Blue Boot

Blue Boot provides application startup primitives for BlueJS.

## Features

- Application lifecycle bootstrap helpers
- Strong integration with `@blue/context`
- Router wiring support via `@blue/router`
- ESM-first package for Nx/pnpm monorepo workflows

## Installation

```bash
pnpm add @blue/boot
```

## Usage

`@blue/boot` currently acts as a framework-level package. It is typically consumed by BlueJS application setup code rather
than imported directly by leaf business modules.

## Development

```bash
pnpm --filter @blue/boot build:lib
pnpm --filter @blue/boot test
```
