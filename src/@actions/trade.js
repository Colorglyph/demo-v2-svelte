import { Transaction } from 'stellar-sdk'

import { server, passphrase, baseUrl, handleResponse } from '../@js/utils'

export default function trade({
  user,
  keypair,
  issuer, 
  side,
  offer,
  price,
}) {
  // this.loading.trading = true

  price = offer 
    ? side === 'buy' 
      ? offer.price * offer.amount * 1.6 
      : offer.amount * 0.4
    : price
  const counterAsset = 'native' 
  // const counterAsset = side === 'buy' 
  // ? offer 
  //   ? {
  //     code: offer.buying.asset_code,
  //     issuer: offer.buying.asset_issuer
  //   } 
  //   : {
  //     code: 'COLORGLYPH',
  //     issuer: this.ownedGlyphs[0].asset_issuer
  //   } 
  // : offer 
  //   ? {
  //     code: offer.selling.asset_code,
  //     issuer: offer.selling.asset_issuer
  //   } 
  //   : {
  //     code: 'COLORGLYPH',
  //     issuer: this.availableGlyphs[0].id
  //   }

  return (
    offer?.type === 'claimable-balance'
    ? fetch(`${baseUrl}/contracts/trade`, {
        method: 'POST',
        body: JSON.stringify({
          userAccount: user,
          balanceId: offer.id
        })
      })
    : fetch(`${baseUrl}/contracts/trade`, {
        method: 'POST',
        body: JSON.stringify({
          userAccount: user,
          baseAssetIssuer: issuer,
          counterAsset,
          price,
          side
        })
      })
  )
  .then(handleResponse)
  .then((xdr) => {
    const transaction = new Transaction(xdr, passphrase)

    transaction.sign(keypair)

    return server.submitTransaction(transaction)
  })
  // .then(async () => {
    // await this.updateOffers()
    // await this.updateClaimableBalances()
    // await this.updateAccount(this.publicKey, 'account')
  // })
  // .finally(() => this.loading.trading = false)
}