import { Block } from './block'

export class Blockchain {
  private blocks: Block[]

  constructor() {
    this.blocks = [Block.genesis()]
  }

  getBlocks() {
    return this.blocks.slice()
  }
}
