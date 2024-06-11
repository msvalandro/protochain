import sha256 from 'crypto-js/sha256'

export class Block {
  private index: number
  private hash: string
  private previousHash: string
  private data: string
  private timestamp: number

  constructor(index: number, previousHash: string, data: string) {
    this.index = index
    this.hash = this.generateHash()
    this.previousHash = previousHash
    this.data = data
    this.timestamp = Date.now()
  }

  static genesis() {
    return new Block(0, '0000000000000000', 'Genesis Block')
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

  isValid() {
    if (this.index < 0 || !this.previousHash || !this.data) {
      return false
    }

    return true
  }
}
