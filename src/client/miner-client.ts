import axios, { isAxiosError } from 'axios'

import { env } from '../env'
import { Block } from '../lib/block'
import { BlockInfo } from '../lib/block-info'
import { Transaction } from '../lib/transaction'
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

  const { index, previousHash, transactions, difficulty } =
    responseData.block as BlockInfo

  const block = new Block({
    index,
    previousHash,
    transactions,
    miner: minerWallet.getPublicKey(),
  })

  block.addTransaction(
    new Transaction({
      to: minerWallet.getPublicKey(),
      type: TransactionType.FEE,
    }),
  )
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
