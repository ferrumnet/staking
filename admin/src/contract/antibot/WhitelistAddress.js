import React, {useState} from 'react';
import { PrimaryButton, Modal, TextField, ActionButton } from 'office-ui-fabric-react';
import { whitelistAddressOnAntibot } from './DeployHelper';
import { Row } from '../../common/Layout';

export function WhitelistAddress({antiBot}) {
    const [isOpen, setIsOpen] = useState(false);
    const [addr, setAddr] = useState('');

    return (
        <>
            <Modal
                titleAriaId={'modal-whitelist'}
                isOpen={isOpen}
                onDismiss={() => setIsOpen(false)}
                isBlocking={false}
            >
                <WhitelistAdder antiBot={antiBot} addr={addr} setAddr={setAddr}/>
            </Modal>
          <PrimaryButton text="Whitelist" onClick={() => {
              setAddr('');
              setIsOpen(true);
            }} />
        </>
    );
}

export function WhitelistAdder({antiBot, addr, setAddr}) {
    return (
        <div className="app-container">
        <h4>Enter an address to whitelist for PRE-LAUNCH activity</h4>
        <Row>
          <TextField
            label="address"
            className="address"
            onChange={(_, v) => setAddr(v)}
            value={addr}
            />
        </Row>
        <Row>
            <PrimaryButton text="Whitelist"
                onClick={() => whitelistAddressOnAntibot(antiBot, addr)}/>
        </Row>
        </div>
    );
}
