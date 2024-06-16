import axios, { isAxiosError } from 'axios'

import { env } from '../env'
import { Block } from '../lib/block'
import { BlockInfo } from '../lib/block-info'
import { Blockchain } from '../lib/blockchain'
import { Transaction } from '../lib/transaction'
import { TransactionOutput } from '../lib/transaction-output'
import { TransactionType } from '../lib/transaction-type'
import { Wallet } from '../lib/wallet'

const minerWallet = new Wallet(env.WALLET_PRIVATE_KEY)

console.log('Logged as', minerWallet.getPublicKey())

let totalMined = 0

async function mine(): Promise<void> {
  console.log('Getting next block info...')

  const { data: responseData } = await axios.get(
    `${env.BLOCKCHAIN_SERVER_URL}/blocks/next`,
  )

  if (!responseData.block) {
    console.log('No blocks to mine. Waiting 5 seconds...')

    setTimeout(() => {
      mine()
    }, 5000)

    return
  }

  const {
    index,
    previousHash,
    transactions,
    difficulty,
    maxDifficulty,
    feePerTx,
  } = responseData.block as BlockInfo

  const block = new Block({
    index,
    previousHash,
    transactions,
    miner: minerWallet.getPublicKey(),
  })

  let rewardAmount = 0

  if (difficulty <= maxDifficulty) {
    rewardAmount += Blockchain.getRewardAmount(difficulty)
  }

  const fees = block
    .getTransactions()
    .map((tx) => tx.getFee())
    .reduce((a, b) => a + b, 0)
  const feeCheck = block.getTransactions().length * feePerTx

  if (fees < feeCheck) {
    console.error('Low fees. Await for more transactions')
    setTimeout(() => {
      mine()
    }, 5000)
    return
  }

  rewardAmount += fees

  const rewardTransaction = new Transaction({
    txOutputs: [
      new TransactionOutput({
        toAddress: minerWallet.getPublicKey(),
        amount: rewardAmount,
      }),
    ],
    type: TransactionType.FEE,
  })

  rewardTransaction.setTransactionOutputHash(0)
  block.addTransaction(rewardTransaction)
  block.generateHash()

  console.log('Start mining block #', block.getIndex())

  block.mine(difficulty, minerWallet.getPublicKey())

  console.log('Block mined! Sending to blockchain...')

  try {
    await axios.post(`${env.BLOCKCHAIN_SERVER_URL}/blocks`, {
      index: block.getIndex(),
      previousHash: block.getPreviousHash(),
      transactions: block.getTransactions(),
      nonce: block.getNonce(),
      miner: block.getMiner(),
      timestamp: block.getTimestamp(),
      hash: block.getHash(),
    })

    console.log('Block sent and accepted!')

    totalMined++

    console.log('Total mined blocks:', totalMined)
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.response?.data)
    }

    console.error((error as Error).message)
  }

  setTimeout(() => {
    mine()
  }, 1000)
}

mine()
