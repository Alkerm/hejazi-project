import Redis from 'ioredis';
import { env } from './env';

type ScanResult = [string, string[]];

interface CacheStore {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<'OK'>;
  expire(key: string, seconds: number): Promise<0 | 1>;
  del(...keys: string[]): Promise<number>;
  scan(cursor: string, ...args: Array<string | number>): Promise<ScanResult>;
  quit(): Promise<'OK'>;
}

class InMemoryStore implements CacheStore {
  private readonly state = new Map<string, { value: string; expiresAt: number | null }>();

  private static globToRegex(glob: string): RegExp {
    const escaped = glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`);
  }

  private cleanup(key: string) {
    const item = this.state.get(key);
    if (!item) return;
    if (item.expiresAt !== null && item.expiresAt <= Date.now()) {
      this.state.delete(key);
    }
  }

  async get(key: string): Promise<string | null> {
    this.cleanup(key);
    return this.state.get(key)?.value ?? null;
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.state.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
    return 'OK';
  }

  async expire(key: string, seconds: number): Promise<0 | 1> {
    this.cleanup(key);
    const item = this.state.get(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    this.state.set(key, item);
    return 1;
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;
    keys.forEach((key) => {
      if (this.state.delete(key)) removed += 1;
    });
    return removed;
  }

  async scan(cursor: string, ...args: Array<string | number>): Promise<ScanResult> {
    let pattern = '*';
    let count = 10;

    for (let i = 0; i < args.length; i += 1) {
      const token = String(args[i]).toUpperCase();
      if (token === 'MATCH') pattern = String(args[i + 1] ?? '*');
      if (token === 'COUNT') count = Number(args[i + 1] ?? 10);
    }

    const regex = InMemoryStore.globToRegex(pattern);
    const keys = Array.from(this.state.keys()).filter((key) => {
      this.cleanup(key);
      return this.state.has(key) && regex.test(key);
    });

    const start = Number(cursor) || 0;
    const chunk = keys.slice(start, start + count);
    const next = start + count >= keys.length ? '0' : String(start + count);
    return [next, chunk];
  }

  async quit(): Promise<'OK'> {
    return 'OK';
  }
}

const createRedisStore = () => {
  const client = new Redis(env.REDIS_URL!, {
    maxRetriesPerRequest: 2,
    lazyConnect: false,
    enableReadyCheck: true,
  });

  return {
    get: (key: string) => client.get(key),
    setex: (key: string, seconds: number, value: string) => client.setex(key, seconds, value),
    expire: (key: string, seconds: number) => client.expire(key, seconds) as Promise<0 | 1>,
    del: (...keys: string[]) => client.del(...keys),
    scan: (cursor: string, ...args: Array<string | number>) =>
      (client as unknown as { scan: (...scanArgs: Array<string>) => Promise<ScanResult> }).scan(
        cursor,
        ...args.map(String),
      ),
    quit: async () => {
      await client.quit();
      return 'OK' as const;
    },
  } satisfies CacheStore;
};

declare global {
  var cacheStore: CacheStore | undefined;
}

export const redis: CacheStore =
  globalThis.cacheStore ??
  (env.USE_IN_MEMORY_STORE
    ? new InMemoryStore()
    : createRedisStore());

if (process.env.NODE_ENV !== 'production') {
  globalThis.cacheStore = redis;
}
