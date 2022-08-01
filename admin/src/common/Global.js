import moment from 'moment';
import {Big} from 'big.js';

// Very quick and dirty global state
export class Global {
    static onSetState;

    static setState(setter) {
        Global.state = setter(Global.state);
        if (Global.onSetState) {
            this.onSetState(Global.state);
        }
    }
}

export function fullTime(epoch) {
    epoch = Number(epoch || '0');
    if (!epoch) {
        return 'NOT SET';
    }
    const from = moment(epoch * 1000).fromNow();
    const exact = moment(epoch * 1000).utc().format();
    return `${epoch} - (${exact} - ${from}) `;
}

export function isZeroAddress(addr) {
    return !addr || addr.toLowerCase() === '0x0000000000000000000000000000000000000000';
}

export function queryStr(par) {
    return (decodeURI(window.location.search || '').replace('?', '').split('&').map(v => v.split('='))
    .find(p => p[0] == par) || [])[1];
  }
  
  export function queryStrNum(par) {
    const v = queryStr(par);
    return v ? Number(v) : undefined;
  }
  
  const dateRaw = (dt, t, offset = 0) => {
    const timestr = dt+'T'+t+'Z';
    var r = moment(moment(timestr).valueOf() + offset);
    return `${r.valueOf() / 1000}`;
  };
  
  export function queryStrDate(par) {
    const v = queryStr(par);
    return v ? new Date(Number(v) * 1000).toISOString() : undefined;
  }

  const formatDate = (dateSec) => {
    const dateMilli = dateSec * 1000;
    const date = new Date(dateMilli).toLocaleString();
    return date === 'Invalid Date' ? 'Loading ...' : date;
  };
  
  export const formFormatter = (dateMilli) => {
    return new Date(dateMilli).toISOString().substr(0, 16);
  };

export function toBigInt(decimals, val) {
    return new Big(val).mul(new Big(10).pow(Number(decimals))).toFixed(0);
}

export function fromBigInt(decimals, val) {
    return new Big(val).div(new Big(10).pow(Number(decimals))).toFixed();
}