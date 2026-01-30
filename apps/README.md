# BlueJS Applications

This directory contains applications built with the BlueJS framework.

## Applications

### blue-demo
Demo/test bed application showcasing BlueJS features.
- TodoMVC implementation
- Vite-based development server
- Integration tests for framework packages

## Development

**Run an application:**
```bash
cd apps/blue-demo
pnpm dev
```

**Build an application:**
```bash
cd apps/blue-demo
pnpm build
```

## Configuration

Applications in this directory:
- Extend from `apps/tsconfig.json`
- Are not published to npm (`private: true`)
- Can depend on any `@blue/*` package
- Use bundlers (Vite, webpack, etc.) for deployment

See individual app directories for specific details.
