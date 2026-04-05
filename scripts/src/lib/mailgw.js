"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailGwGetDomains = mailGwGetDomains;
exports.mailGwCreateAccount = mailGwCreateAccount;
exports.mailGwGetToken = mailGwGetToken;
exports.mailGwGetMessages = mailGwGetMessages;
exports.mailGwGetMessage = mailGwGetMessage;
exports.mailGwMarkRead = mailGwMarkRead;
const BASE = 'https://api.mail.gw';
async function mailGwGetDomains() {
    const res = await fetch(`${BASE}/domains?page=1`, { cache: 'no-store' });
    if (!res.ok)
        throw new Error('Failed to fetch domains');
    const data = await res.json();
    return data['hydra:member']
        .filter((d) => d.isActive)
        .map((d) => d.domain);
}
async function mailGwCreateAccount(address, password) {
    var _a;
    const res = await fetch(`${BASE}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((_a = err['hydra:description']) !== null && _a !== void 0 ? _a : `Create account failed: ${res.status}`);
    }
    return res.json();
}
async function mailGwGetToken(address, password) {
    const res = await fetch(`${BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
    });
    if (!res.ok)
        throw new Error(`Auth failed: ${res.status}`);
    const data = await res.json();
    return data.token;
}
async function mailGwGetMessages(token) {
    const res = await fetch(`${BASE}/messages?page=1`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    if (!res.ok)
        throw new Error(`Get messages failed: ${res.status}`);
    const data = await res.json();
    return data['hydra:member'];
}
async function mailGwGetMessage(token, id) {
    const res = await fetch(`${BASE}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    if (!res.ok)
        throw new Error(`Get message failed: ${res.status}`);
    return res.json();
}
async function mailGwMarkRead(token, id) {
    await fetch(`${BASE}/messages/${id}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({ seen: true }),
    });
}
