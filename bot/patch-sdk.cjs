const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/@selfxyz/agent-sdk/dist/Ed25519Agent.js');
let content = fs.readFileSync(filePath, 'utf8');

// Patch 1: remplace le require par une variable vide (sera remplie au runtime)
const oldRequire = `const ed = __importStar(require("@noble/ed25519"));`;
const newRequire = `// patched: ed is loaded lazily via dynamic import`;

// Patch 2: remplace le check sha512 et tout le reste par une version async-safe
const oldCheck = `if (!ed.hashes.sha512) {
    ed.hashes.sha512 = (message) => new Uint8Array((0, node_crypto_1.createHash)("sha512").update(message).digest());
}`;

const newCheck = `// sha512 patch handled below`;

const oldClass = `class Ed25519Agent {`;
const newClass = `let ed;
async function getEd() {
    if (!ed) {
        ed = await import('@noble/ed25519');
        const { createHash } = await import('node:crypto');
        if (!ed.hashes) ed.hashes = {};
        if (!ed.hashes.sha512) {
            ed.hashes.sha512 = (message) => new Uint8Array(createHash("sha512").update(message).digest());
        }
    }
    return ed;
}
class Ed25519Agent {`;

let patched = content;

if (patched.includes(oldRequire)) {
    patched = patched.replace(oldRequire, newRequire);
    patched = patched.replace(oldCheck, newCheck);
    patched = patched.replace(oldClass, newClass);

    // Patch les appels ed.getPublicKey, ed.signAsync pour attendre getEd()
    patched = patched.replace(
        `this.publicKeyBytes = ed.getPublicKey(this.privateKeyBytes);`,
        `this.publicKeyBytes = (await getEd()).getPublicKey(this.privateKeyBytes);`
    );
    patched = patched.replace(
        `const sigBytes = await ed.signAsync(msgBytes, this.privateKeyBytes);`,
        `const sigBytes = await (await getEd()).signAsync(msgBytes, this.privateKeyBytes);`
    );

    fs.writeFileSync(filePath, patched);
    console.log('✅ Patch applied successfully');
} else {
    console.log('⚠️ Already patched or pattern not found');
}