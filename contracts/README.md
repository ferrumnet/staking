# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

From shell run the following commands:

set environment configs from terminal run :

```
export ETHERSCAN_API_KEY=xx
export BSCSCAN_API_KEY=xx
export POLYGONSCAN_API_KEY=xx
export RINKEBY_LIVE_NETWORK=https://rinkeby.infura.io/v3/18b15ac5b3e8447191c6b233dcd2ce14
export ETH_LIVE_NETWORK=https://mainnet.infura.io/v3/18b15ac5b3e8447191c6b233dcd2ce14
export POLYGON_LIVE_NETWORK=https://rpc-mainnet.maticvigil.com/
export POLYGON_LIVE_NETWORK=https://polygon-rpc.com/
export BSC_LIVE_NETWORK=https://bsc-dataseed.binance.org/
export BSC_TESTNET_LIVE_NETWORK=https://data-seed-prebsc-2-s1.binance.org:8545/
export PRIVATE_KEY=xx
export CONTRACT_OWNER=0x0Bdb79846e8331A19A65430363f240Ec8aCC2A52
export SET_SIGNER=true
```

To deply contract, run from shell

```

change directory into the `contract` directory from root.

run npm install from contract directory.

run npx hardhat help

run npx hardhat test

GAS_REPORT=true npx hardhat test

run npx hardhat node

npx hardhat run scripts/deploy.js to deploy contract

```
