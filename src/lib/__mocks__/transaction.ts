import { TransactionType } from '../transaction-type'
import { ValidationError } from '../validation-error'

interface CreateTransactionParams {
  type?: TransactionType
  data: string
  timestamp?: number
  hash?: string
}

export class Transaction {
  private type: TransactionType
  private data: string
  private timestamp: number
  private hash: string

  constructor({ type, data, timestamp, hash }: CreateTransactionParams) {
    this.type = type || TransactionType.REGULAR
    this.data = data
    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()
  }

  getType(): TransactionType {
    return this.type
  }

  getData(): string {
    return this.data
  }

  getHash(): string {
    return this.hash
  }

  private generateHash(): string {
    return 'abc'
  }

  private validateData(): void {
    if (!this.data) {
      throw new ValidationError('Invalid mocked transaction data')
    }
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid mocked transaction hash')
    }
  }

  validate(): void {
    try {
      this.validateData()
      this.validateHash()
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }
}