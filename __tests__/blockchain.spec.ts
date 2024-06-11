import { Blockchain } from '../src/lib/blockchain'

describe('Blockchain tests', () => {
  it('should has genesis block', () => {
    const blockchain = new Blockchain()

    expect(blockchain.getBlocks().length).toBe(1)
  })
})
