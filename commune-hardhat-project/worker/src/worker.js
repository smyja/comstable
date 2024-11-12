import { ethers } from 'ethers';

const ABI = [
    "function lastPrice() view returns (uint256)",
    "function owner() view returns (address)",
    "function updatePrice(uint256) external"
];

async function getNvidiaStockPrice() {
    try {
        const NVDA_PRICE_ID = "0xb1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593";
        const response = await fetch(
            `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${NVDA_PRICE_ID}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const priceFeed = data[0];
        
        const priceInDollars = parseFloat(priceFeed.price.price) / 100000;
        const priceForContract = Math.round(priceInDollars * 100);
        
        console.log({
            rawPrice: priceFeed.price.price,
            priceInDollars,
            priceForContract
        });
        
        return priceForContract;
    } catch (error) {
        console.error('Error fetching price:', error);
        throw error;
    }
}

export default {
    async scheduled(event, env, ctx) {
        try {
            // Initialize provider and wallet
            const provider = new ethers.JsonRpcProvider(env.RPC_URL);
            const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
            
            const contract = new ethers.Contract(
                env.CONTRACT_ADDRESS,
                ABI,
                wallet
            );

            // Get current price first
            const currentPrice = await contract.lastPrice();
            console.log('Current contract price:', currentPrice.toString());

            // Get new price
            const newPrice = await getNvidiaStockPrice();
            console.log('New price to set:', newPrice);
            
            // Update price with retry logic
            let attempts = 0;
            while (attempts < 3) {
                try {
                    const tx = await contract.updatePrice(newPrice, {
                        gasLimit: 200000,
                        gasPrice: ethers.parseUnits("1.5", "gwei")
                    });
                    
                    console.log('Transaction sent:', tx.hash);
                    const receipt = await tx.wait(1);
                    
                    if (receipt.status === 1) {
                        console.log(`Success! Updated price to: ${newPrice}`);
                        return;
                    }
                } catch (error) {
                    console.error(`Attempt ${attempts + 1} failed:`, error);
                    attempts++;
                    if (attempts === 3) throw error;
                    await new Promise(r => setTimeout(r, 1000 * attempts));
                }
            }
        } catch (error) {
            console.error('Failed to update price:', error);
            throw error;
        }
    }
};