import { TransactionType } from '../transaction-type'
import {
  CreateTransactionInputParams,
  TransactionInput,
} from './transaction-input'
import {
  CreateTransactionOutputParams,
  TransactionOutput,
} from './transaction-output'

export interface CreateTransactionParams {
  type?: TransactionType
  txInputs?: TransactionInput[] | CreateTransactionInputParams[]
  txOutputs?: TransactionOutput[] | CreateTransactionOutputParams[]
  timestamp?: number
  hash?: string
}

export class Transaction {
  private type: TransactionType
  private txInputs: TransactionInput[]
  private txOutputs: TransactionOutput[]
  private timestamp: number
  private hash: string

  constructor({
    type,
    txInputs,
    txOutputs,
    timestamp,
    hash,
  }: CreateTransactionParams) {
    this.type = type || TransactionType.REGULAR
    this.txInputs = txInputs
      ? txInputs.map(
          (txInput) =>
            new TransactionInput({
              ...txInput,
            } as CreateTransactionInputParams),
        )
      : []
    this.txOutputs = txOutputs
      ? txOutputs.map(
          (txInput) =>
            new TransactionOutput({
              ...txInput,
            } as CreateTransactionOutputParams),
        )
      : []

    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()

    this.txOutputs.forEach((txOutput) => txOutput.setTxHash(this.hash))
  }

  isTo(): boolean {
    // mock invalid miner
    return this.timestamp !== 99
  }

  getType(): TransactionType {
    return this.type
  }

  getTxInputs(): TransactionInput[] {
    return this.txInputs.slice()
  }

  getTxOutputs(): TransactionOutput[] {
    return this.txOutputs.slice()
  }

  getHash(): string {
    return this.hash
  }

  getFee(): number {
    return 0
  }

  setTransactionOutputHash(): void {}

  private generateHash(): string {
    return 'mock-transaction-hash'
  }

  validate(): void {}
}
