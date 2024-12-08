# pg-pool-adapter

`pg-pool-adapter` is an adapter for integrating [Knex](https://knexjs.org) with libraries or frameworks that expect a [pg.Pool](https://node-postgres.com/apis/pool) interface.
For instance, you can integrate [LangGraph's PostgresSaver](https://github.com/langchain-ai/langgraphjs/tree/main/libs/checkpoint-postgres) with an existing codebase that uses Knex.

Using this adapter, you can avoid having two separate pools in the same application, allowing it to manage connections more efficiently.

## Summary

- Allows Knex's tarn-based pool to behave like a `pg.Pool` instance.
- Adheres strictly to promises, avoiding callback-style APIs.
- Provides errors for unsupported operations.

## Installation

Install the required packages:

```bash
npm install knex pg pg-pool-adapter
```

Add `pg-pool-adapter` to your project and use it like this:

```typescript
import { PgPoolAdapter } from 'pg-pool-adapter'
import knex from 'knex'

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
})

// Create an adapter instance
const pgPool = PgPoolAdapter.fromKnex(knexInstance)

// Use pgPool as you would normally use pg.Pool
pgPool.query('SELECT * FROM users').then((result) => console.log(result.rows))
```

## Supported Features

- Execute queries via `pool.query()`
- Acquire clients via `pool.connect()`
- Release acquired clients via `client.release()`

## Unsupported Features

1. The `query` method does not support callback-style arguments. Use promises instead.
2. Releasing a client with the `destroy` flag will throw an error.
3. The adapter does not support ending the pool directly. You must end the original Knex pool if necessary.
4. Event listeners are currently not supported.
