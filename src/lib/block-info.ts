import { Transaction } from './transaction'

export interface BlockInfo {
  index: number
  previousHash: string
  transactions: Transaction[]
  difficulty: number
  maxDifficulty: number
  feePerTx: number
}
