import { Account, Asset, Operation, TransactionBuilder } from "stellar-sdk"
import { passphrase, server } from "../@js/utils"

export default async function deleteOffer({
  offer, 
  account,
  keypair
}) {
  // this.loading.deletingOffer = true

  // try { 
    const transaction = new TransactionBuilder(
      new Account(account.id, account.sequence), 
      {
        fee: 10000,
        networkPassphrase: passphrase
      }
    )
    .addOperation(
      offer.type === 'claimable-balance'
      ? Operation.claimClaimableBalance({
          balanceId: offer.id
        })
      : Operation.manageSellOffer({
          offerId: offer.id,
          selling: new Asset('nil', account.id),
          buying: Asset.native(),
          amount: '0',
          price: 1,
        })
    )
    .setTimeout(300)
    .build()
    
    transaction.sign(keypair)

    return server.submitTransaction(transaction)

    // await this.updateOffers()
    // await this.updateClaimableBalances()
    // await this.updateAccount(this.publicKey, 'account')
  // }

  // finally {
  //   this.loading.deletingOffer = false
  // }
}