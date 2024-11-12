const hre = require("hardhat");

async function waitForTransaction(provider, txHash, timeout = 60000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const receipt = await provider.getTransactionReceipt(txHash);
    if (receipt) {
      return receipt;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Transaction confirmation timeout");
}

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "COMAI");

    console.log("Compiling contract...");
    const NvidiaPeggedToken = await ethers.getContractFactory("NvidiaPeggedToken");

    const nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Current nonce:", nonce);

    const deploymentOptions = {
      gasLimit: 1500000,
      gasPrice: ethers.parseUnits("1", "gwei"),
      nonce: nonce
    };

    console.log("Starting deployment with options:", {
      gasLimit: deploymentOptions.gasLimit.toString(),
      gasPrice: ethers.formatUnits(deploymentOptions.gasPrice, "gwei") + " gwei",
      nonce: deploymentOptions.nonce
    });

    const deployTransaction = await NvidiaPeggedToken.getDeployTransaction(
      "NvidiaPeggedToken",  // name
      "NVDA",              // symbol
      ethers.parseEther("1000000"),  // initialSupply
      deploymentOptions
    );

    console.log("Sending deployment transaction...");
    const tx = await deployer.sendTransaction(deployTransaction);
    console.log("Transaction hash:", tx.hash);
    
    console.log("Waiting for confirmation (max 60 seconds)...");
    try {
      const receipt = await waitForTransaction(ethers.provider, tx.hash, 60000);
      if (receipt.status === 1) {
        console.log("Contract deployed successfully!");
        console.log("Contract address:", receipt.contractAddress);
        console.log("Transaction details:", {
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: ethers.formatUnits(receipt.effectiveGasPrice, "gwei") + " gwei"
        });
      } else {
        console.log("Transaction failed!");
      }
    } catch (timeoutError) {
      console.log("Confirmation timed out, but the transaction might still be processed.");
      console.log("You can check the transaction status at:");
      console.log(`https://communeai.tryethernal.com/tx/${tx.hash}`);
    }

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);