import type { Store } from "../types/index.js";

export class RAMCache implements Store {
  private cache = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | unknown> {
    return this.cache.get(key);
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    this.cache.set(key, value);
    if (ttlMs) {
      setTimeout(() => this.cache.delete(key), ttlMs);
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}
