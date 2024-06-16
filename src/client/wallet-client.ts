import { stdin, stdout } from 'node:process'
import readline from 'node:readline/promises'

import axios, { isAxiosError } from 'axios'

import { env } from '../env'
import { Transaction } from '../lib/transaction'
import { TransactionInput } from '../lib/transaction-input'
import { TransactionOutput } from '../lib/transaction-output'
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

  console.log('Your wallet is', myWalletPublicKey)
  const toWallet = await rl.question('To wallet: ')

  if (toWallet.length !== 66) {
    console.log('Invalid wallet')
    await preMenu()
  }

  const amountStr = await rl.question('Enter the amount: ')
  const amount = parseInt(amountStr)

  if (!amount) {
    console.log('Invalid amount')
    await preMenu()
  }

  try {
    const { data: walletData } = await axios.get(
      `${BLOCKCHAIN_SERVER_URL}/wallet/${myWalletPublicKey}`,
    )
    const { balance, fee, utxo } = walletData as {
      balance: number
      fee: number
      utxo: { txHash: string }[]
    }

    if (balance < amount + fee) {
      console.error('Insufficient funds')
      await preMenu()
      return
    }

    const txInput = new TransactionInput({
      fromAddress: myWalletPublicKey,
      amount,
      previousTx: utxo[0].txHash,
    })
    txInput.sign(myWalletPrivateKey)

    const txOutput = new TransactionOutput({ toAddress: toWallet, amount })
    const tx = new Transaction({ txInputs: [txInput], txOutputs: [txOutput] })
    tx.setTransactionOutputHash(0)

    const { data } = await axios.post(
      `${BLOCKCHAIN_SERVER_URL}/transactions`,
      tx,
    )

    console.log('Transaction accepted. Waiting for the miners...')
    console.log('Transaction hash:', data.transaction.hash)
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.response?.data)
    } else {
      console.error((error as Error).message)
    }
  }

  await preMenu()
}

async function searchTransaction(): Promise<void> {
  console.clear()

  const txHash = await rl.question('Enter the transaction hash: ')

  const { data } = await axios.get(
    `${BLOCKCHAIN_SERVER_URL}/transactions/${txHash}`,
  )

  await preMenu()
}

async function preMenu(): Promise<void> {
  await rl.question('\nPress any key to continue...')
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
  console.log('4. Send transaction')
  console.log('5. Search transaction')
  console.log('0. Exit\n')

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
    case '5':
      await searchTransaction()
      break
    case '0':
      console.log('Goodbye!')
      process.exit(0)
      break
    default: {
      console.log('Invalid option')
      await menu()
    }
  }
}

menu()
