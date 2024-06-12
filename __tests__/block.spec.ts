import { Block } from '../src/lib/block'
import { ValidationError } from '../src/lib/validation-error'

describe('Block tests', () => {
  const exampleDifficulty = 0
  const exampleMiner = 'miner'
  let genesis: Block

  beforeAll(() => {
    genesis = Block.genesis()
  })

  it('should be valid', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    block.mine(exampleDifficulty, exampleMiner)

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).not.toThrow(ValidationError)
  })

  it('should returns a valid block', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
      nonce: 0,
      miner: '',
      timestamp: 1,
      hash: 'abc',
    })

    expect(block.getIndex()).toBe(1)
    expect(block.getPreviousHash()).toBe(genesis.getHash())
    expect(block.getData()).toBe('Block 1')
    expect(block.getNonce()).toBe(0)
    expect(block.getMiner()).toBe('')
    expect(block.getTimestamp()).toBeGreaterThan(0)
    expect(block.getHash()).not.toBe('')
  })

  it('should not be valid due to index', () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block index')
  })

  it('should not be valid due to previous hash', () => {
    const block = new Block({ index: 1, previousHash: '', data: 'Block 1' })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid previous block hash')
  })

  it('should not be valid due to data', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: '',
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block data')
  })

  it('should not be valid due to timestamp', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    // eslint-disable-next-line dot-notation
    block['timestamp'] = 0

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block timestamp')
  })

  it('should create genesis block', () => {
    const block = Block.genesis()

    expect(() => {
      block.validate(
        '0000000000000000000000000000000000000000000000000000000000000000',
        -1,
        exampleDifficulty,
      )
    }).not.toThrow(ValidationError)
    expect(block.getIndex()).toBe(0)
    expect(block.getHash()).toBeTruthy()
  })

  it('should be invalid if change existing hash', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    block.mine(exampleDifficulty, exampleMiner)

    // eslint-disable-next-line dot-notation
    block['hash'] = 'invalid'

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block hash')
  })

  it('should be invalid if block not mined', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Block not mined')
  })
})
