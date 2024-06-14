import sha256 from 'crypto-js/sha256'
import { ECPairFactory } from 'ecpair'
import * as ecc from 'tiny-secp256k1'

import { ValidationError } from './validation-error'

const ECPair = ECPairFactory(ecc)

interface CreateTransactionInputParams {
  fromAddress: string
  amount: number
  signature: string
}

export class TransactionInput {
  fromAddress: string
  amount: number
  signature: string

  constructor({
    fromAddress,
    amount,
    signature,
  }: CreateTransactionInputParams) {
    this.fromAddress = fromAddress
    this.amount = amount
    this.signature = signature
  }

  generateHash(): string {
    return sha256(this.fromAddress + this.amount).toString()
  }

  sign(privateKey: string): void {
    const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'))
    const hash = this.generateHash()

    this.signature = keyPair.sign(Buffer.from(hash, 'hex')).toString('hex')
  }

  private validateSignature(): void {
    if (!this.signature) {
      throw new ValidationError('Signature is required')
    }
  }

  private validateAmount(): void {
    if (this.amount < 1) {
      throw new ValidationError('Amount must be greater than 0')
    }
  }

  private validateHash(): void {
    const hash = Buffer.from(this.generateHash(), 'hex')
    const isValid = ECPair.fromPublicKey(
      Buffer.from(this.fromAddress, 'hex'),
    ).verify(hash, Buffer.from(this.signature, 'hex'))

    if (!isValid) {
      throw new ValidationError('Invalid hash')
    }
  }

  validate(): void {
    try {
      this.validateSignature()
      this.validateAmount()
      this.validateHash()
    } catch (error) {
      console.error(error)
      throw new ValidationError(`Invalid transaction input. ${error}`)
    }
  }
}
