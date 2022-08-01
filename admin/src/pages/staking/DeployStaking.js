import React, {useEffect, useState} from 'react';
import {Page, Row} from '../../common/Layout';
import {
    queryStr, queryStrNum,
} from '../../common/Global';
import { TextField, MaskedTextField } from 'office-ui-fabric-react/lib/TextField';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import {Erc20} from '../../contract/Erc20';
import moment from 'moment';
import { PrimaryButton, ProgressIndicator } from 'office-ui-fabric-react';
import {dateToMoment, deployStaking} from '../../contract/staking/DeployerStaking';

function parseDate(dt) {
    return new Date(moment(dt, 'YYYY-MM-DD').valueOf());
}

const dateRaw = (dt) => {
  var r = moment(dt);
  console.log('r is ', r.format());
  return `${r.format('YYYY-MM-DD')}`;
};

  
const datef = (dt, t, offset = 0) => {
    const r = dateToMoment(dt, t, offset);
    return `${r.toISOString()}   ->   ${r.valueOf() / 1000}`;
}

const networks = [
    { key: 'ETHEREUM', text: 'ETHEREUM' },
    { key: 'RINKEBY', text: 'RINKEBY' },
    { key: 'BSC', text: 'BSC' },
    { key: 'BSC_TESTNET', text: 'BSC_TESTNET' },
  ];

const stakings = [
    { key: 'traditional', text: 'Traditional' },
    { key: 'liquidity', text: 'Liquidity (Different Reward Token)' },
    { key: 'continuation', text: 'Reward Continuation' },
];

const defaultState =  {
    name: queryStr('name') || '',
    network: queryStr('network') || 'ETHEREUM',
    stakingType: queryStr('stakingType') || (!!queryStr('rewardToken') ? 'liquidity' : 'traditional'),
    stakingCap: queryStrNum('stakingCap') || 0,
    stakingStart: parseDate(queryStr('stakingStart')) || new Date(),
    stakingEnd: parseDate(queryStr('stakingEnd')) ||  new Date(),
    withdrawStart: parseDate(queryStr('withdrawStart')) || new Date(),
    withdrawEnd: parseDate(queryStr('withdrawEnd')) || new Date(),
    eventsTime: queryStr('eventsTime') || '',
    token: queryStr('token') || '',
    rewardToken: queryStr('rewardToken') || '',
}

function validate(state) {
    const {
        name,
        network,
        stakingType,
        stakingCap,
        stakingStart,
        stakingEnd,
        withdrawStart,
        withdrawEnd,
        eventsTime,
        token,
        rewardToken,
        tokenError,
        tokenSymbol,
        tokenDecimals,
    } = state;
    if (!network) { return 'Select network'; }
}

const globalState = {}

export function DeployStaking() {
    console.log('DEFAULT IS ', {defaultState})
    const [state, setState] = useState(defaultState);
    globalState.state = state;
    const doSetState = (...args)  => {
        const s = {...globalState.state};
        args.forEach(v => {
            s[v[0]] = v[1];
        });
        setState(s);
    }
    const {
        name,
        network,
        stakingType,
        stakingCap,
        stakingStart,
        stakingEnd,
        withdrawStart,
        withdrawEnd,
        eventsTime,
        token,
        rewardToken,
        rewardTokenSymbol,
        tokenError,
        tokenSymbol,
        tokenDecimals,
    } = state;
    useEffect(() => {
        const f = async () => {
            try {
                const symbol = await Erc20.symbol(network, token);
                const decimals = await Erc20.decimals(network, token);
                doSetState(['tokenSymbol', symbol], ['tokenDecimals', decimals], ['tokenError', undefined]);
            } catch(e) {
                doSetState(['tokenError', e.message]);
            }
        };
        f()
    }, [token, network])
    useEffect(() => {
        const f = async () => {
            try {
                const symbol = await Erc20.symbol(network, rewardToken);
                const decimals = await Erc20.decimals(network, rewardToken);
                doSetState(['rewardTokenSymbol', symbol], ['rewardTokenDecimals', decimals], ['rewardTokenError', undefined]);
            } catch(e) {
                doSetState(['rewardTokenError', e.message]);
            }
        };
        f()
    }, [rewardToken, network])

    let withdrawStartSec = datef(withdrawStart, eventsTime);
    let withdrawStartRaw = dateRaw(withdrawStart, eventsTime);
    const withdrawEndSec = datef(withdrawEnd, eventsTime);
    const withdrawEndRaw = dateRaw(withdrawEnd, eventsTime);
    if (withdrawEnd.valueOf() === withdrawStart.valueOf()) {
      withdrawStartSec = datef(withdrawEnd, eventsTime, -1000);
      withdrawStartRaw = dateRaw(withdrawEnd, eventsTime, -1000);
    }
    const shareableUrlArgs = ({
      network,
      token,
      rewardToken,
      name,
      stakingType,
      stakingCap,
      stakingStart: dateRaw(stakingStart, eventsTime),
      stakingEnd: dateRaw(stakingEnd, eventsTime),
      withdrawStart: withdrawStartRaw,
      withdrawEnd: withdrawEndRaw,
      eventsTime: eventsTime,
    });
    const shareableUrl = window.location.origin + '/admin/deploy?' + Object.keys(shareableUrlArgs)
      .map(k => `${k}=${shareableUrlArgs[k] || ''}`).join('&');

    console.log('PROPS', {state})
    return (
        <Page>
            <h1>Deploy staking</h1>
            <p>Make sure the following information is correct, and press the <b>Deploy</b> button once confirmed.
            </p>
            <Stack >
                <Dropdown
                    placeholder="Select one"
                    label="Network"
                    options={networks}
                    selectedKey={network}
                    disabled={!!defaultState.network}
                    onChange={(e, o, i) => setState({...state, network: networks[i].key})}
                />
                <Dropdown
                    placeholder="Select one"
                    label="Type of staking"
                    options={stakings}
                    selectedKey={stakingType}
                    disabled={!!defaultState.stakingType}
                    onChange={(e, o, i) => setState({...state, stakingType: stakings[i].key})}
                />
                <TextField label="Main token address (stake token)"
                    value={token}
                    readOnly={!!defaultState.token}
                    onChange={e => setState({...state, token: e.target.value})}
                />
                <TextField
                    label="Main token symbol and decimals" readOnly={true}
                    value={`${tokenSymbol || 'ERROR'} - ${tokenDecimals || '0'} decimals`}
                    errorMessage={tokenError}
                />
                {state.stakingType !== 'traditional' &&
                <TextField label="Reward Tokens"
                    value={rewardToken} 
                    readOnly={!!defaultState.rewardToken}
                    onChange={e => setState({...state, rewardToken: e.target.value})}
                    errorMessage={state.rewardTokenError}
                />}
                <TextField label="Name"
                    value={name} 
                    onChange={e => setState({...state, name: e.target.value})}
                />
                <TextField label="Staking Cap"
                    value={stakingCap} 
                    onChange={e => setState({...state, stakingCap: e.target.value})}
                />
                <DatePicker
                    placeholder="Select a date..."
                    label="Staking Start Date"
                    value={stakingStart}
                    onSelectDate={d => setState({...state, stakingStart: d})}
                />
                <DatePicker
                    placeholder="Select a date..."
                    label="Staking Contribution End Date"
                    value={stakingEnd}
                    onSelectDate={d => setState({...state, stakingEnd: d})}
                />
                <DatePicker
                    placeholder="Select a date..."
                    label="Early Withdraw Start Date"
                    value={withdrawStart}
                    onSelectDate={d => setState({...state, withdrawStart: d})}
                />
                <DatePicker
                    placeholder="Select a date..."
                    label="Maturity Date"
                    value={withdrawEnd}
                    onSelectDate={d => setState({...state, withdrawEnd: d})}
                />
                <MaskedTextField
                    label="Time of the day for above events (in UTC 24H)"
                    mask="99:99" title="time"
                    value={eventsTime}
                    onChange={e => setState({...state, eventsTime: e.target.value.replace(/_/g,'')})}
                    />
                <br />
                <TextField
                    label="Deployed staking contract address" readOnly={true}
                    value={state.contractAddress || 'NOT AVAILABLE - WILL APPEAR AFTER DEPLOY'}
                />
                <br />
                <br />
                <PrimaryButton 
                    text="Deploy"
                    disabled={state.pending || !!validate(state)}
                    onClick={() => {
                        const st = {...state, errorMessage: undefined, pending: true};
                        setState(st);
                        deployStaking(st)
                        .then(contractAddress => setState({...st, contractAddress, pending: false}))
                        .catch(e => setState({...st, pending: false, errorMessage: e.message}))}} /> </Stack>
                <br />
                {state.pending && <ProgressIndicator label="Pending transaction" description="Pending transaction results" />}
                <Text variant="small" className="error-text">{validate(state) || state.errorMessage}</Text>
            <Row>
                    <h4>Summary (verify before deploy):</h4>
                <pre>
                    - Staking contract name: <br/>
                    {name}<br/><br/>
                    - Staking cap:<br/>
                    {stakingCap} {tokenSymbol}<br/><br/>
                    {rewardToken && <>
                    - Reward Token:<br/>
                    {rewardTokenSymbol}<br/><br/>
                    </>}
                    - Start time:<br/>
                    {datef(stakingStart, eventsTime)}<br/><br/>
                    - Contribution ends:<br/>
                    {datef(stakingEnd, eventsTime)}<br/><br/>
                    - Early withdraw start:<br/>
                    {withdrawStartSec}<br/><br/>
                    - Maturity:<br/>
                    {withdrawEndSec}<br/><br/>
                </pre>
                        <Text >Copy and share on telegram for verification</Text>
            </Row>
            <Row>
                <h4>shareableUrl</h4><br/>
                {shareableUrl}
            </Row>
        </Page>
    );
}