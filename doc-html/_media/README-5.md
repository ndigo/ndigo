# BlueJS Dispatcher

The BlueJS Dispatcher is a core component that handles routing, handler execution, and error resolution for web applications built with the BlueJS framework.

## Features

- Route mapping and handling
- Handler adapter support for different controller types
- Error resolution with customizable resolvers
- Interceptor support for pre/post processing
- View resolution and rendering

## Package Structure

```
src/
├── dispatcher.ts                 # Main dispatcher implementation
├── error.ts                      # Custom error types
├── route-condition.ts            # Route condition handling
├── route-error-resolver.ts       # Error resolution logic
├── route-handler-adapter.ts      # Handler adapter implementations
├── route-handler-execution-chain.ts  # Execution chain management
├── route-handler-interceptor.ts  # Interceptor support
├── route-handler-method.ts       # Handler method abstraction
├── route-mapping-info.ts         # Route mapping information
├── route-parameter.ts            # Parameter handling
└── strategies/                   # Strategy implementations
```

## Building

```bash
pnpm build
```

## Testing

```bash
pnpm test
```
