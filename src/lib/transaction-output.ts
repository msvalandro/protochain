import sha256 from 'crypto-js/sha256'

import { ValidationError } from './validation-error'

export interface CreateTransactionOutputParams {
  toAddress: string
  amount: number
  txHash?: string
}

export class TransactionOutput {
  private toAddress: string
  private amount: number
  private txHash: string

  constructor({ toAddress, amount, txHash }: CreateTransactionOutputParams) {
    this.toAddress = toAddress
    this.amount = amount
    this.txHash = txHash || ''
  }

  getToAddress(): string {
    return this.toAddress
  }

  getAmount(): number {
    return this.amount
  }

  setTxHash(txHash: string): void {
    this.txHash = txHash
  }

  generateHash(): string {
    return sha256(this.toAddress + this.amount + this.txHash).toString()
  }

  validate(): void {
    if (this.amount < 1) {
      throw new ValidationError('Invalid transaction output amount')
    }
  }
}
