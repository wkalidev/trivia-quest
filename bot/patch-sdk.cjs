const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Not found: ${filePath}`);
        return;
    }
    let c = fs.readFileSync(filePath, 'utf8');
    c = c.replace(
        'const ed = __importStar(require("@noble/ed25519"));',
        'const { ed25519 } = require("@noble/curves/ed25519");'
    );
    c = c.replace(
        /if \(!ed\.hashes\.sha512\)[\s\S]*?\}/m,
        ''
    );
    c = c.replace(/\bed\.getPublicKey\b/g, 'ed25519.getPublicKey');
    c = c.replace(/\bed\.signAsync\b/g, 'ed25519.sign');
    c = c.replace(/\bed\.verify\b/g, 'ed25519.verify');
    c = c.replace(/\bed\.verifyAsync\b/g, 'ed25519.verify');
    fs.writeFileSync(filePath, c);
    console.log(`✅ Patched: ${filePath}`);
}

patchFile(path.join(__dirname, 'node_modules/@selfxyz/agent-sdk/dist/Ed25519Agent.js'));
patchFile(path.join(__dirname, 'node_modules/@selfxyz/agent-sdk/dist/SelfAgentVerifier.js'));