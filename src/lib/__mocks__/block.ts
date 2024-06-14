import { TransactionType } from '../transaction-type'
import { ValidationError } from '../validation-error'
import { Transaction } from './transaction'

interface CreateBlockParams {
  index: number
  previousHash: string
  transactions: Transaction[]
}

export class Block {
  private index: number
  private hash: string
  private previousHash: string
  private transactions: Transaction[]
  private timestamp: number

  constructor({ index, previousHash, transactions }: CreateBlockParams) {
    this.index = index
    this.previousHash = previousHash
    this.transactions = transactions
    this.timestamp = Date.now()
    this.hash = this.generateHash()
  }

  static genesis(): Block {
    const block = new Block({
      index: 0,
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      transactions: [
        new Transaction({
          type: TransactionType.FEE,
          to: 'genesis-block',
        }),
      ],
    })

    block.mine()

    return block
  }

  private generateHash(): string {
    return this.hash || 'abc'
  }

  getIndex(): number {
    return this.index
  }

  getHash(): string {
    return this.hash
  }

  getTransaction(): Transaction {
    return new Transaction({ to: 'mock-wallet', hash: 'transaction-hash' })
  }

  getTransactions(): Transaction[] {
    return this.transactions.slice()
  }

  hasTransaction(): boolean {
    return this.transactions[0]?.getHash() === 'transaction-hash'
  }

  validate(previousHash: string, previousIndex: number): void {
    if (!previousHash || previousIndex < 0 || this.index < 0) {
      throw new ValidationError('Invalid mocked block')
    }
  }

  mine(): void {}
}
