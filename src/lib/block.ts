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

  static genesis() {
    return new Block(
      0,
      '0000000000000000000000000000000000000000000000000000000000000000',
      'Genesis Block',
    )
  }

  private generateHash() {
    return sha256(
      this.index + this.data + this.timestamp + this.previousHash,
    ).toString()
  }

  getIndex() {
    return this.index
  }

  getHash() {
    return this.hash
  }

  private validateBlockData() {
    return this.index >= 0 && this.previousHash && this.data
  }

  private validatePreviousBlockData(hash: string, index: number) {
    return hash === this.previousHash && index === this.index - 1
  }

  private validateHash() {
    return this.hash === this.generateHash()
  }

  isValid(previousHash: string, previousIndex: number) {
    if (!this.validateBlockData()) {
      return false
    }

    if (!this.validatePreviousBlockData(previousHash, previousIndex)) {
      return false
    }

    if (!this.validateHash()) {
      return false
    }

    return true
  }
}
