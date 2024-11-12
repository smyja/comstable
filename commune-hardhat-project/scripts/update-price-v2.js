const { ethers } = require('hardhat');
const axios = require('axios');

async function getNvidiaStockPrice() {
    try {
        const NVDA_PRICE_ID = "0xb1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593";
        const url = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${NVDA_PRICE_ID}`;
        
        const response = await axios.get(url);
        const priceFeed = response.data[0];
        
        // Convert the price to dollars (divide by 10^5)
        const priceInDollars = parseFloat(priceFeed.price.price) / 100000;
        
        // Convert to integer with 2 decimal places precision (multiply by 100)
        const priceForContract = Math.round(priceInDollars * 100);
        
        console.log("Raw Pyth price:", priceFeed.price.price);
        console.log("Price in dollars:", priceInDollars);
        console.log("Adjusted price for contract:", priceForContract);
        
        return priceForContract;
    } catch (error) {
        console.error('Error fetching stock price from Pyth:', error.message);
        throw error;
    }
}

async function main() {
    const contractAddress = "0x751a4a06116653dad2496e23ed29ac5c6bc4573c";

    const abi = [
        "function lastPrice() view returns (uint256)",
        "function owner() view returns (address)",
        "function updatePrice(uint256) external"
    ];

    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
        console.log("Current signer:", signer.address);

        const owner = await contract.owner();
        console.log("Contract owner:", owner);
        console.log("Is signer owner?", owner.toLowerCase() === signer.address.toLowerCase());

        const currentPrice = await contract.lastPrice();
        console.log("\nCurrent price:", currentPrice.toString());

        // Fetch real-time NVIDIA stock price
        console.log("Fetching current NVIDIA stock price...");
        const newPrice = await getNvidiaStockPrice();
        console.log("Current NVIDIA stock price: $", (newPrice / 100).toFixed(2));
        console.log("Attempting to set new price to:", newPrice);

        const tx = await contract.updatePrice(newPrice, {
            gasLimit: 200000,
            gasPrice: ethers.parseUnits("1.5", "gwei")
        });

        console.log("Transaction sent:", tx.hash);

        try {
            console.log("Waiting for confirmation...");
            const receipt = await tx.wait(1);

            if (receipt.status === 0) {
                throw new Error("Transaction failed");
            }

            console.log("Transaction confirmed in block:", receipt.blockNumber);
            const newCurrentPrice = await contract.lastPrice();
            console.log("Updated price:", newCurrentPrice.toString());

        } catch (waitError) {
            console.log("Transaction failed:", waitError.message);
            console.log("Transaction hash:", tx.hash);
        }

    } catch (error) {
        console.error("Error:", {
            message: error.message,
            data: error.data,
            code: error.code
        });
    }
}

main().catch(console.error);