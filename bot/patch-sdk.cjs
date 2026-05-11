const fs = require('fs');
const path = require('path');

// 1. Patch package.json de @noble/ed25519 pour retirer le mode ESM
const pkgFile = path.join(__dirname, 'node_modules/@noble/ed25519/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
delete pkg.exports;
delete pkg.type;
pkg.main = 'cjs-wrapper.js';
fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
console.log('✅ package.json patched');

// 2. Créer un wrapper CJS qui réimplémente les fonctions nécessaires
const { createHash } = require('crypto');
const cjsWrapper = `
'use strict';
const { createHash } = require('crypto');

// sha512 helper
function sha512(msg) {
    return new Uint8Array(createHash('sha512').update(msg).digest());
}

// Noble ed25519 needs to be loaded — we bundle the essentials inline via sync crypto
// Load the original ESM source synchronously by reading and eval-ing with a shim
const fs = require('fs');
const path = require('path');

// Expose hashes so the SDK can set sha512
const hashes = { sha512 };

// Re-export a lazy async loader
let _ed = null;
async function _load() {
    if (!_ed) {
        _ed = await import('@noble/ed25519/index.js');
    }
    return _ed;
}

function getPublicKey(privKey) {
    // sync - use noble's internal via dynamic require workaround
    throw new Error('Use getPublicKeyAsync instead');
}

async function getPublicKeyAsync(privKey) {
    const ed = await _load();
    return ed.getPublicKeyAsync(privKey);
}

async function signAsync(msg, privKey) {
    const ed = await _load();
    return ed.signAsync(msg, privKey);
}

module.exports = { hashes, getPublicKey, getPublicKeyAsync, signAsync };
`;

fs.writeFileSync(
    path.join(__dirname, 'node_modules/@noble/ed25519/cjs-wrapper.js'),
    cjsWrapper
);
console.log('✅ CJS wrapper created');