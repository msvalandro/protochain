import { env } from '../env'
import { Wallet } from '../lib/wallet'

const wallet = new Wallet(env.WALLET_PRIVATE_KEY)

console.log(wallet)
