// scripts/verify-contract.js
const hre = require("hardhat");

async function main() {
  // Contract details
  const contractAddress = "0x87d87b0a79f7bf4b9c0289371ef60a7f9205d645"; // Replace with your contract address
  const args = [
    "Musdt",
    "Musdt",
    ethers.parseEther("1000000")
  ];

  console.log("Getting contract status...");
  
  try {
    // First check if the contract is deployed
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("Contract is not yet deployed. Checking transaction status...");
      const tx = await ethers.provider.getTransaction(contractAddress); // Using tx hash
      if (tx) {
        console.log("Transaction found!");
        console.log("Transaction status:", {
          hash: tx.hash,
          from: tx.from,
          nonce: tx.nonce,
          gasPrice: ethers.formatUnits(tx.gasPrice || 0, "gwei") + " gwei",
          status: tx.blockNumber ? "Mined" : "Pending"
        });
      }
    } else {
      console.log("Contract is deployed!");
      
      // Try to verify the contract
      console.log("Attempting to verify contract...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: args,
        });
        console.log("Contract verified successfully!");
      } catch (verifyError) {
        if (verifyError.message.includes("Already Verified")) {
          console.log("Contract is already verified!");
        } else {
          console.log("Verification failed:", verifyError);
        }
      }

      // Create contract instance to check basic information
      const Token = await ethers.getContractFactory("Musdt");
      const token = Token.attach(contractAddress);

      // Get basic token information
      const [name, symbol, totalSupply] = await Promise.all([
        token.name(),
        token.symbol(),
        token.totalSupply()
      ]);

      console.log("\nToken Information:");
      console.log("Name:", name);
      console.log("Symbol:", symbol);
      console.log("Total Supply:", ethers.formatEther(totalSupply), "tokens");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);