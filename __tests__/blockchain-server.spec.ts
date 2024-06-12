import request from 'supertest'

import { app } from '../src/server/blockchain-server'

jest.mock('../src/lib/block')
jest.mock('../src/lib/blockchain')

describe('BlockchainServer tests', () => {
  beforeAll(async () => {
    await app.ready()
  })

  test('GET /status', async () => {
    const response = await request(app.server).get('/status')

    expect(response.status).toBe(200)
    expect(response.body.isValid).toBe(true)
  })
})
