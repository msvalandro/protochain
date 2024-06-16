import { Block } from '../src/lib/block'
import { Transaction } from '../src/lib/transaction'
import { TransactionType } from '../src/lib/transaction-type'

jest.mock('../src/lib/transaction')
jest.mock('../src/lib/blockchain')

interface CreateBlockParams {
  index?: number
  previousHash?: string
  transactions?: Transaction[]
  timestamp?: number
  hash?: string
}

describe('Block tests', () => {
  const mockPreviousHash = 'mock-previous-hash'
  const mockPreviousIndex = 0
  const mockDifficulty = 2
  const mockFeesPerTx = 8

  function createBlock({
    index,
    previousHash,
    transactions,
    timestamp,
    hash,
  }: CreateBlockParams = {}): Block {
    return new Block({
      index: index ?? 1,
      previousHash: previousHash ?? 'mock-previous-hash',
      miner: 'mock-miner',
      nonce: 1,
      transactions: transactions ?? [
        new Transaction({ type: TransactionType.FEE }),
        new Transaction({ hash: 'mock-transaction-hash' }),
      ],
      timestamp,
      hash,
    })
  }

  it('should not throw an error while validating block', () => {
    const block = createBlock()

    block.mine(mockDifficulty, 'mock-miner')

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).not.toThrow()
  })

  it('should return genesis', () => {
    const block = Block.genesis('mock-miner')

    expect(block.getIndex()).toBe(0)
    expect(block.getPreviousHash()).toBe(
      '0000000000000000000000000000000000000000000000000000000000000000',
    )
    expect(block.getTransactions().length).toBe(1)
    expect(block.getNonce()).toBeDefined()
    expect(block.getMiner()).toBe('mock-miner')
  })

  it('should return block timestamp', () => {
    const block = createBlock({ timestamp: 1 })

    expect(block.getTimestamp()).toBe(1)
  })

  it('should return block hash', () => {
    const block = createBlock({ hash: 'mock-hash' })

    expect(block.getHash()).toBe('mock-hash')
  })

  it('should return block transaction', () => {
    const block = createBlock()

    expect(block.getTransaction('mock-transaction-hash')?.getHash()).toBe(
      'mock-transaction-hash',
    )
  })

  it('should add transaction to block', () => {
    const block = createBlock()

    block.addTransaction(new Transaction({ hash: 'mock-transaction-hash-2' }))

    expect(block.hasTransaction('mock-transaction-hash-2')).toBe(true)
  })

  it('should throw validation error if block has no fee transaction', () => {
    const block = createBlock({ transactions: [] })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Block does not contain fee transaction')
  })

  it('should throw validation error if block has more than 1 fee transaction', () => {
    const block = createBlock({
      transactions: [
        new Transaction({ type: TransactionType.FEE }),
        new Transaction({ type: TransactionType.FEE }),
      ],
    })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Block contains multiple fee transactions')
  })

  it('should throw validation error if fee transaction miner is different from block miner', () => {
    const block = createBlock({
      transactions: [
        new Transaction({ type: TransactionType.FEE, timestamp: 99 }),
      ],
    })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Invalid fee transaction, different from miner')
  })

  it('should throw validation error if block timestamp is invalid', () => {
    const block = createBlock({ timestamp: 0 })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Invalid block timestamp')
  })

  it('should throw validation error if block previous hash is invalid', () => {
    const block = createBlock({ previousHash: '' })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Invalid previous block hash')
  })

  it('should throw validation error if block index is invalid', () => {
    const block = createBlock({ index: 0 })

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Invalid block index')
  })

  it('should throw validation error if block hash is invalid', () => {
    const block = createBlock()

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Invalid block hash')
  })

  it('should throw validation error if block not mined', () => {
    const block = createBlock()

    block.mine(mockDifficulty, 'mock-miner')

    // eslint-disable-next-line dot-notation
    block['miner'] = ''

    expect(() =>
      block.validate(
        mockPreviousHash,
        mockPreviousIndex,
        mockDifficulty,
        mockFeesPerTx,
      ),
    ).toThrow('Block not mined')
  })
})
