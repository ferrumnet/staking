import {deployContract, call, send, getWeb3} from '../ContractHelper';
import {abi} from '../staking/abi/FestakedWithReward.json';
import {bytecode} from '../staking/abi/FestakedWithReward.json';
import {toBigInt} from '../../common/Global';
import {Erc20} from '../Erc20';
import moment from 'moment';

const BYTECODES = {
    'ETHEREUM': bytecode,
    'RINKEBY': bytecode,
    'BSC': bytecode,
    'BSC_TESTNET': bytecode,
    'VELAS_MAINNET': bytecode
};

export function dateToMoment(dt, t, offset) {
    const timestr = moment(dt).format('YYYY-MM-DD') +'T'+t+'Z';
    return moment(moment(timestr).valueOf() + offset);
}

function dateToMomentEpoch(dt, t, offset) {
    return dateToMoment(dt, t, offset).valueOf() / 1000;
}

export async function deployStaking(params) {
    const {
        name,
        network,
        stakingCap,
        stakingStart,
        stakingEnd,
        withdrawStart,
        withdrawEnd,
        token,
        rewardToken,
        tokenDecimals,
        eventsTime,
    } = params;
    const cap = toBigInt(tokenDecimals, stakingCap);
    console.log('CAP IS ', cap, stakingCap)

    let stakingStartSec = dateToMomentEpoch(stakingStart, eventsTime, 0);
    let stakingEndSec = dateToMomentEpoch(stakingEnd, eventsTime, 0);
    let withdrawStartSec = dateToMomentEpoch(withdrawStart, eventsTime, 0);
    const withdrawEndSec = dateToMomentEpoch(withdrawEnd, eventsTime, 0);
    if (withdrawEnd.valueOf() === withdrawStart.valueOf()) {
      withdrawStartSec = dateToMomentEpoch(withdrawEnd, eventsTime, -1000);
    }

    const constructorArgs = [
        name,
        token,
        rewardToken || token,
        stakingStartSec,
        stakingEndSec,
        withdrawStartSec,
        withdrawEndSec,
        cap,
      ];
    console.log('CONSTRUCTOR ARGS FARM', constructorArgs);
    return await deployContract(abi, BYTECODES[network], constructorArgs);
}

export async function staking(address) {
    const web3 = await getWeb3();
    return new web3.eth.Contract(abi, address);
}

export async function getRewardToken(contractAddress) {
    const st = await staking(contractAddress);
    return (await call(st, 'rewardTokenAddress')).toString();
}

export async function addReward(contractAddress, rewardToken, rewardAmount, earlyWithdrawAmount) {
    const st = await staking(contractAddress);
    const decimals = await Erc20.decimals('', rewardToken);
    const rv = await send(st, 'addReward', toBigInt(decimals, rewardAmount),
        toBigInt(decimals, earlyWithdrawAmount));
    alert('Add reward transaction was submitted, check block explorer (like etherscan) for details')
    return rv;
}