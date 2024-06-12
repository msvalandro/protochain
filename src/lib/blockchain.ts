import { Block } from './block'

export class Blockchain {
  private blocks: Block[]
  private nextIndex = 1

  constructor() {
    this.blocks = [Block.genesis()]
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((block) => block.getHash() === hash)
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1]
  }

  getBlocks(): Block[] {
    return this.blocks.slice()
  }

  addBlock(block: Block): void {
    const previousBlock = this.getLastBlock()

    if (!block.isValid(previousBlock.getHash(), previousBlock.getIndex())) {
      throw new Error(`Invalid block #${block.getHash()}`)
    }

    this.blocks.push(block)
    this.nextIndex++
  }

  isValid(): boolean {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i]
      const previousBlock = this.blocks[i - 1]

      if (
        !currentBlock.isValid(previousBlock.getHash(), previousBlock.getIndex())
      ) {
        console.error(`Invalid block #${currentBlock.getHash()}`)
        return false
      }
    }

    return true
  }
}
