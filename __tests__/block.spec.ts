import { Block } from '../src/lib/block'
import { ValidationError } from '../src/lib/validation-error'

describe('Block tests', () => {
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

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex())
    }).not.toThrow(ValidationError)
  })

  it('should not be valid due to index', () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.getHash(),
      data: 'Block 1',
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex())
    }).toThrow(ValidationError)
  })

  it('should not be valid due to previous hash', () => {
    const block = new Block({ index: 1, previousHash: '', data: 'Block 1' })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex())
    }).toThrow(ValidationError)
  })

  it('should not be valid due to data', () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.getHash(),
      data: '',
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex())
    }).toThrow(ValidationError)
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
      block.validate(genesis.getHash(), genesis.getIndex())
    }).toThrow(ValidationError)
  })

  it('should create genesis block', () => {
    const block = Block.genesis()

    expect(() => {
      block.validate(
        '0000000000000000000000000000000000000000000000000000000000000000',
        -1,
      )
    }).not.toThrow(ValidationError)
    expect(block.getIndex()).toBe(0)
    expect(block.getHash()).toBeTruthy()
  })
})
