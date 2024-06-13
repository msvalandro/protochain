import { BlockInfo } from '../block-info'
import { ValidationError } from '../validation-error'
import { Block } from './block'
import { Transaction } from './transaction'

export class Blockchain {
  private transactions: Transaction[]
  private blocks: Block[]
  private nextIndex = 1

  constructor() {
    this.transactions = [
      new Transaction({ data: 'Transaction 1', hash: 'transaction-hash' }),
    ]
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

  getTransaction(hash: string): Transaction | undefined {
    console.log('getTransaction', hash)
    return this.transactions.find(
      (transaction) => transaction.getHash() === hash,
    )
  }

  getMempool(): Transaction[] {
    return this.transactions.slice()
  }

  addTransaction(transaction: Transaction): void {
    if (transaction.getData() === 'invalid transaction') {
      throw new ValidationError('Invalid transaction data')
    }

    if (transaction.getData() === 'internal server error transaction') {
      throw new Error('Simulate internal server error')
    }
  }
}
