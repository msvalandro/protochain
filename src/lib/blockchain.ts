import { Block } from './block'
import { ValidationError } from './validation-error'

export class Blockchain {
  private blocks: Block[]
  private nextIndex = 1
  static readonly DIFFICULTY_FACTOR = 5

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

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR)
  }

  addBlock(block: Block): void {
    try {
      const previousBlock = this.getLastBlock()

      block.validate(
        previousBlock.getHash(),
        previousBlock.getIndex(),
        this.getDifficulty(),
      )

      this.blocks.push(block)
      this.nextIndex++
    } catch (error) {
      throw new ValidationError(
        `Invalid block #${block.getHash()}. Error: ${error}`,
      )
    }
  }

  isValid(): boolean {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i]
      const previousBlock = this.blocks[i - 1]

      try {
        currentBlock.validate(
          previousBlock.getHash(),
          previousBlock.getIndex(),
          this.getDifficulty(),
        )
      } catch (error) {
        console.error(
          `Invalid block #${currentBlock.getHash()}. Error: ${error}`,
        )
        return false
      }
    }

    return true
  }
}
