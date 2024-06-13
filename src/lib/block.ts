import sha256 from 'crypto-js/sha256'

import { Transaction } from './transaction'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

interface CreateBlockParams {
  index: number
  previousHash: string
  transactions: Transaction[]
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
    this.transactions = transactions
    this.nonce = nonce ?? 0
    this.miner = miner ?? ''

    this.timestamp = timestamp ?? Date.now()
    this.hash = hash ?? this.generateHash()
  }

  static genesis(): Block {
    const block = new Block({
      index: 0,
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          data: 'Genesis Transaction',
        }),
      ],
    })

    block.mine(0, 'genesis')

    return block
  }

  private generateHash(): string {
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

  private validateTransactions(): void {
    const fees = this.transactions.filter(
      (tx) => tx.getType() === TransactionType.FEE,
    )

    if (fees.length > 1) {
      throw new ValidationError('Block contains multiple fee transactions')
    }

    try {
      this.transactions.forEach((tx) => tx.validate())
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
    if (!this.nonce || !this.miner) {
      throw new ValidationError('Block not mined')
    }
  }

  validate(
    previousHash: string,
    previousIndex: number,
    difficulty: number,
  ): void {
    try {
      this.validateTransactions()
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
