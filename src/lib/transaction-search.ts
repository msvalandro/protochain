import { Transaction } from './transaction'

export interface TransactionSearch {
  transaction: Transaction | undefined
  mempoolIndex: number
  blockIndex: number
}
