import axios, { isAxiosError } from 'axios'

import { env } from '../env'
import { Block } from '../lib/block'
import { BlockInfo } from '../lib/block-info'

const BLOCKCHAIN_SERVER = `http://localhost:${env.PORT}`
const minerWallet = {
  privateKey: '123456',
  publicKey: 'msvalandro',
}

console.log('Logged as', minerWallet.publicKey)

let totalMined = 0

async function mine(): Promise<void> {
  console.log('Getting next block info...')

  const { data: responseData } = await axios.get(
    `${BLOCKCHAIN_SERVER}/blocks/next`,
  )
  const { index, previousHash, data, difficulty } =
    responseData.block as BlockInfo
  const block = new Block({ index, previousHash, data })

  console.log('Start mining block #', block.getIndex())

  block.mine(difficulty, minerWallet.publicKey)

  console.log('Block mined! Sending to blockchain...')

  try {
    await axios.post(`${BLOCKCHAIN_SERVER}/blocks`, {
      index: block.getIndex(),
      previousHash: block.getPreviousHash(),
      data: block.getData(),
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

  setTimeout(mine, 1000)
}

mine()
