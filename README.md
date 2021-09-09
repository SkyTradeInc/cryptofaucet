# MOVR Faucet Service v1.0

## Table of Contents
- [Prerequisites](#prerequisites)
- [Download and Run](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [How to Contribute](#how-to-contribute)


## Prerequisites

* [NodeJS](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/get-npm/)
* [Redis](https://redis.io/download/)

# Getting started

#### Download

Clone the repository to your computer

```
git clone https://github.com/skytradeinc/faucet.git
cd faucet
touch .env && nano .env
```
add the following:

#### Environment variables

`Example`

```
ADDRESS_PRIVATE_KEY=0xa52c8faab547db6b6bda81f6e6daeca6f6b8f828199c039c4c52eecb1f76eb72
SERVER_PORT=4000
WEB3_PROVIDER_URL=http://localhost:8545
GAS_PRICE_GWEI=5
GOOGLE_CAPTCHA_SECRET=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
REDIS_URL=redis://127.0.0.1:6379
REDIS_EXPIRE_SECONDS=60
REQUEST_LIMIT=0.01

```

#### Run

You need to install the package dependencies

```
npm i
node service
```
