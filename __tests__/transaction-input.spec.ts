import { TransactionInput } from '../src/lib/transaction-input'
import { ValidationError } from '../src/lib/validation-error'
import { Wallet } from '../src/lib/wallet'

describe('TransactionInput tests', () => {
  let alice: Wallet
  beforeAll(() => {
    alice = new Wallet()
  })

  it('should be valid', () => {
    const txInput = new TransactionInput({
      fromAddress: alice.getPublicKey(),
      amount: 1,
      signature: 'signature',
    })

    txInput.sign(alice.getPrivateKey())

    expect(() => {
      txInput.validate()
    }).not.toThrow(ValidationError)
  })
})
