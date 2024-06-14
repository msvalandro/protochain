import { TransactionInput } from '../src/lib/transaction-input'
import { ValidationError } from '../src/lib/validation-error'
import { Wallet } from '../src/lib/wallet'

interface CreateTransactionInputParams {
  fromAddress?: string
  amount?: number
  signature?: string
}

describe('TransactionInput tests', () => {
  const exampleInvalidPublicKey =
    '033ab50d04fe56f1a229cfb8bc78ebde962b94957c8890d45973e48f49b56673d8'

  let alice: Wallet

  function createTransactionInput({
    fromAddress,
    amount,
    signature,
  }: CreateTransactionInputParams = {}): TransactionInput {
    return new TransactionInput({
      fromAddress: fromAddress ?? alice.getPublicKey(),
      amount: amount ?? 1,
      signature: signature ?? 'mock-signature',
    })
  }

  beforeAll(() => {
    alice = new Wallet()
  })

  it('should be valid', () => {
    const txInput = createTransactionInput()

    txInput.sign(alice.getPrivateKey())

    expect(() => {
      txInput.validate()
    }).not.toThrow(ValidationError)
  })

  it('should be invalid due to signature', () => {
    const txInput = createTransactionInput({ signature: '' })

    expect(() => {
      txInput.validate()
    }).toThrow('Signature is required')
  })

  it('should be invalid due to amount', () => {
    const txInput = createTransactionInput({ amount: 0 })

    txInput.sign(alice.getPrivateKey())

    expect(() => {
      txInput.validate()
    }).toThrow('Amount must be greater than 0')
  })

  it('should be invalid due to hash', () => {
    const txInput = createTransactionInput()

    txInput.sign(alice.getPrivateKey())

    // eslint-disable-next-line dot-notation
    txInput['fromAddress'] = exampleInvalidPublicKey

    expect(() => {
      txInput.validate()
    }).toThrow('Invalid hash')
  })
})
