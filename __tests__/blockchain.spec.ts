import { Block } from '../src/lib/block'
import { Blockchain } from '../src/lib/blockchain'
import { Transaction } from '../src/lib/transaction'

jest.mock('../src/lib/block')
jest.mock('../src/lib/transaction')

describe('Blockchain tests', () => {
  function createBlock(
    previousHash: string,
    index = 1,
    hasTransaction = false,
  ): Block {
    return new Block({
      index,
      previousHash,
      transactions: hasTransaction
        ? [
            new Transaction({
              to: 'mock-wallet',
              hash: 'transaction-hash',
            }),
          ]
        : [],
    })
  }

  it('should has genesis block', () => {
    const blockchain = new Blockchain()

    expect(blockchain.getBlocks().length).toBe(1)
  })

  it('should be valid', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = createBlock(previousBlock.getHash())

    blockchain.addBlock(block)

    expect(blockchain.isValid()).toBe(true)
  })

  it('should add a new block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = createBlock(previousBlock.getHash())

    blockchain.addBlock(block)

    expect(blockchain.getBlocks().length).toBe(2)
  })

  it('should not be able to add invalid block', () => {
    const blockchain = new Blockchain()

    const block = createBlock('hash', -1)

    expect(() => {
      blockchain.addBlock(block)
    }).toThrow('Invalid block')
  })

  it('should be invalid if change existing block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = createBlock(previousBlock.getHash())

    blockchain.addBlock(block)

    // eslint-disable-next-line dot-notation
    block['index'] = -1

    expect(blockchain.isValid()).toBe(false)
  })

  it('should return existing block', () => {
    const blockchain = new Blockchain()

    const genesis = blockchain.getBlocks()[0]

    const block = blockchain.getBlock(genesis.getHash())

    expect(block).toBe(genesis)
  })

  it('should return next block', () => {
    const blockchain = new Blockchain()

    blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))

    expect(blockchain.getNextBlock()?.index).toBe(1)
  })

  it('should not return next block if there is no transactions on mempull', () => {
    const blockchain = new Blockchain()

    expect(blockchain.getNextBlock()).toBeNull()
  })

  it('should return mempool', () => {
    const blockchain = new Blockchain()

    blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))

    expect(blockchain.getMempool().length).toBe(1)
  })

  it('should return transaction from mempool', () => {
    const blockchain = new Blockchain()

    const transaction = new Transaction({ to: 'mock-wallet' })

    blockchain.addTransaction(transaction)

    expect(blockchain.getTransaction(transaction.getHash()).transaction).toBe(
      transaction,
    )
  })

  it('should return transaction from block', () => {
    const blockchain = new Blockchain()

    blockchain.addTransaction(
      new Transaction({ to: 'mock-wallet', hash: 'transaction-hash' }),
    )
    const block = createBlock(blockchain.getBlocks()[0].getHash(), 1, true)

    blockchain.addBlock(block)

    expect(blockchain.getTransaction('abc').transaction?.getHash()).toBe(
      'transaction-hash',
    )
  })

  it('should not return transaction if no transactions', () => {
    const blockchain = new Blockchain()

    const block = createBlock(blockchain.getBlocks()[0].getHash())

    blockchain.addBlock(block)

    expect(blockchain.getTransaction('abc').transaction).toBeUndefined()
  })

  it('should not be able to add transaction if transaction already in blockchain', () => {
    const blockchain = new Blockchain()

    const block = createBlock(blockchain.getBlocks()[0].getHash(), 1, true)

    blockchain.addTransaction(
      new Transaction({ to: 'mock-wallet', hash: 'transaction-hash' }),
    )
    blockchain.addBlock(block)

    expect(() => {
      blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))
    }).toThrow('Transaction already in blockchain')
  })

  it('should not be able to add transaction if transaction already in mempool', () => {
    const blockchain = new Blockchain()

    blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))

    expect(() => {
      blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))
    }).toThrow('Transaction already in mempool')
  })

  it('should not be able to add block with invalid transaction', () => {
    const blockchain = new Blockchain()

    blockchain.addTransaction(new Transaction({ to: 'mock-wallet' }))

    const block = createBlock(blockchain.getBlocks()[0].getHash(), 1, true)

    expect(() => {
      blockchain.addBlock(block)
    }).toThrow('Invalid tx in block mempool')
  })
})
