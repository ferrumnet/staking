import {abi as erc20Abi} from './abi/FerrumToken.json';
import {getWeb3, call, send, NETWORK_BY_ID} from './ContractHelper';
import {toBigInt, fromBigInt} from '../common/Global';

export class Erc20 {
    static tokenCache = {};

    static async decimals(network, address) {
        const tok = await Erc20.token(network, address);
        return ((await (call(tok, 'decimals'))) || '').toString();
    }

    static async symbol(network, address) {
        const tok = await Erc20.token(network, address);
        const web3 = await getWeb3();
        return (await (tryWithBytes32(web3, 'symbol', address, async () => call(tok, 'symbol'))) || '').toString();
    }

    static async allowance(network, token, address, spender) {
        const tok = await Erc20.token(network, token);
        const allowance = (await call(tok, 'allowance', [address, spender])).toString();
        const deci = await Erc20.decimals(network, token);
        console.log('Allocaiton', {allowance, deci})
        return fromBigInt(deci.toString(), allowance);
    }

    static async approve(network, token, spender, amount) {
        const tok = await Erc20.token(network, token);
        const deci = await Erc20.decimals(network, token);
        const am = toBigInt(deci.toString(), amount);
        const tx = (await send(tok, 'approve', spender, am)).toString();
        alert('Approve transaction submitted');
        return tx;
    }

    static async verifyNetwork(network, address) {
        console.log('Network is ?')
        const w3 = await getWeb3();
        const netId = await w3.eth.net.getId();
        const net = NETWORK_BY_ID[netId];
        console.log('Network is ', {netId, net})
        if (!net) {
            throw new Error(`Could not connect to network ${network}`);
        }
        if (net !== network) {
            throw new Error(`Network (${network}) does not match the connected wallet ${net}`);
        }
        if (address) {
            if (!w3.utils.isAddress(address)) {
                throw new Error(`Invalid ${network} address "${address}"`);
            }
        }
    }

    static async token(network, address) {
        if (network) { await Erc20.verifyNetwork(network); }
        const web3 = await getWeb3();
        if (!Erc20.tokenCache[address]) {
            Erc20.tokenCache[address] = new web3.eth.Contract(erc20Abi, address);
        }
        return Erc20.tokenCache[address];
    }
}

async function tryWithBytes32(web3, name, address, fun) {
    try {
        return await fun();
    } catch(e) {
        const cont = new web3.eth.Contract([{
            "constant": true,
            "inputs": [],
            "name": name,
            "outputs": [
                {
                    "name": "",
                    "type": "bytes32"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }], address);
        const b32 = await cont.methods[name]().call();
        return web3.utils.hexToString(b32);
    }
  }
