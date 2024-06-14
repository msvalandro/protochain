import { TransactionType } from '../transaction-type'
import { ValidationError } from '../validation-error'
import {
  CreateTransactionInputParams,
  TransactionInput,
} from './transaction-input'

interface CreateTransactionParams {
  type?: TransactionType
  to: string
  txInput?: TransactionInput | CreateTransactionInputParams
  timestamp?: number
  hash?: string
}

export class Transaction {
  private type: TransactionType
  private to: string
  private txInput?: TransactionInput
  private timestamp: number
  private hash: string

  constructor({ type, to, txInput, timestamp, hash }: CreateTransactionParams) {
    this.type = type || TransactionType.REGULAR
    this.to = to
    this.txInput =
      txInput &&
      new TransactionInput({ ...txInput } as CreateTransactionInputParams)

    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()
  }

  getType(): TransactionType {
    return this.type
  }

  getTxInput(): TransactionInput | undefined {
    return this.txInput
  }

  getHash(): string {
    return this.hash
  }

  private generateHash(): string {
    return this.hash || 'abc'
  }

  private validateTo(): void {
    if (!this.to) {
      throw new ValidationError('Invalid mocked transaction to')
    }
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid mocked transaction hash')
    }
  }

  validate(): void {
    try {
      this.validateTo()
      this.validateHash()
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }
}
