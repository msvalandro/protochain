import { ValidationError } from '../validation-error'

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
    return this.hash || 'abc'
  }

  getIndex(): number {
    return this.index
  }

  getHash(): string {
    return this.hash
  }

  validate(previousHash: string, previousIndex: number): void {
    if (!previousHash || previousIndex < 0 || this.index < 0) {
      throw new ValidationError('Invalid mocked block')
    }
  }
}
