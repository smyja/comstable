// scripts/check-balance.js
const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Account:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "COMAI");
}

main().catch(console.error);