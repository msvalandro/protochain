import request from 'supertest'

import { app } from '../src/server/blockchain-server'

jest.mock('../src/lib/block')
jest.mock('../src/lib/blockchain')

describe('BlockchainServer tests', () => {
  function createBlock(index = 1): object {
    return {
      index,
      previousHash: 'abc',
      transactions: [
        {
          type: 'regular',
          to: 'mock-wallet',
          txInputs: [
            {
              fromAddress: 'mock-wallet',
              amount: 1,
              signature: 'mock-signature',
              previousTx: 'mock-previous-tx',
            },
          ],
          txOutputs: [
            {
              toAddress: 'mock-wallet',
              amount: 1,
              txHash: 'mock-tx-hash',
            },
          ],
          timestamp: 1,
          hash: 'transaction-hash',
        },
      ],
      nonce: 1,
      miner: 'miner',
      timestamp: 1,
      hash: 'def',
    }
  }

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

  test('GET /blocks/:hash - should return block #mock-block-hash', async () => {
    const response = await request(app.server).get('/blocks/mock-hash')

    expect(response.status).toBe(200)
    expect(response.body.block.hash).toBe('mock-block-hash')
  })

  test('GET /blocks/:index - should return block not found', async () => {
    const response = await request(app.server).get('/blocks/7')

    expect(response.status).toBe(404)
  })

  test('POST /blocks - should add block on blockchain', async () => {
    const block = createBlock()
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
    const block = createBlock(-1)
    const response = await request(app.server).post('/blocks').send(block)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Invalid mocked block')
  })

  test('POST /transactions - should not be able to add transaction with invalid data', async () => {
    const transaction = {}
    const response = await request(app.server)
      .post('/transactions')
      .send(transaction)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe(
      'Could not create the transaction with the provided data',
    )
  })
})
