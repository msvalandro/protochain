import { TransactionInput } from '../src/lib/transaction-input'

interface CreateTransactionInputParams {
  amount?: number
  signature?: string
  previousTx?: string
}

describe('TransactionInput tests', () => {
  const mockAddress =
    '029a7b3d1aefc834ed33a3c3e54287a501916a664b939c6086d78bbd03796ea4d1'
  const mockInvalidAddress =
    '02cdb5bc239246858b9feccc74f1832c4677e5c49a322e628a10735247aec4be66'
  const mockPrivateKey =
    '993dd1905ffb8780c58fefb75790f93485f0319ee41117b11923b2ea436ef974'

  function createTransaction({
    amount,
    signature,
    previousTx,
  }: CreateTransactionInputParams = {}): TransactionInput {
    return new TransactionInput({
      fromAddress: mockAddress,
      amount: amount ?? 100,
      signature,
      previousTx,
    })
  }

  it('should not throw an error while validating transaction input', () => {
    const txInput = createTransaction({ previousTx: 'mock-previous-tx' })

    txInput.sign(mockPrivateKey)

    expect(() => txInput.validate()).not.toThrow()
  })

  it('should return transaction input data', () => {
    const txInput = createTransaction()

    expect(txInput.getFromAddress()).toBe(mockAddress)
    expect(txInput.getAmount()).toBe(100)
    expect(txInput.getSignature()).toBe('')
    expect(txInput.getPreviousTx()).toBe('')
  })

  it('should throw validation error if not previous tx hash', () => {
    const txInput = createTransaction()

    expect(() => txInput.validate()).toThrow('Previous transaction is required')
  })

  it('should throw validation error if not signature', () => {
    const txInput = createTransaction({ previousTx: 'mock-previous-tx' })

    expect(() => txInput.validate()).toThrow('Signature is required')
  })

  it('should throw validation error if amount lower than 1', () => {
    const txInput = createTransaction({
      amount: 0,
      signature: 'mock-signature',
      previousTx: 'mock-previous-tx',
    })

    expect(() => txInput.validate()).toThrow('Amount must be greater than 0')
  })

  it('should throw validation error if hash is not valid', () => {
    const txInput = createTransaction({ previousTx: 'mock-previous-tx' })

    txInput.sign(mockPrivateKey)

    // eslint-disable-next-line dot-notation
    txInput['fromAddress'] = mockInvalidAddress

    expect(() => txInput.validate()).toThrow('Invalid hash')
  })
})
