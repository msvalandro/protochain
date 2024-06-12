export interface BlockInfo {
  index: number
  previousHash: string
  data: string
  difficulty: number
  maxDifficulty: number
  feePerTx: number
}
