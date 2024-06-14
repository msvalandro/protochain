import { Block } from '../src/lib/block'
import { Transaction } from '../src/lib/transaction'
import { TransactionInput } from '../src/lib/transaction-input'
import { TransactionType } from '../src/lib/transaction-type'
import { ValidationError } from '../src/lib/validation-error'

jest.mock('../src/lib/transaction')
jest.mock('../src/lib/transaction-input')

interface CreateBlockParams {
  index?: number
  previousHash?: string
  transactions?: Transaction[]
}

describe('Block tests', () => {
  const exampleDifficulty = 0
  const exampleMiner = 'miner'
  let genesis: Block

  function createBlock({
    index,
    previousHash,
    transactions,
  }: CreateBlockParams = {}): Block {
    return new Block({
      index: index ?? 1,
      previousHash: previousHash ?? genesis.getHash(),
      transactions: transactions ?? [
        new Transaction({
          to: 'mock-wallet',
          txInput: new TransactionInput({
            fromAddress: 'mock-wallet',
            amount: 1,
            signature: 'mock-signature',
          }),
        }),
      ],
      nonce: 0,
      miner: 'miner',
      timestamp: 1,
      hash: 'abc',
    })
  }

  beforeAll(() => {
    genesis = Block.genesis()
  })

  it('should be valid', () => {
    const block = createBlock()

    block.mine(exampleDifficulty, exampleMiner)

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).not.toThrow(ValidationError)
  })

  it('should returns a valid block', () => {
    const block = createBlock()

    expect(block.getIndex()).toBe(1)
    expect(block.getPreviousHash()).toBe(genesis.getHash())
    expect(block.getTransactions()[0].getTxInput()?.getFromAddress()).toBe(
      'mock-wallet',
    )
    expect(block.getNonce()).toBe(0)
    expect(block.getMiner()).toBe('miner')
    expect(block.getTimestamp()).toBeGreaterThan(0)
    expect(block.getHash()).not.toBe('')
  })

  it('should not be valid due to index', () => {
    const block = createBlock({ index: -1 })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block index')
  })

  it('should not be valid due to previous hash', () => {
    const block = createBlock({ previousHash: '' })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid previous block hash')
  })

  it('should not be valid due to transaction data', () => {
    const block = createBlock({
      transactions: [new Transaction({ to: '' })],
    })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block due to invalid transaction')
  })

  it('should not be valid if change existing timestamp', () => {
    const block = createBlock()

    // eslint-disable-next-line dot-notation
    block['timestamp'] = 0

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block timestamp')
  })

  it('should create genesis block', () => {
    const block = Block.genesis()

    expect(() => {
      block.validate(
        '0000000000000000000000000000000000000000000000000000000000000000',
        -1,
        exampleDifficulty,
      )
    }).not.toThrow(ValidationError)
    expect(block.getIndex()).toBe(0)
    expect(block.getHash()).toBeTruthy()
  })

  it('should be invalid if change existing hash', () => {
    const block = createBlock()

    block.mine(exampleDifficulty, exampleMiner)

    // eslint-disable-next-line dot-notation
    block['hash'] = 'invalid'

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Invalid block hash')
  })

  it('should be invalid if block not mined', () => {
    const block = createBlock()

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Block not mined')
  })

  it('should be invalid block if transactions contains more than one fee', () => {
    const transaction1 = new Transaction({
      type: TransactionType.FEE,
      to: 'mock-wallet',
    })
    const transaction2 = new Transaction({
      type: TransactionType.FEE,
      to: 'mock-wallet',
    })

    const block = createBlock({ transactions: [transaction1, transaction2] })

    expect(() => {
      block.validate(genesis.getHash(), genesis.getIndex(), exampleDifficulty)
    }).toThrow('Block contains multiple fee transactions')
  })

  it('should get transaction by hash', () => {
    const transaction = new Transaction({
      to: 'mock-wallet',
      txInput: new TransactionInput({
        fromAddress: 'mock-wallet',
        amount: 1,
        signature: 'mock-signature',
      }),
    })
    const block = createBlock({ transactions: [transaction] })

    expect(
      block
        .getTransaction(transaction.getHash())
        ?.getTxInput()
        ?.getFromAddress(),
    ).toBe('mock-wallet')
  })

  it('should has transaction with hash', () => {
    const transaction = new Transaction({ to: 'mock-wallet' })
    const block = createBlock({ transactions: [transaction] })

    expect(block.hasTransaction(transaction.getHash())).toBe(true)
  })
})
