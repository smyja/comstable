const { ethers } = require('hardhat');

// Contract ABI - just the functions we need
const ABI = [
    {
        "inputs": [],
        "name": "lastPrice",
        "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastUpdateTime",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

async function main() {
    try {
        const CONTRACT_ADDRESS = '0x751a4a06116653dad2496e23ed29ac5c6bc4573c';
        
        // Connect to contract
        const contract = await ethers.getContractAt(ABI, CONTRACT_ADDRESS);
        
        // Get last price and update time
        const price = await contract.lastPrice();
        const updateTime = await contract.lastUpdateTime();
        
        console.log("\nNVIDIA Token Price Info:");
        console.log("------------------------");
        console.log(`Current Price: $${Number(price) / 100}`); // Convert BigInt to Number
        
        // Convert timestamp to date
        const date = new Date(Number(updateTime) * 1000);
        console.log(`Last Update: ${date.toLocaleString()}`);
        
        // Additional debug info
        console.log("\nDebug Info:");
        console.log("Raw price value:", price.toString());
        console.log("Raw timestamp:", updateTime.toString());
        
    } catch (error) {
        console.error("Error:", error);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

main().catch(console.error);