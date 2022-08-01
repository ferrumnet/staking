import { ChainId, Token, TokenAmount, Trade, TradeType, Route, Percent, Router, ETHER, Pair
    } from '@uniswap/sdk'
import { LocalCache, ValidationUtils } from 'ferrum-plumbing';
import * as utils from './Common';
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import { abi as IUniswapV2Pair} from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { getWeb3, WEB3 } from '../ContractHelper';
import { abi as TokenABI } from '../../contract/abi/FerrumToken.json';

const DEFAULT_TTL = 360;
export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

function getRouterContract(web3) {
    return utils.getContract(web3, ROUTER_ADDRESS, IUniswapV2Router02ABI)
}

export class UniV2Helper {
    constructor(web3) {
        this.web3 = web3;
        this.cache = new LocalCache();
        this.registerToken(utils.WETH, 'WETH', 'WETH');
    }

    routerContract() {
        return getRouterContract(this.web3);
    }

    registerToken(addr, symbol, name) {
        const token = new Token(
            ChainId.MAINNET,
            addr,
            18,
            symbol,
            name
          );
        this.cache.set('TOK_' + addr, token);
    }

    cleanPair(tok1, tok2) {
        const k = 'PAIR_' + this.pairAddress(tok1, tok2);
        this.cache.set(k, undefined);
    }

    pairAddress(tok1, tok2) {
        return Pair.getAddress(this.tok(tok1), this.tok(tok2));
    }

    async totalSupply(tok1) {
        const contract = utils.getContract(this.web3, tok1, TokenABI);
        const res = await contract.methods.totalSupply().call();
        return utils.fromWei(res);
    }

    async tokenBalanceOf(tok1, address) {
        console.log('VAL0',tok1, address)
        const contract = utils.getContract(this.web3, tok1, TokenABI);
        const res = await contract.methods.balanceOf(address).call();
        console.log('VAL2', res)
        return utils.fromWei(res);
    }

    async allow(tok1, from, approvee, amount) {
        const contract = utils.getContract(this.web3, tok1, TokenABI);
        const pars = {
            methodName: 'approve',
            args: [
                approvee,
                utils.toWei(amount),
            ],
        };
        await utils.execOnRouter(this.web3, contract, pars, from);
        const allowance = await contract.methods.allowance(from, ROUTER_ADDRESS).call();
        console.log('Allowance is ', allowance);
    }

    async allowRouter(tok1, from) {
        return this.allow(tok1, from, ROUTER_ADDRESS, '1000000000000000000000000000000000');
    }

    async allowance(tok1, from, spender) {
        const contract = utils.getContract(this.web3, tok1, TokenABI);
        const res = await contract.methods.allowance(from, spender).call();
        return utils.fromWei(res);
    }

    async routerAllowance(tok1, from) {
        const res = await this.allowance(tok1, from, ROUTER_ADDRESS);
        return utils.fromWei(res);
    }

    async pair(tok1, tok2) {
        const pairAddr = this.pairAddress(tok1, tok2);
        const k = 'PAIR_' + pairAddr;
        let curP = this.cache.get(k);
        if (!curP) {
            const contract = utils.getContract(this.web3, pairAddr, IUniswapV2Pair);
            const res = await contract.methods.getReserves().call();
            const reserves0 = res.reserve0;
            const reserves1 = res.reserve1;
            const token1 = this.tok(tok1);
            const token2 = this.tok(tok2);
            const balances = token1.sortsBefore(token2) ? [reserves0, reserves1] : [reserves1, reserves0];
            curP = new Pair(new TokenAmount(token1, balances[0]), new TokenAmount(token2, balances[1]));
            this.cache.set(k, curP);
        }
        return curP;
    }

    async route(tok1, tok2) {
        const pair = await this.pair(tok1, tok2);
        return new Route([pair], this.tok(tok1));
    }

    async price(tok1, tok2) {
        return (await this.route(tok2, tok1)).midPrice;
    }

    async buy(token, base, amount, slippagePct, to) {
        // When we buy amount out is exact
        const t = await this.trade(base, token, 'buy', amount);
        if (utils.isWeth(base)) {
            t.inputAmount.currency = ETHER;
        }
        const slippageTolerance = new Percent((slippagePct * 100).toFixed(0), '10000') // in bips
        const tradeOptions = {
            allowedSlippage: slippageTolerance,
            ttl: DEFAULT_TTL,
            recipient: to,
        };
        const swapPars = Router.swapCallParameters(t, tradeOptions);
        return this.execOnRouter(swapPars, to);
    }

    async sell(token, base, amount, slippagePct, to) {
        // When we buy amount in is exact
        const t = await this.trade(token, base, 'sell', amount);
        if (utils.isWeth(base)) {
            t.outputAmount.currency = ETHER;
        }
        const slippageTolerance = new Percent((slippagePct * 100).toFixed(0), '10000') // in bips
        const tradeOptions = {
            allowedSlippage: slippageTolerance,
            ttl: DEFAULT_TTL,
            recipient: to,
        };
        const swapPars = Router.swapCallParameters(t, tradeOptions);
        return this.execOnRouter(swapPars, to);
    }

    async trade(tokIn, tokOut, tType, amount) {
        const r = await this.route(tokIn, tokOut);
        const tokA = new TokenAmount(tType === 'sell' ? this.tok(tokIn) : this.tok(tokOut), utils.toWei(amount));
        // console.log('TRADE', {tokIn, tokOut, tType, amount, ac: tokA.currency, rout: r.output});
        return new Trade(r, tokA, tType === 'sell' ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT);
    }

    // function addLiquidityETH(
    //     address token,
    //     uint amountTokenDesired,
    //     uint amountTokenMin,
    //     uint amountETHMin,
    //     address to,
    //     uint deadline
    //   ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    async addLiquidityEth(from, token, tokenDesired, tokenMin, ethDesired, ethMin) {
        // Deadline for adding liquidity = now + 25 minutes
        const deadline = Date.now() + 1500;
        const pars = {
            methodName: 'addLiquidityETH',
            args: [
            token, 
            utils.toWei(tokenDesired), // uint amountTokenDesired
            utils.toWei(tokenMin), // uint amountTokenMin
            utils.toWei(ethMin),   // uint amountETHMin
            from, 
            deadline, 
            ],
            value: utils.toWei(ethDesired),
        }
        console.log('Executing on router ', pars);
        return await this.execOnRouter(pars, from);
    }

    async removeLiquidity(from, tokenA, tokenB, liquidity, amountAMin, amountBMin) {
        // Deadline for adding liquidity = now + 25 minutes
        const deadline = Date.now() + 1500;
        const pars = {
            methodName: 'removeLiquidity',
            args: [
            tokenA, 
            tokenB,
            utils.toWei(liquidity),
            utils.toWei(amountAMin),
            utils.toWei(amountBMin),
            from, 
            deadline, 
            ],
        }
        return await this.execOnRouter(pars, from);
    }

    async removeLiquidityEth(from, token, liquidity, amountTokenMin, amountETHMin) {
        // Deadline for adding liquidity = now + 25 minutes
        const deadline = Date.now() + 1500;
        const pars = {
            methodName: 'removeLiquidityETH',
            args: [
            token, 
            utils.toWei(liquidity),
            utils.toWei(amountTokenMin),
            utils.toWei(amountETHMin),
            from, 
            deadline, 
            ],
        }
        return await this.execOnRouter(pars, from);
    }

    async execOnRouter(pars, from) {
        const contract = this.routerContract();
        return utils.execOnRouter(this.web3, contract, pars, from);
    }

    tok(tokA) {
        const t = this.cache.get('TOK_'+tokA);
        ValidationUtils.isTrue(!!t, `Token "${tokA} not registered`);
        return t;
    }
}

export async function addLiquidityETH(token, tokenDesired, ethDesired) {
    const web3 = await getWeb3();
    const uniV2 = new UniV2Helper(web3);
    console.log('About to add liq', {token, tokenDesired, ethDesired})
    await uniV2.addLiquidityEth(WEB3.from, token, tokenDesired, '0', ethDesired, '0');
}

export async function approveLiquidity(token) {
    const web3 = await getWeb3();
    const uniV2 = new UniV2Helper(web3);
    return uniV2.allowRouter(token, WEB3.from);
}
