import { Transaction } from '../src/lib/transaction'
import { TransactionType } from '../src/lib/transaction-type'
import { ValidationError } from '../src/lib/validation-error'

describe('Transaction tests', () => {
  it('should be a valid regular transaction', () => {
    const transaction = new Transaction({ data: 'Transaction 1' })

    expect(() => {
      transaction.validate()
    }).not.toThrow(ValidationError)
  })

  it('should be a valid fee transaction', () => {
    const transaction = new Transaction({
      type: TransactionType.FEE,
      data: 'Transaction 1',
    })

    expect(() => {
      transaction.validate()
    }).not.toThrow(ValidationError)
  })

  it('should return a valid transaction type', () => {
    const transaction = new Transaction({
      data: 'Transaction 1',
      timestamp: 1,
      hash: 'abc',
    })

    expect(transaction.getType()).toBe(TransactionType.REGULAR)
    expect(transaction.getData()).toBe('Transaction 1')
    expect(transaction.getHash()).toBe('abc')
  })

  it('should be an invalid transaction due to data', () => {
    const transaction = new Transaction({ data: '' })

    expect(() => {
      transaction.validate()
    }).toThrow('Invalid transaction data')
  })

  it('should be an invalid transaction if change existing hash', () => {
    const transaction = new Transaction({ data: 'Transaction 1' })

    // eslint-disable-next-line dot-notation
    transaction['hash'] = 'invalid-hash'

    expect(() => {
      transaction.validate()
    }).toThrow('Invalid transaction hash')
  })
})
