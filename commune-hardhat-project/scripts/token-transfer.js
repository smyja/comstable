// scripts/transfer-token.js
const hre = require("hardhat");

async function main() {
    const contractAddress = "0x87d87b0a79f7bf4b9c0289371ef60a7f9205d645"; // Your token contract
    const recipientAddress = "0x077Fc847c25d680053E98e66016f1788F016E20a"; // The recipient's EVM address
    const transferAmount = "10000"; // Amount to transfer

    const [signer] = await ethers.getSigners();
    console.log("Sending from:", signer.address);
    console.log("Sending to:", recipientAddress);
    console.log("Amount to transfer:", transferAmount, "tokens");

    try {
        // Create contract instance
        const Token = await ethers.getContractFactory("Musdt");
        const token = Token.attach(contractAddress);

        // Check balances before transfer
        const [senderBalance, recipientBalance] = await Promise.all([
            token.balanceOf(signer.address),
            token.balanceOf(recipientAddress)
        ]);

        console.log("\nBalances before transfer:");
        console.log("Sender balance:", ethers.formatEther(senderBalance), "tokens");
        console.log("Recipient balance:", ethers.formatEther(recipientBalance), "tokens");

        // Perform transfer
        console.log("\nInitiating transfer...");
        const tx = await token.transfer(
            recipientAddress, 
            ethers.parseEther(transferAmount),
            {
                gasLimit: 100000,
                gasPrice: ethers.parseUnits("1", "gwei")
            }
        );

        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("Transfer confirmed in block:", receipt.blockNumber);

        // Check balances after transfer
        const [newSenderBalance, newRecipientBalance] = await Promise.all([
            token.balanceOf(signer.address),
            token.balanceOf(recipientAddress)
        ]);

        console.log("\nBalances after transfer:");
        console.log("Sender balance:", ethers.formatEther(newSenderBalance), "tokens");
        console.log("Recipient balance:", ethers.formatEther(newRecipientBalance), "tokens");

    } catch (error) {
        if (error.reason) {
            console.error("Error reason:", error.reason);
        } else {
            console.error("Error:", error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });