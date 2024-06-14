export interface CreateTransactionInputParams {
  fromAddress: string
  amount: number
  signature: string
}

export class TransactionInput {
  private fromAddress: string
  private amount: number
  private signature: string

  constructor({
    fromAddress,
    amount,
    signature,
  }: CreateTransactionInputParams) {
    this.fromAddress = fromAddress
    this.amount = amount
    this.signature = signature
  }

  getFromAddress(): string {
    return 'mock-wallet'
  }

  generateHash(): string {
    return 'mock-hash'
  }

  sign(): void {
    this.signature = 'mock-signature'
  }

  validate(): void {}
}
