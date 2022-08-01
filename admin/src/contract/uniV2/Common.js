import web3 from 'web3';
import { Big } from 'big.js';

export let WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

export function isWeth(addr) {
    return addr.toLowerCase() === WETH.toLocaleLowerCase();
}

export function toWei(amount) {
    return web3.utils.toWei(amount.toString(), "ether");
}

export function fromWei(amount) {
    return web3.utils.fromWei(amount.toString(), "ether");
}

// account is optional
export function getContract(web3, address, ABI) {
    if (address === '0x') {
      throw Error(`Invalid 'address' parameter '${address}'.`)
    }
  
    return new web3.eth.Contract(ABI, address);
}

export async function execOnRouter(web3, contract, pars, from) {
    const { methodName, args, value } = pars;
    const method = contract.methods[methodName](...args);
    const gasEstimate = await method.estimateGas({
        from,
        ...(value ? { value } : {})});
    console.log('Estimated gas', gasEstimate)
    const res = await method.send({
        from,
        gasLimit: new Big(gasEstimate).times('1.2').round(0).toFixed(0),
        ...(value ? { value } : {})});

    const hash = res.transactionHash;
    return await web3.eth.getTransactionReceipt(hash);
}