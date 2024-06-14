import { ECPairFactory, ECPairInterface } from 'ecpair'
import * as ecc from 'tiny-secp256k1'

const ECPair = ECPairFactory(ecc)

export class Wallet {
  private privateKey: string
  private publicKey: string

  constructor(wifOrPrivateKey?: string) {
    const keys = wifOrPrivateKey
      ? Wallet.retrieveExistingKey(wifOrPrivateKey)
      : ECPair.makeRandom()

    this.privateKey = keys.privateKey?.toString('hex') || ''
    this.publicKey = keys.publicKey.toString('hex')
  }

  private static retrieveExistingKey(wifOrPrivateKey: string): ECPairInterface {
    return wifOrPrivateKey.length === 64
      ? ECPair.fromPrivateKey(Buffer.from(wifOrPrivateKey, 'hex'))
      : ECPair.fromWIF(wifOrPrivateKey)
  }
}
