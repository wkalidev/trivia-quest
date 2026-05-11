const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules/@selfxyz/agent-sdk/dist/Ed25519Agent.js');
let content = fs.readFileSync(filePath, 'utf8');

// Remplace le require ESM par un import dynamique
const oldCode = `const ed = __importStar(require("@noble/ed25519"));`;
const newCode = `let ed = {};
(async () => {
    const _ed = await import('@noble/ed25519');
    Object.assign(ed, _ed);
})();`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync(filePath, content);
    console.log('✅ Patch applied to Ed25519Agent.js');
} else {
    console.log('⚠️ Patch already applied or pattern not found');
}