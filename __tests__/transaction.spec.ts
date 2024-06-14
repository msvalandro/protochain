import { Transaction } from '../src/lib/transaction'
import { TransactionInput } from '../src/lib/transaction-input'
import { TransactionType } from '../src/lib/transaction-type'
import { ValidationError } from '../src/lib/validation-error'

jest.mock('../src/lib/transaction-input')

interface CreateTransactionParams {
  type?: TransactionType
  to?: string
  txInput?: TransactionInput
  timestamp?: number
  hash?: string
}

describe('Transaction tests', () => {
  function createTransaction({
    type,
    to,
    txInput,
    timestamp,
    hash,
  }: CreateTransactionParams = {}): Transaction {
    return new Transaction({
      type: type ?? TransactionType.REGULAR,
      to: to ?? 'mock-wallet',
      txInput: txInput ?? undefined,
      timestamp: timestamp ?? 1,
      hash,
    })
  }

  it('should be a valid regular transaction', () => {
    const transaction = createTransaction({
      txInput: new TransactionInput({
        fromAddress: 'mock-wallet',
        amount: 1,
        signature: 'mock-signature',
      }),
    })

    expect(() => {
      transaction.validate()
    }).not.toThrow(ValidationError)
  })

  it('should be a valid fee transaction', () => {
    const transaction = createTransaction({ type: TransactionType.FEE })

    expect(() => {
      transaction.validate()
    }).not.toThrow(ValidationError)
  })

  it('should return a valid transaction', () => {
    const txInput = new TransactionInput({
      fromAddress: 'mock-wallet',
      amount: 1,
      signature: 'mock-signature',
    })
    const transaction = createTransaction({ txInput, hash: 'mock-hash' })

    expect(transaction.getType()).toBe(TransactionType.REGULAR)
    expect(transaction.getTxInput()?.getFromAddress()).toBe('mock-wallet')
    expect(transaction.getHash()).toBe('mock-hash')
  })

  it('should be an invalid transaction due to "to"', () => {
    const transaction = new Transaction({ to: '' })

    expect(() => {
      transaction.validate()
    }).toThrow('Invalid transaction to')
  })

  it('should be an invalid transaction if change existing hash', () => {
    const transaction = createTransaction()

    // eslint-disable-next-line dot-notation
    transaction['hash'] = 'invalid-hash'

    expect(() => {
      transaction.validate()
    }).toThrow('Invalid transaction hash')
  })
})
