import { Block } from './block'

export class Blockchain {
  private blocks: Block[]
  private nextIndex = 1

  constructor() {
    this.blocks = [Block.genesis()]
  }

  getBlocks() {
    return this.blocks.slice()
  }

  private getLastBlock() {
    return this.blocks[this.blocks.length - 1]
  }

  addBlock(block: Block) {
    const previousBlock = this.getLastBlock()

    if (!block.isValid(previousBlock.getHash(), previousBlock.getIndex())) {
      return false
    }

    this.blocks.push(block)
    this.nextIndex++

    return true
  }

  isValid() {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i]
      const previousBlock = this.blocks[i - 1]

      if (
        !currentBlock.isValid(previousBlock.getHash(), previousBlock.getIndex())
      ) {
        return false
      }
    }

    return true
  }
}
