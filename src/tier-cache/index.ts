import { RAMCache } from "../ramCache.js";
import type { Options, Store } from "../types/index.js";

export class TierCache implements Store {
  public stores: Store[] = [new RAMCache()];

  constructor(private options: Options) {
    if (this.options.stores) {
      this.stores = this.options.stores;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    for (let i = 0; i < this.stores.length; i++) {
      const value = await this.stores[i].get<T>(key);
      if (value !== undefined) {
        await Promise.all(
          this.stores.slice(0, i).map((s) => s.set(key, value)),
        );
        return value as T;
      }
    }
    return undefined;
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    await Promise.all(this.stores.map((s) => s.set(key, value, ttlMs)));
  }

  async delete(key: string): Promise<void> {
    await Promise.all(this.stores.map((s) => s.delete(key)));
  }

  async clear(): Promise<void> {
    await Promise.all(this.stores.map((s) => s.clear()));
  }
}
