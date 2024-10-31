// scripts/network-test.js
const hre = require("hardhat");

async function main() {
  try {
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("Account:", signer.address);

    // Check balance
    const balance = await ethers.provider.getBalance(signer.address);
    console.log("Balance:", ethers.formatEther(balance), "COMAI");

    // Check network
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("Current block number:", blockNumber);

    // Check network connection
    const network = await ethers.provider.getNetwork();
    console.log("Network:", {
      name: network.name,
      chainId: network.chainId
    });

  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);