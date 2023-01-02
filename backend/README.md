# Developer guide

## Prerequisits

You need a mongo db database

## Production notes

In production, you can either pass the parameters through environment variables, or an `AWS secret`


## How to start

Set the following environment variables in backend directory:

```
MONGOOSE_CONNECTION_STRING=""
RANDOM_SECRET="OUZX23ZPFYSSSTKL"
REQUEST_SIGNING_KEY="ASDF"
WEB3_PROVIDER_ETHEREUM="https://apis-sj.ankr.com/c75b758a18a54b928b5139f9a0d2eced/668d162102a8a9a27cb1a4a1abc76cbe/eth/fast/main"
WEB3_PROVIDER_RINKEBY="https://apis.ankr.com/6dfd4df95a334c87834bcdf1a709ed29/668d162102a8a9a27cb1a4a1abc76cbe/eth/fast/rinkeby"
WEB3_PROVIDER_BSC="https://apis.ankr.com/3510110a565b4ac8b64216274e0fa9da/17d51fb5735bba322c78e521ac58c161/binance/full/main"
WEB3_PROVIDER_BSC_TESTNET="https://data-seed-prebsc-1-s1.binance.org:8545/"
WEB3_PROVIDER_POLYGON="https://polygon-rpc.com/"
WEB3_PROVIDER_VELAS_MAINNET="https://explorer.velas.com/rpc"
UNIFYRE_BACKEND="http://"
CMK_KEY_ARN="arn:aws:kms:us-east-2:806611346442:key/6b07a4f4-92cf-4860-b9f2-33628a5e631d"
ADMIN_SECRET="TESTADMINSECRET"
TOKEN_BRDIGE_CONTRACT_ETHEREUM="https://apis-sj.ankr.com/c75b758a18a54b928b5139f9a0d2eced/668d162102a8a9a27cb1a4a1abc76cbe/eth/fast/main"
TOKEN_BRDIGE_CONTRACT_RINKEBY="https://apis.ankr.com/6dfd4df95a334c87834bcdf1a709ed29/668d162102a8a9a27cb1a4a1abc76cbe/eth/fast/rinkeby"
TOKEN_BRDIGE_CONTRACT_BSC_TESTNET="https://data-seed-prebsc-1-s1.binance.org:8545/"
TOKEN_BRDIGE_CONTRACT_BSC_TESTNET="https://data-seed-prebsc-1-s1.binance.org:8545/"
TOKEN_BRDIGE_CONTRACT_VELAS_MAINNET="https://explorer.velas.com/rpc"

```

Then run

```
npx node ./sim_lambda.js
```
