import React, { useState } from 'react';
import { PrimaryButton, Modal, TextField, ActionButton } from 'office-ui-fabric-react';
import {Row} from '../../common/Layout';
import {deployContract} from './DeployHelper';
import {bytecode as lockerBytecode} from './abi/BasicLocker.json';

const TITLE = {
    'token': 'Token',
    'antibot': 'AntiBot Contract',
    'locker': 'Locker Contract'
}

const BYTECODE = {
    'locker': lockerBytecode,
}

export function Contract({contractKey, address, canDeploy, addressSetter}) {
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [contractAddress, setContractAddress] = useState(address || '');
    if (address) {
        return (
            <Row bordered>
                <h3>{TITLE[contractKey]}</h3>
                <span className="address">{address} 
                <ActionButton iconProps={({iconName: 'AddFriend'})}
                    className="address"
                    onClick={() => {setContractAddress(''); addressSetter('')}}
                    >clear</ActionButton>
                </span>
            </Row>
        );
    }
    const modal = (
        <>
      <Modal
        titleAriaId={'modal-' + contractKey}
        isOpen={showDeployModal}
        onDismiss={() => setShowDeployModal(false)}
        isBlocking={false}
      >
          <ContractDeployer contractKey={contractKey} />
    </Modal>
        </>
    )
    return (
        <>
        {modal}
        <Row bordered>
            <h3>{TITLE[contractKey]}</h3>
            <TextField
                label="Contract Address " required value={contractAddress}
                onChange={(e, v) => setContractAddress(v)}
            />
            <div>
                <PrimaryButton text="Set" onClick={() => addressSetter(contractAddress)}/>
                &nbsp;
                {canDeploy && <PrimaryButton text="Deploy" onClick={() => setShowDeployModal(true)}/>}
            </div>
        </Row>
        </>
    );
}

export function ContractDeployer({contractKey,}) {
    const [bytecode, setBytecode] = useState(BYTECODE[contractKey]);
    return (
        <div className="app-container">
        <h3>{TITLE[contractKey]}</h3>
        <Row>
          <TextField
            label="Bytecode"
            multiline={true}
            onChange={(_, v) => setBytecode(v)}
            value={bytecode}
            />
        </Row>
        <Row>
            <PrimaryButton text="Deploy" onClick={() => deployContract(contractKey, bytecode)}/>
        </Row>
        </div>
    );
}

export function ContractField({label, desc, fieldData, fieldAction, fieldControl, onFieldAction}) {
    return (
    <Row bordered>
        <h4>{label}</h4>
        {desc && <p>{desc}</p>}
        {fieldData && <span className="address">{fieldData}</span>}
        {fieldControl}
        {fieldAction && (<><br/><PrimaryButton text={fieldAction} onClick={() => onFieldAction()}/></>)}
    </Row>
    )
}