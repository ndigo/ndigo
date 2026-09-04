# Blue HTTP

Blue HTTP is a robust HTTP client built on the Fetch API, providing advanced interceptor capabilities and RFC-compliant URL parsing.

## Features

- **Interceptor System**: A 5-hook interceptor system (`preInit`, `preRequest`, `postResponse`, `postError`, `postComplete`) allows for granular control over the HTTP request lifecycle.
- **URL Pattern Matching**: `MappedHTTPInterceptor` enables conditional application of interceptors based on URL patterns.
- **Built-in Interceptors**: Includes 8 ready-to-use interceptors for common use cases like `Timeout`, `ContentType`, and `ResponseClass`.
- **Body Transform Pipeline**: Request/response body transforms via `requestTransforms` and `responseTransforms`.
- **RFC-Compliant Parsers**: Sophisticated query and matrix string parsers.
- **Response Status & Header Abstractions**: Provides comprehensive status code and header name constants for type-safe usage.

## Installation

```bash
pnpm install @blue/http
# or
npm install @blue/http
# or
yarn add @blue/http
```

## Usage Patterns

Blue HTTP supports two usage patterns:

### 1. Static Factory Method (Recommended for Direct Use)

Use `HTTP.create()` for standalone HTTP clients or when not using dependency injection:

```typescript
import { HTTP } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: {
        Authorization: 'Bearer your-token',
        'Content-Type': 'application/json',
    },
    params: {
        api_version: 'v2',
    },
});

// All requests inherit the configuration
await api.get('/users');
await api.post('/data', { body: JSON.stringify(data) });
```

### 2. Constructor (For Dependency Injection)

Use the constructor when working with BlueJS's ApplicationContext or other DI containers:

```typescript
import { AsHTTPStrategy } from '@blue/dispatcher';

class MyApplication extends AsHTTPStrategy(StrategyInitializer) {
    getHTTP(fetch?: Fetch): HTTP {
        // Framework manages interceptors and settings via DI
        return new HTTP(this.httpInterceptors, this.httpSettings, fetch);
    }
}
```

The constructor's signature (`interceptors`, `init`, `fetch`) is optimized for scenarios where these three concerns are managed separately by a DI container.

**When to use which:**

- ✅ Use `HTTP.create()` for: tests, scripts, standalone clients, multi-instance patterns
- ✅ Use constructor for: ApplicationContext, AsHTTPStrategy, custom DI containers

## Usage

### Basic Requests

```typescript
import { HTTP } from '@blue/http';

const http = HTTP.create();

async function fetchData() {
    try {
        const response = await http.get('https://api.example.com/data');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Request failed:', error);
    }
}

fetchData();
```

### Base URL Configuration

Set a base URL to resolve relative URLs:

```typescript
import { HTTP } from '@blue/http';

const api = HTTP.create({
    baseURL: 'https://api.github.com/',
});

async function fetchGithubData() {
    const usersResponse = await api.get('users'); // Resolves to https://api.github.com/users
    const reposResponse = await api.get('repos'); // Resolves to https://api.github.com/repos

    console.log(await usersResponse.json());
    console.log(await reposResponse.json());
}

fetchGithubData();
```

**Important**: When using `baseURL` for paths that include segments, ensure the `baseURL` ends with a trailing slash. The native `URL` constructor behavior will treat the last segment as a file if the `baseURL` does not end with a slash.

- ✅ `baseURL: 'https://api.github.com/v3/'` + `input: 'users'` → `https://api.github.com/v3/users`
- ❌ `baseURL: 'https://api.github.com/v3'` + `input: 'users'` → `https://api.github.com/users` (loses `/v3`)

Absolute URLs provided in the `input` parameter will ignore the configured `baseURL`:

```typescript
import { HTTP } from '@blue/http';

const api = HTTP.create({ baseURL: 'https://api.github.com/' });

async function fetchOtherDomain() {
    const response = await api.get('https://other.com/data'); // Ignores baseURL
    console.log(response.url); // https://other.com/data
}

fetchOtherDomain();
```

You can also override the `baseURL` for individual requests:

```typescript
import { HTTP } from '@blue/http';

const api = HTTP.create({ baseURL: 'https://api.github.com/' });

async function fetchWithOverride() {
    const response = await api.get('search', {
        baseURL: 'https://search.github.com/',
    });
    console.log(response.url); // https://search.github.com/search
}

fetchWithOverride();
```

## Interceptors

Blue HTTP's core strength is its powerful interceptor system. You can register custom interceptors to inject logic at various points in the request lifecycle.

```typescript
import { HTTP, HTTPInterceptor, HTTPInit } from '@blue/http';

class LoggerInterceptor implements HTTPInterceptor {
    preRequest(request: Request): Request | void {
        console.log(`[Request] ${request.method} ${request.url}`);
        return request;
    }

    postResponse(response: Response): void {
        console.log(`[Response] ${response.status} ${response.url}`);
    }

    postError(error: Error): Promise<Response | undefined> {
        console.error(`[Error] ${error.message}`);
        // Optionally, rethrow, retry, or return a new Response
        throw error;
    }
}

const http = HTTP.create({
    interceptors: [new LoggerInterceptor()],
});

// ... make requests, logs will appear ...
```

### Body Transformations

Blue HTTP supports composable request/response body transformations.

```typescript
import { HTTP } from '@blue/http';

const http = HTTP.create({
    requestTransforms: [(body) => ({ ...body, requestId: crypto.randomUUID() })],
    responseTransforms: [(body) => ({ ...body, parsed: true })],
});
```

You can also use specialized transformers from the subpath export:

```typescript
import {
    JSONTransformer,
    CompositionTransformer,
    FormDataTransformer,
    URLSearchParamsTransformer,
} from '@blue/http/transformers';
```

## API

### `HTTP.create(config?: HTTPConfig)`

Creates a new HTTP client instance using the static factory method (recommended for direct use).

- `config`: Configuration options for the HTTP client
    - `baseURL`: Base URL for resolving relative URLs
    - `headers`: Default headers to include in all requests
    - `params`: Default query parameters to include in all requests
    - `interceptors`: Optional HTTP interceptors
    - `requestTransforms`: Optional request body transforms
    - `responseTransforms`: Optional response body transforms
    - `fetch`: Optional custom fetch implementation (defaults to `globalThis.fetch`)

**Example:**

```typescript
const api = HTTP.create({
    baseURL: 'https://api.example.com/',
    headers: { Authorization: 'Bearer token' },
    params: { version: 'v2' },
    interceptors: [new TimeoutInterceptor(5000)],
});
```

### `new HTTP(interceptors?: HTTPInterceptor[], init?: HTTPInit, fetch?: Fetch)`

Creates a new HTTP client instance using the constructor (for dependency injection scenarios).

- `interceptors`: An array of `HTTPInterceptor` instances to apply to requests.
- `init`: An `HTTPInit` object for default request configuration, including `baseURL`.
- `fetch`: A custom `fetch` implementation to use (defaults to `globalThis.fetch`).

**Note:** For direct instantiation, prefer using `HTTP.create()` for a cleaner API.

### `HTTPConfig`

Configuration options for `HTTP.create()`:

```typescript
export interface HTTPConfig extends HTTPInit {
    interceptors?: HTTPInterceptor[];
    requestTransforms?: Transform[];
    responseTransforms?: Transform[];
    fetch?: Fetch;
}
```

### `HTTPInit`

Extends `RequestInit` with additional properties:

```typescript
export type HTTPInit = RequestInit & {
    method?: HTTPMethod;
    baseURL?: string;
    headers?: HeadersInit;
    params?: URLSearchParams | string[][] | Record<string, string> | string;
};
```

- `method`: The HTTP request method (e.g., `'GET'`, `'POST'`).
- `baseURL`: The base URL for resolving relative URLs (see "Base URL Configuration" above).
- `headers`: Default headers to include in all requests.
- `params`: Default query parameters to include in all requests.

### `HTTPInterceptor`

An interface defining hooks for the request lifecycle:

- `preInit(url: URL, settings: HTTPInit): boolean`
- `preRequest(request: Request, http: HTTP): Promise<Request | void>`
- `postResponse(response: Response, settings: HTTPInit): Promise<Response | void>`
- `postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>`
- `postComplete(request: Request, response: Response | ResponseError): void`

### Methods

All standard HTTP methods (`get`, `post`, `put`, `delete`, `patch`, `head`, `options`, `trace`, `connect`) are available as convenience methods:

```typescript
http.get(url: string, init?: HTTPInit): Promise<Response>
http.post(url: string, init?: HTTPInit): Promise<Response>
// ... and so on
```

These methods call the core `request` method with the appropriate HTTP method set.

### Core `request` method

```typescript
http.request(input: string, init?: HTTPInit): Promise<Response>
```

The central method for making HTTP requests. It applies interceptors and handles URL resolution.

---

## Contributing

See our [Contribution Guidelines](/CONTRIBUTING.md) for more information.

---

## License

ISC License
