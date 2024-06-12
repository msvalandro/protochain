import { BlockInfo } from '../block-info'
import { ValidationError } from '../validation-error'
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
    if (block.getIndex() < 0) {
      throw new ValidationError('Invalid mocked block')
    }

    if (block.getIndex() === 99) {
      throw new Error('Mocked internal server error')
    }

    this.blocks.push(block)
    this.nextIndex++
  }

  isValid(): boolean {
    return true
  }

  getNextBlock(): BlockInfo {
    return {
      index: this.nextIndex,
      previousHash: this.getLastBlock().getHash(),
    } as BlockInfo
  }
}
