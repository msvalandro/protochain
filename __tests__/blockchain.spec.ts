import { Block } from '../src/lib/block'
import { Blockchain } from '../src/lib/blockchain'
import { Transaction } from '../src/lib/transaction'
import { TransactionInput } from '../src/lib/transaction-input'

jest.mock('../src/lib/transaction')
jest.mock('../src/lib/block')

describe('Blockchain tests', () => {
  function createBlockchain(): Blockchain {
    return new Blockchain('mock-miner')
  }

  function createTransaction(
    hash?: string,
    from = 'mock-address',
  ): Transaction {
    return new Transaction({
      hash,
      txInputs: [
        new TransactionInput({
          fromAddress: from,
          amount: 80,
          previousTx: 'mock-transaction-hash',
        }),
      ],
      txOutputs: [],
    })
  }

  it('should return valid blockchain', () => {
    const blockchain = createBlockchain()

    expect(blockchain.isValid()).toBe(true)
  })

  it('should return invalid blockchain', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'mock-previous-hash',
        transactions: [],
      }),
    )

    // eslint-disable-next-line dot-notation
    blockchain['blocks'][0]['hash'] = 'invalid-hash'

    expect(blockchain.isValid()).toBe(false)
  })

  it('should return blockchain fee per transaction', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getFeePerTx()).toBe(1)
  })

  it('should return blockchain last block', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getLastBlock().getHash()).toBe('mock-block-hash')
  })

  it('should return blockchain next block null if no transactions on mempull', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getNextBlock()).toBe(null)
  })

  it('should return blockchain next block', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())

    expect(blockchain.getNextBlock()?.index).toBe(1)
  })

  it('should return block by hash', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getBlock('mock-block-hash')?.getHash()).toBe(
      'mock-block-hash',
    )
  })

  it('should return blockchain difficulty', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getDifficulty()).toBe(2)
  })

  it('should return list of blocks', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getBlocks().length).toBe(1)
  })

  it('should return mempool', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getMempool().length).toBe(0)
  })

  it('should return UTXO', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getUTXO('mock-address').length).toBe(1)
  })

  it('should return UTXO if not transaction inputs', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getUTXO('mock-address-2').length).toBe(0)
  })

  it('should return balance', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getBalance('mock-address')).toBe(80)
  })

  it('should be able to add transaction', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())

    expect(blockchain.getMempool().length).toBe(1)
  })

  it('should not be able to add transaction if there is a pending transaction', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())

    expect(() => blockchain.addTransaction(createTransaction())).toThrow(
      'This wallet has a pending transaction',
    )
  })

  it('should not be able to add transaction if transaction already in mempool', () => {
    const blockchain = createBlockchain()

    // eslint-disable-next-line dot-notation
    blockchain['mempool'] = [createTransaction(undefined, 'another-address')]

    expect(() => blockchain.addTransaction(createTransaction())).toThrow(
      'Transaction already in mempool',
    )
  })

  it('should not be able to add block if no next block', () => {
    const blockchain = createBlockchain()

    expect(() =>
      blockchain.addBlock(
        new Block({
          index: 1,
          previousHash: 'mock-previous-hash',
          transactions: [],
        }),
      ),
    ).toThrow('No block info to be added')
  })

  it('should be able to add block', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'mock-previous-hash',
        transactions: [],
      }),
    )

    expect(blockchain.getBlocks().length).toBe(2)
  })

  it('should not be able to add block if invalid transaction in block', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())

    expect(() =>
      blockchain.addBlock(
        new Block({
          index: 1,
          previousHash: 'mock-previous-hash',
          transactions: [],
          timestamp: 99,
        }),
      ),
    ).toThrow('Invalid tx in block mempool')
  })

  it('should return transaction on mempool', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())

    expect(
      blockchain.getTransaction('mock-transaction-hash').mempoolIndex,
    ).toBe(0)
  })

  it('should return transaction on blockchain', () => {
    const blockchain = createBlockchain()

    blockchain.addTransaction(createTransaction())
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: 'mock-previous-hash',
        transactions: [],
      }),
    )

    expect(blockchain.getTransaction('invalid-transaction').blockIndex).toBe(0)
  })

  it('should return no transaction', () => {
    const blockchain = createBlockchain()

    expect(blockchain.getTransaction('mock-transaction-hash').blockIndex).toBe(
      -1,
    )
    expect(
      blockchain.getTransaction('mock-transaction-hash').mempoolIndex,
    ).toBe(-1)
  })

  it('should not be able to add transaction if transaction already in blockchain', () => {
    const blockchain = createBlockchain()

    expect(() =>
      blockchain.addTransaction(createTransaction('invalid-transaction')),
    ).toThrow('Transaction already in blockchain')
  })

  it('should not be able to add transaction if transaction already in blockchain', () => {
    const blockchain = createBlockchain()

    expect(() =>
      blockchain.addTransaction(createTransaction('invalid-transaction-2')),
    ).toThrow('Invalid transaction: a TXO is already spent or does not exist')
  })
})
