import { stdin, stdout } from 'node:process'
import readline from 'node:readline/promises'

import axios from 'axios'

import { env } from '../env'
import { Wallet } from '../lib/wallet'

const { BLOCKCHAIN_SERVER_URL } = env

let myWalletPublicKey = ''
let myWalletPrivateKey = ''

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
})

async function createWallet(): Promise<void> {
  console.clear()

  const wallet = new Wallet()

  myWalletPublicKey = wallet.getPublicKey()
  myWalletPrivateKey = wallet.getPrivateKey()

  console.log('Wallet created!')
  console.log('Public key:', myWalletPublicKey)
  console.log('Private key:', myWalletPrivateKey)

  await preMenu()
}

async function recoverWallet(): Promise<void> {
  console.clear()

  const wifOrPrivateKey = await rl.question('Enter your private key or WIF: ')

  try {
    const wallet = new Wallet(wifOrPrivateKey)

    myWalletPublicKey = wallet.getPublicKey()
    myWalletPrivateKey = wallet.getPrivateKey()

    console.log('Wallet recovered!')
    console.log('Public key:', myWalletPublicKey)
    console.log('Private key:', myWalletPrivateKey)
  } catch (error) {
    console.error('Invalid private key')
  }

  await preMenu()
}

async function balance(): Promise<void> {
  console.clear()

  if (!myWalletPublicKey) {
    console.log('You must create or recover a wallet first')
    await preMenu()
    return
  }

  await preMenu()
  // TODO: implement balance
}

async function sendTransaction(): Promise<void> {
  console.clear()

  if (!myWalletPublicKey) {
    console.log('You must create or recover a wallet first')
    await preMenu()
  }

  // TODO: send transaction

  // rl.question('Enter the receiver public key: ', (to) => {
  //   rl.question('Enter the amount: ', (amount) => {
  //     axios
  //       .post(`${BLOCKCHAIN_SERVER_URL}/transactions`, {
  //         from: myWalletPublicKey,
  //         to,
  //         amount: Number(amount),
  //       })
  //       .then(() => {
  //         console.log('Transaction sent!')
  //       })
  //       .catch((error) => {
  //         console.error('Error sending transaction:', error)
  //       })
  //       .finally(() => {
  //         menu()
  //       })
  //   })
  // })
}

async function preMenu(): Promise<void> {
  console.clear()

  await rl.question('Press any key to continue...')
  await menu()
}

async function menu(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.clear()

  if (myWalletPublicKey) {
    console.log('Logged as', myWalletPublicKey)
  } else {
    console.log('Not logged\n')
  }

  console.log('1. Create wallet')
  console.log('2. Recover wallet')
  console.log('3. Balance')
  console.log('4. Send transaction\n')

  const choice = await rl.question('Choose your option: ')

  switch (choice) {
    case '1':
      await createWallet()
      break
    case '2':
      await recoverWallet()
      break
    case '3':
      await balance()
      break
    case '4':
      await sendTransaction()
      break
    default: {
      console.log('Invalid option')
      await menu()
    }
  }
}

menu()
