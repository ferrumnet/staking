import {abi as lockerAbi} from './abi/BasicLocker.json';
import {abi as antiBotAbi} from './abi/EvnAntiBot.json';
import {abi as fullTokenAbi} from '../abi/FerrumToken.json';
import {getWeb3, call, send, WEB3} from '../ContractHelper';
import Web3 from 'web3';

const ABI = {
    'locker': lockerAbi,
    'antibot': antiBotAbi,
}

const tokenAbi = [
    {
      "inputs": [],
      "name": "locker",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
];

fullTokenAbi.push(tokenAbi[0]);

async function token(addr) {
    const web3 = await getWeb3();
    return new web3.eth.Contract(fullTokenAbi, addr);
}

export async function symbol(addr) {
    const c = await token(addr);
    return await call(c, 'symbol');
}

export async function balance(addr, usr) {
    const c = await token(addr);
    return await call(c, 'balanceOf', [usr]);
}

async function locker(addr) {
    const web3 = await getWeb3();
    return new web3.eth.Contract(lockerAbi, addr);
}

async function antiBot(addr) {
    const web3 = await getWeb3();
    return new web3.eth.Contract(antiBotAbi, addr);
}

export async function deployContract(contractKey, bytecode) {
    const web3 = await getWeb3();
    const abi = ABI[contractKey];
    console.log('ABI IS ', abi, contractKey, WEB3.from);
    const c = new web3.eth.Contract(abi);
    await c.deploy({data: bytecode}).send({from: WEB3.from});
}

export async function getAntiBotFromLocker(addr) {
    const c = await locker(addr);
    return call(c, 'safetyLocker');
}

export async function isLockerValid(addr) {
    return (await getAntiBotFromLocker(addr)) !== undefined;
}

export async function isAntiBotValid(addr) {
    const c = await antiBot(addr);
    return !!await call(c, 'IsSafetyLocker');
}

export async function setAntiBotOnLocker(lockerAddr, antiBotAddr) {
    const c = await locker(lockerAddr);
    await send(c, 'setSafetyLocker', antiBotAddr)
}

export async function setTokenOnAntibot(antiBotAddr, tokenAddr) {
    const c = await antiBot(antiBotAddr);
    await send(c, 'addWethPool', tokenAddr, WEB3.weth);
}

export async function lockerAddressOnToken(tokenAddress) {
    const c = await token(tokenAddress);
    return await call(c, 'locker');
}

export async function getAntiBotTokenDetails(antiBotAddr) {
    const c = await antiBot(antiBotAddr);
    return [await call(c, 'token'), await call(c, 'wethPool')];
}

export async function getAntiBotStartTime(antiBotAddr) {
    const c = await antiBot(antiBotAddr);
    return await call(c, 'startTime');
}

export async function setAntiBotStartTime(antiBotAddr, startTime) {
    console.log("About to set start", antiBotAddr, startTime)
    const c = await antiBot(antiBotAddr);
    await send(c, 'open', startTime.toString(), Web3.utils.toWei('10'));
}

export async function whitelistAddressOnAntibot(antiBotAddr, addr) {
    const c = await antiBot(antiBotAddr);
    await send(c, 'addSuperWhitelist', addr);
}

export async function addTokenToMetamask(address) {
    const web3 = await getWeb3();
    const sym = await symbol(address);
    const c = await token(address);
    const decimals = await call(c, 'decimals');
    web3.currentProvider.sendAsync({
        method:'wallet_watchAsset',
        params: {
                type: 'ERC20',
                options: { address,
                    symbol: sym,
                    decimals: decimals,
                    // image: 'https://etherscan.io/token/images/ferrum_32.png'
            }}});
}