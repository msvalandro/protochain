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

  getTxHash(): string {
    return this.txHash
  }

  setTxHash(txHash: string): void {
    this.txHash = txHash
  }

  generateHash(): string {
    return 'mock-tx-output-hash'
  }

  validate(): void {}
}
