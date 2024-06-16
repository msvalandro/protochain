import sha256 from 'crypto-js/sha256'

import { Blockchain } from './blockchain'
import {
  CreateTransactionInputParams,
  TransactionInput,
} from './transaction-input'
import {
  CreateTransactionOutputParams,
  TransactionOutput,
} from './transaction-output'
import { TransactionType } from './transaction-type'
import { ValidationError } from './validation-error'

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

  isTo(to: string): boolean {
    return this.txOutputs.some((txOuput) => txOuput.getToAddress() === to)
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
    if (!this.txInputs.length) {
      return 0
    }

    const inputSum = this.txInputs.reduce(
      (acc, txInput) => acc + txInput.getAmount(),
      0,
    )
    const outputSum = this.txOutputs.reduce(
      (acc, txOutput) => acc + txOutput.getAmount(),
      0,
    )

    return inputSum - outputSum
  }

  setTransactionOutputHash(index: number): void {
    this.txOutputs[index].setTxHash(this.hash)
  }

  private generateHash(): string {
    const from = this.txInputs
      .map((txInput) => txInput.getSignature())
      .join(',')
    const to = this.txOutputs
      .map((txOutput) => txOutput.generateHash())
      .join(',')

    return sha256(this.type + from + to + this.timestamp).toString()
  }

  private validateTransactionInputs(): void {
    if (this.type !== TransactionType.FEE && !this.txInputs.length) {
      throw new ValidationError('Invalid transaction transaction inputs')
    }

    this.txInputs.forEach((txInput) => txInput.validate())
  }

  private validateTransactionOutputs(): void {
    if (!this.txOutputs.length) {
      throw new ValidationError('Invalid transaction transaction outputs')
    }

    this.txOutputs.forEach((txOutput) => txOutput.validate())
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid transaction hash')
    }
  }

  private validateTransactionsAmount(): void {
    if (this.type === TransactionType.FEE) {
      return
    }

    const inputAmount = this.txInputs.reduce(
      (acc, txInput) => acc + txInput.getAmount(),
      0,
    )
    const outputAmount = this.txOutputs.reduce(
      (acc, txOutput) => acc + txOutput.getAmount(),
      0,
    )

    if (inputAmount < outputAmount) {
      throw new ValidationError(
        'Inputs amount must be equal or greater than outputs amount',
      )
    }
  }

  private validateTransactionOutputsHash(): void {
    this.txOutputs.forEach((txOutput) => {
      if (txOutput.getTxHash() !== this.hash) {
        throw new ValidationError('Invalid transaction output hash')
      }
    })
  }

  private validateFeesAndReward(difficulty: number, totalFees: number): void {
    if (this.type === TransactionType.FEE) {
      const fee = this.txOutputs[0].getAmount()

      if (fee > Blockchain.getRewardAmount(difficulty) + totalFees) {
        throw new ValidationError('Invalid transaction reward')
      }
    }
  }

  validate(difficulty: number, totalFees: number): void {
    try {
      this.validateTransactionInputs()
      this.validateTransactionOutputs()
      this.validateHash()
      this.validateTransactionsAmount()
      this.validateTransactionOutputsHash()
      this.validateFeesAndReward(difficulty, totalFees)
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }
}
