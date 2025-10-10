// Usage: node send.js <PRIVATE_KEY> <RECIPIENT_ADDRESS>
// Make sure to install ethers: npm install ethers

const { ethers } = require('ethers');

async function sendEth(privateKey, recipient, amountEth = '10') {
	// Connect to Ethereum network (default: mainnet, change to testnet if needed)
	const provider = ethers.getDefaultProvider();
	const wallet = new ethers.Wallet(privateKey, provider);

	const tx = {
		to: recipient,
		value: ethers.utils.parseEther(amountEth)
	};

	try {
		
		const transaction = await wallet.sendTransaction(tx);
		
		await transaction.wait();
		
	} catch (err) {
		console.error('Error sending ETH:', err);
	}
}

// Read arguments from command line
if (require.main === module) {
	const [,, privateKey, recipient] = process.argv;
	if (!privateKey || !recipient) {
		console.error('Usage: node send.js <PRIVATE_KEY> <RECIPIENT_ADDRESS>');
		process.exit(1);
	}
	sendEth(privateKey, recipient);
}
