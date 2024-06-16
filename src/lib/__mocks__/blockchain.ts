import { BlockInfo } from '../block-info'
import { TransactionSearch } from '../transaction-search'
import { Block } from './block'
import { Transaction } from './transaction'
import { TransactionOutput } from './transaction-output'

export class Blockchain {
  private mempool: Transaction[]
  private blocks: Block[]
  private nextIndex = 1

  static readonly TX_PER_BLOCK = 2
  static readonly DIFFICULTY_FACTOR = 5
  static readonly MAX_DIFFICULTY = 62

  constructor(miner: string) {
    this.mempool = []
    this.blocks = [Block.genesis(miner)]
  }

  static getRewardAmount(
    difficulty: number = Math.ceil(0 / Blockchain.DIFFICULTY_FACTOR) + 1,
  ): number {
    return (64 - difficulty) * 10
  }

  getBlock(hash: string): Block | undefined {
    return this.blocks.find((block) => block.getHash() === hash)
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1]
  }

  getFeePerTx(): number {
    return 1
  }

  getNextBlock(): BlockInfo | null {
    if (!this.mempool.length) {
      return null
    }

    return {
      index: 1,
      previousHash: 'mock-last-block-hash',
      transactions: [],
      difficulty: this.getDifficulty(),
      maxDifficulty: Blockchain.MAX_DIFFICULTY,
      feePerTx: this.getFeePerTx(),
    }
  }

  getBlocks(): Block[] {
    return this.blocks.slice()
  }

  getMempool(): Transaction[] {
    return this.mempool.slice()
  }

  getTransaction(): TransactionSearch {
    return {
      transaction: undefined,
      mempoolIndex: -1,
      blockIndex: -1,
    }
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1
  }

  addTransaction(): void {}

  addBlock(): void {}

  isValid(): boolean {
    return true
  }

  getUTXO(): TransactionOutput[] {
    return []
  }

  getBalance(): number {
    return 0
  }
}
