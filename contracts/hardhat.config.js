require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require('@typechain/hardhat');
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');

const getEnv = (env) => {
	const value = process.env[env];
	if (typeof value === 'undefined') {
	  console.warn(`${env} has not been set.`);
	  //throw new Error(`${env} has not been set.`);
	}
	return value || '0x123123123';
};

const config = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.2", settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    } }],
  },
  networks: {
		hardhat: {
			gas: 10000000,
		},
    local: {
	    chainId: 31337,
      url: `http://127.0.0.1:8545/`,
      accounts: [getEnv('LOCAL_PRIVATE_KEY')],
	    gasPrice: 18000000000,
    },
    mainnet: {
	    chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${getEnv('ALCHEMY_API_KEY') || '123123123'}`,
      accounts: [getEnv('PRIVATE_KEY')],
	    gasPrice: 18000000000,
    },
    rinkeby: {
	    chainId: 4,
      url: getEnv('RINKEBY_LIVE_NETWORK'),
      //url: `https://eth-rinkeby.alchemyapi.io/v2/${getEnv('ALCHEMY_API_KEY') || '123123123'}`,
      accounts: [getEnv('PRIVATE_KEY')],
	    //gasPrice: 20000000000,
    },
	  bsctestnet: {
      chainId: 97,
      url: getEnv('BSC_TESTNET_LIVE_NETWORK'),
      accounts: [getEnv('PRIVATE_KEY')],
      //gasPrice: 20000000000,
    },
    bsc: {
      chainId: 56,
      url: getEnv('BSC_LIVE_NETWORK'),
      accounts: [getEnv('PRIVATE_KEY')],
    },
    velas: {
      chainId: '106',
      url: 'https://explorer.velas.com/rpc',
      account: [getEnv('PRIVATE_KEY')],
    },
    velastestnet: {
      chainId: '111',
      url: 'https://evmexplorer.testnet.velas.com/rpc',
      account: [getEnv('PRIVATE_KEY')],
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    // apiKey: getEnv('BSCSCAN_API_KEY'),
    // apiKey: getEnv('POLYGONSCAN_API_KEY'),
    // apiKey: getEnv('VELAS_EXPLORER_API_KEY'),
    apiKey: getEnv('ETHERSCAN_API_KEY'),
    // apiKey: getEnv('SNOWTRACE_API_KEY'),
  }
};

module.exports = config
