import { Wallet } from '../src/lib/wallet'

describe('Wallet tests', () => {
  const exampleWIF = '5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'

  let alice: Wallet

  beforeAll(() => {
    alice = new Wallet()
  })

  it('should be valid', () => {
    const wallet = new Wallet()

    expect(wallet.getPrivateKey()).toBeDefined()
    expect(wallet.getPublicKey()).toBeDefined()
  })

  it('should recover wallet from private key', () => {
    const wallet = new Wallet(alice.getPrivateKey())

    expect(wallet.getPublicKey()).toBe(alice.getPublicKey())
  })

  it('should recover wallet from wif', () => {
    const wallet = new Wallet(exampleWIF)

    expect(wallet.getPrivateKey()).toBeDefined()
    expect(wallet.getPublicKey()).toBeDefined()
  })
})
