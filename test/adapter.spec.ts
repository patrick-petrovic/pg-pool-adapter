import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import knexLib from 'knex'
import { PgPoolAdapter } from '../lib/pg-pool.adapter.js'

describe('Knex PG adapter', () => {
  function init() {
    const db = knexLib({
      client: 'pg',
      connection: {
        host: 'localhost',
        user: 'myuser',
        password: 'mypassword',
        database: 'mydb',
      },
    })

    const adapter = PgPoolAdapter.fromKnex(db)

    return { db, adapter }
  }

  it('should run a simple query', async () => {
    const { db, adapter } = init()

    try {
      const result = await adapter.query('SELECT 1+1 as result;')
      assert.equal(result.rows[0].result, 2)
      assert.equal(db.client.pool.numUsed(), 0)
    } finally {
      await db.destroy()
    }
  })

  it('should run a query with parameters', async () => {
    const { db, adapter } = init()

    try {
      const result = await adapter.query('SELECT $1::text as result;', ['hello'])
      assert.equal(result.rows[0].result, 'hello')
      assert.equal(db.client.pool.numUsed(), 0)
    } finally {
      await db.destroy()
    }
  })

  it('should acquire connection and run a query', async () => {
    const { db, adapter } = init()

    try {
      const client = await adapter.connect()
      try {
        const result = await client.query('SELECT 1+1 as result;')
        assert.equal(result.rows[0].result, 2)
        assert.equal(db.client.pool.numUsed(), 1)
      } finally {
        client.release()
        assert.equal(db.client.pool.numUsed(), 0)
      }
    } finally {
      await db.destroy()
    }
  })
})
