import { Block } from './block'
import { BlockInfo } from './block-info'
import { Transaction } from './transaction'
import { TransactionSearch } from './transaction-search'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

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
      index: this.nextIndex,
      previousHash: this.getLastBlock().getHash(),
      transactions: this.mempool.slice(0, Blockchain.TX_PER_BLOCK),
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

  getTransaction(hash: string): TransactionSearch {
    const mempoolIndex = this.mempool.findIndex(
      (transaction) => transaction.getHash() === hash,
    )

    if (mempoolIndex !== -1) {
      return {
        transaction: this.mempool[mempoolIndex],
        mempoolIndex,
        blockIndex: -1,
      }
    }

    const blockIndex = this.blocks.findIndex((block) =>
      block.hasTransaction(hash),
    )

    if (blockIndex !== -1) {
      return {
        transaction: this.blocks[blockIndex].getTransaction(hash),
        mempoolIndex: -1,
        blockIndex,
      }
    }

    return {
      transaction: undefined,
      mempoolIndex: -1,
      blockIndex: -1,
    }
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1
  }

  private validateTransactionInBlocks(hash: string): void {
    if (this.blocks.some((block) => block.hasTransaction(hash))) {
      throw new ValidationError('Transaction already in blockchain')
    }
  }

  private validateTransactionInMempool(hash: string): void {
    if (this.mempool.some((tx) => tx.getHash() === hash)) {
      throw new ValidationError('Transaction already in mempool')
    }
  }

  private validatePendingTransactions(transaction: Transaction): void {
    const txInputs = transaction.getTxInputs()
    const from = txInputs[0].getFromAddress()

    const pendingTx = this.mempool
      .filter((tx) => tx.getTxInputs().length > 0)
      .map((tx) => tx.getTxInputs())
      .flat()
      .filter((txInput) => txInput.getFromAddress() === from)

    if (pendingTx.length > 0) {
      throw new ValidationError('This wallet has a pending transaction')
    }

    // TODO: validar origens dos fundos
  }

  addTransaction(transaction: Transaction): void {
    try {
      this.validatePendingTransactions(transaction)

      transaction.validate()

      this.validateTransactionInBlocks(transaction.getHash())
      this.validateTransactionInMempool(transaction.getHash())

      this.mempool.push(transaction)
    } catch (error) {
      throw new ValidationError(`Invalid transaction. ${error}`)
    }
  }

  addBlock(block: Block): void {
    try {
      const nextBlock = this.getNextBlock()

      if (!nextBlock) {
        throw new ValidationError('No block info to be added')
      }

      block.validate(
        nextBlock.previousHash,
        nextBlock.index - 1,
        nextBlock.difficulty,
      )

      const txs = block
        .getTransactions()
        .filter((tx) => tx.getType() !== TransactionType.FEE)
        .map((tx) => tx.getHash())

      const newMempool = this.mempool.filter(
        (tx) => !txs.includes(tx.getHash()),
      )

      if (newMempool.length + txs.length !== this.mempool.length) {
        throw new ValidationError('Invalid tx in block mempool')
      }

      this.mempool = newMempool

      this.blocks.push(block)
      this.nextIndex++
    } catch (error) {
      throw new ValidationError(`Invalid block #${block.getHash()}. ${error}`)
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
          `Invalid block #${currentBlock.getHash()}. Error: ${(error as ValidationError).message}`,
        )
        return false
      }
    }

    return true
  }
}
