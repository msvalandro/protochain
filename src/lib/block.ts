import sha256 from 'crypto-js/sha256'

export class Block {
  private index: number
  private hash: string
  private previousHash: string
  private data: string
  private timestamp: number

  constructor(index: number, previousHash: string, data: string) {
    this.index = index
    this.previousHash = previousHash
    this.data = data
    this.timestamp = Date.now()
    this.hash = this.generateHash()
  }

  static genesis(): Block {
    return new Block(
      0,
      '0000000000000000000000000000000000000000000000000000000000000000',
      'Genesis Block',
    )
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
      throw new Error('Invalid data')
    }
  }

  private validatePreviousBlock(hash: string, index: number): void {
    if (hash !== this.previousHash) {
      throw new Error('Invalid previous hash')
    }

    if (index !== this.index - 1) {
      throw new Error('Invalid index')
    }
  }

  private validateHash(): void {
    if (this.hash !== this.generateHash()) {
      throw new Error('Invalid hash')
    }
  }

  isValid(previousHash: string, previousIndex: number): boolean {
    try {
      this.validateData()
      this.validatePreviousBlock(previousHash, previousIndex)
      this.validateHash()

      return true
    } catch (error) {
      console.error((error as Error).message)
      return false
    }
  }
}
