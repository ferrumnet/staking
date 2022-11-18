import Web3 from 'web3';
import Web3Modal from "web3modal";

const WETH = {
    1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    4: '0xc778417e063141139fce010982780140aa0cd5ab',
    56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    97: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    106: '0x380f73bAd5E7396B260f737291AE5A8100baabcD',
}

export const NETWORK_BY_ID = {
    1: 'ETHEREUM',
    4: 'RINKEBY',
    56: 'BSC',
    97: 'BSC_TESTNET',
    106: 'VELAS_MAINNET'
}

export const WEB3 = {
    _web3: undefined,
    from: '',
    weth: '',
}

export async function getWeb3() {
    if (WEB3._web3) {
        return WEB3._web3;
    }
    const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions: {}, // required
      });
      
      const provider = await web3Modal.connect();
      
      WEB3._web3 = new Web3(provider);
      const acc = await WEB3._web3.eth.getAccounts();
      const netId = await WEB3._web3.eth.net.getId();
      WEB3.from = acc[0];
      WEB3.weth = WETH[netId];
      return WEB3._web3;
}

export async function call(c, method, args) {
    try {
        console.log('CALL ARGS ARE ', method, args)
        const rv = (await c.methods[method](...(args || [])).call()).toString();
        console.log('Called contract ', method, rv);
        return rv;
    } catch(e) {
        console.error('method', e);
        return undefined;
    }
}

export async function send(c, method, ...args) {
    try {
        console.log('Executing', {method, args});
        const m = await c.methods[method](...args);
        const gl = await m.estimateGas({from: WEB3.from});
        const rv = (await m.send({from: WEB3.from, gas: gl})).toString();
        console.log('Executed contract ', method, rv);
        return rv;
    } catch(e) {
        console.error('method', e);
        throw e;
    }
}

export async function deployContract(abi, bytecode, args) {
    const web3 = await getWeb3();
    console.log('Deploying contract ', WEB3.from);
    const c = new web3.eth.Contract(abi);
    const deployed = await c.deploy({data: bytecode, arguments: args}).send({from: WEB3.from});
    if (deployed._address) {
        alert(`Contract deployed with address: ${deployed._address}`);
        // window.location.href = `${window.location.origin}/admin/${festaking._address}/addReward?token=${config.tokenAddress}`;
        return deployed._address;
    }
    return '';
}