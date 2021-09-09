const Web3 = require('web3')
const web3 = new Web3(process.env.WEB3_PROVIDER_URL)

class Blockchain {
  constructor() {
    this.privateKey        = process.env.ADDRESS_PRIVATE_KEY
    this.gasPrice          = web3.utils.toWei(process.env.GAS_PRICE_GWEI, 'gwei')
    this.utils             = web3.utils;
    this.eth               = web3.eth;
    this.wallet            = null;
    this.balance           = null;
    this.nonce             = null;
    this.init()
  }

  async init() {
    await this.updateAccount()
    await this.updateBalace()
    await this.updateNonce()
    console.log(
      `
      ====WALLET====
      Gas Price: ${process.env.GAS_PRICE_GWEI} GWEI
      Address: ${this.wallet.address}
      Balance: ${web3.utils.fromWei(this.balance, 'ether')} ETH
      Nonce: ${this.nonce}
      `
    )
  }

  updateAccount() {
    return new Promise(async(resolve, reject) => {
       this.wallet = await web3.eth.accounts.wallet.add(this.privateKey)
       resolve()
    })
  }

  updateNonce() {
    return new Promise(async(resolve, reject) => {
      this.nonce = await web3.eth.getTransactionCount(this.wallet.address, 'pending'),

      resolve()
    })
  }

  updateBalace() {
    return new Promise(async(resolve, reject) => {
      this.balance = await web3.eth.getBalance(this.wallet.address);
      resolve()
    })
  }

  request(to, value) {
    return new Promise(async(resolve, reject) => {
      const transactionParams = {
        nonce: this.nonce,
        gasPrice: web3.utils.toHex(this.gasPrice),
        gasLimit: '0x9C40',
        to: to,
        from: this.wallet.address,
        value: web3.utils.toWei(`${value}`, 'ether'),
      }

      const signedTransaction = await web3.eth.accounts.signTransaction(transactionParams, this.wallet.privateKey)

      web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
        .then((tx) => {
          this.nonce = `${parseInt(this.nonce, 10) + 1}`
          console.log(tx)
          resolve(tx)
        })
        .catch(error => {
          this.nonce = `${parseInt(this.nonce, 10) + 1}`
          error(error)
          reject(error)
        })
        console.log(`Sent ${value} MOVR to ${to}`)
    })
  }
}

 module.exports = new Blockchain()
