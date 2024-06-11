import { Block } from '../src/lib/block'

describe('Block tests', () => {
  it('should be valid', () => {
    const block = new Block(1, 'hash1', 'Block 1')

    expect(block.isValid()).toBe(true)
  })

  it('should not be valid due to index', () => {
    const block = new Block(-1, 'hash1', 'Block 1')

    expect(block.isValid()).toBe(false)
  })

  it('should not be valid due to previous hash', () => {
    const block = new Block(1, '', 'Block 1')

    expect(block.isValid()).toBe(false)
  })

  it('should not be valid due to data', () => {
    const block = new Block(1, '', '')

    expect(block.isValid()).toBe(false)
  })

  it('should create genesis block', () => {
    const block = Block.genesis()

    expect(block.isValid()).toBe(true)
    expect(block.getIndex()).toBe(0)
    expect(block.getHash()).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })
})
