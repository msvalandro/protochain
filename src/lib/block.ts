export class Block {
  private index: number
  private hash: string

  constructor(index: number, hash: string) {
    this.index = index
    this.hash = hash
  }

  static genesis() {
    return new Block(0, '0000000000000000')
  }

  isValid() {
    if (this.index < 0) {
      return false
    }

    if (!this.hash) {
      return false
    }

    return true
  }

  getIndex() {
    return this.index
  }

  getHash() {
    return this.hash
  }
}
