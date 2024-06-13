import { Block } from '../src/lib/block'
import { Blockchain } from '../src/lib/blockchain'
import { Transaction } from '../src/lib/transaction'

jest.mock('../src/lib/block')
jest.mock('../src/lib/transaction')

describe('Blockchain tests', () => {
  function createBlock(previousHash: string, index = 1): Block {
    return new Block({
      index,
      previousHash,
      transactions: [new Transaction({ data: 'Transaction 1' })],
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

    expect(blockchain.getNextBlock().index).toBe(1)
  })
})
