import { Block } from '../src/lib/block'
import { Blockchain } from '../src/lib/blockchain'

describe('Blockchain tests', () => {
  it('should has genesis block', () => {
    const blockchain = new Blockchain()

    expect(blockchain.getBlocks().length).toBe(1)
  })

  it('should be valid', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block(1, previousBlock.getHash(), 'data')

    blockchain.addBlock(block)

    expect(blockchain.isValid()).toBe(true)
  })

  it('should add a new block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block(1, previousBlock.getHash(), 'data')

    blockchain.addBlock(block)

    expect(blockchain.getBlocks().length).toBe(2)
  })

  it('should not be able to add invalid block', () => {
    const blockchain = new Blockchain()

    const block = new Block(1, 'invalid hash', 'data')

    blockchain.addBlock(block)

    expect(blockchain.getBlocks().length).toBe(1)
  })

  it('should be invalid if change existing block', () => {
    const blockchain = new Blockchain()

    const previousBlock = blockchain.getBlocks()[0]
    const block = new Block(1, previousBlock.getHash(), 'data')

    blockchain.addBlock(block)

    // eslint-disable-next-line dot-notation
    block['data'] = 'changed data'

    expect(blockchain.isValid()).toBe(false)
  })
})
