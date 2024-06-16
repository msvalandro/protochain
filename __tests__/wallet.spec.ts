import { Wallet } from '../src/lib/wallet'

describe('Wallet tests', () => {
  const mockPrivateKey =
    '993dd1905ffb8780c58fefb75790f93485f0319ee41117b11923b2ea436ef974'
  const mockWif = 'L1h7ar6pcTtWJs28B1skDpmSzN1ZbnHsH1e4znAHsVEvhS1RKhpJ'

  it('should return wallet data', () => {
    const wallet = new Wallet()

    expect(wallet.getPrivateKey()).toBeDefined()
    expect(wallet.getPublicKey()).toBeDefined()
  })

  it('should be able to create wallet with provided private key', () => {
    const wallet = new Wallet(mockPrivateKey)

    expect(wallet.getPrivateKey()).toBe(mockPrivateKey)
  })

  it('should be able to create wallet with provided WIF', () => {
    const wallet = new Wallet(mockWif)

    expect(wallet.getPrivateKey()).toBe(
      '85726bbb74ee59178854532e60e10aa08b8ef1d5c1b20b371a159a07b7a5a523',
    )
  })
})
