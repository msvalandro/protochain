import sha256 from 'crypto-js/sha256'

import { TransactionInput } from './transaction-input'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

export interface CreateTransactionParams {
  type?: TransactionType
  to: string
  txInput: TransactionInput
  timestamp?: number
  hash?: string
}

export class Transaction {
  private type: TransactionType
  private to: string
  private txInput: TransactionInput
  private timestamp: number
  private hash: string

  constructor({ type, to, txInput, timestamp, hash }: CreateTransactionParams) {
    this.type = type || TransactionType.REGULAR
    this.to = to
    this.txInput = new TransactionInput(txInput)

    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()
  }

  getType(): TransactionType {
    return this.type
  }

  getTxInput(): TransactionInput {
    return this.txInput
  }

  getHash(): string {
    return this.hash
  }

  private generateHash(): string {
    return sha256(
      this.type + this.to + this.txInput.generateHash() + this.timestamp,
    ).toString()
  }

  private validateTo(): void {
    if (!this.to) {
      throw new ValidationError('Invalid transaction to')
    }
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid transaction hash')
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
