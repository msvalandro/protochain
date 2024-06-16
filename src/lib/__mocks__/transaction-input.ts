export interface CreateTransactionInputParams {
  fromAddress: string
  amount: number
  previousTx?: string
  signature?: string
}

export class TransactionInput {
  private fromAddress: string
  private amount: number
  private previousTx: string
  private signature: string

  constructor({
    fromAddress,
    amount,
    previousTx,
    signature,
  }: CreateTransactionInputParams) {
    this.fromAddress = fromAddress
    this.amount = amount
    this.previousTx = previousTx || ''
    this.signature = signature || ''
  }

  getFromAddress(): string {
    return this.fromAddress
  }

  getAmount(): number {
    return this.amount
  }

  getSignature(): string {
    return this.signature
  }

  getPreviousTx(): string {
    return this.previousTx
  }

  generateHash(): string {
    return 'mock-tx-input-hash'
  }

  sign(): void {}

  validate(): void {}
}
