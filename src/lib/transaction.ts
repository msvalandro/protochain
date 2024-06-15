import sha256 from 'crypto-js/sha256'

import {
  CreateTransactionInputParams,
  TransactionInput,
} from './transaction-input'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

export interface CreateTransactionParams {
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

  isTo(to: string): boolean {
    return this.to === to
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
    return sha256(
      this.type + this.to + this.txInput?.generateHash() + this.timestamp,
    ).toString()
  }

  private validateTo(): void {
    if (!this.to) {
      throw new ValidationError('Invalid transaction to')
    }
  }

  private validateTransactionInput(): void {
    if (!this.txInput) {
      return
    }

    this.txInput.validate()
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid transaction hash')
    }
  }

  validate(): void {
    try {
      this.validateTo()
      this.validateTransactionInput()
      this.validateHash()
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }
}
