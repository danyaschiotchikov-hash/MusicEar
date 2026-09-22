import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// In-memory mock store for when SQL database is not connected
const inMemoryBugReports: any[] = [];
let nextBugId = 1;

let realDb: any = null;

if (process.env.SQL_HOST) {
  try {
    if (!global._postgresPool) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 5000,
      });

      // Prevent unhandled pool-level errors from crashing the application
      global._postgresPool.on('error', (err) => {
        console.warn('[AI Studio] PostgreSQL pool warning:', err.message);
      });
    }
    realDb = drizzle(global._postgresPool, { schema });
  } catch (err: any) {
    console.warn('[AI Studio] PostgreSQL initialization failed — using mock store:', err.message);
  }
}

// Resilient wrapper: uses real database when configured, falls back to in-memory store
export const db: any = new Proxy(realDb || {}, {
  get(target, prop, receiver) {
    if (prop === 'insert') {
      return (table: any) => ({
        values: (val: any) => ({
          returning: async () => {
            if (realDb?.insert) {
              try {
                return await realDb.insert(table).values(val).returning();
              } catch (err: any) {
                console.warn('[AI Studio] PostgreSQL insert failed, falling back to memory store:', err.message);
              }
            }
            const record = {
              id: nextBugId++,
              createdAt: new Date(),
              status: 'new',
              ...val,
            };
            inMemoryBugReports.push(record);
            return [record];
          },
        }),
      });
    }

    if (prop === 'select') {
      return () => ({
        from: (table: any) => {
          const promise = (async () => {
            if (realDb?.select) {
              try {
                return await realDb.select().from(table);
              } catch (err: any) {
                console.warn('[AI Studio] PostgreSQL select failed, falling back to memory store:', err.message);
              }
            }
            return [...inMemoryBugReports];
          })();
          return promise;
        },
      });
    }

    if (realDb && prop in realDb) {
      return Reflect.get(realDb, prop, receiver);
    }

    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d: any) => d?.data ?? {},
      update: async (d: any) => d?.data ?? {},
      delete: async () => ({}),
    };
    return prop === 'query' ? new Proxy({}, { get: () => noOp }) : async () => [];
  },
});

