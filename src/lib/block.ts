import sha256 from 'crypto-js/sha256'

import { Blockchain } from './blockchain'
import { CreateTransactionParams, Transaction } from './transaction'
import { TransactionOutput } from './transaction-output'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

interface CreateBlockParams {
  index: number
  previousHash: string
  transactions: Transaction[] | CreateTransactionParams[]
  nonce?: number
  miner?: string
  timestamp?: number
  hash?: string
}

export class Block {
  private index: number
  private hash: string
  private previousHash: string
  private transactions: Transaction[]
  private timestamp: number
  private nonce: number
  private miner: string

  constructor({
    index,
    previousHash,
    transactions,
    nonce,
    miner,
    timestamp,
    hash,
  }: CreateBlockParams) {
    this.index = index
    this.previousHash = previousHash
    this.transactions = transactions.map(
      (tx) => new Transaction({ ...tx } as CreateTransactionParams),
    )
    this.nonce = nonce ?? 0
    this.miner = miner ?? ''

    this.timestamp = timestamp ?? Date.now()
    this.hash = hash ?? this.generateHash()
  }

  static genesis(miner: string): Block {
    const amount = Blockchain.getRewardAmount()

    const transaction = new Transaction({
      type: TransactionType.FEE,
      txOutputs: [new TransactionOutput({ toAddress: miner, amount })],
    })
    transaction.setTransactionOutputHash(0)

    const block = new Block({
      index: 0,
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      transactions: [transaction],
    })

    block.mine(1, miner)

    return block
  }

  generateHash(): string {
    const txs = this.transactions.map((tx) => tx.getHash()).join('')

    return sha256(
      this.index +
        txs +
        this.timestamp +
        this.previousHash +
        this.nonce +
        this.miner,
    ).toString()
  }

  getIndex(): number {
    return this.index
  }

  getPreviousHash(): string {
    return this.previousHash
  }

  getTransactions(): Transaction[] {
    return this.transactions.slice()
  }

  getNonce(): number {
    return this.nonce
  }

  getMiner(): string {
    return this.miner
  }

  getTimestamp(): number {
    return this.timestamp
  }

  getHash(): string {
    return this.hash
  }

  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.find((tx) => tx.getHash() === hash)
  }

  hasTransaction(hash: string): boolean {
    return this.transactions.some((tx) => tx.getHash() === hash)
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction)
  }

  private validateTransactions(difficulty: number, feePerTx: number): void {
    try {
      const fees = this.transactions.filter(
        (tx) => tx.getType() === TransactionType.FEE,
      )

      if (fees.length === 0) {
        throw new ValidationError('Block does not contain fee transaction')
      }

      if (fees.length > 1) {
        throw new ValidationError('Block contains multiple fee transactions')
      }

      if (!fees[0].isTo(this.miner)) {
        throw new ValidationError(
          'Invalid fee transaction, different from miner',
        )
      }

      const totalFees =
        feePerTx *
        this.transactions.filter((tx) => tx.getType() !== TransactionType.FEE)
          .length
      this.transactions.forEach((tx) => tx.validate(difficulty, totalFees))
    } catch (error) {
      throw new Error(`Invalid block due to invalid transaction. ${error}`)
    }
  }

  private validateTimestamp(): void {
    if (this.timestamp < 1) {
      throw new ValidationError('Invalid block timestamp')
    }
  }

  private validatePreviousBlock(hash: string, index: number): void {
    if (hash !== this.previousHash) {
      throw new ValidationError('Invalid previous block hash')
    }

    if (index !== this.index - 1) {
      throw new ValidationError('Invalid block index')
    }
  }

  private validateHash(difficulty: number): void {
    const prefix = '0'.repeat(difficulty)

    if (this.hash !== this.generateHash() || !this.hash.startsWith(prefix)) {
      throw new ValidationError('Invalid block hash')
    }
  }

  private validateMining(): void {
    if (this.nonce < 1 || !this.miner) {
      throw new ValidationError('Block not mined')
    }
  }

  validate(
    previousHash: string,
    previousIndex: number,
    difficulty: number,
    feePerTx: number,
  ): void {
    try {
      this.validateTransactions(difficulty, feePerTx)
      this.validateTimestamp()
      this.validatePreviousBlock(previousHash, previousIndex)
      this.validateMining()

      this.validateHash(difficulty)
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }

  mine(difficulty: number, miner: string): void {
    this.miner = miner
    const prefix = '0'.repeat(difficulty)

    do {
      this.nonce++
      this.hash = this.generateHash()
    } while (!this.hash.startsWith(prefix))
  }
}
