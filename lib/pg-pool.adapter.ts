import { Pool as TarnPool } from 'tarn'
import { EventEmitter } from 'node:events'
import { Pool } from 'pg'
import knexLib from 'knex'

export class PgPoolAdapter extends EventEmitter {
  constructor(private readonly pool: TarnPool<any>) {
    super()
  }

  static fromKnex(knex: knexLib.Knex<any, unknown[]>) {
    if (!knex.client.pool) {
      throw new Error('Knex instance is not connected to a database.')
    }
    return new PgPoolAdapter(knex.client.pool) as Pool
  }

  get totalCount() {
    return this.pool.numUsed() + this.pool.numFree()
  }

  get idleCount() {
    return this.pool.numFree()
  }

  get waitingCount() {
    return this.pool.numPendingAcquires()
  }

  get expiredCount() {
    return 0
  }

  get ended() {
    return false
  }

  get ending() {
    return false
  }

  get options() {
    return null as any
  }

  async query(...args: any[]) {
    const maybeCallback = args[args.length - 1]
    if (typeof maybeCallback === 'function') {
      throw new Error('Callbacks are not supported. Use Promise instead.')
    }

    const client = await this.connect()
    try {
      return await client.query(...args)
    } finally {
      client.release()
    }
  }

  async connect() {
    const client = await this.pool.acquire().promise
    let released = false
    client.release = (destroy?: boolean) => {
      if (destroy) {
        throw new Error('The `destroy` option is not supported.')
      }
      if (released) {
        throw new Error('Release called on client which has already been released to the pool.')
      }
      this.pool.release(client)
      released = true
    }
    return client
  }

  async end() {
    throw new Error('End the original knex connection instead of calling end on the adapter.')
  }
}
