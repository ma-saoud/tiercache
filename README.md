# tiercache

A small, multi-tier cache for TypeScript/Node.js. Chain several cache stores (e.g. in-memory → Redis → disk) behind one async API: reads go through the tiers from fastest to slowest, and a hit in a lower tier is copied back into the faster tiers above it.

## How it works

- **`get(key)`** checks each store in order. On the first hit, the value is written back to every store before it, then returned. If no store has the key, it returns `undefined`.
- **`set(key, value, ttlMs?)`** writes to all stores in parallel, with an optional TTL in milliseconds.
- **`delete(key)`** removes the key from all stores.
- **`clear()`** empties all stores.

With no stores configured, `TierCache` uses a single in-memory store (`RAMCache`).

## Usage

```ts
import { TierCache } from "./src/index.js";

const cache = new TierCache({});

await cache.set("user:1", { name: "Ada" }, 60_000); // expires after 60s
const user = await cache.get<{ name: string }>("user:1");

await cache.delete("user:1");
await cache.clear();
```

### Multiple tiers

Pass stores in order from fastest to slowest:

```ts
const cache = new TierCache({
  stores: [new RAMCache(), myRedisStore, myDiskStore],
});
```

## Custom stores

Any object implementing the `Store` interface can be used as a tier:

```ts
interface Store {
  get<T>(key: string): Promise<T | unknown>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

A store must return `undefined` for a missing key; any other value (including `null`) counts as a hit.

## Options

| Option   | Type      | Description                                         |
| -------- | --------- | --------------------------------------------------- |
| `stores` | `Store[]` | Cache tiers, fastest first. Defaults to `[new RAMCache()]`. |
| `ttl`    | `number`  | Reserved for a default TTL; not used yet.           |

## Development

```sh
pnpm install
pnpm dev      # run src/main.ts in watch mode
pnpm build    # compile with tsc
pnpm test     # run tests with vitest
pnpm check    # format and lint with biome
```
