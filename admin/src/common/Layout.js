import React from 'react';

export function Page({children}) {
    return (
        <div className="app-page">
            <div className="app-page-container">
            {children}
            </div>
        </div>
    )
}

export function Row({bordered, children}) {
    return (
        <div class={`app-row ${bordered !== undefined ? 'app-bordered-row' : ''}`}>
            {children}
        </div>
    )
}