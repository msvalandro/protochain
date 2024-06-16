import { Transaction } from '../src/lib/transaction'
import { TransactionInput } from '../src/lib/transaction-input'
import { TransactionOutput } from '../src/lib/transaction-output'
import { TransactionType } from '../src/lib/transaction-type'

jest.mock('../src/lib/transaction-input')
jest.mock('../src/lib/transaction-output')

interface CreateTransactionParams {
  type?: TransactionType
  hash?: string
  txInputs?: TransactionInput[]
  txOutputs?: TransactionOutput[]
  toAddress?: string
}

describe('Transaction tests', () => {
  const mockDifficulty = 2
  const mockTotalFees = 8

  function createTransaction({
    type,
    hash,
    txOutputs,
    toAddress,
  }: CreateTransactionParams = {}): Transaction {
    const txInputs = [
      new TransactionInput({ fromAddress: 'mock-address', amount: 100 }),
    ]
    const mockTxOutputs = txOutputs ?? [
      new TransactionOutput({
        toAddress: toAddress ?? 'mock-address',
        amount: 80,
      }),
    ]

    return new Transaction({ type, hash, txInputs, txOutputs: mockTxOutputs })
  }

  function createEmptyTransaction(): Transaction {
    return new Transaction({})
  }

  it('should not throw an error while validating transaction', () => {
    const transaction = createTransaction()

    expect(() =>
      transaction.validate(mockDifficulty, mockTotalFees),
    ).not.toThrow()
  })

  it('should return transaction data', () => {
    const transaction = createEmptyTransaction()

    expect(transaction.getType()).toBe(TransactionType.REGULAR)
    expect(transaction.getTxInputs().length).toBe(0)
    expect(transaction.getTxOutputs().length).toBe(0)
  })

  it('should return transaction hash', () => {
    const transaction = createTransaction({ hash: 'mock-hash' })

    expect(transaction.getHash()).toBe('mock-hash')
  })

  it('should return if transaction is to same wallet', () => {
    const transaction = createTransaction({ toAddress: 'mock-to-address' })

    expect(transaction.isTo('mock-to-address')).toBe(true)
  })

  it('should return transaction fee 0 if no transaction inputs', () => {
    const transaction = createEmptyTransaction()

    expect(transaction.getFee()).toBe(0)
  })

  it('should return transaction fee', () => {
    const transaction = createTransaction()

    expect(transaction.getFee()).toBe(20)
  })

  it('should set transaction output hash', () => {
    const transaction = createTransaction({ hash: 'mock-hash' })

    transaction.setTransactionOutputHash(0)

    expect(transaction.getTxOutputs()[0].getTxHash()).toBe('mock-hash')
  })

  it('should throw validation error if no transaction inputs', () => {
    const transaction = createEmptyTransaction()

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Invalid transaction transaction inputs',
    )
  })

  it('should throw validation error if no transaction outputs', () => {
    const transaction = createTransaction({ txOutputs: [] })

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Invalid transaction transaction outputs',
    )
  })

  it('should throw validation error if invalid hash', () => {
    const transaction = createTransaction()

    // eslint-disable-next-line dot-notation
    transaction['hash'] = 'invalid-hash'

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Invalid transaction hash',
    )
  })

  it('should throw validation error if invalid transaction inputs/outputs amount', () => {
    const transaction = createTransaction({
      txOutputs: [
        new TransactionOutput({ toAddress: 'mock-address', amount: 120 }),
      ],
    })

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Inputs amount must be equal or greater than outputs amount',
    )
  })

  it('should not validate transaction inputs/outputs amount if type FEE', () => {
    const transaction = createTransaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({ toAddress: 'mock-address', amount: 120 }),
      ],
    })

    expect(() =>
      transaction.validate(mockDifficulty, mockTotalFees),
    ).not.toThrow()
  })

  it('should throw validation error if invalid transaction output hash', () => {
    const transaction = createTransaction()

    // eslint-disable-next-line dot-notation
    transaction['txOutputs'][0]['txHash'] = 'invalid-hash'

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Invalid transaction output hash',
    )
  })

  it('should throw validation error if invalid fees and reward', () => {
    const transaction = createTransaction({
      type: TransactionType.FEE,
      txOutputs: [
        new TransactionOutput({ toAddress: 'mock-address', amount: 700 }),
      ],
    })

    expect(() => transaction.validate(mockDifficulty, mockTotalFees)).toThrow(
      'Invalid transaction reward',
    )
  })
})
