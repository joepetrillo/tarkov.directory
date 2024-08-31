import { Elysia } from "elysia";

class CacheService {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
  }

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    return item as T | undefined;
  }

  set<T>(key: string, value: T): T {
    this.cache.set(key, value);
    return value;
  }

  del(key: string): number {
    return this.cache.delete(key) ? 1 : 0;
  }

  flush(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();

export const dataCachePlugin = new Elysia({ name: "dataCachePlugin" }).decorate(
  "cache",
  cacheService
);
