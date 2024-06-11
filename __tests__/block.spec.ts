import { Block } from '../src/lib/block'

describe('Block tests', () => {
  let genesis: Block

  beforeAll(() => {
    genesis = Block.genesis()
  })

  it('should be valid', () => {
    const block = new Block(1, genesis.getHash(), 'Block 1')

    expect(block.isValid(genesis.getHash(), genesis.getIndex())).toBe(true)
  })

  it('should not be valid due to index', () => {
    const block = new Block(-1, genesis.getHash(), 'Block 1')

    expect(block.isValid(genesis.getHash(), genesis.getIndex())).toBe(false)
  })

  it('should not be valid due to previous hash', () => {
    const block = new Block(1, '', 'Block 1')

    expect(block.isValid(genesis.getHash(), genesis.getIndex())).toBe(false)
  })

  it('should not be valid due to data', () => {
    const block = new Block(1, genesis.getHash(), '')

    expect(block.isValid(genesis.getHash(), genesis.getIndex())).toBe(false)
  })

  it('should create genesis block', () => {
    const block = Block.genesis()

    expect(
      block.isValid(
        '0000000000000000000000000000000000000000000000000000000000000000',
        -1,
      ),
    ).toBe(true)
    expect(block.getIndex()).toBe(0)
    expect(block.getHash()).toBeTruthy()
  })
})
