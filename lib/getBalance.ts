import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

// const INFURA_URL = process.env.INFURA_URL || ""; // Ethereum / Polygon RPC
const INFURA_URL = "https://eth-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W"
// const BSC_URL = process.env.BSC_URL || ""; // BSC RPC
const BSC_URL = "https://bitcoin-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W"
const SOLANA_RPC = "https://solana-mainnet.g.alchemy.com/v2/JPak6EkEO3LVAzts1a69W";

// EVM providers
const ethProvider = new ethers.JsonRpcProvider(INFURA_URL);
const bscProvider = new ethers.JsonRpcProvider(BSC_URL);

// ERC-20 token addresses
const tokenAddresses: Record<string, string> = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum mainnet
  // add more tokens if needed
};

export async function getBalance(
  symbol: string,
  address: string
): Promise<number> {
  switch (symbol.toUpperCase()) {
    // ---------- EVM coins ----------
    case "ETH":
      
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid Ethereum address");
      }
      return Number(ethers.formatEther(await ethProvider.getBalance(address)));

    case "BNB":
      return Number(ethers.formatEther(await bscProvider.getBalance(address)));

    // ERC20 tokens
    case "USDT": {
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const contract = new ethers.Contract(
        tokenAddresses.USDT,
        erc20Abi,
        ethProvider
      );
      const rawBalance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      return Number(ethers.formatUnits(rawBalance, decimals));
    }

    // ---------- Solana ----------
    case "SOL": {
      const connection = new Connection(SOLANA_RPC);
      const pubkey = new PublicKey(address);
      const lamports = await connection.getBalance(pubkey);
      return lamports / 1e9; // 1 SOL = 1e9 lamports
    }

    // ---------- Bitcoin, Litecoin, Dogecoin ----------
    case "BTC":
    case "LTC":
    case "DOGE": {
      // use public API like BlockCypher, Blockchain.com, etc.
      const network =
        symbol.toUpperCase() === "BTC" ? "btc" : symbol.toLowerCase();
      const url = `https://api.blockcypher.com/v1/${network}/main/addrs/${address}/balance`;
      const res = await axios.get(url);
      return res.data.balance / 1e8; // satoshi -> BTC
    }

    default:
      throw new Error(`Unsupported symbol: ${symbol}`);
  }
}
