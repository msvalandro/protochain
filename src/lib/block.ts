export class Block {
  private index: number
  private hash: string

  constructor(index: number, hash: string) {
    this.index = index
    this.hash = hash
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
}