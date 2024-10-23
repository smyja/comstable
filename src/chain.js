const { ApiPromise, WsProvider } = require('@polkadot/api');

async function getChainId() {
    const provider = new WsProvider('wss://testnet.api.communeai.net');
    const api = await ApiPromise.create({ provider });

    try {
        // Query the chain ID from the EVMChainId pallet
        const chainId = await api.query.evmChainId.chainId();
        console.log('EVM Chain ID:', chainId.toString());

        // Optionally, we can also get the chain name
        const chainName = await api.rpc.system.chain();
        console.log('Chain Name:', chainName.toString());

    } catch (error) {
        console.error('Error querying chain ID:', error);
    }

    await api.disconnect();
}

getChainId();