# @blue/host

Micro frontend orchestration for BlueJS — registers features from any context
and mounts them into a shared shell.

## Overview

`@blue/host` gives the shell one-call feature registration with
dependency-validated mounting:

```
@blue/host
├── HostManager          ← register/mount/unmount features in a shell
└── shell contracts      ← feature descriptors + shared-dependency validation
```

Features are plain BlueJS contexts (or context factories); the shell owns their
lifecycle and exclusive activation. The browser app shell demonstrates the
pattern end to end (`apps/blue-host`).

## Usage

```ts
import { HostManager } from '@blue/host';
import { ApplicationContext } from '@blue/context';

const host = new HostManager();

// Register a feature with its dependencies.
host.registerFeature('catalog', {
    create: () => new ApplicationContext('catalog'),
    dependencies: ['@blue/view'],
});

// Mount and unmount as navigation demands.
host.mount('catalog');
host.unmount('catalog');
```

For lazy feature chunks loaded with dynamic `import()`, see the
`mountLazy` support used by the blue-host demo app.

## Design

- **Exclusive activation** — mounting a feature deactivates the previous one
- **Shared-dependency validation** — features declare what they need from the
  shell, and the shell checks availability before mounting
- **Lifecycle managed** — mount/unmount are symmetric; unmounting destroys the
  feature context

## See Also

- [apps/blue-host](../../apps/blue-host/README.md) — micro frontend host demo
  with three lazy-loaded feature chunks
- [@blue/router](../blue-router/README.md) — feature routing registry used by
  the shell