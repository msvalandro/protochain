import request from 'supertest'

import { app } from '../src/server/blockchain-server'

jest.mock('../src/lib/block')
jest.mock('../src/lib/blockchain')

describe('BlockchainServer tests', () => {
  beforeAll(async () => {
    await app.ready()
  })

  test('GET /status - should return status valid', async () => {
    const response = await request(app.server).get('/status')

    expect(response.status).toBe(200)
    expect(response.body.isValid).toBe(true)
  })

  test('GET /blocks/next - should return next block info', async () => {
    const response = await request(app.server).get('/blocks/next')

    expect(response.status).toBe(200)
    expect(response.body.block.index).toBe(1)
  })

  test('GET /blocks/:index - should return block genesis', async () => {
    const response = await request(app.server).get('/blocks/0')

    expect(response.status).toBe(200)
    expect(response.body.block.index).toBe(0)
  })

  test('GET /blocks/:hash - should return block #abc', async () => {
    const response = await request(app.server).get('/blocks/abc')

    expect(response.status).toBe(200)
    expect(response.body.block.hash).toBe('abc')
  })

  test('GET /blocks/:index - should return block not found', async () => {
    const response = await request(app.server).get('/blocks/7')

    expect(response.status).toBe(404)
  })

  test('POST /blocks - should add block on blockchain', async () => {
    const block = { index: 1, previousHash: 'abc', data: 'block 1' }
    const response = await request(app.server).post('/blocks').send(block)

    expect(response.status).toBe(201)
    expect(response.body.block.index).toBe(1)
  })

  test('POST /blocks - should not be able to add block if invalid payload', async () => {
    const response = await request(app.server).post('/blocks').send({})

    expect(response.status).toBe(400)
    expect(response.body.message).toBe(
      'Could not create the block with the provided data',
    )
  })

  test('POST /blocks - should not be able to add invalid block', async () => {
    const block = { index: -1, previousHash: 'abc', data: 'block 1' }
    const response = await request(app.server).post('/blocks').send(block)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid mocked block')
  })

  test('POST /blocks - should not be able to add block if internal server error', async () => {
    const block = { index: 99, previousHash: 'abc', data: 'block 1' }
    const response = await request(app.server).post('/blocks').send(block)

    expect(response.status).toBe(500)
  })
})
