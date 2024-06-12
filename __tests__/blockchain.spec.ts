import { Block } from '../src/lib/block'
import { Blockchain } from '../src/lib/blockchain'

jest.mock('../src/lib/block')

describe('Blockchain tests', () => {
  it('should has genesis block', () => {
    const blockchain = new Blockchain()

    expect(blockchain.getBlocks().length).toBe(1)
  })

  it('should be valid', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block({
      index: 1,
      previousHash: previousBlock.getHash(),
      data: 'data',
    })

    blockchain.addBlock(block)

    expect(blockchain.isValid()).toBe(true)
  })

  it('should add a new block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block({
      index: 1,
      previousHash: previousBlock.getHash(),
      data: 'data',
    })

    blockchain.addBlock(block)

    expect(blockchain.getBlocks().length).toBe(2)
  })

  it('should not be able to add invalid block', () => {
    const blockchain = new Blockchain()

    const block = new Block({
      index: -1,
      previousHash: 'hash',
      data: 'data',
    })

    expect(() => {
      blockchain.addBlock(block)
    }).toThrow('Invalid block')
  })

  it('should be invalid if change existing block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block({
      index: 1,
      previousHash: previousBlock.getHash(),
      data: 'data',
    })

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
})
