import React, {useState, useEffect} from 'react';
import {Page, Row} from '../../common/Layout';
import Big from 'big.js';
import Web3 from 'web3';
import {
    queryStr,
} from '../../common/Global';
import {
    WEB3, 
} from '../../contract/ContractHelper';
import {
    Erc20
} from '../../contract/Erc20';
import {
    getRewardToken, addReward,
} from '../../contract/staking/DeployerStaking';
import { TextField, MaskedTextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack, IStackProps, IStackStyles } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { PrimaryButton, ProgressIndicator } from 'office-ui-fabric-react';

const defaultState =  {
    network: queryStr('network') || '',
    contractAddress: queryStr('contractAddress') || '',
    amount: queryStr('amount') || '0',
    earlyWithdraw: queryStr('earlyWithdraw'),
}

function gte(a1, a2) {
    try {
        return new Big(a1).gte(new Big(a2));
    } catch(e) {
        return undefined;
    }
}

export function AddReward() {
    const [contractAddress, setContractAddress] = useState(defaultState.contractAddress);
    const [amount, setAmount] = useState(defaultState.amount);
    const [earlyWithdraw, setEarlyWithdraw] = useState(defaultState.earlyWithdraw);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [rewardToken, setRewardToken] = useState('');
    const [allocation, setAllocation] = useState('0');
    useEffect(() => {
        if (!Web3.utils.isAddress(contractAddress) || !contractAddress) {
            setError('Invalid contract address');
        } else {
            setError('');
            getRewardToken(contractAddress)
                .then(t => setRewardToken(t)).catch(e => setError(e));
        }
    }, [contractAddress, setRewardToken, setError]);
    const getAllowance = () => {
        if (rewardToken && WEB3.from) {
            setError('');
            Erc20.allowance(defaultState.network, rewardToken, WEB3.from, contractAddress)
                .then(t => setAllocation(t))
                .catch(e => setError(e.message))
        }
    }
    useEffect(() => {
        getAllowance();
    }, [rewardToken, contractAddress, setAllocation, WEB3.from, setError]);

    return (
        <Page>
            <Row>
                <h1>Set Rewards</h1>
            </Row>
            <Stack >
                <TextField label="Contract Address"
                    value={contractAddress}
                    readOnly={!!defaultState.contractAddress}
                    onChange={e => setContractAddress(e.target.value)}
                />
                <TextField label="Reward amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
                <TextField label="Part of reward dedicated to early withdrawal"
                    value={earlyWithdraw}
                    onChange={e => setEarlyWithdraw(e.target.value)}
                />
                {gte(allocation, amount) ? (
                <PrimaryButton 
                    text="Submit add reward transaction"
                    disabled={pending}
                    onClick={() => {
                        setPending(true);
                        setError('');
                        addReward(contractAddress, rewardToken, amount, earlyWithdraw)
                        .then(() => setPending(false))
                        .catch(e => {
                            setError(e.message);
                            setPending(false);
                        });}}
                />
                ) : (
                <PrimaryButton 
                    text="Approve staking contract"
                    disabled={pending}
                    onClick={() => {
                        setPending(true);
                        setError('');
                        Erc20.approve(defaultState.network, rewardToken, contractAddress, amount)
                        .then(() => {setPending(false); getAllowance()})
                        .catch(e => {
                            setError(e.message);
                            setPending(false);
                        });}}
                />
                )}
                <br />
                {pending && <ProgressIndicator label="Pending transaction" description="Pending transaction results" />}
                <Text variant="small" className="error-text">{error}</Text>
            </Stack>
        </Page>
    );
}