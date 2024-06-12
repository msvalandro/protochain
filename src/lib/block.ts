import sha256 from 'crypto-js/sha256'

import { ValidationError } from './validation-error'

interface CreateBlockParams {
  index: number
  previousHash: string
  data: string
}

export class Block {
  private index: number
  private hash: string
  private previousHash: string
  private data: string
  private timestamp: number

  constructor({ index, previousHash, data }: CreateBlockParams) {
    this.index = index
    this.previousHash = previousHash
    this.data = data
    this.timestamp = Date.now()
    this.hash = this.generateHash()
  }

  static genesis(): Block {
    return new Block({
      index: 0,
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      data: 'Genesis Block',
    })
  }

  private generateHash(): string {
    return sha256(
      this.index + this.data + this.timestamp + this.previousHash,
    ).toString()
  }

  getIndex(): number {
    return this.index
  }

  getHash(): string {
    return this.hash
  }

  private validateData(): void {
    if (!this.data) {
      throw new ValidationError('Invalid block data')
    }
  }

  private validateTimestamp(): void {
    if (this.timestamp < 1) {
      throw new ValidationError('Invalid block timestamp')
    }
  }

  private validatePreviousBlock(hash: string, index: number): void {
    if (hash !== this.previousHash) {
      throw new ValidationError('Invalid previous block hash')
    }

    if (index !== this.index - 1) {
      throw new ValidationError('Invalid block index')
    }
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new ValidationError('Invalid block hash')
    }
  }

  validate(previousHash: string, previousIndex: number): void {
    try {
      this.validateData()
      this.validateTimestamp()
      this.validatePreviousBlock(previousHash, previousIndex)
      this.validateHash()
    } catch (error) {
      console.error((error as ValidationError).message)
      throw error
    }
  }
}
