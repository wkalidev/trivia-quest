import fs from "fs";

const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192">
  <circle cx="96" cy="96" r="96" fill="#FBCD00"/>
  <circle cx="96" cy="96" r="70" fill="white"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial Black" font-weight="900" font-size="72" fill="#FBCD00">Q</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <circle cx="256" cy="256" r="256" fill="#FBCD00"/>
  <circle cx="256" cy="256" r="186" fill="white"/>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial Black" font-weight="900" font-size="192" fill="#FBCD00">Q</text>
</svg>`;

fs.writeFileSync("public/icon-192.svg", svg192);
fs.writeFileSync("public/icon-512.svg", svg512);
fs.renameSync("public/icon-192.svg", "public/icon-192.png");
fs.renameSync("public/icon-512.svg", "public/icon-512.png");

console.log("Icons generated!");