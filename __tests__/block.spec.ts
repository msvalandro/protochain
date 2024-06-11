import { Block } from '../src/lib/block'

describe('Block tests', () => {
  it('should be valid', () => {
    const block = new Block(1, 'hash1')

    expect(block.isValid()).toBe(true)
  })

  it('should not be valid due to index', () => {
    const block = new Block(-1, 'hash1')

    expect(block.isValid()).toBe(false)
  })

  it('should not be valid due to hash', () => {
    const block = new Block(1, '')

    expect(block.isValid()).toBe(false)
  })
})
