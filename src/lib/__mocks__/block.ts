import { TransactionType } from '../transaction-type'
import { Blockchain } from './blockchain'
import { CreateTransactionParams, Transaction } from './transaction'
import { TransactionInput } from './transaction-input'
import { TransactionOutput } from './transaction-output'

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
    transaction.setTransactionOutputHash()

    const block = new Block({
      index: 0,
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      transactions: [transaction],
    })

    block.mine()

    return block
  }

  generateHash(): string {
    return 'mock-block-hash'
  }

  getIndex(): number {
    return this.index
  }

  getPreviousHash(): string {
    return this.previousHash
  }

  getTransactions(): Transaction[] {
    // mock invalid tx in block
    if (this.timestamp === 99) {
      return [new Transaction({}), new Transaction({})]
    }

    return [
      new Transaction({
        txInputs: [
          new TransactionInput({
            fromAddress: 'mock-address',
            amount: 100,
          }),
        ],
        txOutputs: [
          new TransactionOutput({ toAddress: 'mock-address', amount: 80 }),
          new TransactionOutput({ toAddress: 'mock-address', amount: 100 }),
        ],
      }),
    ]
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
    return hash === 'invalid-transaction'
  }

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction)
  }

  validate(hash: string): void {
    if (hash === 'invalid-hash') {
      throw new Error('Invalid block')
    }
  }

  mine(): void {}
}
